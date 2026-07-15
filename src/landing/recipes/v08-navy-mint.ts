import type { Recipe } from '../validateRecipe';

export const v08NavyMint: Recipe = {
  id: 'v08-navy-mint',
  label: 'v08 — Navy × Mint',
  theme: 'navy-mint',
  chipColor: { bg: '#2D2640', text: '#8FE3BC', label: 'Navy × Mint' },
  slots: {
    hook: 'playful-dark-accent',
    minigame: 'playful-dark-accent',
    payoff: 'playful-dark-accent',
    programs: 'playful-dark-accent',
    conversion: 'playful-dark-accent',
    done: 'playful-dark-accent',
  },
};
