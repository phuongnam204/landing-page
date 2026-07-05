# 3-Phase Skincare Minigame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the "khoanh mụn" minigame with a 3-phase Pluck-Pop-Squeeze-style skincare game (press whiteheads → drag sticker on blackheads → swipe machine over hairs) followed by a 3-question self-report that maps to one of the existing 6 skin profiles, all inside a theme-aware `BrandCanvas` + `GameFrame` shell.

**Architecture:** Two pure-logic modules (`skinProfileLogic`, `collisionUtils`) are built TDD-first. Then presentational pieces: a shared `GameScene` chrome (HUD + 3:2 sky/skin background), a `GhostHand` + `useAdvancingHint` hint system, three phase components, a `SelfReportStep`, and a `SkinGame` orchestrator that also provides the `BrandCanvas`/`GameFrame` shell. Finally `AppFlow` swaps the old `SkinScanScreen` for `SkinGame`. Game logic never infers the profile — the profile comes only from the self-report.

**Tech Stack:** React 19, Next.js 16 (app router, `'use client'`), Tailwind CSS (`darkMode: 'media'`), TypeScript, Vitest. Pointer Events for input. User-authored SVG assets served from `public/`. No new dependencies.

**Design spec:** [2026-07-04-minigame-skincare-modes-design.md](../specs/2026-07-04-minigame-skincare-modes-design.md). Shell spec: [2026-07-04-minigame-brandcanvas-gameframe-design.md](../specs/2026-07-04-minigame-brandcanvas-gameframe-design.md).

**Non-goals:** other game modes, level-select, skin-color picker, 3D art, marketing copy, analytics, backend. Do not modify `content/quiz.ts` (all 6 profiles already exist).

**Asset paths (already in repo, do not recreate):**
- `public/acne_press/normal.svg`, `Pressed.svg`, `Pop.svg`
- `public/black_acne_pull/black_acne.svg`, `sticker.svg`
- `public/swipe/hair.svg`, `machine.svg`

---

### Task 1: `skinProfileLogic.ts` — self-report types + profile waterfall (TDD)

**Files:**
- Create: `src/components/MinigameCore/skinProfileLogic.ts`
- Create: `src/components/MinigameCore/skinProfileLogic.test.ts`

**Context:** This module owns the self-report question option types and the deterministic waterfall that maps 3 answers to one of the 6 `ConditionId`s in `content/quiz.ts` (spec section 6). It replaces the old `resolveConditionByZone`. Pure functions, no React.

- [ ] **Step 1: Write the failing test**

Create `src/components/MinigameCore/skinProfileLogic.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { resolveProfile } from './skinProfileLogic';

describe('resolveProfile', () => {
  it('maps chin/jaw zone to hormonal acne regardless of feel/trigger', () => {
    expect(resolveProfile('cam-quai-ham', 'dau', 'ky-kinh').id).toBe('mun-noi-tiet');
    expect(resolveProfile('cam-quai-ham', 'on-dinh', 'nang').id).toBe('mun-noi-tiet');
  });

  it('maps T-zone + oily to oily inflamed acne', () => {
    expect(resolveProfile('chu-t', 'dau', 'stress').id).toBe('da-nhon-mun-viem');
  });

  it('maps T-zone + non-oily to enlarged pores', () => {
    expect(resolveProfile('chu-t', 'kho', 'stress').id).toBe('lo-chan-long');
    expect(resolveProfile('chu-t', 'nhay-cam', 'nang').id).toBe('lo-chan-long');
  });

  it('maps cheeks to sensitive skin', () => {
    expect(resolveProfile('hai-ma', 'kho', 'thuc-khuya').id).toBe('da-nhay-cam');
  });

  it('maps no-problem + stable to clean skin', () => {
    expect(resolveProfile('khong-bi', 'on-dinh', 'nang').id).toBe('clean-skin');
  });

  it('maps no-problem + non-stable to no-routine fallback', () => {
    expect(resolveProfile('khong-bi', 'dau', 'stress').id).toBe('da-moi-bat-dau');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/MinigameCore/skinProfileLogic.test.ts`
Expected: FAIL — `resolveProfile` not found / module missing.

- [ ] **Step 3: Write the implementation**

Create `src/components/MinigameCore/skinProfileLogic.ts`:

```ts
import { skinConditions, type SkinCondition } from '../../content/quiz';

/** Q1 — vùng da hay nổi loạn (face mapping driver). */
export type SkinZone = 'cam-quai-ham' | 'chu-t' | 'hai-ma' | 'khong-bi';
/** Q2 — cảm giác da chủ đạo. */
export type SkinFeel = 'dau' | 'kho' | 'nhay-cam' | 'on-dinh';
/** Q3 — thời điểm da nổi loạn (chỉ cá nhân hoá copy, không đổi bucket). */
export type SkinTrigger = 'ky-kinh' | 'nang' | 'stress' | 'thuc-khuya';

export interface SelfReportAnswers {
  zone: SkinZone;
  feel: SkinFeel;
  trigger: SkinTrigger;
}

/**
 * Waterfall ánh xạ 3 câu tự khai → 1 trong 6 profile của content/quiz.ts.
 * Deterministic. Zone là driver chính; feel tinh chỉnh nhánh chu-t & khong-bi;
 * trigger KHÔNG đổi profile (chỉ dùng cá nhân hoá copy reveal).
 */
export function resolveProfile(zone: SkinZone, feel: SkinFeel, _trigger: SkinTrigger): SkinCondition {
  switch (zone) {
    case 'cam-quai-ham':
      return skinConditions['mun-noi-tiet'];
    case 'chu-t':
      return feel === 'dau' ? skinConditions['da-nhon-mun-viem'] : skinConditions['lo-chan-long'];
    case 'hai-ma':
      return skinConditions['da-nhay-cam'];
    case 'khong-bi':
      return feel === 'on-dinh' ? skinConditions['clean-skin'] : skinConditions['da-moi-bat-dau'];
    default:
      return skinConditions['da-moi-bat-dau'];
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/MinigameCore/skinProfileLogic.test.ts`
Expected: PASS — 6/6.

