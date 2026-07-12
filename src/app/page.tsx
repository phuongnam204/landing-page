import LandingFlow from '../landing/LandingFlow';
import { getRecipeById } from '../landing/recipes';
import { v01Baseline } from '../landing/recipes/v01-baseline';

export default async function Home({ searchParams }: { searchParams: Promise<{ recipe?: string }> }) {
  const { recipe: recipeId } = await searchParams;
  const recipe = (recipeId ? getRecipeById(recipeId) : null) ?? v01Baseline;
  return <LandingFlow recipe={recipe} />;
}
