import { notFound } from 'next/navigation';
import LandingFlow from '../../../landing/LandingFlow';
import { getRecipeById, allRecipes } from '../../../landing/recipes';

type Props = { params: Promise<{ version: string }> };

export default async function VersionPage({ params }: Props) {
  const { version } = await params;
  const recipe = getRecipeById(version);
  if (!recipe) notFound();
  return <LandingFlow recipe={recipe!} />;
}

export function generateStaticParams() {
  return allRecipes.map(r => ({ version: r.id }));
}