- [ ] **Step 5: Commit**

```bash
git add src/components/MinigameCore/skinProfileLogic.ts src/components/MinigameCore/skinProfileLogic.test.ts
git commit -m "feat(minigame): self-report types + profile waterfall (TDD)"
```

---

### Task 2: `collisionUtils.ts` — percent-based hit detection (TDD)

**Files:**
- Create: `src/components/MinigameCore/collisionUtils.ts`
- Create: `src/components/MinigameCore/collisionUtils.test.ts`

**Context:** All three phases place targets by `%` of the scene and detect interaction by distance (press/swipe) or bounding-box overlap (sticker lift). Two pure helpers shared across phases (spec section 4 "Điểm chung"). Coordinates are percentages 0–100.

- [ ] **Step 1: Write the failing test**

Create `src/components/MinigameCore/collisionUtils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { withinRadius, withinBox } from './collisionUtils';

describe('withinRadius', () => {
  it('is true when point is inside the radius', () => {
    expect(withinRadius({ x: 50, y: 50 }, { x: 52, y: 53 }, 5)).toBe(true);
  });
  it('is false when point is outside the radius', () => {
    expect(withinRadius({ x: 50, y: 50 }, { x: 60, y: 60 }, 5)).toBe(false);
  });
  it('is true exactly on the boundary', () => {
    expect(withinRadius({ x: 0, y: 0 }, { x: 3, y: 4 }, 5)).toBe(true);
  });
});

describe('withinBox', () => {
  const box = { cx: 50, cy: 50, halfW: 10, halfH: 8 };
  it('is true when point is inside the box', () => {
    expect(withinBox({ x: 55, y: 45 }, box)).toBe(true);
  });
  it('is false when point is outside on x', () => {
    expect(withinBox({ x: 65, y: 50 }, box)).toBe(false);
  });
  it('is false when point is outside on y', () => {
    expect(withinBox({ x: 50, y: 61 }, box)).toBe(false);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/components/MinigameCore/collisionUtils.test.ts`
Expected: FAIL — module missing.

- [ ] **Step 3: Write the implementation**

Create `src/components/MinigameCore/collisionUtils.ts`:

```ts
export interface Pt { x: number; y: number }
export interface Box { cx: number; cy: number; halfW: number; halfH: number }

/** True nếu `p` nằm trong bán kính `radius` quanh `center` (đơn vị %). */
export function withinRadius(center: Pt, p: Pt, radius: number): boolean {
  return Math.hypot(center.x - p.x, center.y - p.y) <= radius;
}

/** True nếu `p` nằm trong hình chữ nhật `box` (tâm + nửa cạnh, đơn vị %). */
export function withinBox(p: Pt, box: Box): boolean {
  return Math.abs(p.x - box.cx) <= box.halfW && Math.abs(p.y - box.cy) <= box.halfH;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/components/MinigameCore/collisionUtils.test.ts`
Expected: PASS — 6/6.

- [ ] **Step 5: Commit**

```bash
git add src/components/MinigameCore/collisionUtils.ts src/components/MinigameCore/collisionUtils.test.ts
git commit -m "feat(minigame): percent-based collision helpers (TDD)"
```

---

### Task 3: Shell + shared game types + `GameScene` chrome

**Files:**
- Modify: `src/app/globals.css` (add game keyframes)
- Create: `src/components/minigame/gameShell.tsx` (`BrandCanvas`, `GameFrame`)
- Create: `src/components/minigame/GameScene.tsx` (HUD + 3:2 sky/skin scene)
- Create: `src/components/minigame/gameConstants.ts` (shared timing/threshold constants)

**Context:** This builds the reusable shell (per shell spec) and the per-phase scene chrome (spec section 3). `BrandCanvas` = pastel gradient + 3 blobs (light) / navy + deep blobs (dark), fills viewport, stable across phases. `GameFrame` = centered rounded card, `max-w-[880px] max-h-[90vh] w-[92vw]`, not edge-to-edge. `GameScene` = the HUD header (label/title/progress) + a 3:2 sky-over-skin play area with a torn-paper boundary, exposing a `sceneRef` and rendering `children` (the interactive targets) absolutely-positioned inside the play area.

- [ ] **Step 1: Add game keyframes to `globals.css`**

Append to `src/app/globals.css`:

```css
/* ── Skincare minigame ── */
@keyframes mgBlobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(0, -16px) scale(1.06); }
}
.mg-blob {
  position: absolute; border-radius: 9999px; filter: blur(30px);
  opacity: 0.5; pointer-events: none; animation: mgBlobFloat 9s ease-in-out infinite;
}
@media (prefers-color-scheme: dark) {
  .mg-blob { opacity: 0.32; filter: blur(50px); }
}
@keyframes mgHintArrow {
  0%, 100% { transform: translate(-50%, 0); opacity: 0.9; }
  50% { transform: translate(-50%, 5px); opacity: 1; }
}
.mg-hint-arrow { animation: mgHintArrow 1.4s ease-in-out infinite; }
@keyframes mgTargetGlow {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(255,205,120,0)); }
  50% { filter: drop-shadow(0 0 10px rgba(255,205,120,0.9)); }
}
.mg-target-glow { animation: mgTargetGlow 1.1s ease-in-out infinite; }
@keyframes mgPhaseIn {
  from { opacity: 0; transform: scale(0.94); }
  to { opacity: 1; transform: scale(1); }
}
.mg-phase-in { animation: mgPhaseIn 380ms cubic-bezier(0.34, 1.56, 0.64, 1) both; }
@media (prefers-reduced-motion: reduce) {
  .mg-blob, .mg-hint-arrow, .mg-target-glow { animation: none; }
  .mg-phase-in { animation: mgPhaseIn 150ms linear both; transform: none; }
}
```

