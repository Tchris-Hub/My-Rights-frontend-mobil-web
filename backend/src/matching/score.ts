// Pure scoring for the lawyer and firm directory. No database access, so the
// ranking rules can be tested on their own and explained to a person: every
// result carries the reasons it matched, in plain language.

export interface Candidate {
  location?: string | null;
  practice_areas: string[];
  service_areas: string[];
  languages: string[];
  fee_band?: string | null;
}

export interface MatchFilters {
  practiceArea?: string;
  location?: string;
  serviceArea?: string;
  language?: string;
  feeBand?: string;
}

export interface MatchResult {
  score: number;
  matched_attributes: string[];
  match_reasons: string[];
}

const norm = (s: string): string => s.trim().toLowerCase();
const includesAny = (list: string[], wanted: string): boolean => list.some((x) => norm(x) === norm(wanted));
const looseMatch = (a: string, b: string): boolean => {
  const x = norm(a);
  const y = norm(b);
  return x.length > 0 && y.length > 0 && (x.includes(y) || y.includes(x));
};

// Practice area counts most: a lawyer who does not handle the problem is not a match.
const WEIGHTS = { practice_area: 4, location: 2, service_area: 2, language: 1, fee_band: 1 } as const;

/** Score one candidate against the filters the person set. Unset filters are ignored. */
export function scoreCandidate(c: Candidate, f: MatchFilters): MatchResult {
  const matched: string[] = [];
  const reasons: string[] = [];
  let score = 0;

  if (f.practiceArea?.trim()) {
    if (includesAny(c.practice_areas, f.practiceArea)) {
      score += WEIGHTS.practice_area;
      matched.push('practice_area');
      reasons.push(`Handles ${f.practiceArea.trim()} matters.`);
    }
  }
  if (f.location?.trim() && c.location && looseMatch(c.location, f.location)) {
    score += WEIGHTS.location;
    matched.push('location');
    reasons.push(`Based in ${c.location}.`);
  }
  if (f.serviceArea?.trim() && c.service_areas.some((a) => looseMatch(a, f.serviceArea!))) {
    score += WEIGHTS.service_area;
    matched.push('service_area');
    reasons.push(`Serves ${f.serviceArea.trim()}.`);
  }
  if (f.language?.trim() && includesAny(c.languages, f.language)) {
    score += WEIGHTS.language;
    matched.push('language');
    reasons.push(`Speaks ${f.language.trim()}.`);
  }
  if (f.feeBand?.trim() && c.fee_band && norm(c.fee_band) === norm(f.feeBand)) {
    score += WEIGHTS.fee_band;
    matched.push('fee_band');
    reasons.push(`Fees in the ${c.fee_band} range.`);
  }
  return { score, matched_attributes: matched, match_reasons: reasons };
}

/**
 * Rank candidates. With no filters everyone is returned (alphabetical). With
 * filters, a practice-area filter is a hard requirement (a lawyer who does not
 * do the work is never shown), and the rest only raise the ranking.
 */
export function rank<T extends Candidate & { id: string }>(
  items: T[],
  filters: MatchFilters,
  nameOf: (item: T) => string,
): Array<T & MatchResult> {
  const hasFilters = Object.values(filters).some((v) => typeof v === 'string' && v.trim());
  const scored = items.map((item) => ({ ...item, ...scoreCandidate(item, filters) }));
  const kept = hasFilters
    ? scored.filter((s) => (filters.practiceArea?.trim() ? s.matched_attributes.includes('practice_area') : s.score > 0))
    : scored;
  return kept.sort((a, b) => b.score - a.score || nameOf(a).localeCompare(nameOf(b)) || a.id.localeCompare(b.id));
}
