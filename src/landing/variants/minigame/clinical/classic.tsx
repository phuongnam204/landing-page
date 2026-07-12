'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function ClinicalClassicMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-minigame)]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
