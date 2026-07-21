'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Chăm da đúng cách',
  heading:       'Skincare không cần nhiều.',
  headingAccent: 'Cần đúng.',
  subtext:       'Biết đúng điều da cần mới quan trọng hơn số bước.',
  cta:           'Khám phá ngay',
  hookImage:     '/face-map-hook.svg',
};

export function PlayfulMinimalHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      <div className="max-w-6xl mx-auto w-full px-5 md:flex md:items-center md:gap-12 relative z-10">
        <div className="relative h-48 md:h-[420px] mb-4 md:mb-0 flex items-center justify-center shrink-0">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          {c.badge && (
            <div className="inline-block px-3 py-1 rounded-full mb-4"
                 style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--lp-accent)' }}>{c.badge}</span>
            </div>
          )}
          <h1 className="font-extrabold text-3xl md:text-5xl text-cta leading-snug md:leading-snug [text-wrap:balance]">
            {c.heading}<br />
            <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">{c.subtext}</p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
          </div>
          <p className="text-sm md:text-base text-cta/50 mt-4">Chỉ 60 giây là xong</p>
        </div>
      </div>
    </div>
  );
}