- [ ] **Step 2: Create `gameConstants.ts`**

Create `src/components/minigame/gameConstants.ts`:

```ts
/** Ngưỡng giữ để nặn 1 mụn trắng (ms). */
export const PRESS_HOLD_MS = 700;
/** Bán kính bắt cho press & swipe (theo % scene). */
export const CATCH_RADIUS = 8;
/** Escalating hint: highlight lại sau ngần này ms không tiến triển. */
export const HINT_ESCALATE_MS = 20000;
/** Safety net: tự hoàn thành pha sau ngần này ms không tiến triển. */
export const SAFETY_NET_MS = 35000;
/** Ranh giới trời/da theo % chiều cao scene (3:2 → 60%). */
export const SKY_RATIO = 60;
```

- [ ] **Step 3: Create the shell `gameShell.tsx`**

Create `src/components/minigame/gameShell.tsx`:

```tsx
import type { ReactNode } from 'react';

// Lớp ngoài cùng — nền pastel + blob (light) / navy đậm + blob mờ (dark). Ổn định qua các phase.
export function BrandCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
    >
      {/* Light blobs */}
      <span className="mg-blob dark:hidden" style={{ width: 220, height: 220, background: '#FFB8D4', left: -40, top: -30 }} />
      <span className="mg-blob dark:hidden" style={{ width: 180, height: 180, background: '#B39DFF', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob dark:hidden" style={{ width: 140, height: 140, background: '#8FE3BC', left: '12%', bottom: -30, animationDelay: '4s' }} />
      {/* Dark blobs */}
      <span className="mg-blob hidden dark:block" style={{ width: 220, height: 220, background: '#4c1d95', left: -40, top: -30 }} />
      <span className="mg-blob hidden dark:block" style={{ width: 180, height: 180, background: '#1e40af', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob hidden dark:block" style={{ width: 140, height: 140, background: '#312e81', left: '12%', bottom: -30, animationDelay: '4s' }} />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: 'linear-gradient(135deg,#0f0c1a 0%,#1a1030 55%,#0f0c1a 100%)' }}
      />
      <div className="relative z-10 w-full flex items-center justify-center px-4">{children}</div>
    </div>
  );
}

// Khung game bo góc, canh giữa, KHÔNG edge-to-edge.
export function GameFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[92vw] max-w-[880px] max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden bg-white dark:bg-[#2D2640]">
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create `GameScene.tsx`**

Create `src/components/minigame/GameScene.tsx`:

```tsx
import type { ReactNode, RefObject } from 'react';
import { SKY_RATIO } from './gameConstants';

