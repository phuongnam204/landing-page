'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] relative flex items-center overflow-hidden">
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--lp-blob-1)] blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-80 h-80 rounded-full bg-[var(--lp-blob-2)] blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-72 h-72 rounded-full bg-[var(--lp-blob-3)] blur-3xl opacity-25 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full px-5 md:flex md:items-center md:gap-12 relative z-10">
        <div className="relative h-48 md:h-[420px] mb-4 md:mb-0 flex items-center justify-center shrink-0">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-4xl md:text-6xl text-cta leading-tight">
            Mụn của bạn đang{' '}
            <span className="text-[var(--lp-accent)]">giấu</span>{' '}
            bí mật gì?
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">
            Da tự kể câu chuyện của mình — chỉ cần 60 giây để lắng nghe.
          </p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg">
              Bật đèn soi da →
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-cta/50 mt-4">Miễn phí, không cần đăng ký</p>
        </div>
      </div>
    </div>
  );
}
