# Acne-Spot Minigame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thay minigame "soi da" (hidden-object mascot) bằng game "tìm & khoanh mụn" trên ảnh mặt thật + một bước tự khai vùng da, để kết quả cá nhân hóa đến từ khai báo của người dùng thay vì máy tự đoán.

**Architecture:** Tách bạch phần chơi (tìm các nốt mụn overlay trên ảnh, chỉ để giải trí, có gợi ý tăng dần chống kẹt) khỏi phần chẩn đoán (người dùng chọn 1 trong 4 vùng da, map sang profile theo face mapping). `SkinScanScreen` giữ tên file nhưng viết lại nội bộ thành 2 phase (`find` → `report`) và gọi `onComplete` một lần duy nhất. `skinScanLogic` bỏ toàn bộ khái niệm "kind"/dominance, chỉ còn sinh toạ độ nốt + map zone→profile.

**Tech Stack:** Next.js 16 (App Router, client component), React 19, TypeScript, Vitest, Tailwind + inline styles.

**Spec:** `docs/superpowers/specs/2026-07-02-acne-spot-minigame-design.md`

---

## File Structure

- `src/content/quiz.ts` — **Modify:** thêm lại profile `mun-noi-tiet`.
- `src/components/MinigameCore/skinScanLogic.ts` — **Rewrite:** types `AcneSpot`/`SkinZone`, `generateSpots()`, `findNearestUnfoundSpot()`, `ZONE_META`, `resolveProfileByZone()`. Bỏ `BoardCharacter`, `CharacterKind`, `KindCounts`, `generateBoard`, `computeResultFromBoard`, `countByKind`.
- `src/components/MinigameCore/skinScanLogic.test.ts` — **Rewrite:** test cho API mới.
- `src/components/SkinScanScreen.tsx` — **Rewrite:** 2 phase find/report; onComplete đổi chữ ký.
- `src/components/AppFlow.tsx` — **Modify:** onComplete handler + state, `PayoffView` prop `counts`→`stats`, `PayoffStats` render mới, xóa `KIND_STAT_META`/`STAT_ORDER`.
- `src/lib/trackEvent.ts` — không đổi (giữ mốc `minigame_complete`).

---

## Task 1: Thêm lại profile `mun-noi-tiet`

**Files:**
- Modify: `src/content/quiz.ts`

- [ ] **Step 1: Thêm entry `mun-noi-tiet` vào `quizResults`**

Thêm block sau vào object `quizResults` (đặt ngay trước `'da-nhay-cam':`):

```ts
  'mun-noi-tiet': {
    id: 'mun-noi-tiet',
    tone: 'concern',
    body: 'Da bạn có dấu hiệu <b>mụn nội tiết</b> — mụn tập trung ở vùng cằm và quai hàm, thường nặng hơn theo chu kỳ. Đây là kiểu mụn liên quan đến thay đổi nội tiết bên trong.',
    solution:
      'Điều trị mụn nội tiết cần kết hợp chăm sóc da đúng cách và đánh giá yếu tố bên trong. Nên được tư vấn 1:1 để có phác đồ phù hợp.',
    suggestedProgram: 'chuyen-sau',
  },
```

- [ ] **Step 2: Kiểm tra type sạch**

Run: `npx tsc --noEmit`
Expected: PASS (không lỗi mới). Nếu môi trường chưa cài, dùng `npm run build` chỉ để kiểm type là quá nặng — ưu tiên `npx tsc --noEmit`.

- [ ] **Step 3: Commit**

```bash
git add src/content/quiz.ts
git commit -m "feat: restore mun-noi-tiet skin profile for face-mapping"
```

---

## Task 2: Viết lại `skinScanLogic` (spots + zone mapping)

**Files:**
- Rewrite: `src/components/MinigameCore/skinScanLogic.ts`
- Rewrite: `src/components/MinigameCore/skinScanLogic.test.ts`

- [ ] **Step 1: Viết lại test trước (failing)**

Thay TOÀN BỘ nội dung `src/components/MinigameCore/skinScanLogic.test.ts` bằng:

