'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Chuyên mục da mặt',
  heading:       'Da bạn xứng đáng được',
  headingAccent: 'hiểu — không chỉ được che.',
  subtext:       'Không che. Không filter. Chỉ cần đúng phác đồ.',
  cta:           'Bắt đầu phân tích →',
  hookImage:     '/face-map-hook.svg',
};

export function ClinicalEditorialHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden"
      style={{ fontFamily: 'var(--font-lora, Georgia, serif)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--lp-accent) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, var(--lp-accent) 0 1px, transparent 1px 60px)',
        }}
      />
      <div className="max-w-6xl mx-auto w-full px-6 md:grid md:grid-cols-2 md:gap-16 md:items-center relative z-10">
        <div className="flex flex-col gap-6 py-16 md:py-0">
          {c.badge && (
            <span className="inline-flex items-center self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
              {c.badge}
            </span>
          )}
          <h1 className="font-bold text-4xl md:text-6xl text-[var(--lp-primary)] leading-snug md:leading-snug [text-wrap:balance]">
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-base md:text-lg text-[var(--lp-primary)]/55 max-w-md leading-relaxed">{c.subtext}</p>
          <div>
            <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
          </div>
        </div>
        <div className="flex justify-center pb-10 md:pb-0 md:items-center md:justify-center">
          <div className="bg-[var(--lp-bg-minigame)] p-6 shadow-md rounded-[var(--lp-radius-card)]">
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
