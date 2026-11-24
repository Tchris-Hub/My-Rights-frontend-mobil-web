import { currentFacts, gate, progress, urgency } from './engine';
import { Fact, SituationSchema } from './types';

// The one-page file a lawyer or clinic student reads. Built only from what the
// person actually said, labelled with where each fact came from. It states no
// legal conclusions: that is the lawyer's job.

export interface LawyerFile {
  situation: string;
  schemaVersion: number;
  schemaReviewed: boolean;
  urgency: { level: string; reasons: string[] };
  readiness: { decision: string; completeness: number };
  facts: Array<{ label: string; value: string; source: string; corrected: boolean }>;
  missing: string[];
  evidenceToCollect: string[];
}

export function buildLawyerFile(schema: SituationSchema, ledger: Fact[]): LawyerFile {
  const facts = currentFacts(ledger);
  const p = progress(schema, ledger);
  const u = urgency(schema, ledger);
  const g = gate(schema, ledger);

  const changes = new Map<string, number>();
  for (const fact of ledger) changes.set(fact.key, (changes.get(fact.key) ?? 0) + 1);

  const latestSource = new Map<string, string>();
  for (const fact of ledger) latestSource.set(fact.key, fact.source);

  const rows = schema.fields
    .filter((f) => facts[f.key] !== undefined)
    .map((f) => ({
      label: f.label,
      value: facts[f.key],
      source: latestSource.get(f.key) ?? 'person',
      corrected: (changes.get(f.key) ?? 0) > 1,
    }));

  const missingKeys = new Set<string>(p.missingRequired);
  const missing = schema.fields.filter((f) => missingKeys.has(f.key)).map((f) => f.label);

  return {
    situation: schema.title,
    schemaVersion: schema.version,
    schemaReviewed: schema.reviewed,
    urgency: u,
    readiness: { decision: g.decision, completeness: Math.round(p.completeness * 100) / 100 },
    facts: rows,
    missing,
    evidenceToCollect: schema.evidence.filter((e) => facts[e.key] !== 'have').map((e) => e.label),
  };
}
