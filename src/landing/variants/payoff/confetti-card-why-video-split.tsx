'use client';
import type { PayoffSlotProps } from '../../slots';
import { ConfettiCardWhyPayoff } from './ConfettiCardWhyPayoff';
import { NumberedBadgeVideoSplit, CarouselGrid } from './feature-layouts';

export function ConfettiCardWhyVideoSplitPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      BenefitComponent={NumberedBadgeVideoSplit}
      FeatureComponent={CarouselGrid}
    />
  );
}