```ts
import { describe, it, expect } from 'vitest';
import {
  generateSpots,
  findNearestUnfoundSpot,
  resolveProfileByZone,
  ZONE_META,
  SPOT_POOL,
  type AcneSpot,
  type SkinZone,
} from './skinScanLogic';

describe('generateSpots', () => {
  it('produces the requested count of unfound spots at unique pool positions', () => {
    for (let trial = 0; trial < 50; trial++) {
      const spots = generateSpots(6);
      expect(spots).toHaveLength(6);
      expect(spots.every((s) => !s.found)).toBe(true);
      const positions = new Set(spots.map((s) => `${s.x},${s.y}`));
      expect(positions.size).toBe(6);
      // every chosen position must come from the authored pool
      for (const s of spots) {
        expect(SPOT_POOL.some((p) => p.x === s.x && p.y === s.y)).toBe(true);
      }
    }
  });

  it('gives each spot a unique id', () => {
    const spots = generateSpots(6);
    const ids = new Set(spots.map((s) => s.id));
    expect(ids.size).toBe(spots.length);
  });
});

describe('findNearestUnfoundSpot', () => {
  const spots: AcneSpot[] = [
    { id: 'a', x: 20, y: 20, found: false },
    { id: 'b', x: 80, y: 80, found: false },
    { id: 'c', x: 22, y: 22, found: true },
  ];

  it('returns the nearest unfound spot within radius', () => {
    const hit = findNearestUnfoundSpot(spots, 21, 21, 9);
    expect(hit?.id).toBe('a');
  });

  it('returns null when nothing is within radius', () => {
    expect(findNearestUnfoundSpot(spots, 50, 50, 9)).toBeNull();
  });

  it('never returns an already-found spot', () => {
    const hit = findNearestUnfoundSpot(spots, 22, 22, 9);
    expect(hit?.id).not.toBe('c');
  });
});

describe('resolveProfileByZone', () => {
  const cases: [SkinZone, string][] = [
    ['cam-quai-ham', 'mun-noi-tiet'],
    ['chu-t', 'da-nhon-mun-viem'],
    ['hai-ma', 'da-nhay-cam'],
    ['khong-bi', 'clean-skin'],
  ];
  it.each(cases)('maps zone %s to profile %s', (zone, profileId) => {
    expect(resolveProfileByZone(zone).id).toBe(profileId);
  });

  it('falls back to da-moi-bat-dau for an unknown zone', () => {
    expect(resolveProfileByZone('nonsense' as SkinZone).id).toBe('da-moi-bat-dau');
  });
});

describe('ZONE_META', () => {
  it('has a human label and profile id for all four zones', () => {
    const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
    for (const z of zones) {
      expect(ZONE_META[z].label.length).toBeGreaterThan(0);
      expect(ZONE_META[z].profileId.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Chạy test để xác nhận FAIL**

Run: `npx vitest run src/components/MinigameCore/skinScanLogic.test.ts`
Expected: FAIL — các export (`generateSpots`, `resolveProfileByZone`, ...) chưa tồn tại.

- [ ] **Step 3: Viết lại `skinScanLogic.ts`**

Thay TOÀN BỘ nội dung `src/components/MinigameCore/skinScanLogic.ts` bằng:

```ts
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
```

- [ ] **Step 4: Chạy test để xác nhận PASS**

Run: `npx vitest run src/components/MinigameCore/skinScanLogic.test.ts`
Expected: PASS toàn bộ.

- [ ] **Step 5: Commit**

```bash
git add src/components/MinigameCore/skinScanLogic.ts src/components/MinigameCore/skinScanLogic.test.ts
git commit -m "refactor: replace kind-based board logic with spot + zone mapping"
```

---

## Task 3: Viết lại `SkinScanScreen` (find + report phases)

**Files:**
- Rewrite: `src/components/SkinScanScreen.tsx`

**Ghi chú:** UI không unit-test; xác minh bằng `tsc` + preview ở Task 5. Chữ ký `onComplete` đổi thành `(result: QuizResult, stats: { foundCount: number; zoneLabel: string }) => void`.

- [ ] **Step 1: Viết lại toàn bộ `SkinScanScreen.tsx`**

Thay TOÀN BỘ nội dung file bằng:

```tsx
'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  generateSpots,
  findNearestUnfoundSpot,
  resolveProfileByZone,
  ZONE_META,
  type AcneSpot,
  type SkinZone,
} from './MinigameCore/skinScanLogic';
import type { QuizResult } from '../content/quiz';

