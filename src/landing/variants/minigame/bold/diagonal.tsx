'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function BoldDiagonalMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh]">
      <div
        className="py-3 px-6 text-center font-bold text-sm"
        style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
      >
        PHAN TICH VUNG DA
      </div>
      <FaceMapMinigame {...props} />
    </div>
  );
}
