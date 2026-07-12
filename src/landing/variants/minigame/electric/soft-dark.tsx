'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function ElectricSoftDarkMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-payoff)]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
