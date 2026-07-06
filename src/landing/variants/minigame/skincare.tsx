'use client';
import type { MinigameSlotProps } from '../../slots';
import { SkinGame } from '../../../components/minigame/SkinGame';

export function SkincareMinigame({ onComplete }: MinigameSlotProps) {
  return (
    <SkinGame
      onComplete={(condition, stats) => onComplete({
        condition,
        foundCount: stats.foundCount,
        zoneLabel: stats.zoneLabel,
        triggerNote: stats.triggerNote ?? '',
      })}
    />
  );
}
