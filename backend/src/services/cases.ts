import { prisma } from '../db';
import { HttpError } from '../authz';
import { oneOf, reqString } from '../lib/validate';
import { AnswerError, applicableFields, currentFacts, gate, makeFact, nextQuestion, progress, urgency, validateAnswer } from '../intake/engine';
import { buildLawyerFile } from '../intake/file';
import { getSchema, listSituations } from '../intake/schemas';
import { Fact, FactSource } from '../intake/types';

// A case belongs to one person. Every read and write is scoped by user_id; a
// case that is not theirs is a 404. Facts are only ever appended.

const MAX_FACTS_PER_CASE = 300;
const notFound = () => new HttpError(404, 'Case not found.');

async function loadOwned(userId: string, caseId: string) {
  const c = await prisma.case.findFirst({
    where: { id: caseId, user_id: userId },
    include: { facts: { orderBy: { created_at: 'asc' } } },
  });
  if (!c) throw notFound();
  return c;
}

function toLedger(rows: Array<{ key: string; value: string; source: string; created_at: Date }>): Fact[] {
  return rows.map((r) => ({ key: r.key, value: r.value, source: r.source as FactSource, at: r.created_at.toISOString() }));
}

function state(c: Awaited<ReturnType<typeof loadOwned>>, personStopped = false) {
  const schema = getSchema(c.situation);
  const ledger = toLedger(c.facts);
  const next = nextQuestion(schema, ledger);
  return {
    id: c.id,
    situation: schema.id,
    title: schema.title,
    status: c.status,
    next_question: next
      ? { key: next.key, question: next.question, type: next.type, options: next.options ?? null }
      : null,
    progress: progress(schema, ledger),
    urgency: urgency(schema, ledger),
    gate: gate(schema, ledger, personStopped),
  };
}

export function situations() {
  return listSituations();
}

export async function createCase(userId: string, input: Record<string, unknown>) {
  const ids = listSituations().map((s) => s.id);
  const situation = oneOf(input.situation, ids as readonly string[], 'situation');
  const schema = getSchema(situation);
  const created = await prisma.case.create({
    data: { user_id: userId, situation: schema.id, schema_version: schema.version },
    include: { facts: true },
  });
  return state(created);
}

export async function listCases(userId: string) {
  const rows = await prisma.case.findMany({
    where: { user_id: userId },
    orderBy: { updated_at: 'desc' },
    select: { id: true, situation: true, status: true, created_at: true, updated_at: true },
  });
  return rows.map((r) => ({ ...r, title: getSchema(r.situation).title }));
}

export async function getCase(userId: string, caseId: string) {
  return state(await loadOwned(userId, caseId));
}

export async function answer(userId: string, caseId: string, input: Record<string, unknown>) {
  const c = await loadOwned(userId, caseId);
  if (c.status !== 'open') throw new HttpError(409, 'This case is no longer open for changes.');
  if (c.facts.length >= MAX_FACTS_PER_CASE) throw new HttpError(409, 'This case has reached its size limit.');

  const schema = getSchema(c.situation);
  const key = reqString(input.key, 'key', 80);
  const field = schema.fields.find((f) => f.key === key);
  if (!field) throw new HttpError(400, 'That question is not part of this case.');
  const facts = currentFacts(toLedger(c.facts));
  if (!applicableFields(schema, facts).some((f) => f.key === key)) {
    throw new HttpError(400, 'That question does not apply yet.');
  }

  let value: string;
  try {
    value = validateAnswer(field, input.value);
  } catch (e) {
    if (e instanceof AnswerError) throw new HttpError(400, e.message);
    throw e;
  }

  // Corrections are new facts, not edits, so the history stays intact.
  await prisma.$transaction([
    prisma.caseFact.create({ data: { case_id: c.id, key, value, source: 'person' } }),
    prisma.case.update({ where: { id: c.id }, data: { updated_at: new Date() } }),
  ]);
  return state(await loadOwned(userId, caseId));
}

/** The person chose to stop. Returns the honest status instead of pretending the file is complete. */
export async function finish(userId: string, caseId: string) {
  const c = await loadOwned(userId, caseId);
  const s = state(c, true);
  return { ...s, file: buildLawyerFile(getSchema(c.situation), toLedger(c.facts)) };
}

export async function getFile(userId: string, caseId: string) {
  const c = await loadOwned(userId, caseId);
  return buildLawyerFile(getSchema(c.situation), toLedger(c.facts));
}
