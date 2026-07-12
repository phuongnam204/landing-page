'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulDarkAccentHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-accent)] relative flex items-center overflow-hidden">
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--lp-blob-3)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full px-5 md:flex md:items-center md:gap-12 relative z-10">
        <div className="relative h-48 md:h-[420px] mb-4 md:mb-0 flex items-center justify-center shrink-0">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-4xl md:text-6xl text-white leading-tight">
            Da bạn đang{' '}
            <span className="text-[var(--lp-blob-3)]">giấu</span>{' '}
            điều gì?
          </h1>
          <p className="text-base md:text-lg text-white/70 mt-5">
            Tìm những &ldquo;bạn nhỏ&rdquo; ẩn náu và khám phá điều da bạn thực sự cần.
          </p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg" className="bg-white text-[var(--lp-accent)]">
              Soi da ngay →
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-white/50 mt-4">Chỉ mất 60 giây</p>
        </div>
      </div>
    </div>
  );
}
