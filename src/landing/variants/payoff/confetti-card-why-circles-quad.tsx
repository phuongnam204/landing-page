'use client';
import type { PayoffSlotProps } from '../../slots';
import { ConfettiCardWhyPayoff } from './ConfettiCardWhyPayoff';
import { CirclesWithBackground, NumberedBadgeQuadGrid } from './feature-layouts';

export function ConfettiCardWhyCirclesQuadPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      BenefitComponent={CirclesWithBackground}
      FeatureComponent={NumberedBadgeQuadGrid}
    />
  );
}
