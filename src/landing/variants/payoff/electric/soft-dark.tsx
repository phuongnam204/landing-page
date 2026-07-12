'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function ElectricSoftDarkPayoff(props: PayoffSlotProps) {
  return (
    <div className="bg-[var(--lp-bg-minigame)]">
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
