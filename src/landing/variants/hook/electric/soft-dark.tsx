'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích vùng da',
  heading:       'Có một lý do da bạn',
  headingAccent: 'chưa khỏi hẳn',
  subtext:       'Vuốt trái / phải để xác định đúng tình trạng da — chỉ mất 30 giây.',
  cta:           'Bắt đầu vuốt →',
  hookImage:     '/face-map-hook.svg',
};

export function ElectricSoftDarkHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-112 h-112 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--lp-accent) 12%, transparent) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-112 h-112 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--lp-primary) 8%, transparent) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto w-full px-5 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-14 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[340px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 28px color-mix(in srgb, var(--lp-accent) 50%, transparent))' }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <div
            className="inline-block px-4 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>{c.badge}</span>
          </div>

          <h1 className="font-extrabold text-4xl md:text-6xl leading-snug md:leading-snug [text-wrap:balance]" style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
            {c.heading}<br />
            <span style={{ color: 'var(--lp-accent)' }}>{c.headingAccent}</span>
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
            {c.subtext}
          </p>

          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-accent)] focus-visible:ring-offset-2"
            style={{
              background: 'var(--lp-accent)',
              color: '#fff',
              boxShadow: 'color-mix(in srgb, var(--lp-accent) 30%, transparent) 0 0 12px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'color-mix(in srgb, var(--lp-accent) 50%, transparent) 0 0 20px'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'color-mix(in srgb, var(--lp-accent) 30%, transparent) 0 0 12px'; }}
          >
            {c.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