// Chrome dùng chung cho 1 pha: HUD header + vùng chơi trời/da tỉ lệ 3:2.
// `children` là các đối tượng tương tác, absolute theo % bên trong vùng chơi.
export function GameScene({
  phaseIndex,
  title,
  progress,
  total,
  sceneRef,
  onScenePointerDown,
  onScenePointerMove,
  onScenePointerUp,
  children,
}: {
  phaseIndex: number;
  title: string;
  progress: number;
  total: number;
  sceneRef: RefObject<HTMLDivElement | null>;
  onScenePointerDown?: (e: React.PointerEvent) => void;
  onScenePointerMove?: (e: React.PointerEvent) => void;
  onScenePointerUp?: (e: React.PointerEvent) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-[90vh] max-h-[720px]">
      {/* HUD */}
      <div className="px-5 pt-4 pb-3 md:px-8 md:pt-6 bg-white dark:bg-[#2D2640] shrink-0">
        <div className="text-[10px] md:text-xs font-bold tracking-wide text-cta/55 dark:text-white/55">
          PHA {phaseIndex} / 3
        </div>
        <div className="text-base md:text-xl font-extrabold text-cta dark:text-white mt-0.5">{title}</div>
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex-1 h-1.5 rounded-full bg-cta/10 dark:bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${(progress / total) * 100}%`, background: 'linear-gradient(90deg,#FF5C9E,#B39DFF)' }}
            />
          </div>
          <div className="text-[11px] font-extrabold text-cta dark:text-white whitespace-nowrap">
            {progress} / {total}
          </div>
        </div>
      </div>

      {/* Play area: sky over skin, 3:2 */}
      <div
        ref={sceneRef}
        onPointerDown={onScenePointerDown}
        onPointerMove={onScenePointerMove}
        onPointerUp={onScenePointerUp}
        className="relative flex-1 overflow-hidden select-none"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-x-0 top-0" style={{ height: `${SKY_RATIO}%`, background: '#7A9EBB' }} />
        <div className="absolute inset-x-0 bottom-0" style={{ top: `${SKY_RATIO}%`, background: '#E8A57E', position: 'absolute' }} />
        {/* Torn-paper boundary */}
        <div
          className="absolute inset-x-0"
          style={{
            top: `calc(${SKY_RATIO}% - 4px)`, height: 8,
            background: 'repeating-linear-gradient(90deg,#E8A57E 0 8px,transparent 8px 12px)',
          }}
        />
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Verify with `tsc` and vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean, existing tests still pass (these files aren't imported yet, so no runtime break).

- [ ] **Step 6: Commit**

```bash
git add src/app/globals.css src/components/minigame/gameShell.tsx src/components/minigame/GameScene.tsx src/components/minigame/gameConstants.ts
git commit -m "feat(minigame): shell (BrandCanvas/GameFrame) + GameScene chrome + keyframes"
```

---

### Task 4: `GhostHand` + `useAdvancingHint` hook

**Files:**
- Create: `src/components/minigame/GhostHand.tsx`
- Create: `src/components/minigame/useAdvancingHint.ts`

**Context:** Shared hint system (spec section 5). `GhostHand` is an SVG hand overlay for demoing the gesture. `useAdvancingHint` tracks time since last progress and returns escalation state + fires a safety-net callback; it also exposes whether the initial hint should still show (hidden after first interaction).

- [ ] **Step 1: Create `GhostHand.tsx`**

Create `src/components/minigame/GhostHand.tsx`:

```tsx
// Bàn tay ma demo thao tác. `className` mang animation loop cụ thể của từng pha.
export function GhostHand({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute z-20 pointer-events-none ${className ?? ''}`} style={style}>
      <svg width="46" height="60" viewBox="0 0 46 60" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}>
        <path d="M13 31 Q13 20 20 20 L31 20 Q38 20 38 31 L38 48 Q38 57 28 57 L24 57 Q13 57 13 48 Z" fill="white" fillOpacity="0.92" stroke="rgba(45,38,64,0.5)" strokeWidth="1.4" />
        <path d="M20 20 Q20 7 24 7 Q28 7 28 20 Z" fill="white" fillOpacity="0.92" stroke="rgba(45,38,64,0.5)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Create `useAdvancingHint.ts`**

Create `src/components/minigame/useAdvancingHint.ts`:

```ts
import { useEffect, useRef, useState } from 'react';
import { HINT_ESCALATE_MS, SAFETY_NET_MS } from './gameConstants';

/**
 * Theo dõi thời gian kể từ tiến triển gần nhất trong 1 pha.
 * - `showInitialHint`: true cho đến khi user tương tác lần đầu (markInteracted).
 * - `escalate`: true khi kẹt quá HINT_ESCALATE_MS (highlight lại đối tượng).
 * - Gọi `onSafetyNet` một lần khi kẹt quá SAFETY_NET_MS.
 * Gọi `markProgress()` mỗi lần hoàn thành 1 đối tượng để reset đồng hồ.
 */
export function useAdvancingHint(onSafetyNet: () => void) {
  const [showInitialHint, setShowInitialHint] = useState(true);
  const [escalate, setEscalate] = useState(false);
  const lastProgressRef = useRef(Date.now());
  const firedRef = useRef(false);
  const onSafetyNetRef = useRef(onSafetyNet);
  onSafetyNetRef.current = onSafetyNet;

  useEffect(() => {
    const timer = setInterval(() => {
      if (firedRef.current) return;
      const elapsed = Date.now() - lastProgressRef.current;
      if (elapsed >= SAFETY_NET_MS) {
        firedRef.current = true;
        onSafetyNetRef.current();
      } else if (elapsed >= HINT_ESCALATE_MS) {
        setEscalate(true);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  function markInteracted() {
    setShowInitialHint(false);
  }
  function markProgress() {
    lastProgressRef.current = Date.now();
    setEscalate(false);
  }

  return { showInitialHint, escalate, markInteracted, markProgress };
}
```

- [ ] **Step 3: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Commit**

```bash
git add src/components/minigame/GhostHand.tsx src/components/minigame/useAdvancingHint.ts
git commit -m "feat(minigame): GhostHand + useAdvancingHint (escalate + safety net)"
```

---

### Task 5: `PressPhase` — nặn mụn đầu trắng (press-hold)

**Files:**
- Create: `src/components/minigame/PressPhase.tsx`

**Context:** Phase 1 (spec section 4). 5 whiteheads clustered near the sky/skin boundary. Press & hold a whitehead PRESS_HOLD_MS to cycle `normal → pressed → popped`; releasing early reverts. Uses the three `acne_press` SVGs. Calls `onComplete` when all 5 are popped.

- [ ] **Step 1: Create `PressPhase.tsx`**

Create `src/components/minigame/PressPhase.tsx`:

```tsx
import { useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { GhostHand } from './GhostHand';
import { useAdvancingHint } from './useAdvancingHint';
import { PRESS_HOLD_MS } from './gameConstants';

type Spot = { id: number; x: number; y: number; state: 'normal' | 'pressed' | 'popped' };

// 5 mụn cụm sát ranh giới (y 62–86%), x rải ngang.
const INITIAL: Spot[] = [
  { id: 0, x: 22, y: 64, state: 'normal' },
  { id: 1, x: 50, y: 62, state: 'normal' },
  { id: 2, x: 74, y: 66, state: 'normal' },
  { id: 3, x: 34, y: 82, state: 'normal' },
  { id: 4, x: 63, y: 84, state: 'normal' },
];

const SRC = {
  normal: '/acne_press/normal.svg',
  pressed: '/acne_press/Pressed.svg',
  popped: '/acne_press/Pop.svg',
};

export function PressPhase({ onComplete }: { onComplete: () => void }) {
  const [spots, setSpots] = useState<Spot[]>(INITIAL);
  const sceneRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | null>(null);
  const doneRef = useRef(false);
  const { showInitialHint, escalate, markInteracted, markProgress } = useAdvancingHint(() => {
    setSpots((prev) => prev.map((s) => ({ ...s, state: 'popped' })));
    finish();
  });

  const popped = spots.filter((s) => s.state === 'popped').length;

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(onComplete, 400);
  }

  function setState(id: number, state: Spot['state']) {
    setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, state } : s)));
  }

  function startPress(id: number) {
    markInteracted();
    const spot = spots.find((s) => s.id === id);
    if (!spot || spot.state === 'popped') return;
    setState(id, 'pressed');
    holdTimer.current = window.setTimeout(() => {
      setState(id, 'popped');
      markProgress();
      setSpots((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, state: 'popped' as const } : s));
        if (next.every((s) => s.state === 'popped')) finish();
        return next;
      });
    }, PRESS_HOLD_MS);
  }

  function cancelPress(id: number) {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    const spot = spots.find((s) => s.id === id);
    if (spot && spot.state === 'pressed') setState(id, 'normal');
  }

  const firstUnpopped = spots.find((s) => s.state !== 'popped');

  return (
    <GameScene phaseIndex={1} title="Chăm mụn đầu trắng" progress={popped} total={spots.length} sceneRef={sceneRef}>
      {spots.map((s) => (
        <img
          key={s.id}
          src={SRC[s.state]}
          alt="mụn đầu trắng"
          draggable={false}
          onPointerDown={(e) => { e.preventDefault(); startPress(s.id); }}
          onPointerUp={() => cancelPress(s.id)}
          onPointerLeave={() => cancelPress(s.id)}
          className={escalate && firstUnpopped?.id === s.id ? 'mg-target-glow' : undefined}
          style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: 72, transform: 'translate(-50%, -50%)', transformOrigin: 'center bottom',
            cursor: s.state === 'popped' ? 'default' : 'pointer',
          }}
        />
      ))}

      {showInitialHint && firstUnpopped && (
        <>
          <div className="absolute left-1/2 z-10 text-sm font-extrabold text-white text-center whitespace-nowrap" style={{ top: '15%', transform: 'translateX(-50%)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Nhấn giữ để nặn mụn
          </div>
          <div className="mg-hint-arrow absolute left-1/2 z-10" style={{ top: '24%' }}>
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
              <path d="M8 0 L8 13 M2 10 L8 17 L14 10" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <GhostHand style={{ left: `${firstUnpopped.x}%`, top: `calc(${firstUnpopped.y}% + 18px)`, transform: 'translateX(-50%)', animation: 'mgHintArrow 2.4s ease-in-out infinite' }} />
        </>
      )}
    </GameScene>
  );
}
```

- [ ] **Step 2: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/minigame/PressPhase.tsx
git commit -m "feat(minigame): PressPhase — press-hold whiteheads"
```

---

### Task 6: `DragPhase` — hút mụn đầu đen bằng miếng dán (drag-drop 2 bước)

**Files:**
- Create: `src/components/minigame/DragPhase.tsx`

**Context:** Phase 2 (spec section 4). ~28 blackheads clustered near boundary; one sticker starts on the sky. Two-step: drag sticker down onto a cluster (drop = it sticks), then drag it up (lift) → blackheads under its bounding box are removed. Uses `withinBox`. Sticker rendered larger (start on sky). Complete when all removed.

- [ ] **Step 1: Create `DragPhase.tsx`**

Create `src/components/minigame/DragPhase.tsx`:

```tsx
import { useMemo, useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { GhostHand } from './GhostHand';
import { useAdvancingHint } from './useAdvancingHint';
import { withinBox } from '../MinigameCore/collisionUtils';

type Dot = { id: number; x: number; y: number };

// Sinh ~28 mụn đen dày, cụm sát ranh giới (y 62–90%).
function makeDots(): Dot[] {
  const dots: Dot[] = [];
  let id = 0;
  const cols = 7, rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        id: id++,
        x: 15 + (c / (cols - 1)) * 70 + (Math.random() - 0.5) * 5,
        y: 64 + (r / (rows - 1)) * 24 + (Math.random() - 0.5) * 4,
      });
    }
  }
  return dots;
}

// Nửa cạnh bounding-box của miếng dán tính theo % scene (sticker ~110px trên khung ~380px → ~15%).
const STICKER_HALF = 15;

export function DragPhase({ onComplete }: { onComplete: () => void }) {
  const initial = useMemo(makeDots, []);
  const [dots, setDots] = useState<Dot[]>(initial);
  // Vị trí miếng dán (%) — bắt đầu trên nền trời.
  const [sticker, setSticker] = useState({ x: 50, y: 30 });
  const [onSkin, setOnSkin] = useState(false); // đã thả xuống da (bước 1 xong) chưa
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const doneRef = useRef(false);
  const { showInitialHint, markInteracted, markProgress } = useAdvancingHint(() => {
    setDots([]); finish();
  });

  const total = initial.length;
  const removed = total - dots.length;

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(onComplete, 400);
  }

  function pctFromEvent(e: React.PointerEvent) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
  }

  function onDown(e: React.PointerEvent) {
    markInteracted();
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = pctFromEvent(e);
    if (p) setSticker(p);
  }

  function onUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (!onSkin) {
      // Bước 1: thả xuống da → dính tại chỗ.
      if (sticker.y > 60) setOnSkin(true);
    } else {
      // Bước 2: lift → hút mụn dưới bounding box.
      const box = { cx: sticker.x, cy: sticker.y, halfW: STICKER_HALF, halfH: STICKER_HALF };
      setDots((prev) => {
        const next = prev.filter((d) => !withinBox(d, box));
        if (next.length < prev.length) markProgress();
        if (next.length === 0) finish();
        return next;
      });
      setOnSkin(false);
    }
  }

  return (
    <GameScene
      phaseIndex={2}
      title="Hút mụn đầu đen"
      progress={removed}
      total={total}
      sceneRef={sceneRef}
      onScenePointerDown={onDown}
      onScenePointerMove={onMove}
      onScenePointerUp={onUp}
    >
      {dots.map((d) => (
        <img key={d.id} src="/black_acne_pull/black_acne.svg" alt="mụn đầu đen" draggable={false}
          style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: 12, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      ))}

      <img src="/black_acne_pull/sticker.svg" alt="miếng dán" draggable={false}
        style={{ position: 'absolute', left: `${sticker.x}%`, top: `${sticker.y}%`, width: 110, transform: 'translate(-50%, -50%)', opacity: onSkin ? 0.75 : 0.95, pointerEvents: 'none' }} />

      {showInitialHint && (
        <>
          <div className="absolute left-1/2 z-10 text-sm font-extrabold text-white text-center whitespace-nowrap" style={{ top: '10%', transform: 'translateX(-50%)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Kéo miếng dán vào vùng mụn
          </div>
          <GhostHand style={{ left: '50%', top: '40%', transform: 'translateX(-50%)', animation: 'mgHintArrow 2.6s ease-in-out infinite' }} />
        </>
      )}
    </GameScene>
  );
}
```

- [ ] **Step 2: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/minigame/DragPhase.tsx
git commit -m "feat(minigame): DragPhase — sticker drag-drop over blackheads"
```

---

### Task 7: `SwipePhase` — cạo lông tơ bằng máy đốt (swipe)

**Files:**
- Create: `src/components/minigame/SwipePhase.tsx`

**Context:** Phase 3 (spec section 4). ~40 hairs clustered near boundary; machine (×1.5 size) starts on sky. Drag machine down and swipe over hairs — each hair within the machine head radius starts fading then is removed. Uses `withinRadius`. Complete when all cleared.

- [ ] **Step 1: Create `SwipePhase.tsx`**

Create `src/components/minigame/SwipePhase.tsx`:

```tsx
import { useMemo, useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { GhostHand } from './GhostHand';
import { useAdvancingHint } from './useAdvancingHint';
import { withinRadius } from '../MinigameCore/collisionUtils';
import { CATCH_RADIUS } from './gameConstants';

type Hair = { id: number; x: number; y: number; fading: boolean };

// ~40 lông tơ dày, cụm sát ranh giới (y 62–92%).
function makeHairs(): Hair[] {
  const hairs: Hair[] = [];
  let id = 0;
  const cols = 8, rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      hairs.push({
        id: id++,
        x: 12 + (c / (cols - 1)) * 76 + (Math.random() - 0.5) * 4,
        y: 63 + (r / (rows - 1)) * 29 + (Math.random() - 0.5) * 3,
        fading: false,
      });
    }
  }
  return hairs;
}

export function SwipePhase({ onComplete }: { onComplete: () => void }) {
  const initial = useMemo(makeHairs, []);
  const [hairs, setHairs] = useState<Hair[]>(initial);
  const [machine, setMachine] = useState({ x: 50, y: 30 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const doneRef = useRef(false);
  const { showInitialHint, markInteracted, markProgress } = useAdvancingHint(() => {
    setHairs([]); finish();
  });

  const total = initial.length;
  const cleared = total - hairs.length;

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(onComplete, 400);
  }

  function pctFromEvent(e: React.PointerEvent) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
  }

  function burn(head: { x: number; y: number }) {
    setHairs((prev) => {
      let changed = false;
      const next = prev.map((h) => {
        if (!h.fading && withinRadius(head, h, CATCH_RADIUS)) { changed = true; return { ...h, fading: true }; }
        return h;
      });
      if (changed) {
        markProgress();
        // Xoá hẳn các sợi đang fade sau 300ms.
        setTimeout(() => {
          setHairs((cur) => {
            const remaining = cur.filter((h) => !h.fading);
            if (remaining.length === 0) finish();
            return remaining;
          });
        }, 300);
      }
      return next;
    });
  }

  function onDown(e: React.PointerEvent) {
    markInteracted();
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = pctFromEvent(e); if (p) { setMachine(p); burn(p); }
  }
  function onMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = pctFromEvent(e); if (p) { setMachine(p); burn(p); }
  }
  function onUp() { draggingRef.current = false; }

  return (
    <GameScene
      phaseIndex={3}
      title="Cạo lông tơ"
      progress={cleared}
      total={total}
      sceneRef={sceneRef}
      onScenePointerDown={onDown}
      onScenePointerMove={onMove}
      onScenePointerUp={onUp}
    >
      {hairs.map((h) => (
        <img key={h.id} src="/swipe/hair.svg" alt="lông tơ" draggable={false}
          style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, width: 14, transform: 'translate(-50%, -50%)', opacity: h.fading ? 0.15 : 1, transition: 'opacity 300ms', pointerEvents: 'none' }} />
      ))}

      <img src="/swipe/machine.svg" alt="máy đốt lông" draggable={false}
        style={{ position: 'absolute', left: `${machine.x}%`, top: `${machine.y}%`, width: 96, transform: 'translate(-50%, -60%)', pointerEvents: 'none' }} />

      {showInitialHint && (
        <>
          <div className="absolute left-1/2 z-10 text-sm font-extrabold text-white text-center whitespace-nowrap" style={{ top: '10%', transform: 'translateX(-50%)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Vuốt máy qua lông tơ
          </div>
          <GhostHand style={{ left: '50%', top: '42%', transform: 'translateX(-50%)', animation: 'mgHintArrow 2.6s ease-in-out infinite' }} />
        </>
      )}
    </GameScene>
  );
}
```

- [ ] **Step 2: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/minigame/SwipePhase.tsx
git commit -m "feat(minigame): SwipePhase — machine swipe over vellus hairs"
```

