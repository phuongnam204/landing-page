'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ClinicalClassicConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 py-16">
      <div className="max-w-lg w-full flex flex-col gap-5">
        <div className="text-center">
          <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--lp-text)]">
            Đặt lịch tư vấn
          </h2>
          <p className="text-sm text-[var(--lp-text)]/55 mt-2">
            Chuyên viên O2Skin sẽ liên hệ trong 24 giờ để tư vấn liệu trình phù hợp.
          </p>
        </div>
        <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] p-5">
          <ConversionOrganism {...props} />
        </div>
      </div>
    </div>
  );
}
