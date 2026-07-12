'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function NaturalSpaConversion(props: ConversionSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 py-20 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8 animate-fade-in-up">
        <div className="text-center">
          <h2 className="font-extrabold text-3xl md:text-4xl text-cta mb-3">
            Đặt lịch ngay
          </h2>
          <p className="text-base md:text-lg text-cta/55 max-w-md mx-auto leading-relaxed">
            Tư vấn miễn phí với chuyên gia da liễu
          </p>
        </div>
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
