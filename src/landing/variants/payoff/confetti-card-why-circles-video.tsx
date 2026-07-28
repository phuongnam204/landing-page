'use client';
import type { PayoffSlotProps } from '../../slots';
import { ConfettiCardWhyPayoff } from './ConfettiCardWhyPayoff';
import { CirclesWithBackground, NumberedBadgeVideoSplit } from './feature-layouts';

export function ConfettiCardWhyCirclesVideoPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      FeatureComponent={CirclesWithBackground}
      BenefitComponent={NumberedBadgeVideoSplit}
    />
  );
}
