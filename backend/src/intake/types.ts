// Types for the case intake pipeline.
//
// A case is a ledger of facts. Facts are only ever appended; the "current"
// value of a field is the latest fact for that key. This keeps a full history
// (what the person said, when, and how) and lets the lawyer see corrections.

export type FactSource = 'person' | 'document' | 'staff';

export interface Fact {
  key: string;
  value: string;
  source: FactSource;
  at: string; // ISO timestamp
}

export type FieldType = 'choice' | 'yesno' | 'text' | 'date';

export interface FieldDef {
  key: string;
  // Plain-language question shown to the person.
  question: string;
  // Short label used in the lawyer file.
  label: string;
  type: FieldType;
  options?: Array<{ value: string; label: string }>;
  // How much this answer matters to a lawyer (1-5).
  weight: number;
  // 1 if the answer can change how urgent the case is (safety, a deadline).
  urgency: 0 | 1;
  // Effort to answer (1 = tap, 2 = type a sentence, 3 = find a document).
  cost: 1 | 2 | 3;
  // Only ask when another field has one of these values.
  dependsOn?: { key: string; values: string[] };
  // Must be present before the case is considered ready for a lawyer.
  required?: boolean;
  // Always asked before anything else, in schema order. Used for safety, so a
  // clever priority score can never push the "are you in danger" question down.
  pinned?: boolean;
}

export type UrgencyLevel = 'none' | 'high' | 'critical';

export interface UrgencyRule {
  id: string;
  level: Exclude<UrgencyLevel, 'none'>;
  // Plain-language reason shown to staff. Never states a legal time limit.
  reason: string;
  when: (facts: Record<string, string>) => boolean;
}

export interface EvidenceItem {
  key: string;
  label: string;
}

export interface SituationSchema {
  id: string;
  title: string;
  version: number;
  // false until a qualified lawyer has reviewed the questions and rules.
  reviewed: boolean;
  fields: FieldDef[];
  urgencyRules: UrgencyRule[];
  evidence: EvidenceItem[];
}

export type GateDecision = 'refer_now' | 'refer' | 'keep_asking' | 'honest_answer';

export interface Gate {
  decision: GateDecision;
  reason: string;
}

export interface Progress {
  completeness: number; // 0..1, weighted
  missingRequired: string[]; // field keys
  answered: number;
  applicable: number;
}
