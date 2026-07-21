'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích vùng da',
  heading:       'Skincare routine dài',
  headingAccent: 'hơn cả bộ phim. Da vẫn tệ.',
  subtext:       'Không phải bạn lười. Là cách tiếp cận.',
  cta:           'Soi da ngay',
  hookImage:     '/face-map-hook.svg',
};

export function ElectricGlowHeavyHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-128 h-128 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(219,39,119,.6) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-128 h-128 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147,51,234,.5) 0%, transparent 70%)',
          filter: 'blur(80px)',
        }}
      />

      <div className="max-w-5xl mx-auto w-full px-5 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-14 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[340px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 40px rgba(219,39,119,.6))' }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          {c.badge && (
            <div className="inline-block px-4 py-1.5 rounded-full" style={{ background: 'rgba(219,39,119,.2)', border: '1px solid rgba(219,39,119,.3)' }}>
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

          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer"
            style={{
              background: 'var(--lp-accent)',
              color: '#fff',
              boxShadow: '0 0 40px rgba(219,39,119,.7)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 56px rgba(219,39,119,.9)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 40px rgba(219,39,119,.7)'; }}
          >
            {c.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
