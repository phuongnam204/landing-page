# Minigame Full-Bleed + HUD Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rework `SkinScanScreen.tsx` (both `FindGame` and `ReportStep` phases) from a fixed 330px modal-in-a-pastel-backdrop layout into a full-bleed, theme-aware "game window" with HUD-style text overlays, per `docs/superpowers/specs/2026-07-03-minigame-fullbleed-hud-design.md`.

**Architecture:** Both phases share a new `GameStage` full-bleed wrapper (`h-screen w-full`, no rounded corners, background color follows `dark:` theme). `PlayfulBackdrop` (pastel gradient + floating blobs) and `PlayfulPanel` (separate text column) are deleted. Text/progress/stat content becomes absolutely-positioned HUD overlays with dark scrim gradients for legibility, instead of living in separate stacked blocks.

**Tech Stack:** React 19 (Next.js 16 app router), Tailwind CSS (`darkMode: 'media'`), TypeScript. No new dependencies.

**Non-goals (do not touch):** `src/components/MinigameCore/skinScanLogic.ts` and its test file, `AppFlow.tsx`, `PayoffView`, `ProgramsScreen`, `ConversionForm`. This is a pure presentational rewrite of one file.

---

### Task 1: Add `GameStage` wrapper and convert `FindGame` to use it

**Files:**
- Modify: `src/components/SkinScanScreen.tsx:56-155` (the `FindGame` function)
- Modify: `src/components/SkinScanScreen.tsx:241-254` (delete `PlayfulBackdrop`)

**Context:** `PlayfulBackdrop` currently wraps both `FindGame` and `ReportStep` in a pastel gradient with floating blobs, and `FindGame` renders its content inside a fixed `frameStyle` (330px navy card) next to a separate `PlayfulPanel` text column. This task replaces that with a single full-bleed, theme-aware stage. The HUD overlay content itself is built in Task 2 — this task only gets the stage/board full-bleed and wired up, using a temporary minimal header so the file stays in a runnable state.

- [ ] **Step 1: Add the `GameStage` component**

Insert this new function directly above the `FindGame` function definition (i.e. right before line 56, `function FindGame(...)`):

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

- [ ] **Step 2: Rewrite `FindGame`'s return statement to use `GameStage` and a full-bleed `ScanBoard`**

Replace the entire `return (...)` block inside `FindGame` (currently lines 110-154, from `return (` down to the matching closing `);`) with:

```tsx
  return (
    <GameStage>
      <ScanBoard
        boardRef={boardRef}
        spots={spots}
        hintLevel={hintLevel}
        firstUnfound={firstUnfound}
        onPointer={handlePointer}
      />
      <FindGameHud foundCount={foundCount} />
    </GameStage>
  );
```

Do not write `FindGameHud` yet — that is Task 2. Leave `FindGame`'s existing state/refs/effects (`spots`, `hintLevel`, `spotsRef`, `lastFindRef`, `boardRef`, `doneRef`, `foundCount`, `firstUnfound`, `commit`, `handlePointer`, the hint-timer `useEffect`) exactly as they are — only the JSX returned changes.

- [ ] **Step 3: Rewrite `ScanBoard` to be full-bleed instead of a fixed 360px box**

Replace the `ScanBoard` function (lines 158-239) with:

```tsx
// Khung ảnh tương tác — chứa ảnh khuôn mặt, các nốt mụn và lớp gợi ý. Full-bleed: phủ kín GameStage.
function ScanBoard({
  boardRef,
  spots,
  hintLevel,
  firstUnfound,
  onPointer,
}: {
  boardRef: RefObject<HTMLDivElement | null>;
  spots: AcneSpot[];
  hintLevel: 0 | 1 | 2;
  firstUnfound: AcneSpot | null;
  onPointer: (clientX: number, clientY: number) => void;
}) {
  return (
    <div
      ref={boardRef}
      onPointerDown={(e) => onPointer(e.clientX, e.clientY)}
      onPointerMove={(e) => {
        if (e.buttons !== 1) return;
        onPointer(e.clientX, e.clientY);
      }}
      className="absolute inset-0"
      style={{ touchAction: 'none', userSelect: 'none' }}
    >
      <img
        src={FACE_IMAGE_URL}
        alt="Khuôn mặt để soi da"
        className="absolute inset-0 w-full h-full object-cover"
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
  );
}
```

