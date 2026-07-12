'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div className="flex-[1] flex items-center justify-center px-5" style={{ background: 'var(--lp-band-bg)' }}>
        <h1
          className="text-5xl md:text-8xl font-extrabold tracking-tight text-center leading-[0.95]"
          style={{ color: 'var(--lp-band-text)' }}
        >
          DA BẠN
          <br />
          <span style={{ color: 'var(--lp-band-accent)' }}>CẦN GÌ?</span>
        </h1>
      </div>
      <div
        className="flex-[2] flex flex-col items-center justify-center px-5 gap-6"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <p className="text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed">
          Phân tích vùng da mặt chỉ trong 60 giây — để biết làn da bạn thực sự cần gì và liệu trình nào phù hợp nhất.
        </p>
        <CtaButton onClick={onStart} size="lg">
          Soi da ngay →
        </CtaButton>
        <img
          src="/face-map-hook.svg"
          alt="Phân tích vùng da"
          className="h-36 md:h-52 w-auto object-contain"
        />
      </div>
    </div>
  );
}
