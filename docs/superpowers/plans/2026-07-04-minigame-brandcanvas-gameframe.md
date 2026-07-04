# Minigame BrandCanvas + GameFrame Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `SkinScanScreen.tsx` from the full-bleed HUD-on-image layout (merged 2026-07-03) into a 3-layer shell: `BrandCanvas` (pastel gradient + floating blobs, dark variant) → `GameFrame` (rounded card, max-width, centered, not edge-to-edge) → `PhaseContent` (phase-specific inner UI with transition animation). Per [2026-07-04-minigame-brandcanvas-gameframe-design.md](../specs/2026-07-04-minigame-brandcanvas-gameframe-design.md).

**Architecture:** Three nested layout components inside `SkinScanScreen.tsx`. `BrandCanvas` handles viewport-filling brand background (pastel/navy gradient + 3 blobs, unchanged across phase switches). `GameFrame` is a rounded max-880px card centered inside canvas. `PhaseContent` slot swaps between `FindGameContent` and `ReportStepContent` with sequential exit/enter animation via a small `useDelayedPhase` hook. Game logic in `MinigameCore/skinScanLogic.ts` is 100% untouched.

**Tech Stack:** React 19, Next.js 16 app router, Tailwind CSS (`darkMode: 'media'`), TypeScript. No new dependencies.

**Non-goals (explicitly out of scope for this plan):**
- Any change to `MinigameCore/skinScanLogic.ts` and its 18 unit tests.
- Any change to `AppFlow.tsx`, `PayoffView`, `ProgramsScreen`, `ConversionForm`, `HeroScreen`.
- Redesign of the minigame gameplay itself (user is brainstorming a new game concept independently — this plan only builds the shell it will live inside).

**Deferred execution:** Do NOT begin implementation until the user explicitly signals they are ready to proceed (they have said they want to lock in the new game concept first and will notify when ready). This plan sits ready.

---

### Task 1: Add animation + blob CSS to `globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Context:** Iteration 1's final cleanup commit `dce0f9f` deleted the `.mg-blob` block + `mgBlobFloat` keyframes when they became dead code. This iteration restores them (design section 4) and adds two new keyframes for the phase transition (design section 6). All CSS lands first so subsequent tasks can reference the classes without dead-styling.

- [ ] **Step 1: Restore `.mg-blob` and `mgBlobFloat` keyframes**

At the end of `globals.css` (before the ProgramsScreen animations section), add:

```css
/* ── BrandCanvas blob background (used by SkinScanScreen) ── */

@keyframes mgBlobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(0, -16px) scale(1.06); }
}
.mg-blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(30px);
  opacity: 0.5;
  pointer-events: none;
  animation: mgBlobFloat 9s ease-in-out infinite;
}
@media (prefers-color-scheme: dark) {
  .mg-blob {
    opacity: 0.32;
    filter: blur(50px);
  }
}
@media (prefers-reduced-motion: reduce) {
  .mg-blob { animation: none; }
}
```

Note that opacity/blur diverge in dark mode (per design section 4). Blob COLORS are set inline per-blob in the component (Task 2), not in CSS — this keeps light/dark blob color pairs colocated with their positions in JSX.

- [ ] **Step 2: Add phase transition keyframes**

Directly below the `.mg-blob` block, add:

```css
/* ── SkinScanScreen phase transition (find ↔ report) ── */

@keyframes phaseFadeUp {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-15px); }
}
@keyframes phaseBouncyIn {
  from { opacity: 0; transform: scale(0.92); }
  to   { opacity: 1; transform: scale(1); }
}
.phase-exit {
  animation: phaseFadeUp 200ms ease-in both;
}
.phase-enter {
  animation: phaseBouncyIn 400ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@media (prefers-reduced-motion: reduce) {
  .phase-exit { animation: phaseFadeUp 150ms linear both; transform: none; }
  .phase-enter { animation: phaseBouncyIn 150ms linear both; transform: none; }
}
```

The reduced-motion fallback keeps the fade (opacity) but suppresses the vertical translate + scale — both fallback rules use `transform: none` at the end of the rule to defeat the keyframes' transform values while keeping the opacity change.

