import { describe, it, expect } from 'vitest';
import { getConditionById, getPrograms, getProgramsTreating, getSuggestedProgram } from './catalog';
import type { ConditionId } from './quiz';

const ALL: ConditionId[] = ['mun-noi-tiet', 'da-nhon-mun-viem', 'da-nhay-cam', 'lo-chan-long', 'clean-skin', 'da-moi-bat-dau'];

describe('getConditionById', () => {
  it('returns a condition for a known id', () => {
    expect(getConditionById('mun-noi-tiet')?.label).toBe('Mụn nội tiết');
  });
  it('returns undefined for an unknown id', () => {
    expect(getConditionById('nope' as ConditionId)).toBeUndefined();
  });
});

describe('getProgramsTreating', () => {
  it('returns only programs whose treatsConditions includes the id', () => {
    const result = getProgramsTreating('da-nhay-cam');
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.treatsConditions.includes('da-nhay-cam'))).toBe(true);
  });
});

describe('getSuggestedProgram', () => {
  it('every condition resolves to a program that actually treats it', () => {
    for (const id of ALL) {
      const p = getSuggestedProgram(id);
      expect(p).toBeDefined();
      expect(p!.treatsConditions.includes(id)).toBe(true);
    }
  });
});

describe('getPrograms', () => {
  it('returns the full non-empty programs list', () => {
    expect(getPrograms().length).toBeGreaterThanOrEqual(5);
  });
});
