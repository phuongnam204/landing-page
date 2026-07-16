'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function ElectricClassicHook({ onStart }: HookSlotProps) {
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
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[340px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 28px color-mix(in srgb, var(--lp-accent) 40%, transparent))' }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <div
            className="inline-block px-4 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--lp-accent) 20%, transparent)',
              border: '1px solid color-mix(in srgb, var(--lp-accent) 30%, transparent)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--lp-band-text)' }}>Phân tích vùng da</span>
          </div>

          <h1 className="font-extrabold text-4xl md:text-6xl leading-snug [text-wrap:balance]" style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}>
            Da bạn<br />
            <span style={{ color: 'var(--lp-accent)', filter: 'drop-shadow(0 0 20px var(--lp-accent))' }}>đang nói gì</span>?
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-band-text) 65%, transparent)' }}>
            Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
          </p>

          <CtaButton onClick={onStart} variant="accent" size="lg" className="cta-glow-hover">
            Soi da ngay
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