---

### Task 8: `SelfReportStep` — 3 câu tự khai

**Files:**
- Create: `src/components/minigame/SelfReportStep.tsx`

**Context:** After the 3 phases, ask 3 single-choice questions sequentially (spec section 6), collect `SelfReportAnswers`, then call `onComplete(answers)`. White card content (per shell), 4 tappable options per question.

- [ ] **Step 1: Create `SelfReportStep.tsx`**

Create `src/components/minigame/SelfReportStep.tsx`:

```tsx
import { useState } from 'react';
import type { SelfReportAnswers, SkinZone, SkinFeel, SkinTrigger } from '../MinigameCore/skinProfileLogic';

type OptionSet =
  | { key: 'zone'; q: string; options: { id: SkinZone; label: string }[] }
  | { key: 'feel'; q: string; options: { id: SkinFeel; label: string }[] }
  | { key: 'trigger'; q: string; options: { id: SkinTrigger; label: string }[] };

const QUESTIONS: OptionSet[] = [
  { key: 'zone', q: 'Da bạn hay “nổi loạn” ở đâu?', options: [
    { id: 'cam-quai-ham', label: 'Cằm & quai hàm' }, { id: 'chu-t', label: 'Vùng chữ T (trán, mũi)' },
    { id: 'hai-ma', label: 'Hai má' }, { id: 'khong-bi', label: 'Gần như không bị' }] },
  { key: 'feel', q: 'Cảm giác da chủ đạo?', options: [
    { id: 'dau', label: 'Bóng dầu' }, { id: 'kho', label: 'Khô căng' },
    { id: 'nhay-cam', label: 'Nhạy cảm, dễ ửng đỏ' }, { id: 'on-dinh', label: 'Ổn định' }] },
  { key: 'trigger', q: 'Da bạn “nổi loạn” khi nào?', options: [
    { id: 'ky-kinh', label: 'Gần kỳ kinh' }, { id: 'nang', label: 'Khi nắng nóng' },
    { id: 'stress', label: 'Khi stress' }, { id: 'thuc-khuya', label: 'Khi thức khuya' }] },
];

export function SelfReportStep({ onComplete }: { onComplete: (answers: SelfReportAnswers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SelfReportAnswers>>({});
  const current = QUESTIONS[step];

  function pick(id: string) {
    const next = { ...answers, [current.key]: id } as Partial<SelfReportAnswers>;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(next as SelfReportAnswers);
    }
  }

  return (
    <div className="bg-white dark:bg-[#f5f0ff] px-6 py-8 md:py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <div key={step} className="mg-phase-in w-full max-w-md">
        <div className="text-center mb-5">
          <div className="text-[13px] font-bold tracking-wide" style={{ color: '#FF5C9E' }}>
            SOI XONG RỒI 🎉 &nbsp;·&nbsp; {step + 1} / {QUESTIONS.length}
          </div>
          <div className="text-xl md:text-2xl font-extrabold leading-snug mt-1.5 text-cta">{current.q}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {current.options.map((o) => (
            <button key={o.id} onClick={() => pick(o.id)}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left border-2 transition-colors bg-cta/5 hover:bg-cta/10 border-cta/10 text-cta">
              <span className="font-bold text-[15px]">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git add src/components/minigame/SelfReportStep.tsx
git commit -m "feat(minigame): SelfReportStep — 3 sequential questions"
```

