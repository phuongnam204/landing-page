'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalMinimalHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg mx-auto w-full flex flex-col items-center gap-5 text-center animate-fade-in-up">
        <h1 className="font-bold text-2xl md:text-3xl text-cta leading-snug">
          Lắng nghe điều{' '}
          <span className="text-[var(--lp-accent)]">làn da</span>{' '}
          bạn đang nói
        </h1>
        <p className="text-sm text-cta/55 max-w-xs leading-relaxed">
          Chỉ mất 60 giây để biết làn da bạn thực sự cần gì.
        </p>
        <CtaButton onClick={onStart} size="md">
          Soi da ngay →
        </CtaButton>
      </div>
    </div>
  );
}
