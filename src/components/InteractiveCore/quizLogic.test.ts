import { describe, it, expect } from 'vitest';
import { computeResult } from './quizLogic';

describe('computeResult', () => {
  it('returns the acne result when q1 answer is acne', () => {
    const result = computeResult({ q1: 'acne' });
    expect(result.id).toBe('acne');
  });

  it('returns the dark-spot result when q1 answer is dark-spot', () => {
    const result = computeResult({ q1: 'dark-spot' });
    expect(result.id).toBe('dark-spot');
  });

  it('returns the scar result when q1 answer is scar', () => {
    const result = computeResult({ q1: 'scar' });
    expect(result.id).toBe('scar');
  });

  it('throws when q1 has not been answered', () => {
    expect(() => computeResult({})).toThrow();
  });
});
