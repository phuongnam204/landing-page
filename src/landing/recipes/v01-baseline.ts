import type { Recipe } from '../validateRecipe';

export const v01Baseline: Recipe = {
  id: 'v01-baseline',
  label: 'v01 — Facemap + blossom + v04 workflow',
  theme: 'blossom',
  slots: {
    hook:       'two-column',
    minigame:   'face-map',
    payoff:     'confetti-card-why',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
};
