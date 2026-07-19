import { describe, it, expect } from 'vitest';
import { validateRecipe } from '../validateRecipe';

const reg = {
  hook: { 'two-column': {} }, minigame: { 'face-map': {} },
  payoff: { 'confetti-card': {} }, conversion: { 'short-form': {} },
  programs: { grid: {} }, socialProof: { 'video-proof': {} }, done: { 'contact-info': {} },
  teaserPayoff: { 'bold-classic': {} }, pathChooser: { 'bold-stacked': {} }, expertHandoff: { 'natural-spa': {} },
};
const base = { id: 'v', label: 'T', slots: { hook: 'two-column', minigame: 'face-map', payoff: 'confetti-card', conversion: 'short-form' } };

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
  it('passes recipe with valid teaserPayoff slot', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, teaserPayoff: 'bold-classic' } }, reg);
    expect(r.valid).toBe(true);
  });
  it('passes recipe with valid pathChooser slot', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, pathChooser: 'bold-stacked' } }, reg);
    expect(r.valid).toBe(true);
  });
  it('passes recipe with valid expertHandoff slot', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, expertHandoff: 'natural-spa' } }, reg);
    expect(r.valid).toBe(true);
  });
  it('fails unknown teaserPayoff variant', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, teaserPayoff: 'ghost' } }, reg);
    expect(r.valid).toBe(false);
  });
  it('fails unknown pathChooser variant', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, pathChooser: 'ghost' } }, reg);
    expect(r.valid).toBe(false);
  });
  it('fails unknown expertHandoff variant', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, expertHandoff: 'ghost' } }, reg);
    expect(r.valid).toBe(false);
  });
  it('passes v04 recipe using compound variant ids', () => {
    const reg4 = {
      ...reg,
      hook:       { ...reg.hook,       'bold-single': {} },
      minigame:   { ...reg.minigame,   'face-map': {} },
      programs:   { ...reg.programs,   'grid-with-faq': {} },
      conversion: { ...reg.conversion, 'short-form-with-testimonials': {} },
      done:       { 'contact-info': {} },
    };
    const v04 = {
      id: 'v04-combined', label: 'v04', slots: {
        hook: 'bold-single', minigame: 'face-map', payoff: 'confetti-card',
        programs: 'grid-with-faq', conversion: 'short-form-with-testimonials',
        done: 'contact-info',
      },
    };
    expect(validateRecipe(v04 as any, reg4).valid).toBe(true);
  });
});