// TODO(go-live): thay bằng ảnh chân dung da sạch có license thương mại.
const FACE_IMAGE_URL =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=560&fit=crop&crop=faces';

const SPOT_COUNT = 6;
const CATCH_RADIUS = 9; // theo % khung ảnh
const HINT_L1_MS = 5000; // sáng vùng sau ~5s không tiến triển
const HINT_L2_MS = 9000; // khoanh sát sau ~9s
const SAFETY_MS = 22000; // lưới an toàn: tự mở hết sau ~22s

export function SkinScanScreen({
  onComplete,
}: {
  onComplete: (result: QuizResult, stats: { foundCount: number; zoneLabel: string }) => void;
}) {
  const [phase, setPhase] = useState<'find' | 'report'>('find');
  const foundCountRef = useRef(SPOT_COUNT);

  if (phase === 'find') {
    return (
      <FindGame
        onAllFound={(count) => {
          foundCountRef.current = count;
          setPhase('report');
        }}
      />
    );
  }

  return (
    <ReportStep
      onPick={(zone) => {
        const result = resolveProfileByZone(zone);
        onComplete(result, {
          foundCount: foundCountRef.current,
          zoneLabel: ZONE_META[zone].label,
        });
      }}
    />
  );
}

function FindGame({ onAllFound }: { onAllFound: (count: number) => void }) {
  const [spots, setSpots] = useState<AcneSpot[]>(() => generateSpots(SPOT_COUNT));
  const [hintLevel, setHintLevel] = useState<0 | 1 | 2>(0);
  const spotsRef = useRef(spots);
  spotsRef.current = spots;
  const lastFindRef = useRef(Date.now());
  const boardRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(false);

  const foundCount = spots.filter((s) => s.found).length;
  const firstUnfound = spots.find((s) => !s.found) ?? null;

  function commit(next: AcneSpot[]) {
    spotsRef.current = next;
    setSpots(next);
    if (next.every((s) => s.found) && !doneRef.current) {
      doneRef.current = true;
      onAllFound(next.length);
    }
  }

  function handlePointer(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const hit = findNearestUnfoundSpot(spotsRef.current, x, y, CATCH_RADIUS);
    if (!hit) return;
    lastFindRef.current = Date.now();
    setHintLevel(0);
    commit(spotsRef.current.map((s) => (s.id === hit.id ? { ...s, found: true } : s)));
  }

  // Gợi ý tăng dần + lưới an toàn, tính theo thời gian kể từ lần khoanh trúng gần nhất.
  useEffect(() => {
    const timer = setInterval(() => {
      if (doneRef.current) return;
      const hasUnfound = spotsRef.current.some((s) => !s.found);
      if (!hasUnfound) return;
      const elapsed = Date.now() - lastFindRef.current;
      if (elapsed >= SAFETY_MS) {
        commit(spotsRef.current.map((s) => ({ ...s, found: true })));
        return;
      }
      if (elapsed >= HINT_L2_MS) setHintLevel(2);
      else if (elapsed >= HINT_L1_MS) setHintLevel(1);
      else setHintLevel(0);
    }, 500);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-4 overflow-hidden">
      <div style={frameStyle}>
        <div style={{ padding: '16px 18px 12px', color: '#fff' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.3px', opacity: 0.85 }}>
            SOI THỬ LÀN DA
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, lineHeight: 1.35, marginTop: 4 }}>
            Chạm để khoanh hết các nốt mụn bạn thấy 👀
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12 }}>
            <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.18)', borderRadius: 99, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${(foundCount / SPOT_COUNT) * 100}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg,#FF5C9E,#B39DFF)',
                  borderRadius: 99,
                  transition: 'width 300ms ease',
                }}
              />
            </div>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#FFB8D4', whiteSpace: 'nowrap' }}>
              {foundCount} / {SPOT_COUNT} nốt
            </div>
          </div>
        </div>

        <div
          ref={boardRef}
          onPointerDown={(e) => handlePointer(e.clientX, e.clientY)}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            handlePointer(e.clientX, e.clientY);
          }}
          style={{ position: 'relative', width: '100%', height: 360, background: '#111', touchAction: 'none', userSelect: 'none' }}
        >
          <img
            src={FACE_IMAGE_URL}
            alt="Khuôn mặt để soi da"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {spots.map((s) =>
            s.found ? (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: 'translate(-50%,-50%)',
                  width: 36,
                  height: 36,
                  border: '3px solid #FF5C9E',
                  borderRadius: '50%',
                  boxShadow: '0 0 0 4px rgba(255,92,158,.25)',
                }}
              >
                <div style={tickStyle}>✓</div>
              </div>
            ) : (
              <div
                key={s.id}
                style={{
                  position: 'absolute',
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  transform: 'translate(-50%,-50%)',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 40% 35%, #E8806F, #C64B3C)',
                  boxShadow: '0 1px 3px rgba(0,0,0,.3)',
                }}
              />
            )
          )}

          {/* Gợi ý cấp 1: sáng vùng */}
          {hintLevel >= 1 && firstUnfound && (
            <div
              className="acne-hint-glow"
              style={{ left: `${firstUnfound.x}%`, top: `${firstUnfound.y}%` }}
            />
          )}
          {/* Gợi ý cấp 2: khoanh sát */}
          {hintLevel >= 2 && firstUnfound && (
            <div
              className="acne-hint-ring"
              style={{ left: `${firstUnfound.x}%`, top: `${firstUnfound.y}%` }}
            />
          )}
        </div>

        <div style={{ padding: '12px 18px 16px', color: 'rgba(255,255,255,.7)', fontSize: 12, textAlign: 'center' }}>
          Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡
        </div>
      </div>
    </div>
  );
}

