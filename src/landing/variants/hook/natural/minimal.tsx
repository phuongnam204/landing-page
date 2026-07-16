'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalMinimalHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <img
          src="/face-map-hook.svg"
          alt="Phân tích vùng da"
          className="h-36 md:h-52 w-auto object-contain"
        />
        <h1 className="font-bold text-4xl md:text-5xl text-cta leading-snug [text-wrap:balance]" style={{ fontFamily: 'var(--font-nunito)' }}>
          Mụn không phải lỗi của bạn.{' '}
          <span className="text-[var(--lp-accent)]">Nhưng cách xử lý</span>{' '}
          thì có thể.
        </h1>
        <p className="text-sm text-cta/55 max-w-xs leading-relaxed">
          Hiểu đúng — để lần này làm khác đi.
        </p>
        <CtaButton onClick={onStart} size="md">
          Soi da ngay →
        </CtaButton>
      </div>
    </div>
  );
}
