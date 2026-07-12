'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ElectricClassicConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center justify-center py-12 px-5">
      <div className="max-w-md w-full">
        <h2 className="font-extrabold text-2xl md:text-3xl text-center mb-2" style={{ color: 'var(--lp-primary)' }}>
          Đặt lịch ngay
        </h2>
        <p className="text-sm md:text-base text-center mb-8" style={{ color: 'rgba(240,230,255,.6)' }}>
          Tư vấn miễn phí — không ép mua thêm
        </p>
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
