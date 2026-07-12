'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function BoldStackedPayoff(props: PayoffSlotProps) {
  return (
    <div style={{ background: 'var(--lp-bg-hero)' }}>
      <div
        className="py-3 px-6 text-center font-bold text-sm tracking-widest uppercase"
        style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
      >
        KET QUA PHAN TICH
      </div>
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
