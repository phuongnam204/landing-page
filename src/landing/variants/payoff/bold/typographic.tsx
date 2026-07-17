'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';
import { CirclesWithBackground } from '../feature-layouts';

export function BoldTypographicPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      FeatureComponent={CirclesWithBackground}
      topbarConfig={{
        labels: {
          result:  'Kết quả phân tích',
          why:     'Tìm hiểu nguyên nhân',
          clinic:  'Hãy đến O2skin!',
          benefit: 'Lợi ích & dịch vụ',
        },
        style: { background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' },
      }}
    />
  );
}
