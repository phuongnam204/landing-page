'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalEditorialHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center overflow-hidden px-5">
      <div className="max-w-6xl mx-auto w-full md:grid md:grid-cols-2 md:gap-16 md:items-center">
        {/* Text block — editorial / magazine style */}
        <div className="flex flex-col gap-6 text-center md:text-left items-center md:items-start mb-8 md:mb-0 animate-fade-in-up">
          <h1 className="font-serif font-bold text-4xl md:text-6xl text-cta leading-snug [text-wrap:balance] italic">
            Bạn Google{' '}
            <span className="text-[var(--lp-accent)] not-italic">&lsquo;cách trị mụn&rsquo;</span>{' '}
            lần thứ mấy rồi?
          </h1>
          <p className="font-serif italic text-base md:text-lg text-cta/55 max-w-sm leading-relaxed">
            Bạn biết câu trả lời rồi — và vẫn chưa tìm được đúng chỗ.
          </p>
          <CtaButton onClick={onStart} size="lg">
            Soi da ngay →
          </CtaButton>
        </div>

        {/* Image with decorative border */}
        <div className="flex justify-center items-center">
          <div className="relative p-3 border-2 border-[var(--lp-border)] rounded-[var(--lp-radius-card)]">
            <img
              src="/face-map-hook.svg"
              alt="Phân tích vùng da"
              className="h-52 md:h-[420px] w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
