'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function ClinicalEditorialPayoff(props: PayoffSlotProps) {
  return (
    <div className="bg-[var(--lp-bg-payoff)]">
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
