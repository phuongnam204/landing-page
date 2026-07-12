'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ElectricLightPopConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center py-12 px-5" style={{ background: '#fdf4ff' }}>
      <div className="max-w-md w-full">
        <h2 className="font-extrabold text-2xl md:text-3xl text-center mb-2" style={{ color: '#1a0533' }}>
          Đặt lịch ngay
        </h2>
        <p className="text-sm md:text-base text-center mb-8" style={{ color: 'rgba(26,5,51,.6)' }}>
          Tư vấn miễn phí — không ép mua thêm
        </p>
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
