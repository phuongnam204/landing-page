'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div className="flex-[1] flex items-center justify-center px-5" style={{ background: 'var(--lp-band-bg)' }}>
        <h1
          className="text-5xl md:text-8xl font-extrabold tracking-tight text-center leading-[0.95]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          DA BẠN
          <br />
          <span style={{ color: 'var(--lp-band-accent)' }}>CẦN GÌ?</span>
        </h1>
      </div>
      <div
        className="flex-[2] flex flex-col md:flex-row items-center justify-center overflow-hidden"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <div className="flex items-center justify-center shrink-0 px-4 md:px-0 md:h-full md:w-[45%]">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da"
            className="h-56 md:h-full max-h-[62vh] w-auto object-contain drop-shadow-xl"
          />
        </div>
        <div className="flex flex-col items-center md:items-start gap-5 text-center md:text-left px-6 md:px-8 md:w-[55%] pb-4 md:pb-0">
          <p className="text-sm md:text-base text-cta/60 max-w-md leading-relaxed">
            Phân tích vùng da mặt chỉ trong 60 giây — để biết làn da bạn thực sự cần gì và liệu trình nào phù hợp nhất.
          </p>
          <CtaButton onClick={onStart} size="lg">
            Soi da ngay →
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
