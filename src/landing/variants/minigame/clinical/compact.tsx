'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function ClinicalCompactMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
