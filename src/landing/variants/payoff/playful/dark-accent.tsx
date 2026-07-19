'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';
import { CarouselKenBurn } from '../feature-layouts';

export function PlayfulDarkAccentPayoff(props: PayoffSlotProps) {
  return (
    <div className="bg-[var(--lp-bg-minigame)]">
      <ConfettiCardWhyPayoff {...props} FeatureComponent={CarouselKenBurn} />
    </div>
  );
}
