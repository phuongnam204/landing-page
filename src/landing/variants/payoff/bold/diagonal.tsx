'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';
import { CarouselKenBurn, NumberedBadgeQuadGrid } from '../feature-layouts';

export function BoldDiagonalPayoff(props: PayoffSlotProps) {
  return <ConfettiCardWhyPayoff {...props} FeatureComponent={CarouselKenBurn} BenefitComponent={NumberedBadgeQuadGrid} />;
}
