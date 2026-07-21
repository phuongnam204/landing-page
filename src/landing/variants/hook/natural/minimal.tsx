'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Mụn không phải lỗi của bạn.',
  headingAccent: 'Nhưng cách xử lý',
  subtext:       'Hiểu đúng — để lần này làm khác đi.',
  cta:           'Soi da ngay →',
  hookImage:     '/face-map-hook.svg',
};

export function NaturalMinimalHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <img
          src={c.hookImage}
          alt="Phân tích vùng da"
          className="h-36 md:h-52 w-auto object-contain"
        />
        <h1 className="font-bold text-4xl md:text-5xl text-cta leading-snug md:leading-snug [text-wrap:balance]" style={{ fontFamily: 'var(--font-nunito)' }}>
          {c.heading}{' '}
          <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>{' '}
          thì có thể.
        </h1>
        <p className="text-sm text-cta/55 max-w-xs leading-relaxed">
          {c.subtext}
        </p>
        <CtaButton onClick={onStart} size="md">
          {c.cta}
        </CtaButton>
      </div>
    </div>
  );
}
