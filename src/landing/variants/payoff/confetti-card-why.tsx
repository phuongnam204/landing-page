'use client';
import type { PayoffSlotProps } from '../../slots';

export function ConfettiCardWhyPayoff({ result, onContinue }: PayoffSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5">
      <button onClick={onContinue} className="bg-cta text-white px-6 py-3 rounded-soft font-bold">
        [stub] {result.condition.label} — Tiếp theo →
      </button>
    </div>
  );
}
