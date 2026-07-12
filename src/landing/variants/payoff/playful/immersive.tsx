'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function PlayfulImmersivePayoff(props: PayoffSlotProps) {
  return (
    <div className="bg-[var(--lp-bg-payoff)] py-4">
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
