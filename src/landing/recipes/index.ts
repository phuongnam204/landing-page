import { v01Baseline } from './v01-baseline';
import { v03Facemap } from './v03-facemap';
import { v04Combined } from './v04-combined';
import { v05PlayfulClassic } from './v05-playful-classic';
import { v06PlayfulMinimal } from './v06-playful-minimal';
import { v07PlayfulImmersive } from './v07-playful-immersive';
import { v08NavyMint } from './v08-navy-mint';
import { v09ClinicalClassic } from './v09-clinical-classic';
import { v10ClinicalCompact } from './v10-clinical-compact';
import { v11ClinicalDashboard } from './v11-clinical-dashboard';
import { v12ClinicalEditorial } from './v12-clinical-editorial';
import { v13NaturalClassic } from './v13-natural-classic';
import { v14NaturalSpa } from './v14-natural-spa';
import { v15NaturalEditorial } from './v15-natural-editorial';
import { v16NaturalMinimal } from './v16-natural-minimal';
import { v17BoldClassic } from './v17-bold-classic';
import { v18BoldStacked } from './v18-bold-stacked';
import { v19BoldDiagonal } from './v19-bold-diagonal';
import { v20BoldTypographic } from './v20-bold-typographic';
import { v21ElectricClassic } from './v21-electric-classic';
import { v22ElectricGlowHeavy } from './v22-electric-glow-heavy';
import { v23ElectricSoftDark } from './v23-electric-soft-dark';
import { v24ElectricLightPop } from './v24-electric-light-pop';
import type { Recipe } from '../validateRecipe';

export const allRecipes: Recipe[] = [
  v01Baseline,
  v03Facemap,
  v04Combined,
  v05PlayfulClassic,
  v06PlayfulMinimal,
  v07PlayfulImmersive,
  v08NavyMint,
  v09ClinicalClassic,
  v10ClinicalCompact,
  v11ClinicalDashboard,
  v12ClinicalEditorial,
  v13NaturalClassic,
  v14NaturalSpa,
  v15NaturalEditorial,
  v16NaturalMinimal,
  v17BoldClassic,
  v18BoldStacked,
  v19BoldDiagonal,
  v20BoldTypographic,
  v21ElectricClassic,
  v22ElectricGlowHeavy,
  v23ElectricSoftDark,
  v24ElectricLightPop,
];
export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}
