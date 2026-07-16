'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulImmersiveHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] relative flex items-start md:items-center overflow-hidden">

      {/* Face image: mobile = bottom-anchored 60% height; desktop = full-height right side */}
      <div className="absolute right-0 bottom-0 h-[60%] md:top-0 md:h-full w-auto opacity-75 md:opacity-90 pointer-events-none">
        <img
          src="/face-map-hook.svg"
          alt=""
          className="h-full w-auto object-contain object-bottom md:object-top"
        />
      </div>

      {/* Gradient scrim: blends face top edge into background — mobile only */}
      <div
        className="absolute inset-x-0 bottom-[52%] h-24 md:hidden pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, var(--lp-bg-hero) 100%)',
        }}
      />

      <div className="max-w-6xl mx-auto w-full px-5 relative z-10 pt-14 md:pt-0">
        <div className="text-center md:text-left md:max-w-xl animate-fade-in-up">
          <h1 className="font-extrabold text-4xl md:text-7xl text-cta leading-snug [text-wrap:balance]">
            Đã thử đủ thứ,{' '}
            <span className="text-[var(--lp-accent)]">vẫn mụn</span>?
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-4 md:mt-5">
            Có thể vấn đề không nằm ở sản phẩm — mà ở chỗ chưa ai thực sự hiểu da bạn.
          </p>
          <div className="flex justify-center md:justify-start mt-6 md:mt-7">
            <CtaButton onClick={onStart} size="lg">
              Để da tôi lên tiếng →
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-cta/50 mt-3 md:mt-4">Phân tích miễn phí trong 60 giây</p>
        </div>
      </div>
    </div>
  );
}
