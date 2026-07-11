import { skinConditions, type ConditionId, type SkinCondition } from '../../../../content/quiz';

export interface AcneSpot { id: string; x: number; y: number; found: boolean; }
export type SkinZone = 'cam-quai-ham' | 'chu-t' | 'hai-ma' | 'khong-bi';

export const SPOT_POOL: { x: number; y: number }[] = [
  { x: 30, y: 24 }, { x: 55, y: 20 }, { x: 41, y: 30 }, { x: 28, y: 50 },
  { x: 70, y: 52 }, { x: 33, y: 58 }, { x: 66, y: 60 }, { x: 50, y: 78 },
  { x: 38, y: 74 }, { x: 62, y: 74 },
];

export const ZONE_META: Record<SkinZone, { label: string; conditionId: ConditionId; color: string }> = {
  'cam-quai-ham': { label: 'cằm & quai hàm', conditionId: 'mun-noi-tiet', color: '#FF5C9E' },
  'chu-t':        { label: 'vùng chữ T', conditionId: 'da-nhon-mun-viem', color: '#FFCD78' },
  'hai-ma':       { label: 'hai má', conditionId: 'da-nhay-cam', color: '#7DD9C0' },
  'khong-bi':     { label: 'gần như không bị', conditionId: 'clean-skin', color: '#B39DFF' },
};

function shuffle<T>(items: T[]): T[] {
  const r = [...items];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export function generateSpots(count: number): AcneSpot[] {
  return shuffle(SPOT_POOL).slice(0, count).map((p, i) => ({ id: `spot-${i}`, x: p.x, y: p.y, found: false }));
}

export function findNearestUnfoundSpot(spots: AcneSpot[], x: number, y: number, radius: number): AcneSpot | null {
  let nearest: AcneSpot | null = null; let nearestDist = Infinity;
  for (const s of spots) {
    if (s.found) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= radius && d < nearestDist) { nearest = s; nearestDist = d; }
  }
  return nearest;
}

export function resolveConditionByZone(zone: SkinZone): SkinCondition {
  const meta = ZONE_META[zone];
  return skinConditions[meta?.conditionId] ?? skinConditions['da-moi-bat-dau']!;
}
