import { describe, it, expect } from 'vitest';
import { MaxHeap } from '../src/intake/heap';
import {
  AnswerError,
  applicableFields,
  currentFacts,
  gate,
  makeFact,
  nextQuestion,
  progress,
  urgency,
  validateAnswer,
} from '../src/intake/engine';
import { getSchema, listSituations } from '../src/intake/schemas';
import { buildLawyerFile } from '../src/intake/file';
import { Fact } from '../src/intake/types';

const at = new Date('2026-11-24T10:00:00Z');
const fact = (key: string, value: string): Fact => makeFact(key, value, 'person', at);

describe('MaxHeap', () => {
  it('pops in priority order and breaks ties by insertion order', () => {
    const h = new MaxHeap<string>();
    h.push('low', 1);
    h.push('high', 9);
    h.push('mid-a', 5);
    h.push('mid-b', 5);
    expect([h.pop(), h.pop(), h.pop(), h.pop(), h.pop()]).toEqual(['high', 'mid-a', 'mid-b', 'low', undefined]);
  });

  it('stays correct over many random pushes', () => {
    const h = new MaxHeap<number>();
    const values = Array.from({ length: 500 }, (_, i) => (i * 7919) % 503);
    values.forEach((v) => h.push(v, v));
    const out: number[] = [];
    while (h.size) out.push(h.pop()!);
    expect(out).toEqual([...values].sort((a, b) => b - a));
  });
});

describe('ledger', () => {
  it('latest fact per key wins and history is kept', () => {
    const ledger = [fact('state', 'Lagos'), fact('state', 'Nasarawa')];
    expect(currentFacts(ledger).state).toBe('Nasarawa');
    expect(ledger).toHaveLength(2);
  });
});

describe('question ordering', () => {
  const police = getSchema('police');

  it('asks the safety question first on an empty case', () => {
    expect(nextQuestion(police, [])?.key).toBe('in_danger');
  });

  it('does not ask dependent fields until their parent is answered', () => {
    const keys = applicableFields(police, {}).map((f) => f.key);
    expect(keys).not.toContain('held_days');
    const after = applicableFields(police, { police_status: 'detained' }).map((f) => f.key);
    expect(after).toContain('held_days');
  });

  it('never repeats an answered question and ends with null', () => {
    const ledger: Fact[] = [];
    const asked = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const next = nextQuestion(police, ledger);
      if (!next) break;
      expect(asked.has(next.key)).toBe(false);
      asked.add(next.key);
      const value = next.type === 'yesno' ? 'no' : next.type === 'choice' ? next.options![0].value : next.type === 'date' ? '2026-11-01' : 'text';
      ledger.push(fact(next.key, value));
    }
    expect(nextQuestion(police, ledger)).toBeNull();
    expect(progress(police, ledger).completeness).toBe(1);
  });

  it('asks a question that unlocks follow-ups before an equal one that does not', () => {
    const work = getSchema('work');
    const ledger = [fact('in_danger', 'no'), fact('state', 'Lagos'), fact('when', '2026-10-01')];
    const next = nextQuestion(work, ledger)!;
    // work_issue unlocks amount_owed and notice_given, so it outranks the rest.
    expect(next.key).toBe('work_issue');
  });
});

describe('urgency and gate', () => {
  const police = getSchema('police');

  it('danger is critical and refers immediately without finishing the form', () => {
    const ledger = [fact('in_danger', 'yes')];
    expect(urgency(police, ledger).level).toBe('critical');
    expect(gate(police, ledger).decision).toBe('refer_now');
  });

  it('being held by police is critical', () => {
    const ledger = [fact('in_danger', 'no'), fact('police_status', 'detained')];
    expect(urgency(police, ledger).reasons.length).toBeGreaterThan(0);
    expect(gate(police, ledger).decision).toBe('refer_now');
  });

  it('keeps asking while required answers are missing, then refers', () => {
    const housing = getSchema('housing');
    expect(gate(housing, [fact('in_danger', 'no')]).decision).toBe('keep_asking');
    const done = [
      fact('in_danger', 'no'),
      fact('state', 'FCT Abuja'),
      fact('when', '2026-11-01'),
      fact('goal', 'Get my deposit back'),
      fact('housing_issue', 'deposit'),
    ];
    expect(gate(housing, done).decision).toBe('refer');
  });

  it('gives an honest answer when the person stops early with gaps', () => {
    const g = gate(getSchema('work'), [fact('in_danger', 'no')], true);
    expect(g.decision).toBe('honest_answer');
  });
});

describe('answer validation', () => {
  const schema = getSchema('housing');
  const field = (key: string) => schema.fields.find((f) => f.key === key)!;

  it('accepts valid answers and rejects bad ones', () => {
    expect(validateAnswer(field('in_danger'), ' yes ')).toBe('yes');
    expect(() => validateAnswer(field('in_danger'), 'maybe')).toThrow(AnswerError);
    expect(() => validateAnswer(field('state'), 'Atlantis')).toThrow(AnswerError);
    expect(validateAnswer(field('state'), 'Kano')).toBe('Kano');
    expect(() => validateAnswer(field('goal'), '   ')).toThrow(AnswerError);
    expect(() => validateAnswer(field('goal'), 'x'.repeat(2001))).toThrow(AnswerError);
    expect(() => validateAnswer(field('goal'), 42)).toThrow(AnswerError);
  });

  it('checks dates are real and not in the future', () => {
    expect(validateAnswer(field('when'), '2026-11-01', at)).toBe('2026-11-01');
    expect(() => validateAnswer(field('when'), '2026-02-30', at)).toThrow(AnswerError);
    expect(() => validateAnswer(field('when'), '01/11/2026', at)).toThrow(AnswerError);
    expect(() => validateAnswer(field('when'), '2027-01-01', at)).toThrow(AnswerError);
  });
});

describe('schemas and lawyer file', () => {
  it('falls back to the general schema for unknown situations', () => {
    expect(getSchema('something-new').id).toBe('general');
    expect(listSituations().at(-1)?.id).toBe('general');
  });

  it('every schema is unreviewed until a lawyer signs off, and says so in the file', () => {
    for (const s of listSituations()) expect(getSchema(s.id).reviewed).toBe(false);
    const file = buildLawyerFile(getSchema('general'), [fact('in_danger', 'no')]);
    expect(file.schemaReviewed).toBe(false);
  });

  it('marks corrected answers and lists what is still missing', () => {
    const ledger = [fact('in_danger', 'no'), fact('state', 'Lagos'), fact('state', 'Nasarawa')];
    const file = buildLawyerFile(getSchema('work'), ledger);
    const state = file.facts.find((f) => f.label === 'State')!;
    expect(state.value).toBe('Nasarawa');
    expect(state.corrected).toBe(true);
    expect(file.facts.find((f) => f.label === 'In danger right now')!.corrected).toBe(false);
    expect(file.missing).toContain('Employer');
    expect(file.readiness.decision).toBe('keep_asking');
  });

  it('only uses field keys that exist and keeps dependencies pointing at real fields', () => {
    for (const { id } of listSituations()) {
      const schema = getSchema(id);
      const keys = new Set(schema.fields.map((f) => f.key));
      expect(keys.size).toBe(schema.fields.length);
      for (const f of schema.fields) {
        if (f.dependsOn) expect(keys.has(f.dependsOn.key)).toBe(true);
        if (f.type === 'choice') expect(f.options?.length).toBeGreaterThan(0);
      }
    }
  });
});
