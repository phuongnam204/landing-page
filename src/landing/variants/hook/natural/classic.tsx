'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      {/* Organic leaf decorative shapes */}
      <div
        className="absolute -top-20 -right-20 w-80 h-80 bg-[var(--lp-blob-1)] opacity-30 pointer-events-none"
        style={{ borderRadius: '0 0 0 80%', transform: 'rotate(-15deg)' }}
      />
      <div
        className="absolute -bottom-32 -left-16 w-64 h-64 bg-[var(--lp-blob-3)] opacity-25 pointer-events-none"
        style={{ borderRadius: '0 0 0 60%', transform: 'rotate(-15deg)' }}
      />

      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        {/* Text block */}
        <div className="flex flex-col gap-5 md:gap-6 animate-fade-in-up text-center md:text-left items-center md:items-start mb-8 md:mb-0">
          <h1 className="font-extrabold text-4xl md:text-6xl text-cta leading-tight">
            Lắng nghe điều{' '}
            <span className="text-[var(--lp-accent)]">làn da</span>{' '}
            bạn đang nói
          </h1>
          <p className="text-sm md:text-base text-cta/60 max-w-sm leading-relaxed">
            Chỉ mất 60 giây để biết làn da bạn thực sự cần gì — và liệu trình nào phù hợp nhất.
          </p>
          <CtaButton onClick={onStart} size="lg">
            Soi da ngay →
          </CtaButton>
        </div>

        {/* Face illustration with glow */}
        <div className="flex justify-center items-center relative">
          <div className="absolute inset-0 blur-xl opacity-30 rounded-full bg-[var(--lp-blob-2)]" />
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da"
            className="relative h-52 md:h-[460px] w-auto object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}
