'use client';
import React from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../face-map';

export function PlayfulDarkAccentMinigame(props: MinigameSlotProps) {
  return (
    <div style={{ '--lp-bg-minigame': 'var(--lp-bg-payoff)' } as React.CSSProperties}>
      <FaceMapMinigame {...props} />
    </div>
  );
}
