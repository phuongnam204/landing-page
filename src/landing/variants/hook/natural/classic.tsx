'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Da bạn đang phản bội bạn —',
  headingAccent: 'hay bạn đang hiểu nhầm nó?',
  subtext:       'Câu trả lời khác hoàn toàn tùy vào góc nhìn.',
  cta:           'Soi da ngay →',
  hookImage:     '/face-map-hook.svg',
};

export function NaturalClassicHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      <div
        className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--lp-blob-1)] opacity-30 pointer-events-none"
        style={{ borderRadius: '0 0 0 80%', transform: 'rotate(-15deg)' }}
      />
      <div
        className="absolute -bottom-32 -left-16 w-64 h-64 bg-[var(--lp-blob-3)] opacity-25 pointer-events-none"
        style={{ borderRadius: '0 0 0 60%', transform: 'rotate(-15deg)' }}
      />

      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        <div className="flex flex-col gap-5 md:gap-6 animate-fade-in-up text-center md:text-left items-center md:items-start mb-8 md:mb-0">
          {c.badge && (
            <span className="inline-flex items-center self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
              {c.badge}
            </span>
          )}
          <h1 className="font-extrabold text-4xl md:text-6xl text-cta leading-snug md:leading-snug [text-wrap:balance]" style={{ fontFamily: 'var(--font-nunito)' }}>
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-sm md:text-base text-cta/60 max-w-sm leading-relaxed">{c.subtext}</p>
          <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
        </div>

        <div className="flex justify-center items-center relative">
          <div className="absolute inset-0 blur-xl opacity-30 rounded-full bg-[var(--lp-blob-2)]" />
          <img
            src={c.hookImage}
            alt="Phân tích vùng da"
            className="relative h-52 md:h-[460px] w-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
