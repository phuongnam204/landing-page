'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function NaturalClassicConversion(props: ConversionSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6 animate-fade-in-up">
        <div className="text-center">
          <h2 className="font-extrabold text-2xl md:text-3xl text-cta mb-2">
            Đặt lịch ngay
          </h2>
          <p className="text-sm md:text-base text-cta/60">
            Tư vấn miễn phí với chuyên gia da liễu
          </p>
        </div>
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
