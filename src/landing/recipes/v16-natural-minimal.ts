import type { Recipe } from '../validateRecipe';

export const v16NaturalMinimal: Recipe = {
  id: 'v16-natural-minimal',
  label: 'v16 — Natural Sage / Minimal',
  theme: 'matcha',
  slots: {
    hook:       'natural-minimal',
    minigame:   'story-day',
    payoff:     'natural-minimal',
    programs:   'natural-minimal',
    conversion: 'natural-minimal',
    done:       'natural-minimal',
  },
  copy: {
    hook: {
      hookImage: '/face-map-v1/face-map-hook-2.svg',
    },
  },
};
