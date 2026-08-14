import { describe, it, expect } from 'vitest';
import { recommendPrograms } from './recommend';

describe('recommendPrograms', () => {
  it('returns empty array when no program matches', () => {
    expect(recommendPrograms([])).toEqual([]);
  });

  it('ranks primary match higher than secondary match for same condition', () => {
    // da-nep-nhan: primary of microneedling-repair (+2), secondary of ipl-oil-control (+1).
    // Asserted by score rather than position — other programs also treat this
    // condition, so the ranking has ties either side.
    const results = recommendPrograms(['da-nep-nhan']);
    const primaryMatch   = results.find(r => r.program.id === 'microneedling-repair')!;
    const secondaryMatch = results.find(r => r.program.id === 'ipl-oil-control')!;
    expect(primaryMatch.score).toBe(2);
    expect(secondaryMatch.score).toBe(1);
    expect(primaryMatch.score).toBeGreaterThan(secondaryMatch.score);
  });

  it('accumulates score across multiple conditions', () => {
    // mun-noi-tiet + da-nhon-mun-viem:
    //   hormonal-acne-plan treats both as primary (+2 each) = 4
    //   peel-acne: primary da-nhon-mun-viem (+2) = 2
    const results = recommendPrograms(['mun-noi-tiet', 'da-nhon-mun-viem']);
    expect(results[0].program.id).toBe('hormonal-acne-plan');
    expect(results[0].score).toBe(4);
    expect(results[0].matchedPrimary).toContain('mun-noi-tiet');
    expect(results[0].matchedPrimary).toContain('da-nhon-mun-viem');
  });

  it('respects the topN cap', () => {
    const results = recommendPrograms(['da-nhon-mun-viem', 'lo-chan-long', 'da-mun-tham-seo'], 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('filters out programs with score 0', () => {
    // maintenance-skin-health only matches clean-skin or da-moi-bat-dau
    const results = recommendPrograms(['mun-noi-tiet']);
    expect(results.every(r => r.score > 0)).toBe(true);
    expect(results.find(r => r.program.id === 'maintenance-skin-health')).toBeUndefined();
  });

  it('returns matchedPrimary and matchedSecondary arrays correctly', () => {
    const results = recommendPrograms(['da-nep-nhan']);
    const lkn = results.find(r => r.program.id === 'microneedling-repair')!;
    expect(lkn.matchedPrimary).toEqual(['da-nep-nhan']);
    expect(lkn.matchedSecondary).toEqual([]);

    const ipl = results.find(r => r.program.id === 'ipl-oil-control')!;
    expect(ipl.matchedPrimary).toEqual([]);
    expect(ipl.matchedSecondary).toEqual(['da-nep-nhan']);
  });
});
