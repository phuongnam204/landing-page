'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function ClinicalCompactHook({ onStart }: HookSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] relative flex items-center overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, var(--lp-accent) 0 1px, transparent 1px 40px), repeating-linear-gradient(90deg, var(--lp-accent) 0 1px, transparent 1px 40px)',
        }}
      />
      <div className="max-w-5xl mx-auto w-full px-4 md:grid md:grid-cols-2 md:gap-8 md:items-center relative z-10">
        <div className="flex flex-col gap-3 py-10 md:py-0">
          <h1 className="font-extrabold text-3xl md:text-5xl text-[var(--lp-text)] leading-tight">
            Biết chính xác{' '}
            <span className="text-[var(--lp-accent)]">da bạn cần gì</span>{' '}
            trong 60 giây
          </h1>
          <p className="text-sm md:text-base text-[var(--lp-text)]/60 max-w-sm">
            Hệ thống phân tích vùng da mặt bằng bản đồ mụn — nhanh và trực quan.
          </p>
          <div>
            <CtaButton onClick={onStart} size="md">
              Bắt đầu phân tích →
            </CtaButton>
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/20 bg-[var(--lp-bg-minigame)] p-2">
            <img
              src="/face-map-hook.svg"
              alt="Phân tích vùng da mụn"
              className="w-full max-w-[280px] h-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
