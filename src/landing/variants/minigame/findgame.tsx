'use client';
import type { MinigameSlotProps } from '../../slots';
import { SkinScanScreen } from './_findgame-core/SkinScanScreen';

export function FindgameMinigame({ onComplete }: MinigameSlotProps) {
  return (
    <SkinScanScreen
      onComplete={(condition, stats) => onComplete({
        conditions: [condition],
        condition,
        zoneLabel: stats.zoneLabel,
        zoneIds: [],
        triggerNote: '',
      })}
    />
  );
}
