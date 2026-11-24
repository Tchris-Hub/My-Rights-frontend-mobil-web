import { describe, it, expect } from 'vitest';
import { rank, scoreCandidate } from '../src/matching/score';

const base = { practice_areas: [], service_areas: [], languages: [], fee_band: null, location: null };
const items = [
  { id: 'a', name: 'Ada', ...base, practice_areas: ['Employment'], location: 'Lafia, Nasarawa', languages: ['English', 'Hausa'], fee_band: 'pro_bono' },
  { id: 'b', name: 'Bayo', ...base, practice_areas: ['Employment', 'Housing'], location: 'Abuja', service_areas: ['Nasarawa'] },
  { id: 'c', name: 'Chidi', ...base, practice_areas: ['Criminal'], location: 'Keffi, Nasarawa' },
];

describe('lawyer matching', () => {
  it('scores practice area highest and explains each match', () => {
    const r = scoreCandidate(items[0], { practiceArea: 'employment', location: 'nasarawa', language: 'hausa' });
    expect(r.score).toBe(4 + 2 + 1);
    expect(r.matched_attributes).toEqual(['practice_area', 'location', 'language']);
    expect(r.match_reasons[0]).toMatch(/employment/i);
  });

  it('never shows a lawyer who does not handle the requested practice area', () => {
    const ranked = rank(items, { practiceArea: 'Employment', location: 'Keffi' }, (i) => i.name);
    expect(ranked.map((i) => i.id)).toEqual(['a', 'b']);
    expect(ranked.find((i) => i.id === 'c')).toBeUndefined();
  });

  it('ranks by score, then name, so results are stable', () => {
    const ranked = rank(items, { practiceArea: 'Employment', serviceArea: 'Nasarawa' }, (i) => i.name);
    expect(ranked.map((i) => i.id)).toEqual(['b', 'a']); // b: 4+2, a: 4 only
  });

  it('returns everyone alphabetically when no filters are set', () => {
    expect(rank(items, {}, (i) => i.name).map((i) => i.id)).toEqual(['a', 'b', 'c']);
    expect(rank(items, { practiceArea: '   ' }, (i) => i.name)).toHaveLength(3);
  });

  it('without a practice area filter, drops candidates that match nothing', () => {
    expect(rank(items, { location: 'Keffi' }, (i) => i.name).map((i) => i.id)).toEqual(['c']);
  });
});
