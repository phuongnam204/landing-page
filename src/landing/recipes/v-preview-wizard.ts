import type { Recipe } from '../validateRecipe';

export const vPreviewWizard: Recipe = {
  id: 'v-preview-wizard',
  label: 'Preview — Minigame: Step Wizard',
  theme: 'lilac',
  slots: {
    hook: 'playful-immersive',
    minigame: 'face-map-v3',
    payoff: 'playful-immersive',
    programs: 'playful-immersive',
    conversion: 'playful-immersive',
    done: 'playful-immersive',
  },
};
