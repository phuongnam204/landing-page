'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';
import { NumberedBadgeCirclesRight } from '../feature-layouts';

export function BoldDiagonalPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      FeatureComponent={NumberedBadgeCirclesRight}
    />
  );
}
