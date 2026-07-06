import { v01Baseline } from './v01-baseline';
import { v02Skincare } from './v02-skincare';
import type { Recipe } from '../validateRecipe';

export const allRecipes: Recipe[] = [v01Baseline, v02Skincare];
export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}
