'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Hết mụn này, mụn khác mọc.',
  headingAccent: 'Vòng lặp đó có thể kết thúc.',
  subtext:       'Đặt lịch ngay hoặc phân tích da trước — chọn cách phù hợp với bạn.',
  cta:           'Tìm giải pháp phù hợp →',
  hookImage:     '/face-map-hook.svg',
};

export function BoldStackedHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="w-full py-10 px-5 flex items-center justify-center"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-center leading-snug md:leading-snug [text-wrap:balance]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          {c.heading}<br />
          <span style={{ color: 'var(--lp-band-accent)' }}>{c.headingAccent}</span>
        </h1>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 gap-6"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <img
          src={c.hookImage}
          alt="Phân tích vùng da"
          className="h-36 md:h-48 w-auto object-contain"
        />
        <p className="text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed">{c.subtext}</p>
        <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
      </div>
    </div>
  );
}
