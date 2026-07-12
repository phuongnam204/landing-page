'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ClinicalEditorialConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full flex flex-col gap-6">
        <div className="text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-[var(--lp-text)]">
            Đặt lịch tư vấn
          </h2>
          <p className="text-sm text-[var(--lp-text)]/50 mt-3 max-w-md mx-auto leading-relaxed">
            Chuyên viên O2Skin sẽ liên hệ trong 24 giờ để tư vấn liệu trình phù hợp với làn da của bạn.
          </p>
        </div>
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
