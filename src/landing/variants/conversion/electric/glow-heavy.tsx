'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ElectricGlowHeavyConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center justify-center py-12 px-5 relative overflow-hidden">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(219,39,119,.2) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div className="max-w-md w-full relative z-10">
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
