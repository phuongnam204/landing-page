'use client';
import type { HookSlotProps } from '../../slots';
import { CtaButton } from '../../../components/atoms/CtaButton';

export function BoldSingleHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] flex items-center overflow-hidden px-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center gap-6 md:grid md:grid-cols-2 md:gap-16 md:items-center">

        {/* Text block */}
        <div className="flex flex-col gap-4 md:gap-5 animate-fade-in-up text-center md:text-left items-center md:items-start">
          <h1 className="font-extrabold text-4xl md:text-7xl text-cta leading-[1.05] tracking-tight">
            Da bạn đang{' '}
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
              nói gì
            </span>{' '}
            với bạn?
          </h1>
          <p className="text-sm md:text-base text-cta/55 max-w-xs leading-relaxed">
            Chỉ mất 60 giây để biết da bạn thực sự cần gì.
          </p>
          <CtaButton onClick={onStart} size="lg">
            Khám phá ngay →
          </CtaButton>
        </div>

        {/* Face illustration */}
        <div className="flex justify-center items-center">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[460px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 4px 24px color-mix(in srgb, var(--lp-primary) 40%, transparent))' }}
          />
        </div>
      </div>
    </div>
  );
}
