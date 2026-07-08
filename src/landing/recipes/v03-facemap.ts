import type { Recipe } from '../validateRecipe';

export const v03Facemap: Recipe = {
  id: 'v03-facemap',
  label: 'Face-map tự khai + ocean',
  theme: 'ocean',
  slots: {
    hook: 'bold-single',
    minigame: 'face-map',
    payoff: 'confetti-card',
    programs: 'carousel',
    conversion: 'short-form',
    socialProof: 'video-proof',
    done: 'contact-info',
  },
};
