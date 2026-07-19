'use client';
import { useState } from 'react';
import type { TeaserPayoffSlotProps } from '../../../slots';
import { trackEvent } from '../../../../lib/trackEvent';

export function BoldClassicTeaserPayoff({ onContinue }: TeaserPayoffSlotProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden items-center justify-center px-5"
      style={{ animation: 'fade-in 400ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes breathe { 0%, 100% { transform: scale(1); opacity: 0.6; } 50% { transform: scale(1.03); opacity: 1; } }
        .teaser-card { animation: breathe 3s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-sm mx-auto text-center">
        <p className="text-xs font-bold uppercase tracking-widest mb-4"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          Ban chua san sang?
        </p>

        <div className="teaser-card rounded-soft p-6 relative overflow-hidden"
          style={{
            background: 'color-mix(in srgb, var(--lp-accent) 6%, white)',
            border: '1px solid color-mix(in srgb, var(--lp-accent) 14%, transparent)',
            filter: hovered ? 'blur(0)' : 'blur(3px)',
            transition: 'filter 400ms ease',
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="text-lg font-extrabold" style={{ color: 'var(--lp-primary)' }}>
            Noi dung danh cho ban
          </div>
          <div className="mt-3 flex justify-center gap-2">
            <div className="h-3 w-16 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 20%, white)' }} />
            <div className="h-3 w-12 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 20%, white)' }} />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <div className="h-2 w-full rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, white)' }} />
            <div className="h-2 w-3/4 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, white)' }} />
            <div className="h-2 w-5/6 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, white)' }} />
          </div>
        </div>

        <p className="text-xs mt-4 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          Noi dung chi tiet ve tinh trang da se duoc mo khoa sau khi dat lich.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button onClick={() => { trackEvent('teaser_book'); onContinue(); }}
            className="w-full rounded-full py-3.5 text-base font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: 'var(--lp-accent)' }}>
            Dat lich de xem day du
          </button>
          <button onClick={() => { trackEvent('teaser_skip'); onContinue(); }}
            className="text-sm font-semibold underline underline-offset-2"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
            Bo qua, chuyen den dang ky
          </button>
        </div>
      </div>
    </div>
  );
}