- [ ] **Step 3: Verify with `tsc` and vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: `tsc` clean, 19/19 tests pass (CSS-only change doesn't affect either but confirms baseline stays green).

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(css): restore mg-blob + add phase transition keyframes"
```

---

### Task 2: Add `BrandCanvas` and `GameFrame` layout components

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

**Context:** These two components replace the deleted `GameStage` (which was full-bleed and theme-aware in a single lump). Splitting them lets `BrandCanvas` render once and stay stable across phase switches (blobs don't reset position), while `GameFrame` is a pure "picture frame" shell that PhaseContent fills. Both live in `SkinScanScreen.tsx` — no new files. `GameStage` gets deleted in the same task since nothing will reference it anymore after this refactor lands (Task 3 rewrites the callers).

- [ ] **Step 1: Locate `GameStage` and delete it**

Find the `GameStage` function in `src/components/SkinScanScreen.tsx` (~line 111 as of tip commit `dce0f9f`; use grep to find current line). It looks like:

```tsx
// Sân khấu full-bleed dùng chung cho cả 2 phase — nền theo theme, không bo góc, không hé lộ nền pastel.
function GameStage({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen w-full relative overflow-hidden bg-[#FFF8F3] dark:bg-[#2D2640]">
      {children}
    </div>
  );
}
```

Delete the entire function. Leave the file's other content untouched for now — Task 3 will fix the callers that now reference an undefined `GameStage` (this is intentional interim-broken state, same pattern as Task 1 → Task 3 flow in the previous plan).

- [ ] **Step 2: Add `BrandCanvas` in its place**

At the same location `GameStage` used to occupy, add:

```tsx
// Lớp ngoài cùng của minigame — nền pastel + blob trôi (light), navy đậm + blob mờ (dark).
// Không re-render khi đổi phase → blob giữ vị trí liên tục.
function BrandCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
    >
      {/* Light-mode blobs — colors set inline; sizes/positions match old PlayfulBackdrop */}
      <span className="mg-blob dark:hidden" style={{ width: 220, height: 220, background: '#FFB8D4', left: -40, top: -30 }} />
      <span className="mg-blob dark:hidden" style={{ width: 180, height: 180, background: '#B39DFF', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob dark:hidden" style={{ width: 140, height: 140, background: '#8FE3BC', left: '12%', bottom: -30, animationDelay: '4s' }} />

      {/* Dark-mode blobs — deeper palette, subtler */}
      <span className="mg-blob hidden dark:block" style={{ width: 220, height: 220, background: '#4c1d95', left: -40, top: -30 }} />
      <span className="mg-blob hidden dark:block" style={{ width: 180, height: 180, background: '#1e40af', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob hidden dark:block" style={{ width: 140, height: 140, background: '#312e81', left: '12%', bottom: -30, animationDelay: '4s' }} />

      {/* Dark-mode gradient overlay — layered on top of the light gradient via absolute cover */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: 'linear-gradient(135deg,#0f0c1a 0%,#1a1030 55%,#0f0c1a 100%)' }}
      />

      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}
```

Note the dark-mode approach: rather than swapping the outer div's `background`, we render both gradient + blob sets and use `hidden dark:block` / `dark:hidden` to swap. This works because Tailwind's `darkMode: 'media'` responds to `prefers-color-scheme` — one set is always hidden. The dark gradient overlay must come AFTER the light blobs in DOM order and before `children` — since `pointer-events-none` is applied, it never blocks interaction, and z-index 10 on children keeps them above it.

- [ ] **Step 3: Add `GameFrame` directly below**

Immediately after `BrandCanvas`, add:

```tsx
// Khung game bo góc, canh giữa trong BrandCanvas. Không đặt background — PhaseContent tự set theo phase.
function GameFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[92vw] max-w-[880px] max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden">
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Verify — expect two known errors**

Run: `npx tsc --noEmit`
Expected: FAILS with exactly two `TS2304: Cannot find name 'GameStage'` errors, referencing the two callers (one inside `FindGame`, one inside `ReportStep`). This confirms `BrandCanvas`/`GameFrame` themselves added no new errors — the only remaining errors are the known, not-yet-fixed `GameStage` references that Task 3 addresses.

If ANY other error appears (typo, unused import, missing `ReactNode` type), fix it before proceeding.

- [ ] **Step 5: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "refactor(shell): add BrandCanvas + GameFrame, remove GameStage"
```

---

### Task 3: Refactor `FindGame` to portrait-emphasis + sandwich mobile layout

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

**Context:** After Task 2, `FindGame` still calls `<GameStage>` and won't compile. This task rewrites `FindGame`'s return to use the new `BrandCanvas > GameFrame > content` shell, and rebuilds the content itself per design section 6: desktop side-by-side (photo left in a small navy "picture frame", HUD panel right on white/navy background), mobile sandwich (HUD-card top, photo middle, chip strip bottom). The photo is never full-bleed anymore — it's inside a `w-[280px]` fixed-size portrait frame with `aspect-[3/4]`. The old `FindGameHud` (top scrim + bottom scrim overlays on the photo) is fully deleted. `ScanBoard` is retooled from `absolute inset-0` back to a positioned box with fixed aspect ratio.

- [ ] **Step 1: Update `FACE_IMAGE_URL`**

At the top of the file, find:

```tsx
const FACE_IMAGE_URL =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&h=560&fit=crop&crop=faces';
```

Replace with:

```tsx
// TODO(go-live): thay bằng ảnh chân dung da sạch có commercial license — tiêu chí: portrait dọc, tone da sáng, background dịu, không đè lên 6 vị trí spot trong SPOT_POOL.
const FACE_IMAGE_URL =
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=900&h=1200&fit=crop&crop=faces&q=85';
```

- [ ] **Step 2: Rewrite `FindGame`'s return**

Locate `FindGame`. Its current return uses `<GameStage>` and renders `ScanBoard` + `FindGameHud` as siblings. Replace the entire `return (...)` block with:

```tsx
  return (
    <FindGameContent
      spots={spots}
      hintLevel={hintLevel}
      firstUnfound={firstUnfound}
      foundCount={foundCount}
      boardRef={boardRef}
      onPointer={handlePointer}
    />
  );
```

Leave `FindGame`'s state/refs/effects (all the useState, useRef, useEffect for hint timer, `commit`, `handlePointer`) exactly as they were. Only the return JSX changes. `FindGameContent` is a new component (Step 3) that renders the shell + inner layout.

- [ ] **Step 3: Add `FindGameContent`**

Directly below `FindGame`, add:

```tsx
// Nội dung phase 'find' — layout portrait-emphasis (desktop) hoặc sandwich (mobile) bên trong GameFrame.
function FindGameContent({
  spots,
  hintLevel,
  firstUnfound,
  foundCount,
  boardRef,
  onPointer,
}: {
  spots: AcneSpot[];
  hintLevel: 0 | 1 | 2;
  firstUnfound: AcneSpot | null;
  foundCount: number;
  boardRef: RefObject<HTMLDivElement | null>;
  onPointer: (clientX: number, clientY: number) => void;
}) {
  const remaining = SPOT_COUNT - foundCount;
  return (
    <BrandCanvas>
      <GameFrame>
        <div className="flex flex-col md:flex-row bg-white dark:bg-[#2D2640]">
          {/* Photo column — desktop left, mobile middle (order-2) */}
          <div className="order-2 md:order-1 md:w-[300px] md:shrink-0 p-4 md:p-6 md:flex md:items-center md:justify-center">
            <div className="w-full max-w-[300px] mx-auto rounded-2xl overflow-hidden bg-black/5 dark:bg-black/40">
              <ScanBoard
                boardRef={boardRef}
                spots={spots}
                hintLevel={hintLevel}
                firstUnfound={firstUnfound}
                onPointer={onPointer}
              />
            </div>
          </div>

          {/* HUD column — desktop right (full), mobile split top (title/progress) + bottom (chips) */}
          <div className="order-1 md:order-2 md:flex-1 md:flex md:flex-col md:justify-center px-5 pt-5 pb-3 md:px-8 md:py-8">
            <div className="text-[13px] font-bold tracking-wide text-cta/70 dark:text-white/70">
              SOI THỬ LÀN DA
            </div>
            <div className="text-xl md:text-2xl font-extrabold leading-snug mt-1.5 text-cta dark:text-white">
              Chạm để khoanh hết các nốt mụn bạn thấy 👀
            </div>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 h-2 rounded-full bg-cta/10 dark:bg-white/15 overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-300"
                  style={{
                    width: `${(foundCount / SPOT_COUNT) * 100}%`,
                    background: 'linear-gradient(90deg,#FF5C9E,#B39DFF)',
                  }}
                />
              </div>
              <div className="text-[13px] font-extrabold whitespace-nowrap text-cta dark:text-white">
                {foundCount} / {SPOT_COUNT} nốt
              </div>
            </div>
          </div>

          {/* Chip strip — mobile only (order-3), desktop hides (already in HUD column) */}
          <div className="order-3 flex md:hidden gap-2 px-5 pb-5 pt-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cta/5 dark:bg-white/10 px-3 py-1.5 text-sm font-bold text-cta dark:text-white">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5C9E' }} />
              {foundCount} đã soi
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cta/5 dark:bg-white/5 px-3 py-1.5 text-sm font-bold text-cta/60 dark:text-white/60">
              <span className="w-2.5 h-2.5 rounded-full bg-cta/30 dark:bg-white/30" />
              còn {remaining}
            </span>
          </div>
        </div>
      </GameFrame>
    </BrandCanvas>
  );
}
```

Note the `order-N` responsive trick: on mobile the natural document order is HUD text (order-1) → photo (order-2) → chip strip (order-3), giving the sandwich per design section 6. On desktop, `md:order-*` flips it to photo-left-first (order-1) + HUD-right (order-2); the mobile-only chip strip stays but is hidden via `md:hidden`.

The photo container uses `aspect-[3/4]` (via `ScanBoard` — Step 4) inside a fixed 300px max width, so it never exceeds the source resolution.

- [ ] **Step 4: Rewrite `ScanBoard` to portrait aspect ratio**

Find the existing `ScanBoard` function. Its current outer div is `className="absolute inset-0" style={{ touchAction: 'none', userSelect: 'none' }}` — fine for full-bleed but wrong now that it lives inside a fixed-width container. Replace the outer div's className/style:

```tsx
    <div
      ref={boardRef}
      onPointerDown={(e) => onPointer(e.clientX, e.clientY)}
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        onPointer(e.clientX, e.clientY);
      }}
      className="relative w-full aspect-[3/4]"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
```

The `<img>` inside stays `className="absolute inset-0 w-full h-full object-cover"` — same as before. Spots/hint-layer JSX inside is byte-for-byte unchanged (they use `%` coordinates which work regardless of container size).

- [ ] **Step 5: Delete the old `FindGameHud`**

Find the `FindGameHud` function (starts with `// HUD nổi trên ảnh — dải trên (label+headline+tiến độ, mọi kích thước) và dải dưới (chip đếm+mascot, chỉ desktop).`). Delete the entire function. `Mascot` is no longer used by anything after this (the new HUD doesn't include it) — delete `Mascot` too. If a subsequent design pass wants a mascot back somewhere, it's easy to re-add; leaving unused code around is worse.

- [ ] **Step 6: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: STILL FAILS, with exactly one `GameStage`-related error from `ReportStep` (Task 4 fixes it). All FindGame-related errors should be gone. If any FindGame or FindGameContent error remains, fix before commit.

- [ ] **Step 7: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "refactor(find): portrait-emphasis + sandwich layout, drop HUD overlays"
```

---

### Task 4: Refactor `ReportStep` to white-card content

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

**Context:** `ReportStep` still uses `<GameStage>` (deleted in Task 2) and won't compile. Per design section 6, its inner background changes from the previous "navy in dark / cream in light" to **white in light / off-white `#f5f0ff` in dark** — the card stays light regardless of theme to signal "past game, into self-report" (nhất quán với PayoffView phía sau). Same content (FaceMap + question card + 4 zone buttons) as before, only palette + shell change.

- [ ] **Step 1: Rewrite `ReportStep`'s return**

Find `ReportStep`. Replace its return with:

```tsx
  return (
    <BrandCanvas>
      <GameFrame>
        <div className="bg-white dark:bg-[#f5f0ff] flex flex-col items-center justify-center gap-8 px-6 py-8 md:flex-row md:gap-16 md:py-12">
          <FaceMap className="hidden md:flex" />
          <div className="w-full max-w-sm md:max-w-md">
            <div className="text-center mb-5">
              <div className="text-[13px] font-bold tracking-wide" style={{ color: '#FF5C9E' }}>
                SOI XONG RỒI 🎉
              </div>
              <div className="text-xl md:text-2xl font-extrabold leading-snug mt-1.5 text-cta">
                Còn da của <u>bạn</u> thì hay “nổi loạn” nhất ở đâu?
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => onPick(zone)}
                  className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left border-2 transition-colors bg-cta/5 hover:bg-cta/10 border-cta/10 text-cta"
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ZONE_META[zone].color }} />
                  <span className="font-bold text-[15px]">{ZONE_LABELS[zone]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </GameFrame>
    </BrandCanvas>
  );
```

The `zones: SkinZone[] = [...]` line at the top of `ReportStep`'s body stays as-is.

Two key differences from the previous ReportStep:
- No `dark:text-white` on the headline or `dark:bg-white/8` on buttons — because the card is now white in both themes, all text is `text-cta` dark, buttons are `bg-cta/5`.
- No `dark:` variant on the container — `bg-white dark:bg-[#f5f0ff]` is the only dark-aware token in this block.

- [ ] **Step 2: Update `FaceMap`'s legend text**

`FaceMap`'s legend currently reads `className="flex flex-col gap-1.5 text-sm text-cta/80 dark:text-white/80"`. Since the card behind it is now always light, remove the dark variant:

```tsx
      <div className="flex flex-col gap-1.5 text-sm text-cta/80">
```

- [ ] **Step 3: Verify with `tsc` and vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: PASSES with zero errors, 19/19 tests. This is the first task where the whole file compiles again after Task 2's deliberate interim break.

- [ ] **Step 4: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "refactor(report): white card content regardless of theme"
```

---

### Task 5: Add phase transition animation

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

**Context:** After Task 4, phase switches are still instant (`setPhase('report')` swaps content immediately). This task inserts the sequential exit-then-enter animation defined in design section 6, using the CSS keyframes added in Task 1. Implemented via a small `useDelayedPhase` hook that tracks `renderedPhase` (what's mounted) separately from the "target" phase from state, with a 200ms exit + 150ms gap delay before renderedPhase catches up.

- [ ] **Step 1: Add the `useDelayedPhase` hook**

Directly below the imports in `SkinScanScreen.tsx`, add:

```tsx
// Hook điều phối animation chuyển phase: exit 200ms → gap 150ms → enter mount + 400ms bouncy-in.
// Trả về (renderedPhase, isExiting) — component consumer render theo renderedPhase và apply className theo isExiting.
function useDelayedPhase(targetPhase: 'find' | 'report') {
  const [renderedPhase, setRenderedPhase] = useState(targetPhase);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (targetPhase === renderedPhase) return;
    setIsExiting(true);
    const t1 = setTimeout(() => {
      setRenderedPhase(targetPhase);
      setIsExiting(false);
    }, 200 + 150); // exit 200ms + gap 150ms
    return () => clearTimeout(t1);
  }, [targetPhase, renderedPhase]);

  return { renderedPhase, isExiting };
}
```

If `useState`/`useEffect` aren't already imported at the top, add them: `import { useEffect, useRef, useState, ... }` (they should already be imported — sanity-check).

- [ ] **Step 2: Wire the hook into `SkinScanScreen`**

Find the top-level `SkinScanScreen` function. Its body currently looks roughly like:

```tsx
export function SkinScanScreen({ onComplete }: { onComplete: ... }) {
  const [phase, setPhase] = useState<'find' | 'report'>('find');
  const foundCountRef = useRef(SPOT_COUNT);

  if (phase === 'find') {
    return <FindGame onAllFound={...} />;
  }
  return <ReportStep onPick={...} />;
}
```

Rewrite the return branch to use the hook + apply the animation class:

```tsx
export function SkinScanScreen({ onComplete }: { onComplete: ... }) {
  const [phase, setPhase] = useState<'find' | 'report'>('find');
  const foundCountRef = useRef(SPOT_COUNT);
  const { renderedPhase, isExiting } = useDelayedPhase(phase);

  const animationClass = isExiting ? 'phase-exit' : 'phase-enter';

  return (
    <div key={renderedPhase} className={animationClass}>
      {renderedPhase === 'find' ? (
        <FindGame onAllFound={(count) => {
          foundCountRef.current = count;
          setPhase('report');
        }} />
      ) : (
        <ReportStep onPick={(zone) => {
          const result = resolveConditionByZone(zone);
          onComplete(result, {
            foundCount: foundCountRef.current,
            zoneLabel: ZONE_META[zone].label,
          });
        }} />
      )}
    </div>
  );
}
```

Two important details:
- `key={renderedPhase}` forces the wrapper `<div>` to re-mount when `renderedPhase` changes, which restarts the CSS animation (otherwise it would run only once on first mount).
- When `isExiting` is true, `renderedPhase` still equals the OLD phase (per the hook's contract), so the exit animation runs on the OLD content. After the 350ms timeout, `renderedPhase` flips and `isExiting` returns false, so the NEW content mounts with `.phase-enter`.

- [ ] **Step 3: Verify with `tsc` and vitest**

Run: `npx tsc --noEmit && npx vitest run`
Expected: clean tsc, 19/19 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "feat(anim): phase transition with useDelayedPhase hook"
```

