import LandingFlow from '../landing/LandingFlow';
import { getRecipeById } from '../landing/recipes';
import { v02Skincare } from '../landing/recipes/v02-skincare';

export default async function Home({ searchParams }: { searchParams: Promise<{ recipe?: string }> }) {
  const { recipe: recipeId } = await searchParams;
  const recipe = (recipeId ? getRecipeById(recipeId) : null) ?? v02Skincare;
  return <LandingFlow recipe={recipe} />;
}
