import LandingFlow from '../landing/LandingFlow';
import { v02Skincare } from '../landing/recipes/v02-skincare';

export default function Home() {
  return <LandingFlow recipe={v02Skincare} />;
}