---

### Task 9: `SkinGame` orchestrator + disclaimer + AppFlow integration

**Files:**
- Create: `src/components/minigame/SkinGame.tsx`
- Modify: `src/components/AppFlow.tsx`

**Context:** Orchestrates `press → drag → swipe → self-report`, shows the opening disclaimer, wraps everything in `BrandCanvas`+`GameFrame`, resolves the profile from the answers, and calls the existing `onComplete(result, stats)` contract (spec section 8). Then `AppFlow` replaces `SkinScanScreen` with `SkinGame`.

- [ ] **Step 1: Inspect the current `AppFlow` minigame wiring**

Run: `grep -n "SkinScanScreen\|onComplete\|payoffStats\|minigame" src/components/AppFlow.tsx`
Expected: shows the `SkinScanScreen` import, the `step === 'minigame'` block, and the `onComplete(result, stats)` handler shape. Note the exact `stats` object keys the handler expects (from the previous iteration: `{ foundCount, zoneLabel }`). Use those SAME keys so `PayoffStats` keeps working — do not rename them in this task.

- [ ] **Step 2: Create `SkinGame.tsx`**

Create `src/components/minigame/SkinGame.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import type { SkinCondition } from '../../content/quiz';
import { BrandCanvas, GameFrame } from './gameShell';
import { PressPhase } from './PressPhase';
import { DragPhase } from './DragPhase';
import { SwipePhase } from './SwipePhase';
import { SelfReportStep } from './SelfReportStep';
import { resolveProfile, type SelfReportAnswers } from '../MinigameCore/skinProfileLogic';

type Stage = 'disclaimer' | 'press' | 'drag' | 'swipe' | 'report';

// Nhãn hiển thị vùng tự khai cho PayoffStats (giữ chữ ký stats.zoneLabel cũ).
const ZONE_LABEL: Record<SelfReportAnswers['zone'], string> = {
  'cam-quai-ham': 'cằm & quai hàm',
  'chu-t': 'vùng chữ T',
  'hai-ma': 'hai má',
  'khong-bi': 'gần như không bị',
};

export function SkinGame({
  onComplete,
}: {
  onComplete: (result: SkinCondition, stats: { foundCount: number; zoneLabel: string }) => void;
}) {
  const [stage, setStage] = useState<Stage>('disclaimer');

  // Disclaimer tự mờ sau ~2s.
  useEffect(() => {
    if (stage !== 'disclaimer') return;
    const t = setTimeout(() => setStage('press'), 2000);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <BrandCanvas>
      <GameFrame>
        {stage === 'disclaimer' && (
          <div className="bg-white dark:bg-[#2D2640] min-h-[60vh] flex flex-col items-center justify-center px-8 text-center">
            <div className="text-3xl mb-3">💛</div>
            <div className="text-lg md:text-xl font-extrabold text-cta dark:text-white">Mô phỏng vui thôi nhé</div>
            <div className="text-sm text-cta/60 dark:text-white/60 mt-2 max-w-xs">Da thật cần chuyên gia chăm — cùng chơi một chút trước nha!</div>
          </div>
        )}
        {stage === 'press' && <div className="mg-phase-in"><PressPhase onComplete={() => setStage('drag')} /></div>}
        {stage === 'drag' && <div className="mg-phase-in"><DragPhase onComplete={() => setStage('swipe')} /></div>}
        {stage === 'swipe' && <div className="mg-phase-in"><SwipePhase onComplete={() => setStage('report')} /></div>}
        {stage === 'report' && (
          <SelfReportStep
            onComplete={(answers) => {
              const result = resolveProfile(answers.zone, answers.feel, answers.trigger);
              onComplete(result, { foundCount: 0, zoneLabel: ZONE_LABEL[answers.zone] });
            }}
          />
        )}
      </GameFrame>
    </BrandCanvas>
  );
}
```

