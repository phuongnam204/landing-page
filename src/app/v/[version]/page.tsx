import { notFound } from 'next/navigation';
import LandingFlow from '../../../landing/LandingFlow';
import { getRecipeById, allRecipes } from '../../../landing/recipes';

type Props = { params: { version: string } };

export default function VersionPage({ params }: Props) {
  const recipe = getRecipeById(params.version);
  if (!recipe) notFound();
  return <LandingFlow recipe={recipe} />;
}

export function generateStaticParams() {
  return allRecipes.map(r => ({ version: r.id }));
}