The only changes from the original: the outer `<div>` switches from an inline `style={{ position: 'relative', width: '100%', height: 360, background: '#111', ... }}` to `className="absolute inset-0"` (fills the full `GameStage`), and the `<img>` switches from inline `style` to `className="absolute inset-0 w-full h-full object-cover"`. The spots/hint-layer JSX is byte-for-byte identical to before — no logic or coordinate math changes.

- [ ] **Step 4: Add a temporary placeholder `FindGameHud` so the file compiles**

Insert this directly below the new `ScanBoard` function (this is a throwaway stub — Task 2 replaces it with the real HUD):

```tsx
// TODO(Task 2): replace with the real HUD overlay.
function FindGameHud({ foundCount }: { foundCount: number }) {
  return null;
}
```

- [ ] **Step 5: Delete `PlayfulBackdrop`**

Remove the entire `PlayfulBackdrop` function (the block that starts with `// Nền pastel dùng chung cho cả hai màn...` and the `function PlayfulBackdrop({ children }: { children: ReactNode }) { ... }` body, originally lines 241-254).

`ReportStep` still calls `<PlayfulBackdrop>` at this point in the file — that's fine, it will fail to compile until Task 3 rewrites `ReportStep`. Do not fix `ReportStep` in this task.

- [ ] **Step 6: Confirm the expected compile error, then proceed**

Run: `npx tsc --noEmit`
Expected: FAILS with an error about `PlayfulBackdrop` not being defined, referencing the `ReportStep` function. This confirms Task 1's edits to `FindGame`/`ScanBoard`/`GameStage` themselves introduced no new errors — the only remaining error is the known, not-yet-fixed `ReportStep` reference. Do not attempt to silence this error; Task 3 resolves it.

- [ ] **Step 7: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "refactor: full-bleed GameStage + ScanBoard for FindGame (ReportStep pending)"
```

---

### Task 2: Build the real `FindGameHud` overlay and remove the old side panel

**Files:**
- Modify: `src/components/SkinScanScreen.tsx` (replace the `FindGameHud` stub from Task 1, delete `PlayfulPanel`)

**Context:** The stub HUD from Task 1 renders nothing. This task builds the real HUD: a top bar (label + headline + progress bar/counter, visible on all breakpoints) and a bottom bar (found/remaining chips + mascot, desktop-only — matching the existing `hidden md:flex` rule the old `PlayfulPanel` used). Both bars are absolutely positioned over the `ScanBoard` image with a dark scrim gradient so white text stays legible regardless of the site's light/dark theme (per spec section 5 — the scrim itself does not change with theme).

- [ ] **Step 1: Replace the `FindGameHud` stub with the real overlay**

Replace the stub written in Task 1:

```tsx
// TODO(Task 2): replace with the real HUD overlay.
function FindGameHud({ foundCount }: { foundCount: number }) {
  return null;
}
```

with:

```tsx
// HUD nổi trên ảnh — dải trên (label+headline+tiến độ, mọi kích thước) và dải dưới (chip đếm+mascot, chỉ desktop).
function FindGameHud({ foundCount }: { foundCount: number }) {
  const remaining = SPOT_COUNT - foundCount;
  return (
    <>
      <div className="absolute top-0 inset-x-0 pointer-events-none bg-gradient-to-b from-black/70 via-black/30 to-transparent px-5 pt-5 pb-10 md:px-10 md:pt-8">
        <div className="text-[13px] font-bold tracking-wide text-white/85">
          SOI THỬ LÀN DA
        </div>
        <div className="text-lg md:text-2xl font-extrabold leading-snug mt-1 text-white max-w-md">
          Chạm để khoanh hết các nốt mụn bạn thấy 👀
        </div>
        <div className="flex items-center gap-2 mt-3 max-w-xs md:max-w-sm">
          <div className="flex-1 h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{
                width: `${(foundCount / SPOT_COUNT) * 100}%`,
                background: 'linear-gradient(90deg,#FF5C9E,#B39DFF)',
              }}
            />
          </div>
          <div className="text-[13px] font-extrabold whitespace-nowrap" style={{ color: '#FFB8D4' }}>
            {foundCount} / {SPOT_COUNT} nốt
          </div>
        </div>
      </div>

      <div className="hidden md:flex absolute bottom-0 inset-x-0 pointer-events-none bg-gradient-to-t from-black/60 to-transparent px-10 pb-8 pt-14 items-end justify-between">
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-sm font-bold text-cta shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5C9E' }} />
            {foundCount} đã soi
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5 text-sm font-bold text-cta/70 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-cta/30" />
            còn {remaining}
          </span>
        </div>
        <Mascot />
      </div>
    </>
  );
}
```

Both overlay bars use `pointer-events-none` so taps pass through to the `ScanBoard` underneath (which is earlier in the JSX, so it's beneath the HUD in stacking order) — this preserves the ability to tap spots that happen to sit near the top or bottom edge of the screen.

- [ ] **Step 2: Delete `PlayfulPanel`**

Remove the entire `PlayfulPanel` function (the block starting with `// Panel phải của FindGame — chỉ hiện từ breakpoint md trở lên.` through its closing `}`). It is no longer called anywhere — `FindGame` was already updated in Task 1 to stop rendering it.

