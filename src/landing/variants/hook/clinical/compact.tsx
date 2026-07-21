'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích da nhanh',
  heading:       '60 giây để biết điều mà',
  headingAccent: '2 năm thử sản phẩm không nói ra.',
  subtext:       'Phân tích da miễn phí — không cần đăng ký.',
  cta:           'Bắt đầu phân tích →',
  hookImage:     '/face-map-hook.svg',
};

export function ClinicalCompactHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--lp-accent) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, var(--lp-accent) 0 1px, transparent 1px 40px)',
        }}
      />
      <div className="max-w-5xl mx-auto w-full px-4 md:grid md:grid-cols-2 md:gap-8 md:items-center relative z-10">
        <div className="flex flex-col gap-3 py-10 md:py-0">
          {c.badge && (
            <span className="inline-flex items-center self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
              {c.badge}
            </span>
          )}
          <h1 className="font-extrabold text-3xl md:text-5xl text-[var(--lp-text)] leading-snug md:leading-snug [text-wrap:balance]">
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-sm md:text-base text-[var(--lp-text)]/60 max-w-sm">{c.subtext}</p>
          <div>
            <CtaButton onClick={onStart} size="md">{c.cta}</CtaButton>
          </div>
        </div>
        <div className="flex justify-center pb-6 md:pb-0 md:items-center md:justify-center">
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/20 bg-[var(--lp-bg-minigame)] p-2">
            <img
              src={c.hookImage}
              alt="Phân tích vùng da mụn"
              className="w-full max-w-[140px] md:max-w-[280px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
