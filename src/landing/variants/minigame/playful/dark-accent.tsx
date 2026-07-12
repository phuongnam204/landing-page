'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function PlayfulDarkAccentMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-accent)]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
