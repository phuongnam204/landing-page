'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function BoldDiagonalPayoff(props: PayoffSlotProps) {
  return (
    <div style={{ background: 'var(--lp-bg-hero)' }}>
      <div
        className="py-3 px-6 text-center font-bold text-sm tracking-widest uppercase"
        style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
      >
        KET QUA PHAN TICH
      </div>
      <ConfettiCardWhyPayoff
        {...props}
        topbarConfig={{
          labels: {
            result:  'Kết quả phân tích',
            why:     'Tìm hiểu nguyên nhân',
            benefit: 'Hãy đến O2skin!',
          },
          style: { background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' },
        }}
      />
    </div>
  );
}
