import { quizResults, type QuizResult } from '../../content/quiz';

/** Một nốt mụn overlay trên ảnh mặt (toạ độ tính theo % khung ảnh). */
export interface AcneSpot {
  id: string;
  x: number;
  y: number;
  found: boolean;
}

/** Bốn vùng da người dùng có thể tự khai ở bước report. */
export type SkinZone = 'cam-quai-ham' | 'chu-t' | 'hai-ma' | 'khong-bi';

/**
 * Toạ độ ứng viên cho nốt mụn (theo % khung ảnh chân dung).
 * Được đặt trên trán / má / cằm / quai hàm, tránh vùng mắt (y≈33–42)
 * và môi (y≈60–66 giữa mặt).
 */
export const SPOT_POOL: { x: number; y: number }[] = [
  { x: 30, y: 24 },
  { x: 55, y: 20 },
  { x: 41, y: 30 },
  { x: 28, y: 50 },
  { x: 70, y: 52 },
  { x: 33, y: 58 },
  { x: 66, y: 60 },
  { x: 50, y: 78 },
  { x: 38, y: 74 },
  { x: 62, y: 74 },
];

/** Nhãn hiển thị + profile ánh xạ + màu chip cho mỗi vùng da (face mapping). */
export const ZONE_META: Record<SkinZone, { label: string; profileId: string; color: string }> = {
  'cam-quai-ham': { label: 'cằm & quai hàm', profileId: 'mun-noi-tiet', color: '#FF5C9E' },
  'chu-t': { label: 'vùng chữ T', profileId: 'da-nhon-mun-viem', color: '#FFCD78' },
  'hai-ma': { label: 'hai má', profileId: 'da-nhay-cam', color: '#7DD9C0' },
  'khong-bi': { label: 'gần như không bị', profileId: 'clean-skin', color: '#B39DFF' },
};

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Sinh `count` nốt mụn ở các vị trí khác nhau lấy từ SPOT_POOL. */
export function generateSpots(count: number): AcneSpot[] {
  const picked = shuffle(SPOT_POOL).slice(0, count);
  return picked.map((p, index) => ({
    id: `spot-${index}`,
    x: p.x,
    y: p.y,
    found: false,
  }));
}

/** Trả về nốt chưa tìm gần nhất trong bán kính `radius` (theo %), hoặc null. */
export function findNearestUnfoundSpot(
  spots: AcneSpot[],
  x: number,
  y: number,
  radius: number
): AcneSpot | null {
  let nearest: AcneSpot | null = null;
  let nearestDist = Infinity;
  for (const spot of spots) {
    if (spot.found) continue;
    const dist = Math.hypot(spot.x - x, spot.y - y);
    if (dist <= radius && dist < nearestDist) {
      nearest = spot;
      nearestDist = dist;
    }
  }
  return nearest;
}

/** Ánh xạ vùng da tự khai sang một profile trong quizResults. */
export function resolveProfileByZone(zone: SkinZone): QuizResult {
  const meta = ZONE_META[zone];
  if (!meta) return quizResults['da-moi-bat-dau'];
  return quizResults[meta.profileId] ?? quizResults['da-moi-bat-dau'];
}
