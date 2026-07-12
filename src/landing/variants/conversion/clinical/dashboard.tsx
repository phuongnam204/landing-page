'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ClinicalDashboardConversion(props: ConversionSlotProps) {
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
        {props.minigameResult && (
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] px-4 py-2.5 flex items-center gap-3 text-xs text-[var(--lp-text)]/60">
            <span className="inline-block w-2 h-2 rounded-full bg-[var(--lp-accent)] shrink-0" />
            <span>
              Kết quả:               <strong className="text-[var(--lp-text)]">{props.minigameResult.condition.label ?? props.minigameResult.condition.id}</strong>
              {props.minigameResult.zoneLabel !== 'không có vùng cụ thể' && (
                <> — vùng <strong className="text-[var(--lp-text)]">{props.minigameResult.zoneLabel}</strong></>
              )}
            </span>
          </div>
        )}
        <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] p-5">
          <ConversionOrganism {...props} />
        </div>
      </div>
    </div>
  );
}
