import { describe, it, expect } from 'vitest';
import { validateRecipe } from '../validateRecipe';

const reg = {
  hook: { 'two-column': {} }, minigame: { skincare: {}, findgame: {} },
  payoff: { 'confetti-card': {} }, conversion: { 'short-form': {} },
  programs: { grid: {} }, socialProof: { 'video-proof': {} }, done: { 'contact-info': {} },
};
const base = { id: 'v', label: 'T', slots: { hook: 'two-column', minigame: 'skincare', payoff: 'confetti-card', conversion: 'short-form' } };

describe('validateRecipe', () => {
  it('passes valid minimal recipe', () => expect(validateRecipe(base, reg).valid).toBe(true));
  it('fails missing required slot', () => {
    const { minigame: _, ...s } = base.slots;
    const r = validateRecipe({ ...base, slots: s as any }, reg);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors[0]).toContain('minigame');
  });
  it('fails unknown variant id', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, hook: 'ghost' } }, reg);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors[0]).toContain('ghost');
  });
  it('fails unknown optional variant', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, programs: 'nope' } }, reg);
    expect(r.valid).toBe(false);
  });
  it('passes recipe with valid optional slots', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, programs: 'grid', done: 'contact-info' } }, reg);
    expect(r.valid).toBe(true);
  });
});
