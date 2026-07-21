'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích da chính xác',
  heading:       'Biết chính xác',
  headingAccent: 'da bạn cần gì trong 60 giây',
  subtext:       'Hệ thống phân tích vùng da mặt bằng bản đồ mụn — nhanh, trực quan, và cá nhân hóa cho từng người.',
  cta:           'Bắt đầu phân tích →',
  hookImage:     '/face-map-hook.svg',
};

export function ClinicalClassicHook({ onStart, copy }: HookSlotProps) {
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
      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        <div className="flex flex-col gap-5 py-12 md:py-0">
          <span className="inline-flex items-center gap-2 self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-4 py-1.5 text-xs font-semibold text-[var(--lp-accent)]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="12" y1="2" x2="12" y2="4" />
              <line x1="12" y1="20" x2="12" y2="22" />
              <line x1="2" y1="12" x2="4" y2="12" />
              <line x1="20" y1="12" x2="22" y2="12" />
            </svg>
            {c.badge}
          </span>
          <h1 className="font-extrabold text-4xl md:text-6xl text-[var(--lp-text)] leading-snug md:leading-snug [text-wrap:balance]">
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--lp-text)]/60 max-w-md">{c.subtext}</p>
          <div>
            <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/20 bg-[var(--lp-bg-minigame)] p-4 shadow-sm">
            <img
              src={c.hookImage}
              alt="Phân tích vùng da mụn"
              className="w-full max-w-[320px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
