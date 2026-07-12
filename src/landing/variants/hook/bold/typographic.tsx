'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldTypographicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="flex-[1] flex items-center justify-center px-5"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]"
          style={{ color: 'var(--lp-band-text)' }}
        >
          DA BẠN
        </h1>
      </div>
      <div
        className="flex-[2] flex flex-col items-center justify-center px-5 gap-6"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <p
          className="text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]"
          style={{ color: 'var(--lp-band-accent)' }}
        >
          CẦN GÌ?
        </p>
        <p className="text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed">
          Phân tích vùng da mặt chỉ trong 60 giây.
        </p>
        <CtaButton onClick={onStart} size="lg">
          Soi da ngay →
        </CtaButton>
      </div>
    </div>
  );
}