---

### Task 6: Manual verification

**Files:** none (verification only)

**Context:** Same as the previous iteration's Task 5 — no automated tests for pure visual changes (logic is unchanged). Verify across the full theme × device × phase matrix by running preview in the worktree.

- [ ] **Step 1: Start dev server in the worktree**

Use the same manual approach as the previous iteration (project's `preview_start` MCP tool points at main worktree, so start Next dev directly on a different port). From worktree root:

```bash
npx next dev -p 4123
```

Then navigate the preview browser to `http://localhost:4123/`.

- [ ] **Step 2: Verify `FindGame` in light mode, desktop viewport**

Resize to ~1280×800, colorScheme light. Click "Soi da ngay" to enter minigame. Confirm:
- Blob trôi thấy được ở nền xung quanh khung game (canvas KHÔNG bị khung phủ kín).
- Khung game bo góc, nhìn rõ shadow.
- Ảnh khuôn mặt ở cột trái, khung nhỏ (~280-300px rộng), portrait 3:4.
- HUD ở cột phải, text tối đọc rõ trên nền trắng, progress bar hoạt động.
- Tap được vào nốt trong ảnh, đếm tăng.

- [ ] **Step 3: Verify `FindGame` in dark mode, desktop viewport**

Switch colorScheme dark. Confirm:
- Nền chuyển sang navy sâu với blob tím than / xanh khuếch tán mờ hơn.
- Khung game nền navy, chữ trắng đọc rõ.
- Ảnh không bị pixelated ở kích thước hiển thị mới.

- [ ] **Step 4: Verify `FindGame` mobile (both themes)**

Resize to 375×812. Confirm:
- Layout sandwich: HUD text trên → ảnh giữa (chiếm hầu hết) → chip strip cuối.
- Ảnh không tràn ra khỏi GameFrame, không edge-to-edge.
- Chip đếm chỉ hiện ở mobile (không có mascot).

- [ ] **Step 5: Verify phase transition find → report**

Complete FindGame (either tap all 6 spots or wait for the ~22s safety net). Watch the transition:
- Content phase find fade + trượt lên `~-15px` trong 200ms.
- Gap ~150ms tối màn.
- Card trắng phase report bung ra với bouncy scale-in.
- Toàn bộ transition ~750ms.

- [ ] **Step 6: Verify `ReportStep` in all 4 combos (desktop/mobile × light/dark)**

- Card trắng nhất quán ở cả 4 combo (dark mode chỉ đổi nền BrandCanvas xung quanh, card vẫn trắng/off-white).
- FaceMap hiện ở desktop, ẩn ở mobile.
- 4 nút chọn vùng bấm được, style `bg-cta/5` với hover.
- Click nút → chuyển qua PayoffView bình thường (không đụng flow này).

- [ ] **Step 7: `prefers-reduced-motion` test**

Enable reduced motion in OS/browser settings. Confirm:
- Blob đứng yên (không animate).
- Transition find → report vẫn fade nhưng không translate/scale, ngắn hơn (~150ms).

- [ ] **Step 8: Console error check**

Đảm bảo không có lỗi console trong toàn bộ playthrough. Take a screenshot of each key state (FindGame light/dark, ReportStep light/dark) for the completion report.

- [ ] **Step 9: Report to user**

Tổng hợp screenshots + kết quả tsc/vitest gửi lại user. Wait for user to visually approve before merging.
