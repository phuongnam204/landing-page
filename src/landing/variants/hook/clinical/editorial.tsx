'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function ClinicalEditorialHook({ onStart }: HookSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--lp-accent) 0 1px, transparent 1px 60px), repeating-linear-gradient(90deg, var(--lp-accent) 0 1px, transparent 1px 60px)',
        }}
      />
      <div className="max-w-6xl mx-auto w-full px-6 md:grid md:grid-cols-2 md:gap-16 md:items-center relative z-10">
        <div className="flex flex-col gap-6 py-16 md:py-0">
          <h1 className="font-serif text-4xl md:text-6xl text-[var(--lp-text)] leading-snug">
            Biết chính xác{' '}
            <span className="text-[var(--lp-accent)]">da bạn cần gì</span>{' '}
            trong 60 giây
          </h1>
          <p className="text-base md:text-lg text-[var(--lp-text)]/55 max-w-md leading-relaxed">
            Hệ thống phân tích vùng da mặt bằng bản đồ mụn — một phương pháp nhanh, trực quan, và được thiết kế riêng cho từng người.
          </p>
          <div>
            <CtaButton onClick={onStart} size="lg">
              Bắt đầu phân tích →
            </CtaButton>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="bg-[var(--lp-bg-minigame)] p-6 shadow-md rounded-[var(--lp-radius-card)]">
            <img
              src="/face-map-hook.svg"
              alt="Phân tích vùng da mụn"
              className="w-full max-w-[320px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