Note: `foundCount: 0` is a deliberate placeholder to preserve the existing `stats` shape; the actual chip content redesign for `PayoffStats` is out of scope here (spec section 8 leaves chip detail to a follow-up). If Step 1 revealed the handler uses a different key than `foundCount`/`zoneLabel`, adjust this object to match exactly what `AppFlow` reads.

- [ ] **Step 3: Swap the import and usage in `AppFlow.tsx`**

In `src/components/AppFlow.tsx`, replace the `SkinScanScreen` import line:

```tsx
import { SkinScanScreen } from './SkinScanScreen';
```

with:

```tsx
import { SkinGame } from './minigame/SkinGame';
```

Then in the `step === 'minigame'` render block, replace `<SkinScanScreen ... />` with `<SkinGame ... />`, keeping the exact same `onComplete={(result, stats) => { ... }}` handler body already present (do not change the handler — only the component name).

- [ ] **Step 4: Verify with `tsc` and vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean; all tests pass. (The old `skinScanLogic.test.ts` still exists and passes; it's removed in the next task.)

- [ ] **Step 5: Commit**

```bash
git add src/components/minigame/SkinGame.tsx src/components/AppFlow.tsx
git commit -m "feat(minigame): SkinGame orchestrator + disclaimer + AppFlow swap"
```

---

### Task 10: Remove superseded `SkinScanScreen` + old logic, verify manually

**Files:**
- Delete: `src/components/SkinScanScreen.tsx`
- Delete: `src/components/MinigameCore/skinScanLogic.ts`
- Delete: `src/components/MinigameCore/skinScanLogic.test.ts`

**Context:** The old game and its spot/zone logic are fully superseded (spec section 9). Remove them once nothing imports them, then verify the new game end-to-end.

- [ ] **Step 1: Confirm nothing imports the old files**

Run: `grep -rn "SkinScanScreen\|skinScanLogic" src/`
Expected: only matches inside the three files being deleted (and none in `AppFlow.tsx`, which was swapped in Task 9). If any other file imports them, stop and fix that import first.

- [ ] **Step 2: Delete the superseded files**

```bash
git rm src/components/SkinScanScreen.tsx src/components/MinigameCore/skinScanLogic.ts src/components/MinigameCore/skinScanLogic.test.ts
```

- [ ] **Step 3: Verify build + tests**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean; tests pass (now `skinProfileLogic` + `collisionUtils` suites, old `skinScanLogic` suite gone).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(minigame): remove superseded SkinScanScreen + skinScanLogic"
```

- [ ] **Step 5: Manual verification in the browser**

Start the dev server (in a worktree: `npx next dev -p 4123`, then point preview at `http://localhost:4123/`). Click "Soi da ngay" and verify across light/dark × desktop/mobile:
- Disclaimer shows ~2s then auto-advances to phase 1.
- Blob background visible around the (non-edge-to-edge) `GameFrame`; sky:skin = 3:2; targets cluster near the boundary.
- **Phase 1:** press-hold a whitehead cycles normal→pressed→popped (using the 3 `acne_press` SVGs); popped ones stay with pus/redness; releasing early reverts; progress reaches 5/5.
- **Phase 2:** drag the (larger) sticker from the sky down onto blackheads, drop, then lift → blackheads under it disappear; clears all ~28.
- **Phase 3:** drag the (×1.5) machine from the sky and swipe over hairs → hairs fade and clear; reaches ~40/40.
- Initial hints (copy + arrow + ghost hand) show on each phase and disappear on first interaction; leaving a phase idle ~20s escalates, ~35s auto-completes (safety net).
- **Self-report:** 3 questions advance one-by-one; picking answers routes to the correct profile (e.g. cằm/quai hàm → mụn nội tiết) at PayoffView.
- No console errors.

- [ ] **Step 6: Report to the user with screenshots**

Summarize results with screenshots of each phase (light + dark). Do not mark complete until the user visually approves — this is a design-heavy change validated visually throughout.
