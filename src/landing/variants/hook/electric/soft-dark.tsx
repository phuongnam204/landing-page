'use client';
import type { HookSlotProps } from '../../../slots';

export function ElectricSoftDarkHook({ onStart }: HookSlotProps) {
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
            src="/face-map-hook.svg"
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
            <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>Phân tích vùng da</span>
          </div>

          <h1 className="font-extrabold text-4xl md:text-6xl leading-tight" style={{ color: 'var(--lp-primary)' }}>
            Da bạn<br />
            <span style={{ color: 'var(--lp-accent)' }}>đang nói gì</span>?
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
            Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
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
            Soi da ngay
          </button>
        </div>
      </div>
    </div>
  );
}