Do not delete the `Mascot` function — `FindGameHud` now calls it directly.

- [ ] **Step 3: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: still FAILS, with the same single `PlayfulBackdrop`/`ReportStep` error as the end of Task 1 (nothing new). If any other error appears (e.g. a typo in the HUD JSX), fix it before proceeding.

- [ ] **Step 4: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "feat: HUD overlay for FindGame (progress header + desktop stat bar)"
```

---

### Task 3: Rewrite `ReportStep` to use `GameStage` and theme-aware colors

**Files:**
- Modify: `src/components/SkinScanScreen.tsx` (rewrite `ReportStep` and `FaceMap`, delete now-unused `zoneChipStyle`)

**Context:** `ReportStep` currently renders inside `PlayfulBackdrop` (just deleted in Task 1) with a fixed `w-[330px] md:w-[440px]` navy card. This task moves it onto `GameStage` with centered content and theme-aware text/button colors (light mode: `text-cta` on the light `GameStage` background; dark mode: white text on navy, matching the existing look byte-for-byte since dark mode is unchanged per spec section 5).

- [ ] **Step 1: Rewrite `ReportStep`**

Replace the entire `ReportStep` function with:

```tsx
function ReportStep({ onPick }: { onPick: (zone: SkinZone) => void }) {
  const zones: SkinZone[] = ['cam-quai-ham', 'chu-t', 'hai-ma', 'khong-bi'];
  return (
    <GameStage>
      <div className="h-full w-full flex flex-col items-center justify-center gap-8 px-6 md:flex-row md:gap-16">
        <FaceMap className="hidden md:flex" />
        <div className="w-full max-w-sm md:max-w-md">
          <div className="text-center mb-5">
            <div className="text-[13px] font-bold tracking-wide" style={{ color: '#FF5C9E' }}>
              SOI XONG RỒI 🎉
            </div>
            <div className="text-xl md:text-2xl font-extrabold leading-snug mt-1.5 text-cta dark:text-white">
              Còn da của <u>bạn</u> thì hay “nổi loạn” nhất ở đâu?
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {zones.map((zone) => (
              <button
                key={zone}
                onClick={() => onPick(zone)}
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left border-2 transition-colors bg-cta/5 hover:bg-cta/10 border-cta/10 text-cta dark:bg-white/8 dark:hover:bg-white/12 dark:border-white/15 dark:text-white"
              >
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: ZONE_META[zone].color }} />
                <span className="font-bold text-[15px]">{ZONE_LABELS[zone]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </GameStage>
  );
}
```

- [ ] **Step 2: Make `FaceMap`'s legend text theme-aware**

In the `FaceMap` function, find this line (the legend text color):

```tsx
      <div className="flex flex-col gap-1.5 text-sm text-cta/80">
```

Replace it with:

```tsx
      <div className="flex flex-col gap-1.5 text-sm text-cta/80 dark:text-white/80">
```

No other changes to `FaceMap` — the SVG itself already uses colors from `ZONE_META` that work on both backgrounds.

- [ ] **Step 3: Delete the now-unused `zoneChipStyle` constant**

Remove this constant (it was only used by the old inline-styled `ReportStep` buttons, now replaced with Tailwind classes in Step 1):

```tsx
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

- [ ] **Step 4: Verify with `tsc`**

Run: `npx tsc --noEmit`
Expected: PASS with no errors. This confirms every reference to the deleted `PlayfulBackdrop`, `PlayfulPanel`, and `zoneChipStyle` has been removed.

- [ ] **Step 5: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "refactor: full-bleed theme-aware ReportStep"
```

---

### Task 4: Remove the leftover hint line and dead `frameStyle`, final cleanup

**Files:**
- Modify: `src/components/SkinScanScreen.tsx`

**Context:** The old `frameStyle` constant (330px fixed-width navy card) is no longer referenced anywhere after Tasks 1-3 rewrote both `FindGame` and `ReportStep`. The hint line "Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡" was part of the old `frameStyle`-wrapped footer and was already dropped when `FindGame`'s return statement was rewritten in Task 1 — this task just confirms it's gone and removes the now-dead constant.

- [ ] **Step 1: Search for any remaining reference to `frameStyle`**

Run: `grep -n "frameStyle" src/components/SkinScanScreen.tsx`
Expected: only the constant's own declaration, no usages. (If a usage still exists, something in Task 1-3 didn't get fully rewritten — go back and check `FindGame`/`ReportStep` for a stray `style={frameStyle}`.)

- [ ] **Step 2: Delete the `frameStyle` constant**

Remove:

```tsx
const frameStyle: CSSProperties = {
  width: 330,
  borderRadius: 28,
  overflow: 'hidden',
  background: '#2D2640',
  boxShadow: '0 18px 50px rgba(45,38,64,0.35)',
};
```

- [ ] **Step 3: Search for the hint line text to confirm it's gone**

Run: `grep -n "nếu bí" src/components/SkinScanScreen.tsx`
Expected: no matches. If a match is found, delete that line — it should not appear anywhere in the new full-bleed layout (per spec section 6, "Mobile (cả 2 phase)").

- [ ] **Step 4: Run the full TypeScript check**

Run: `npx tsc --noEmit`
Expected: PASS with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "chore: remove dead frameStyle constant"
```

---

### Task 5: Manual verification across theme/device combinations

**Files:** none (verification only)

**Context:** This is a pure presentational rewrite with no logic changes — `MinigameCore/skinScanLogic.ts` and its existing 18 unit tests are untouched, so no new automated tests are needed (per spec section 8). Verification is manual, through the running dev server, across every combination called out in the spec.

- [ ] **Step 1: Start the dev server**

Use the project's preview tooling to start the `dev` server (per `.claude/launch.json`) and open it in a browser preview.

- [ ] **Step 2: Verify `FindGame` in light mode, desktop viewport**

Resize the preview to a desktop viewport (e.g. 1280x800) with `colorScheme: light`. Click "Soi da ngay" on the hero to enter the minigame. Confirm:
- The face image fills the entire viewport edge-to-edge (no card, no rounded corners, no pastel background visible).
- The top HUD (label, headline, progress bar, counter) is legible over the image.
- The bottom HUD (found/remaining chips + mascot) is visible (desktop-only).
- Tapping/clicking a red spot circles it and increments the counter.

- [ ] **Step 3: Verify `FindGame` in dark mode, desktop viewport**

Same as Step 2 but with `colorScheme: dark`. Confirm the HUD scrim/text still reads clearly (scrim does not change with theme, per design) and nothing regresses compared to light mode.

- [ ] **Step 4: Verify `FindGame` in light and dark mode, mobile viewport**

Resize to a mobile viewport (e.g. 375x812) with each color scheme. Confirm:
- No rounded corners, no visible pastel background peeking around the edges.
- The bottom HUD (chips + mascot) is hidden (mobile-only rule).
- The removed hint line ("Đừng lo — nếu bí...") does not appear anywhere.

- [ ] **Step 5: Complete the game and verify `ReportStep` in all four combinations (desktop/mobile × light/dark)**

Circle all 6 spots (or wait for the ~22s safety net to auto-complete) to reach `ReportStep`. For each of the four combinations, confirm:
- Background follows the theme: light warm background in light mode, navy in dark mode (byte-identical to the old dark-mode look).
- On desktop, the `FaceMap` diagram is visible to the side of the 4 zone buttons; on mobile, `FaceMap` is hidden and only the 4 buttons show.
- Clicking a zone button advances past `ReportStep` (to the `PayoffView`, per `AppFlow.tsx`'s existing wiring — not modified by this plan).

- [ ] **Step 6: Check for console errors**

Use the preview tooling's console/log inspection across at least one full playthrough. Confirm no new errors or warnings were introduced.

- [ ] **Step 7: Report results to the user**

Summarize what was checked and any screenshots taken. Do not mark the plan complete until the user has reviewed the visual result — this is a design-heavy change and the spec was validated visually before implementation, so final confirmation should also be visual.
