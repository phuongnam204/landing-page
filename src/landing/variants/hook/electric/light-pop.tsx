'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích vùng da',
  heading:       'Một ngày không cần',
  headingAccent: 'nghĩ đến mụn. Nghe hay không?',
  subtext:       'Không cần perfect — chỉ cần đúng hướng.',
  cta:           'Soi da ngay',
  hookImage:     '',
};

export function ElectricLightPopHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full relative flex items-center justify-center overflow-hidden" style={{ background: 'var(--lp-bg-hero)' }}>

      {/* ── Decorative figures — visible only on xl+ where side space is wide enough ── */}
      <div
        className="absolute left-0 bottom-0 top-0 z-0 pointer-events-none select-none hidden xl:flex items-end"
        style={{ right: 'calc(50% + 21rem)' }}
      >
        <img src="/face-map-v1/face-map-hook-1.svg" alt="" aria-hidden="true"
          className="w-auto max-w-full" style={{ maxHeight: '75dvh' }} />
      </div>

      <div
        className="absolute right-0 bottom-0 top-0 z-0 pointer-events-none select-none hidden xl:flex items-end justify-end"
        style={{ left: 'calc(50% + 21rem)' }}
      >
        <img src="/face-map-v1/face-map-hook-2.svg" alt="" aria-hidden="true"
          className="w-auto max-w-full" style={{ maxHeight: '75dvh' }} />
      </div>

      <div className="max-w-2xl mx-auto w-full px-5 relative z-10 text-center animate-fade-in-up">
        {c.badge && (
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>{c.badge}</span>
          </div>
        )}

        <h1 className="font-extrabold text-4xl md:text-6xl leading-snug md:leading-snug [text-wrap:balance] mb-5" style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
          {c.heading}<br />
          <span style={{ color: 'var(--lp-accent)' }}>{c.headingAccent}</span>
        </h1>

        <p className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
          {c.subtext}
        </p>

        <button
          onClick={onStart}
          className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer"
          style={{
            background: 'var(--lp-accent)',
            color: '#fff',
            boxShadow: '0 4px 14px color-mix(in srgb, var(--lp-accent) 35%, transparent)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px color-mix(in srgb, var(--lp-accent) 45%, transparent)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px color-mix(in srgb, var(--lp-accent) 35%, transparent)'; }}
        >
          {c.cta}
        </button>
      </div>
    </div>
  );
}
