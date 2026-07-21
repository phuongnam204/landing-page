'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích vùng da',
  heading:       'Da bạn',
  headingAccent: 'đang nói gì?',
  subtext:       'Chỉ mất 60 giây để làn da bạn được nghe — và tìm ra điều thực sự cần thiết.',
  cta:           'Soi da ngay',
  hookImage:     '/face-map-hook.svg',
};

export function ElectricClassicHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-112 h-112 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--lp-accent) 35%, transparent) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-112 h-112 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, color-mix(in srgb, var(--lp-primary) 30%, transparent) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto w-full px-5 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-14 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[340px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 28px color-mix(in srgb, var(--lp-accent) 40%, transparent))' }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          {c.badge && (
            <div
              className="inline-block px-4 py-1.5 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--lp-accent) 20%, transparent)',
                border: '1px solid color-mix(in srgb, var(--lp-accent) 30%, transparent)',
              }}
            >
              <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>{c.badge}</span>
            </div>
          )}

          <h1 className="font-extrabold text-4xl md:text-6xl leading-snug md:leading-snug [text-wrap:balance]" style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
            {c.heading}<br />
            <span style={{ color: 'var(--lp-accent)' }}>{c.headingAccent}</span>
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
            {c.subtext}
          </p>

          <CtaButton onClick={onStart} variant="accent" size="lg" className="cta-glow-hover">
            {c.cta}
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
