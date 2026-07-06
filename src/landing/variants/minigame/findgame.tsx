'use client';
import type { MinigameSlotProps } from '../../slots';
import { SkinScanScreen } from './_findgame-core/SkinScanScreen';

export function FindgameMinigame({ onComplete }: MinigameSlotProps) {
  return (
    <SkinScanScreen
      onComplete={(condition, stats) => onComplete({
        condition,
        foundCount: stats.foundCount,
        zoneLabel: stats.zoneLabel,
        triggerNote: '',
      })}
    />
  );
}
