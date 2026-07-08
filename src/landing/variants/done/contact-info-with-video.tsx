'use client';
import type { DoneSlotProps } from '../../slots';

export function ContactInfoWithVideoDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5">
      <p className="font-bold text-cta">[stub] Hoàn tất — {selectedProgramId ?? 'no program'}</p>
    </div>
  );
}
