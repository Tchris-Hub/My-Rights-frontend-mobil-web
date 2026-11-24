import { MaxHeap } from './heap';
import {
  Fact,
  FactSource,
  FieldDef,
  Gate,
  Progress,
  SituationSchema,
  UrgencyLevel,
} from './types';

// Pure functions only: no database, no clock except where passed in. That keeps
// the whole engine testable and means the same code can run on the server and,
// later, in the app for offline intake.

/** Latest value per key. Facts are append-only, so a later fact replaces an earlier one. */
export function currentFacts(ledger: Fact[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const fact of ledger) out[fact.key] = fact.value;
  return out;
}

function isApplicable(field: FieldDef, facts: Record<string, string>): boolean {
  if (!field.dependsOn) return true;
  const value = facts[field.dependsOn.key];
  return value !== undefined && field.dependsOn.values.includes(value);
}

export function applicableFields(schema: SituationSchema, facts: Record<string, string>): FieldDef[] {
  return schema.fields.filter((f) => isApplicable(f, facts));
}

export function progress(schema: SituationSchema, ledger: Fact[]): Progress {
  const facts = currentFacts(ledger);
  const fields = applicableFields(schema, facts);
  const totalWeight = fields.reduce((sum, f) => sum + f.weight, 0);
  const answeredFields = fields.filter((f) => facts[f.key] !== undefined);
  const answeredWeight = answeredFields.reduce((sum, f) => sum + f.weight, 0);
  const missingRequired = fields
    .filter((f) => f.required && facts[f.key] === undefined)
    .map((f) => f.key);
  return {
    completeness: totalWeight === 0 ? 0 : answeredWeight / totalWeight,
    missingRequired,
    answered: answeredFields.length,
    applicable: fields.length,
  };
}

/**
 * Next question to ask, or null when nothing is left.
 *
 * Pinned fields (safety) are asked first. For the rest, priority of an
 * unanswered, applicable field f:
 *   P(f) = weight * (1 + urgency) * (1 + unlocks) / cost
 * where `unlocks` is how many currently-hidden fields become askable once f is
 * answered. Cheap, high-value, safety-relevant questions come first, and a
 * question that opens up follow-ups is worth more than a dead end.
 */
export function nextQuestion(schema: SituationSchema, ledger: Fact[]): FieldDef | null {
  const facts = currentFacts(ledger);
  // Pinned questions (safety) come first, in schema order, regardless of score.
  const pinned = schema.fields.find((f) => f.pinned && facts[f.key] === undefined && isApplicable(f, facts));
  if (pinned) return pinned;
  const heap = new MaxHeap<FieldDef>();
  for (const field of schema.fields) {
    if (facts[field.key] !== undefined) continue;
    if (!isApplicable(field, facts)) continue;
    const unlocks = schema.fields.filter(
      (other) => other.dependsOn?.key === field.key && facts[other.key] === undefined,
    ).length;
    const priority = (field.weight * (1 + field.urgency) * (1 + unlocks)) / field.cost;
    heap.push(field, priority);
  }
  return heap.pop() ?? null;
}

export function urgency(schema: SituationSchema, ledger: Fact[]): { level: UrgencyLevel; reasons: string[] } {
  const facts = currentFacts(ledger);
  const hits = schema.urgencyRules.filter((rule) => rule.when(facts));
  const level: UrgencyLevel = hits.some((r) => r.level === 'critical')
    ? 'critical'
    : hits.length > 0
      ? 'high'
      : 'none';
  return { level, reasons: hits.map((r) => r.reason) };
}

/**
 * Decide what happens next.
 *  - critical urgency: refer now, do not make the person finish the form first
 *  - all required answers present: ready to refer
 *  - person chose to stop early with required answers missing: honest answer
 *    (say plainly what is known and unknown instead of pretending it is complete)
 *  - otherwise: keep asking
 */
export function gate(schema: SituationSchema, ledger: Fact[], personStopped = false): Gate {
  const { level } = urgency(schema, ledger);
  if (level === 'critical') {
    return { decision: 'refer_now', reason: 'This looks urgent. A person should see it now.' };
  }
  const p = progress(schema, ledger);
  if (p.missingRequired.length === 0) {
    return { decision: 'refer', reason: 'The file has what a lawyer needs to start.' };
  }
  if (personStopped) {
    return {
      decision: 'honest_answer',
      reason: 'Some key details are missing, so a full file cannot be prepared yet.',
    };
  }
  return { decision: 'keep_asking', reason: 'A few key details are still missing.' };
}

export class AnswerError extends Error {}

/** Validate and normalise a raw answer against its field definition. */
export function validateAnswer(field: FieldDef, raw: unknown, now: Date = new Date()): string {
  if (typeof raw !== 'string') throw new AnswerError('Answer must be text.');
  const value = raw.trim();
  if (!value) throw new AnswerError('Answer is required.');
  if (value.length > 2000) throw new AnswerError('Answer is too long.');

  switch (field.type) {
    case 'yesno':
      if (value !== 'yes' && value !== 'no') throw new AnswerError('Answer must be yes or no.');
      return value;
    case 'choice':
      if (!field.options?.some((o) => o.value === value)) throw new AnswerError('Pick one of the options.');
      return value;
    case 'date': {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new AnswerError('Use the format YYYY-MM-DD.');
      const parsed = new Date(`${value}T00:00:00Z`);
      if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
        throw new AnswerError('That is not a real date.');
      }
      if (parsed.getTime() > now.getTime() + 24 * 60 * 60 * 1000) {
        throw new AnswerError('The date cannot be in the future.');
      }
      return value;
    }
    case 'text':
      return value;
  }
}

export function makeFact(key: string, value: string, source: FactSource, now: Date = new Date()): Fact {
  return { key, value, source, at: now.toISOString() };
}
