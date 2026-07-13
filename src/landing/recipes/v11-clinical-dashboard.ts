import type { Recipe } from '../validateRecipe';

export const v11ClinicalDashboard: Recipe = {
  id: 'v11-clinical-dashboard',
  label: 'v11 — Clinical Ocean / Dashboard',
  theme: 'charcoal',
  slots: {
    hook: 'clinical-dashboard',
    minigame: 'clinical-dashboard',
    payoff: 'clinical-dashboard',
    programs: 'clinical-dashboard',
    conversion: 'clinical-dashboard',
    done: 'clinical-dashboard',
  },
};
