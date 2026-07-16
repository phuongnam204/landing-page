'use client';
import type { HookSlotProps } from '../../slots';
import { CtaButton } from '../../../components/atoms/CtaButton';

export function TwoColumnHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] relative flex items-center overflow-hidden transition-colors duration-500">
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center hero-texture"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?w=1920&q=40&fit=crop&fm=jpg)' }}
      />
      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        <div className="relative h-48 md:h-[500px] mb-4 md:mb-0 flex items-center justify-center">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>
        <div className="text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-4xl md:text-6xl text-cta leading-snug [text-wrap:balance]">
            Da bạn đang{' '}
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">giấu</span>{' '}
            điều gì?
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">
            Có những "bạn nhỏ" đang ẩn náu trên làn da của bạn. Tìm chúng — và khám phá điều da bạn thực sự cần.
          </p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg">
              Soi da ngay →
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-cta/50 mt-4">Cùng thực hiện một cuộc khám phá làn da nhé!</p>
        </div>
      </div>
    </div>
  );
}
