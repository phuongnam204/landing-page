'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Bạn Google',
  headingAccent: '‘cách trị mụn’ lần thứ mấy rồi?',
  subtext:       'Bạn biết câu trả lời rồi — và vẫn chưa tìm được đúng chỗ.',
  cta:           'Soi da ngay →',
  hookImage:     '/face-map-hook.svg',
};

export function NaturalEditorialHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center overflow-hidden px-5">
      <div className="max-w-6xl mx-auto w-full md:grid md:grid-cols-2 md:gap-16 md:items-center">
        <div className="flex flex-col gap-6 text-center md:text-left items-center md:items-start mb-8 md:mb-0 animate-fade-in-up">
          {c.badge && (
            <span className="inline-flex items-center self-start rounded-full border border-[var(--lp-accent)]/30 bg-[var(--lp-accent)]/10 px-3 py-1 text-xs font-semibold text-[var(--lp-accent)]">
              {c.badge}
            </span>
          )}
          <h1 className="font-serif font-bold text-4xl md:text-6xl text-cta leading-snug md:leading-snug [text-wrap:balance] italic">
            {c.heading}<br />
            <span className="text-[var(--lp-accent)] not-italic">{c.headingAccent}</span>
          </h1>
          <p className="font-serif italic text-base md:text-lg text-cta/55 max-w-sm leading-relaxed">{c.subtext}</p>
          <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
        </div>

        <div className="flex justify-center items-center">
          <div className="relative p-3 border-2 border-[var(--lp-border)] rounded-[var(--lp-radius-card)]">
            <img
              src={c.hookImage}
              alt="Phân tích vùng da"
              className="h-52 md:h-[420px] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
