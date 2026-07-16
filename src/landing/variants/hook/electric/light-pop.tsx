'use client';
import type { HookSlotProps } from '../../../slots';

export function ElectricLightPopHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full relative flex items-center justify-center overflow-hidden" style={{ background: 'var(--lp-bg-hero)' }}>
      <div className="max-w-2xl mx-auto w-full px-5 relative z-10 text-center animate-fade-in-up">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>Phân tích vùng da</span>
        </div>

        <h1 className="font-extrabold text-4xl md:text-6xl leading-snug [text-wrap:balance] mb-5" style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
          Một ngày không cần<br />
          <span style={{ color: 'var(--lp-accent)' }}>nghĩ đến mụn</span>. Nghe hay không?
        </h1>

        <p className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
          Không cần perfect — chỉ cần đúng hướng.
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
          Soi da ngay
        </button>
      </div>
    </div>
  );
}
