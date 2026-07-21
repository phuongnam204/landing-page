'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Chỉ cần da',
  headingAccent: 'tốt hơn tuần trước. Không cần perfect.',
  subtext:       'Bắt đầu từ việc hiểu đúng da bạn.',
  cta:           'Soi da ngay →',
  hookImage:     '/face-map-hook.svg',
};

export function NaturalSpaHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 md:gap-16 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da"
            className="h-48 md:h-[320px] w-auto object-contain opacity-90"
          />
        </div>
        <div className="flex flex-col items-center md:items-start gap-6 text-center md:text-left">
          {c.badge && (
            <span className="inline-flex items-center self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
              {c.badge}
            </span>
          )}
          <h1 className="font-extrabold text-5xl md:text-6xl text-cta leading-snug md:leading-snug [text-wrap:balance]" style={{ fontFamily: 'var(--font-nunito)' }}>
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-base md:text-lg text-cta/55 max-w-lg leading-relaxed">{c.subtext}</p>
          <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
        </div>
      </div>
    </div>
  );
}
