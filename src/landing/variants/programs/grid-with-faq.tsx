'use client';
import type { ProgramsSlotProps } from '../../slots';

export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center">
      <button onClick={() => onContinue(suggestedProgramId)} className="bg-cta text-white px-6 py-3 rounded-soft font-bold">
        [stub] Đặt lịch
      </button>
    </div>
  );
}
