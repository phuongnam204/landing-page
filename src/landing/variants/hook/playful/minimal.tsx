'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulMinimalHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      <div className="max-w-6xl mx-auto w-full px-5 md:flex md:items-center md:gap-12 relative z-10">
        <div className="relative h-48 md:h-[420px] mb-4 md:mb-0 flex items-center justify-center shrink-0">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-3xl md:text-5xl text-cta leading-tight">
            Da bạn cần được{' '}
            <span className="text-[var(--lp-accent)]">hiểu đúng</span>
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">
            Không phải mua thêm — chỉ cần biết chính xác điều da bạn đang thực sự cần.
          </p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg">
              Khám phá ngay
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-cta/50 mt-4">Chỉ 60 giây là xong</p>
        </div>
      </div>
    </div>
  );
}
