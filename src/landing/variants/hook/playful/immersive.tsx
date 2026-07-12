'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulImmersiveHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] relative flex items-center overflow-hidden">
      <div className="absolute right-0 top-0 h-full w-auto opacity-60 md:opacity-90 pointer-events-none">
        <img
          src="/face-map-hook.svg"
          alt=""
          className="h-full w-auto object-contain"
        />
      </div>

      <div className="max-w-6xl mx-auto w-full px-5 relative z-10">
        <div className="text-center md:text-left md:max-w-xl animate-fade-in-up">
          <h1 className="font-extrabold text-5xl md:text-7xl text-cta leading-tight">
            Da bạn đang{' '}
            <span className="text-[var(--lp-accent)]">giấu</span>{' '}
            điều gì?
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">
            Tìm những &ldquo;bạn nhỏ&rdquo; ẩn náu và khám phá điều da bạn thực sự cần.
          </p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg">
              Soi da ngay →
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-cta/50 mt-4">Chỉ mất 60 giây</p>
        </div>
      </div>
    </div>
  );
}
