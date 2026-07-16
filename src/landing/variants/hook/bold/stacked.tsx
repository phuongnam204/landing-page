'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldStackedHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="w-full py-10 px-5 flex items-center justify-center"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-3xl md:text-5xl font-extrabold tracking-tight text-center leading-snug md:leading-snug [text-wrap:balance]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          Hết mụn này, mụn khác mọc. Vòng lặp đó có thể kết thúc.
        </h1>
      </div>
      <div
        className="flex-1 flex flex-col items-center justify-center px-5 gap-6"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <img
          src="/face-map-hook.svg"
          alt="Phân tích vùng da"
          className="h-36 md:h-48 w-auto object-contain"
        />
        <p className="text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed">
          Khi xử lý đúng nguyên nhân, không phải triệu chứng.
        </p>
        <CtaButton onClick={onStart} size="lg">
          Soi da ngay →
        </CtaButton>
      </div>
    </div>
  );
}
