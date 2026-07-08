'use client';
import type { ConversionSlotProps } from '../../slots';

export function ShortFormWithTestimonialsConversion({ onSubmit }: ConversionSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center">
      <button onClick={() => onSubmit('stub', '0900000000')} className="bg-cta text-white px-6 py-3 rounded-soft font-bold">
        [stub] Gửi
      </button>
    </div>
  );
}
