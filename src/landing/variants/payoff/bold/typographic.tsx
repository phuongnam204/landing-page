'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function BoldTypographicPayoff(props: PayoffSlotProps) {
  return (
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
  );
}
