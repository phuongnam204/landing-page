'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldTypographicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="hook-da-bg flex-[1] flex items-center justify-center px-5"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          Soi da.
        </h1>
      </div>
      <div
        className="flex-[2] flex flex-col items-center justify-center px-5 gap-6"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <p
          className="hook-can-text text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]"
          style={{ color: 'var(--lp-band-accent)' }}
        >
          60 giây.
        </p>
        <p
          className="hook-fade-in text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed"
          style={{ animationDelay: '0.55s' }}
        >
          Phân tích vùng mụn và nhận phác đồ cá nhân hóa — hoàn toàn miễn phí.
        </p>
        <div className="hook-fade-in" style={{ animationDelay: '0.7s' }}>
          <CtaButton onClick={onStart} size="lg">
            Soi da ngay →
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
