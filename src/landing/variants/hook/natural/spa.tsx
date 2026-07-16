'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalSpaHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 py-16 overflow-hidden">
      <div className="max-w-5xl mx-auto w-full flex flex-col md:flex-row items-center gap-8 md:gap-16 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da"
            className="h-48 md:h-[320px] w-auto object-contain opacity-90"
          />
        </div>
        <div className="flex flex-col items-center md:items-start gap-6 text-center md:text-left">
          <h1 className="font-extrabold text-5xl md:text-6xl text-cta leading-snug md:leading-snug [text-wrap:balance]" style={{ fontFamily: 'var(--font-nunito)' }}>
            Chỉ cần da{' '}
            <span className="text-[var(--lp-accent)]">tốt hơn tuần trước</span>.
            Không cần perfect.
          </h1>
          <p className="text-base md:text-lg text-cta/55 max-w-lg leading-relaxed">
            Bắt đầu từ việc hiểu đúng da bạn.
          </p>
          <CtaButton onClick={onStart} size="lg">
            Soi da ngay →
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
