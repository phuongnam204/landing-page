'use client';
import type { MinigameSlotProps } from '../../slots';
import { SkinGame } from '../../../components/minigame/SkinGame';

export function SkincareMinigame({ onComplete }: MinigameSlotProps) {
  return (
    <SkinGame
      onComplete={(condition, stats) => onComplete({
        conditions: [condition],
        condition,
        zoneLabel: stats.zoneLabel,
        zoneIds: [],
        triggerNote: stats.triggerNote ?? '',
      })}
    />
  );
}
