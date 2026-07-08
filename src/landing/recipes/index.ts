import { v01Baseline } from './v01-baseline';
import { v02Skincare } from './v02-skincare';
import { v03Facemap } from './v03-facemap';
import { v04Combined } from './v04-combined';
import type { Recipe } from '../validateRecipe';

export const allRecipes: Recipe[] = [v01Baseline, v02Skincare, v03Facemap, v04Combined];
export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}
