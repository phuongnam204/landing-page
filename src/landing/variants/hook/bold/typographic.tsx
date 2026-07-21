'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Soi da.',
  headingAccent: '60 giây.',
  subtext:       'Phân tích vùng mụn và nhận phác đồ cá nhân hóa — hoàn toàn miễn phí.',
  cta:           'Soi da ngay →',
  hookImage:     '',
};

export function BoldTypographicHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="hook-da-bg flex-[1] flex items-center justify-center px-5"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-[42px] md:text-[90px] font-extrabold tracking-tight text-center leading-[0.9]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          {c.heading}
        </h1>
      </div>
      <div
        className="flex-[2] flex flex-col items-center justify-center px-5 gap-6"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <p
          className="hook-can-text text-[42px] md:text-[90px] font-extrabold tracking-tight text-center leading-[0.9]"
          style={{ color: 'var(--lp-band-accent)' }}
        >
          {c.headingAccent}
        </p>
        <p
          className="hook-fade-in text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed"
          style={{ animationDelay: '0.55s' }}
        >
          {c.subtext}
        </p>
        <div className="hook-fade-in" style={{ animationDelay: '0.7s' }}>
          <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
        </div>
      </div>
    </div>
  );
}
