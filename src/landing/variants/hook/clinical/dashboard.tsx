'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Dashboard da cá nhân',
  heading:       'Sản phẩm xịn không trị được da —',
  headingAccent: 'hiểu đúng da mới làm được.',
  subtext:       'Đúng sản phẩm cho sai da còn tệ hơn không dùng gì.',
  cta:           'Bắt đầu phân tích →',
  hookImage:     '/face-map-hook.svg',
};

const STATS = [
  { label: 'Độ nhạy', value: '7.2', unit: '/10' },
  { label: 'Bã nhờn', value: '4.8', unit: '/10' },
  { label: 'Độ ẩm', value: '6.1', unit: '/10' },
];

export function ClinicalDashboardHook({ onStart, copy }: HookSlotProps) {
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
          {c.badge && (
            <span className="inline-flex items-center self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
              {c.badge}
            </span>
          )}
          <h1 className="font-extrabold text-4xl md:text-5xl text-[var(--lp-primary)] leading-snug md:leading-snug [text-wrap:balance]">
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-base text-[var(--lp-primary)]/60 max-w-md">{c.subtext}</p>
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/20 bg-[var(--lp-bg-card)] p-4 flex flex-col gap-2.5 w-fit">
            {STATS.map((s) => (
              <div key={s.label} className="flex items-baseline gap-3">
                <span className="text-xs font-semibold text-[var(--lp-primary)]/50 uppercase tracking-wider w-20">
                  {s.label}
                </span>
                <span className="text-lg font-bold text-[var(--lp-accent)] tabular-nums">
                  {s.value}
                </span>
                <span className="text-xs text-[var(--lp-primary)]/40">{s.unit}</span>
              </div>
            ))}
          </div>
          <div>
            <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
          </div>
        </div>
        <div className="flex justify-center pb-8 md:pb-0 md:items-center md:justify-center">
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/20 bg-[var(--lp-bg-minigame)] p-4 shadow-sm">
            <img
              src={c.hookImage}
              alt="Phân tích vùng da mụn"
              className="w-full max-w-[160px] md:max-w-[320px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
