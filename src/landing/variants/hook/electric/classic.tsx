'use client';
import type { HookSlotProps } from '../../../slots';

export function ElectricClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-112 h-112 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(219,39,119,.35) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-112 h-112 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147,51,234,.3) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-5xl mx-auto w-full px-5 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-14 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[340px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 28px rgba(219,39,119,.4))' }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 rounded-full" style={{ background: 'rgba(219,39,119,.2)', border: '1px solid rgba(219,39,119,.3)' }}>
            <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>Phân tích vùng da</span>
          </div>

          <h1 className="font-extrabold text-4xl md:text-6xl leading-tight" style={{ color: 'var(--lp-band-text)' }}>
            Da bạn<br />
            <span style={{ color: 'var(--lp-accent)', filter: 'drop-shadow(0 0 20px var(--lp-accent))' }}>đang nói gì</span>?
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-band-text) 65%, transparent)' }}>
            Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
          </p>

          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer"
            style={{
              background: 'var(--lp-accent)',
              color: '#fff',
              boxShadow: '0 0 24px rgba(219,39,119,.5)',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 36px rgba(219,39,119,.7)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 24px rgba(219,39,119,.5)'; }}
          >
            Soi da ngay
          </button>
        </div>
      </div>
    </div>
  );
}
