'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function BoldTypographicMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