function ReportStep({ onPick }: { onPick: (zone: SkinZone) => void }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-4 overflow-hidden">
      <div style={{ ...frameStyle, padding: '20px 18px 22px' }}>
        <div style={{ textAlign: 'center', color: '#fff', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.3px', color: '#FFB8D4' }}>
            SOI XONG RỒI 🎉
          </div>
          <div style={{ fontSize: 19, fontWeight: 800, lineHeight: 1.35, marginTop: 6 }}>
            Còn da của <u>bạn</u> thì hay “nổi loạn” nhất ở đâu?
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {zones.map((zone) => (
            <button
              key={zone}
              onClick={() => onPick(zone)}
              style={zoneChipStyle}
            >
              <span style={{ width: 12, height: 12, borderRadius: '50%', flex: 'none', background: ZONE_META[zone].color }} />
              <span style={{ fontWeight: 700, fontSize: 15 }}>{ZONE_LABELS[zone]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Nhãn hiển thị đầy đủ cho nút chọn vùng (khác với ZONE_META.label ngắn dùng ở chip payoff).
const ZONE_LABELS: Record<SkinZone, string> = {
  'cam-quai-ham': 'Cằm & quai hàm',
  'chu-t': 'Vùng chữ T (trán, mũi)',
  'hai-ma': 'Hai má',
  'khong-bi': 'Gần như không bị',
};

const frameStyle: CSSProperties = {
  width: 330,
  borderRadius: 28,
  overflow: 'hidden',
  background: '#2D2640',
  boxShadow: '0 18px 50px rgba(45,38,64,0.35)',
};

const tickStyle: CSSProperties = {
  position: 'absolute',
  right: -6,
  top: -6,
  width: 18,
  height: 18,
  background: '#FF5C9E',
  borderRadius: '50%',
  color: '#fff',
  fontSize: 11,
  fontWeight: 900,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const zoneChipStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '14px 16px',
  borderRadius: 16,
  background: 'rgba(255,255,255,.08)',
  border: '2px solid rgba(255,255,255,.14)',
  color: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
};
```

- [ ] **Step 2: Thêm CSS animation cho gợi ý vào `globals.css`**

Thêm vào cuối `src/app/globals.css`:

```css
@keyframes acneZoneGlow {
  0%   { transform: translate(-50%,-50%) scale(0.75); opacity: 0.15; }
  50%  { transform: translate(-50%,-50%) scale(1.05); opacity: 0.55; }
  100% { transform: translate(-50%,-50%) scale(0.75); opacity: 0.15; }
}
@keyframes acneRingPulse {
  0%   { transform: translate(-50%,-50%) scale(0.85); opacity: 0.9; }
  50%  { transform: translate(-50%,-50%) scale(1.15); opacity: 0.4; }
  100% { transform: translate(-50%,-50%) scale(0.85); opacity: 0.9; }
}
.acne-hint-glow {
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,205,120,.85) 0%, rgba(255,180,80,.35) 45%, rgba(255,180,80,0) 70%);
  animation: acneZoneGlow 1.6s ease-in-out infinite;
  pointer-events: none;
}
.acne-hint-ring {
  position: absolute;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 3px dashed #FFCD78;
  box-shadow: 0 0 14px rgba(255,205,120,.7);
  animation: acneRingPulse 1.1s ease-in-out infinite;
  pointer-events: none;
}
```

- [ ] **Step 3: Kiểm tra type (sẽ còn lỗi ở AppFlow — chấp nhận tạm)**

Run: `npx tsc --noEmit`
Expected: lỗi CHỈ nằm ở `AppFlow.tsx` (do `onComplete` đổi chữ ký và import `KindCounts`/`countByKind` không còn). `SkinScanScreen.tsx` và `skinScanLogic.ts` không được có lỗi. Task 4 sẽ khắc phục phần AppFlow.

- [ ] **Step 4: Commit**

```bash
git add src/components/SkinScanScreen.tsx src/app/globals.css
git commit -m "feat: rewrite minigame as find-the-acne + self-report on real photo"
```

---

## Task 4: Nối `AppFlow` + đổi `PayoffStats` sang stats mới

**Files:**
- Modify: `src/components/AppFlow.tsx`

- [ ] **Step 1: Sửa import ở đầu file**

Trong `src/components/AppFlow.tsx`, thay dòng import minigame types:

```ts
import type { CharacterKind, KindCounts } from './MinigameCore/skinScanLogic';
```

bằng:

```ts
// (đã bỏ import kind-based; stats mới dùng type nội bộ PayoffStatsData bên dưới)
```

Và thêm ngay dưới các import hiện có:

```ts
type PayoffStatsData = { foundCount: number; zoneLabel: string };
```

- [ ] **Step 2: Sửa state `foundCounts`**

Thay dòng:

```ts
  const [foundCounts, setFoundCounts] = useState<KindCounts | null>(null);
```

bằng:

```ts
  const [payoffStats, setPayoffStats] = useState<PayoffStatsData | null>(null);
```

- [ ] **Step 3: Sửa handler `onComplete` của `SkinScanScreen`**

Thay block:

```tsx
        <SkinScanScreen
          onComplete={(result, counts) => {
            setQuizResult(result);
            setFoundCounts(counts);
            setSelectedProgram(result.suggestedProgram);
            trackEvent('minigame_complete', { resultId: result.id });
            transitionTo('payoff');
          }}
        />
```

bằng:

```tsx
        <SkinScanScreen
          onComplete={(result, stats) => {
            setQuizResult(result);
            setPayoffStats(stats);
            setSelectedProgram(result.suggestedProgram);
            trackEvent('minigame_complete', { resultId: result.id });
            transitionTo('payoff');
          }}
        />
```

- [ ] **Step 4: Sửa prop truyền vào `PayoffView`**

Thay `counts={foundCounts}` bằng `stats={payoffStats}` trong block `step === 'payoff'`.

- [ ] **Step 5: Xóa `STAT_ORDER` + `KIND_STAT_META`**

Xóa toàn bộ block sau (dòng ~228–236):

```ts
const STAT_ORDER: CharacterKind[] = ['dau-den', 'mun-viem', 'man-do', 'da-sang-khoe'];
const KIND_STAT_META: Record<CharacterKind, { label: string; color: string }> = {
  'mun-viem': { label: 'nốt mụn viêm', color: '#E5544A' },
  'dau-den': { label: 'mụn đầu đen', color: '#8D8378' },
  'man-do': { label: 'vết ửng đỏ', color: '#FFB6C9' },
  'da-sang-khoe': { label: 'vùng da sáng khỏe', color: '#8FE3BC' },
};
```

- [ ] **Step 6: Sửa chữ ký + prop của `PayoffView`**

Thay phần signature:

```tsx
function PayoffView({
  result,
  counts,
  onContinue,
}: {
  result: QuizResult;
  counts: KindCounts | null;
  onContinue: () => void;
}) {
```

bằng:

```tsx
function PayoffView({
  result,
  stats,
  onContinue,
}: {
  result: QuizResult;
  stats: { foundCount: number; zoneLabel: string } | null;
  onContinue: () => void;
}) {
```

Và thay dòng render stats:

```tsx
        {counts && <PayoffStats counts={counts} />}
```

bằng:

```tsx
        {stats && <PayoffStats stats={stats} />}
```

- [ ] **Step 7: Viết lại component `PayoffStats`**

Thay TOÀN BỘ function `PayoffStats` bằng:

```tsx
// Short "achievement" statistics shown between the header and the result body.
// Each chip pops in one-by-one, left to right, to reward finishing the minigame.
function PayoffStats({ stats }: { stats: { foundCount: number; zoneLabel: string } }) {
  const chips: { key: string; color: string; content: React.ReactNode }[] = [
    {
      key: 'found',
      color: '#FF5C9E',
      content: (
        <span>
          đã soi <b>{stats.foundCount}</b> nốt mụn
        </span>
      ),
    },
    {
      key: 'zone',
      color: '#B39DFF',
      content: (
        <span>
          da bạn hay bị ở <b>{stats.zoneLabel}</b>
        </span>
      ),
    },
  ];
  return (
    <div className="mb-4">
      <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip, index) => (
          <span
            key={chip.key}
            className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm md:text-base font-semibold text-cta"
            style={{ animationDelay: `${0.5 + index * 0.18}s` }}
          >
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: chip.color }}
            />
            {chip.content}
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Kiểm tra type sạch**

Run: `npx tsc --noEmit`
Expected: PASS, không còn lỗi ở AppFlow. Nếu báo `CharacterKind`/`KindCounts` chưa dùng — đảm bảo đã xóa hết tham chiếu.

- [ ] **Step 9: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "feat: wire self-report stats into payoff, drop kind-based chips"
```

---

## Task 5: Xác minh toàn bộ qua preview + test

**Files:** không sửa; chỉ chạy kiểm tra.

- [ ] **Step 1: Chạy toàn bộ unit test**

Run: `npx vitest run`
Expected: PASS toàn bộ (đặc biệt `skinScanLogic.test.ts`).

- [ ] **Step 2: Type-check toàn dự án**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Xác minh trực quan qua preview**

Dùng preview server (Next dev). Kiểm tra tuần tự:
- Hero → bấm bắt đầu → vào màn find (khung navy, ảnh mặt, 6 chấm đỏ mờ, đếm 0/6).
- Chạm trúng từng chấm → hiện vòng hồng + tick, thanh tiến độ tăng.
- Đứng yên ~5s → xuất hiện quầng sáng vàng (cấp 1); ~9s → thêm vòng nét đứt vàng (cấp 2); ~22s → tự khoanh hết và chuyển màn.
- Màn report: câu hỏi "da bạn hay nổi loạn ở đâu?" + 4 nút vùng. Chạm 1 vùng → vào payoff.
- Payoff: hiện đúng profile theo vùng đã chọn; `PayoffStats` hiện 2 chip ("đã soi 6 nốt mụn" + "da bạn hay bị ở <vùng>") với hiệu ứng pop-in.
- Kiểm tra map: chọn "Cằm & quai hàm" → profile `mun-noi-tiet`; "Vùng chữ T" → `da-nhon-mun-viem`; "Hai má" → `da-nhay-cam`; "Gần như không bị" → `clean-skin` (tone positive, confetti).

- [ ] **Step 4: Commit (nếu có chỉnh sửa nhỏ khi verify)**

```bash
git add -A
git commit -m "chore: verify acne-spot minigame end-to-end"
```

(Bỏ qua bước commit này nếu không có thay đổi.)

---

## Ghi chú triển khai

- **Ảnh chân dung** hiện dùng URL Unsplash tạm trong `FACE_IMAGE_URL`; thay bằng ảnh có license thương mại trước go-live (đã ghi TODO trong code).
- **Không thêm câu hỏi giới tính** (theo spec) — `PayoffView` không dùng giới tính.
- `lo-chan-long` và `da-moi-bat-dau` vẫn nằm trong `quizResults` nhưng minigame mới không sinh ra chúng (trừ fallback an toàn của `resolveProfileByZone`); không xóa.
