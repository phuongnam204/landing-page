import { describe, it, expect } from 'vitest';
import {
  getConditionById,
  getPrograms,
  getProgramsTreating,
  getSuggestedProgram,
} from './catalog';

describe('getConditionById', () => {
  it('returns the condition for a known id', () => {
    const c = getConditionById('mun-noi-tiet');
    expect(c).toBeDefined();
    expect(c?.id).toBe('mun-noi-tiet');
    expect(c?.label).toBe('Mụn nội tiết');
  });

  it('returns undefined for an unknown id', () => {
    expect(getConditionById('nonsense' as never)).toBeUndefined();
  });
});

describe('getPrograms', () => {
  it('returns at least 5 programs', () => {
    const list = getPrograms();
    expect(list.length).toBeGreaterThanOrEqual(5);
  });

  it('every program has a non-empty id, name, description', () => {
    for (const p of getPrograms()) {
      expect(p.id.length).toBeGreaterThan(0);
      expect(p.name.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
    }
  });
});

describe('getProgramsTreating', () => {
  it('returns only programs that treat the given condition', () => {
    const programs = getProgramsTreating('mun-noi-tiet');
    for (const p of programs) {
      expect(p.primaryConditionIds).toContain('mun-noi-tiet');
    }
  });

  it('returns empty array for a condition no program treats', () => {
    const programs = getProgramsTreating('nonsense' as never);
    expect(programs).toHaveLength(0);
  });
});

describe('getSuggestedProgram', () => {
  it('returns the first program treating the condition', () => {
    const suggested = getSuggestedProgram('mun-noi-tiet');
    expect(suggested).toBeDefined();
    expect(suggested!.primaryConditionIds[0]).toBe('mun-noi-tiet');
  });

  it('falls back to the first program for unknown conditions', () => {
    const fallback = getSuggestedProgram('nonsense' as never);
    expect(fallback).toBeDefined();
    expect(fallback!.id).toBe(getPrograms()[0].id);
  });
});
