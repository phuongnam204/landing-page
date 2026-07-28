'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function BoldStackedPayoff(props: PayoffSlotProps) {
  return (
    <div style={{ background: 'var(--lp-bg-hero)' }}>
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
