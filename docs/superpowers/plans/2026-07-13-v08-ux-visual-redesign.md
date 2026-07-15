# v08 Playful Dark-Accent — Visual Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 4 visual bugs in v08-playful-dark-accent (invisible hook CTA, broken programs, broken conversion layout, color incoherence) while implementing the new Navy × Mint Finale visual identity.

**Architecture:** All changes scope to v08's slot variant files and shared atoms — no changes to the blossom theme tokens or shared organisms. Per-screen background overrides use CSS custom property scope wrappers (`style={{ '--lp-bg-payoff': '...' }}`). The Done screen is rebuilt to embed video social proof inline (no separate socialProof slot), following the v04 ContactInfoWithVideoDone pattern. VideoStage is extracted into a shared file so both v04 and v08 use it.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, CSS custom properties (CSS scope pattern for per-screen bg overrides)

---

## File Map

| Status | File | Change |
|--------|------|--------|
| Modify | `src/components/atoms/CtaButton.tsx` | Add `blob` variant to type + VARIANT map |
| Modify | `src/landing/themes.css` | Append shimmer keyframe + `.cta-shimmer` class |
| Modify | `src/landing/variants/hook/playful/dark-accent.tsx` | bg navy, CTA → `variant="blob"` |
| Replace | `src/landing/variants/programs/playful/dark-accent.tsx` | Thin wrapper delegating to GridWithFaqPrograms |
| Replace | `src/landing/variants/conversion/playful/dark-accent.tsx` | Thin wrapper delegating to ConversionOrganism |
| Create | `src/landing/variants/done/VideoStage.tsx` | VideoStage extracted from contact-info-with-video |
| Modify | `src/landing/variants/done/contact-info-with-video.tsx` | Import VideoStage instead of defining it |
| Replace | `src/landing/variants/done/playful/dark-accent.tsx` | Rebuild: mint bg, 2-col video + contact, purple checkmark |
| DONE | `src/landing/recipes/v08-playful-dark-accent.ts` | Update label (already done) |
| DONE | `src/landing/variants/payoff/FeatureCarousel.tsx` | Carousel layout — already implemented + verified in browser |
| DONE | `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx` | FeatureComponent optional prop — already added |
| DONE | `src/landing/variants/payoff/playful/dark-accent.tsx` | Wired FeatureCarousel — already done |

---

## Task 1: Add `blob` variant to CtaButton

**Files:**
- Modify: `src/components/atoms/CtaButton.tsx`

- [ ] **Step 1: Open the file and locate the type and VARIANT map**

The file is at `src/components/atoms/CtaButton.tsx`. It currently has:
```typescript
type CtaButtonVariant = 'primary' | 'secondary' | 'accent' | 'inverse' | 'golden';
```
And in the VARIANT map:
```typescript
golden: 'bg-[#ffcb13] text-[#1a1230] hover:bg-[#2196F3] hover:text-white',
```

- [ ] **Step 2: Add `blob` to the union type**

Change line 3:
```typescript
// Before:
type CtaButtonVariant = 'primary' | 'secondary' | 'accent' | 'inverse' | 'golden';

// After:
type CtaButtonVariant = 'primary' | 'secondary' | 'accent' | 'inverse' | 'golden' | 'blob';
```

- [ ] **Step 3: Add `blob` entry to the VARIANT map**

After the `golden` entry (line 29), add:
```typescript
const VARIANT: Record<CtaButtonVariant, string> = {
  primary:   'bg-cta text-white hover:opacity-90',
  secondary: 'bg-white text-cta border-2 border-[var(--lp-border)] hover:bg-[var(--lp-bg-hero)]',
  accent:    'bg-[var(--lp-accent)] text-white hover:opacity-90',
  inverse:   'bg-white text-cta hover:opacity-90',
  golden:    'bg-[#ffcb13] text-[#1a1230] hover:bg-[#2196F3] hover:text-white',
  blob:      'relative overflow-hidden bg-[var(--lp-blob-3)] text-[var(--lp-primary)] cta-shimmer hover:shadow-[0_4px_16px_rgba(143,227,188,0.38)]',
};
```

Key decisions:
- `relative overflow-hidden` — required for the shimmer `::after` pseudo-element to clip correctly
- `cta-shimmer` — CSS class defined in Task 2 that adds the shimmer `::after` and keyframe
- `hover:opacity-90` is intentionally omitted — the shimmer provides richer hover feedback
- The existing `hover:-translate-y-0.5` in the base classes still applies

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors (the VARIANT record is now a complete `Record<CtaButtonVariant, string>`)

- [ ] **Step 5: Commit**

```bash
git add src/components/atoms/CtaButton.tsx
git commit -m "feat(cta): add blob variant — mint bg, navy text, shimmer-ready"
```

---

## Task 2: Add shimmer hover animation to themes.css

**Files:**
- Modify: `src/landing/themes.css`

- [ ] **Step 1: Append the shimmer CSS at the end of the file**

Open `src/landing/themes.css` and append after all existing content:

```css
/* ─── blob CTA shimmer hover ─── */
@keyframes cta-shimmer-sweep {
  from { transform: translateX(-120%) skewX(-15deg); }
  to   { transform: translateX(220%)  skewX(-15deg); }
}

.cta-shimmer::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
  transform: translateX(-120%) skewX(-15deg);
  pointer-events: none;
}

.cta-shimmer:hover::after {
  animation: cta-shimmer-sweep 0.5s ease forwards;
}

@media (prefers-reduced-motion: reduce) {
  .cta-shimmer::after { display: none; }
}
```

How this works: The `::after` pseudo-element sits at its initial off-screen position (`translateX(-120%)`) until hover fires `cta-shimmer-sweep`, which slides it across and exits right. `overflow-hidden` on the button (set in Task 1's VARIANT entry) clips it. `forwards` means it stays at the final position after the animation completes (off-screen right), so no flash-back.

- [ ] **Step 2: Commit**

```bash
git add src/landing/themes.css
git commit -m "feat(themes): add cta-shimmer keyframe + reduced-motion guard"
```

---

## Task 3: Fix Hook screen — navy background + blob CTA

**Files:**
- Modify: `src/landing/variants/hook/playful/dark-accent.tsx`

Current problems:
1. Root div: `bg-[var(--lp-accent)]` (saturated purple #7C3AED) — makes face illustration blend in
2. CtaButton: `className="bg-white text-[var(--lp-accent)]"` — Tailwind CSS generation order causes `text-white` from `variant="primary"` to win, producing invisible white text on white pill

- [ ] **Step 1: Change the root div background**

Line 7, change:
```tsx
// Before:
<div className="h-[100dvh] w-full bg-[var(--lp-accent)] relative flex items-center overflow-hidden">

// After:
<div className="h-[100dvh] w-full bg-[var(--lp-primary)] relative flex items-center overflow-hidden">
```

`--lp-primary` resolves to #2D2640 (deep navy) in the blossom theme.

- [ ] **Step 2: Replace the CtaButton's className override with the blob variant**

Line 29, change:
```tsx
// Before:
<CtaButton onClick={onStart} size="lg" className="bg-white text-[var(--lp-accent)]">

// After:
<CtaButton onClick={onStart} size="lg" variant="blob">
```

The `blob` variant from Task 1 renders `bg-[var(--lp-blob-3)] text-[var(--lp-primary)]` — mint pill with navy text — which is controlled by the VARIANT record (no CSS generation order issue).

All other elements stay unchanged: h1 `text-white`, accent span `text-[var(--lp-blob-3)]`, body `text-white/90`, micro-copy `text-white/75`, bottom-right blob decoration.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/hook/playful/dark-accent.tsx
git commit -m "fix(v08/hook): navy bg + blob CTA — fix invisible button, boost illustration contrast"
```

---

## Task 4: Fix Programs screen — delegate to GridWithFaqPrograms

**Files:**
- Replace: `src/landing/variants/programs/playful/dark-accent.tsx`

Current problem: the file has a custom card list that bypasses `GridWithFaqPrograms`, losing `ProgramDetailDrawer`, `FaqSection`, `ComboHighlight`, and the "Đặt lịch" booking CTA.

`GridWithFaqPrograms` already handles everything correctly and is used by v04. The fix is a thin wrapper that delegates entirely, scoping `--lp-bg-payoff` to lavender so Programs feels distinct from Payoff (both internally read from `--lp-bg-payoff`).

- [ ] **Step 1: Replace the entire file**

Overwrite `src/landing/variants/programs/playful/dark-accent.tsx` with:

```tsx
'use client';
import type { ProgramsSlotProps } from '../../slots';
import { GridWithFaqPrograms } from '../GridWithFaqPrograms';

export function PlayfulDarkAccentPrograms(props: ProgramsSlotProps) {
  return (
    <div style={{ '--lp-bg-payoff': 'var(--lp-bg-programs)' } as React.CSSProperties}>
      <GridWithFaqPrograms {...props} />
    </div>
  );
}
```

Why CSS scope: `GridWithFaqPrograms` reads `SectionShell bgVar="--lp-bg-payoff"` internally. Setting `--lp-bg-payoff: var(--lp-bg-programs)` on the wrapper div overrides that token only within this subtree. `--lp-bg-programs` is #C7CEEA (lavender) in the blossom theme.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors — `ProgramsSlotProps` is the correct type for `GridWithFaqPrograms`'s props.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/programs/playful/dark-accent.tsx
git commit -m "fix(v08/programs): delegate to GridWithFaqPrograms — restore drawer, FAQ, combo support"
```

---

## Task 5: Fix Conversion screen — remove narrow-card wrapper

**Files:**
- Replace: `src/landing/variants/conversion/playful/dark-accent.tsx`

Current problem: the slot wraps `ConversionOrganism` in a `max-w-md` card, but `ConversionOrganism` already manages its own `SectionShell` with a 2-column grid. The narrow wrapper collapses all grid columns to single characters per line.

The fix removes the wrapper entirely and only applies a CSS scope for the blush background.

- [ ] **Step 1: Replace the entire file**

Overwrite `src/landing/variants/conversion/playful/dark-accent.tsx` with:

```tsx
'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';

export function PlayfulDarkAccentConversion(props: ConversionSlotProps) {
  return (
    <div style={{ '--lp-bg-payoff': 'var(--lp-bg-hero)' } as React.CSSProperties}>
      <ConversionOrganism {...props} />
    </div>
  );
}
```

`--lp-bg-hero` is #FFEFF4 (blush) in the blossom theme — the Conversion screen's "commitment moment" background.

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors — `ConversionSlotProps` is the correct type for `ConversionOrganism`'s props.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/conversion/playful/dark-accent.tsx
git commit -m "fix(v08/conversion): remove narrow-card wrapper — restore 2-col layout + blush bg"
```

---

## Task 6: Extract VideoStage into shared file

**Files:**
- Create: `src/landing/variants/done/VideoStage.tsx`
- Modify: `src/landing/variants/done/contact-info-with-video.tsx`

The `VideoStage` component is currently defined locally in `contact-info-with-video.tsx`. Both v04 and v08's Done screens need it, so extract it to a shared file to avoid duplication.

- [ ] **Step 1: Create `src/landing/variants/done/VideoStage.tsx`**

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';

export function VideoStage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [userStarted, setUserStarted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function handlePlay() { videoRef.current?.play(); setUserStarted(true); }

  if (reducedMotion && !userStarted) {
    return (
      <div className="relative w-full rounded-soft overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img
          src="/videos/o2skin-quy-trinh-poster.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer"
        >
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="22" fill="white" fillOpacity="0.92" />
            <path d="M20 16v20l18-10z" fill="var(--lp-primary, #2D2640)" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-soft overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/o2skin-quy-trinh-poster.jpg"
        src="/videos/o2skin-quy-trinh.mp4"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
```

This is the exact same component as the one currently in `contact-info-with-video.tsx` — no behavior changes, only extraction.

- [ ] **Step 2: Update `contact-info-with-video.tsx` to import instead of define**

Remove lines 7–44 (the local `VideoStage` function definition) from `src/landing/variants/done/contact-info-with-video.tsx`.

Add the import on line 2 (after the existing `'use client'` directive):
```tsx
import { VideoStage } from './VideoStage';
```

The existing `import { useEffect, useRef, useState } from 'react';` line can be removed since `VideoStage` (which used those hooks) is now imported, not defined here.

Updated top of file after the change:
```tsx
'use client';
import type { DoneSlotProps } from '../../slots';
import { branches } from '../../../content/branches';
import { SectionShell } from '../../../components/atoms/SectionShell';
import { VideoStage } from './VideoStage';
```

The rest of the file (the `ContactInfoWithVideoDone` export) is unchanged — it still renders `<VideoStage />` in the same place.

- [ ] **Step 3: Verify TypeScript compiles and no behavior change**

```bash
npx tsc --noEmit
```
Expected: no errors. The extraction is pure refactor — same component, same props (none), same render output.

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/done/VideoStage.tsx src/landing/variants/done/contact-info-with-video.tsx
git commit -m "refactor(done): extract VideoStage into shared file for v04 + v08 reuse"
```

---

## Task 7: Rebuild PlayfulDarkAccentDone — mint bg, 2-col, embedded social proof

**Files:**
- Replace: `src/landing/variants/done/playful/dark-accent.tsx`

This is a full replacement of the current bare Done screen (just a checkmark + branch cards on purple). The new screen:
- Bright mint background (`--lp-blob-3` #8FE3BC) via CSS scope wrapper on `--lp-bg-payoff`
- Purple filled-circle checkmark (not ghost-white on purple)
- 2-column layout at `md+`: video (left) + contact info card (right)
- No separate `socialProof` slot needed — social proof is embedded inline

The contact info uses the `branches` content array (same source as v04) to render branch addresses.

- [ ] **Step 1: Read the current file to understand what's being replaced**

The current file (before this task) renders a simple dark-purple screen with a ghost-circle checkmark, h1 in white, and branch cards with purple borders. Everything in the file is being replaced.

- [ ] **Step 2: Replace the entire file**

Overwrite `src/landing/variants/done/playful/dark-accent.tsx` with:

```tsx
'use client';
import type { DoneSlotProps } from '../../slots';
import { branches } from '../../../../content/branches';
import { SectionShell } from '../../../../components/atoms/SectionShell';
import { VideoStage } from '../VideoStage';

export function PlayfulDarkAccentDone({ selectedProgramId: _ }: DoneSlotProps) {
  return (
    <div style={{ '--lp-bg-payoff': 'var(--lp-blob-3)' } as React.CSSProperties}>
      <SectionShell bgVar="--lp-bg-payoff" overflow="auto">
        <div className="max-w-5xl mx-auto px-5 py-8 md:py-12 animate-fade-in-up">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="21" fill="var(--lp-accent)" />
                <path
                  d="M14 25l7 7 13-14"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h1 className="font-extrabold text-2xl md:text-3xl text-cta mb-2">
              Đã nhận yêu cầu!
            </h1>
            <p className="text-sm md:text-base text-cta/80 max-w-sm mx-auto">
              Đội ngũ o2skin sẽ liên hệ trong vòng{' '}
              <b className="text-cta">30 phút</b>.
            </p>
          </div>

          {/* 2-column: video left, contact info right */}
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-start gap-6">

            {/* Left: video social proof */}
            <div className="md:order-1 flex flex-col gap-3">
              <h2 className="text-xl font-bold text-cta text-center md:text-left">
                Trị mụn chuẩn y khoa cùng bác sĩ da liễu
              </h2>
              <VideoStage />
              <p className="text-sm text-cta/60 text-center md:text-left leading-relaxed">
                Quy trình khám và trị liệu tại o2skin được thực hiện bởi bác sĩ có chuyên môn sâu.
              </p>
            </div>

            {/* Right: contact info */}
            <div className="md:order-2 bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-6 shadow-sm shadow-cta/10">
              <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-4">
                Thông tin liên hệ
              </p>

              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[var(--lp-border)]">
                <div className="w-10 h-10 rounded-full bg-cta/10 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 text-cta" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.6 12.27a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.51 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.22a16 16 0 0 0 6.29 6.29l1.18-.37a2 2 0 0 1 2.11.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.06z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-cta/50 font-medium">Hotline miễn phí!</p>
                  <p className="font-extrabold text-xl text-cta leading-tight">1800 9292</p>
                </div>
              </div>

              <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-3">
                Địa chỉ phòng khám
              </p>
              <div className="flex flex-col gap-4">
                {branches.map(b => (
                  <div key={b.code} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-cta/40 mt-2 shrink-0" />
                    <div>
                      <p className="text-sm font-bold text-cta">{b.name}</p>
                      {b.mapsUrl ? (
                        <a
                          href={b.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-cta/55 mt-0.5 leading-relaxed inline-flex items-center gap-1 hover:text-[var(--lp-accent)] transition-colors hover:underline underline-offset-2"
                        >
                          {b.address}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round" aria-hidden="true">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </a>
                      ) : (
                        <p className="text-xs text-cta/55 mt-0.5 leading-relaxed">{b.address}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          <div className="h-8" />
        </div>
      </SectionShell>
    </div>
  );
}
```

Key decisions:
- `style={{ '--lp-bg-payoff': 'var(--lp-blob-3)' }}` on the outer div — overrides the token only within this subtree so `SectionShell bgVar="--lp-bg-payoff"` resolves to bright mint #8FE3BC
- Purple filled circle (`fill="var(--lp-accent)"`) + white check path — purple on mint creates a strong, on-brand checkmark
- `branches` from `'../../../../content/branches'` — same data source as v04's ContactInfoWithVideoDone; uses `b.code` as key and `b.mapsUrl` for Google Maps links
- Contact card layout is identical to ContactInfoWithVideoDone's right column — same hotline section + branch list pattern
- `DoneSlotProps` uses `selectedProgramId: _` to destructure and ignore the unused prop (same pattern as ContactInfoWithVideoDone)

- [ ] **Step 3: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```
Expected: no errors. Check specifically:
- `DoneSlotProps` is imported from `../../slots`
- `branches` is imported from `../../../../content/branches` (4 levels up from `done/playful/`)
- `SectionShell` is imported from `../../../../components/atoms/SectionShell`
- `VideoStage` is imported from `../VideoStage` (one level up, the shared file created in Task 6)

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/done/playful/dark-accent.tsx
git commit -m "feat(v08/done): rebuild — mint bg, 2-col video+contact, purple checkmark, embedded social proof"
```

---

## Task 8: FeatureCarousel — ALREADY DONE (browser-verified)

**Status: complete.** The Feature screen for v08 was rebuilt as a full carousel in a prior session and browser-verified at `/v/v08-playful-dark-accent`.

**What was implemented (no action needed):**

- `src/landing/variants/payoff/FeatureCarousel.tsx` — new component: dark navy-to-purple gradient bg, 3-image carousel (desktop: 3-col grid with active card highlighted; mobile: 85%-width sliding cards + prev/next arrows + dots), mint `blob` CTA, auto-advances every 4 s.
- `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx` — added optional `FeatureComponent` prop (default `= Feature`), so all 20+ other versions using this component are unaffected.
- `src/landing/variants/payoff/playful/dark-accent.tsx` — passes `FeatureComponent={FeatureCarousel}` to inject the carousel only for v08.

**Rollback:** remove the `FeatureComponent={FeatureCarousel}` prop from `playful/dark-accent.tsx` — the default `Feature` returns instantly.

No further action required for this task. Acceptance criteria 7 is met.

---

## Task 9: Browser verification

**Files:** None (read-only verification)

Verify all 8 acceptance criteria in the browser.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```
Navigate to `http://localhost:3000` (or whatever port Next.js reports). Switch to v08 — the URL or recipe picker should show `v08-playful-dark-accent`.

- [ ] **Step 2: Verify Hook screen (criteria 1, 2)**

- Background: deep navy (not purple) — confirms `bg-[var(--lp-primary)]`
- Face illustration (the face-map SVG) should be clearly visible against the dark navy bg
- CTA pill: mint green (#8FE3BC-ish) background with dark navy text ("Soi da ngay →") — text must be clearly readable
- Hover over the CTA: a light shimmer should sweep across the button left-to-right
- Inspect button text — must NOT be white-on-white

- [ ] **Step 3: Verify Programs screen (criteria 3)**

Click through the minigame to trigger a result. The Programs screen should:
- Show lavender background (#C7CEEA)
- Display only the suggested program(s) for that minigame result (not all programs)
- Have a "Xem chi tiết" button that opens `ProgramDetailDrawer` (slides up from bottom)
- Have a FAQ section below the program card(s)

- [ ] **Step 4: Verify Conversion screen (criteria 4)**

- Background: blush (#FFEFF4)
- 2-column layout at desktop: form on one side, description/CTA on the other — NO single-character line wrapping
- Form card appears white on blush background

- [ ] **Step 5: Verify Done screen (criteria 5)**

- Background: bright mint (#8FE3BC)
- Top center: purple filled circle with white checkmark — NOT a ghost circle
- h1 "Đã nhận yêu cầu!" in dark text (readable on mint)
- 2-column layout at `md+`: left = video player + subtitle, right = white contact card
- Contact card shows hotline "1800 9292" + branch addresses with Maps links
- Video autoplays (or shows poster + play button if `prefers-reduced-motion` is active)

- [ ] **Step 6: Verify Feature screen shimmer (criteria 6, 7)**

- Feature screen: dark gradient background preserved
- CTA button is mint (not golden/yellow)
- Hover over CTA: shimmer sweeps across — no blue (#2196F3) color flash

- [ ] **Step 7: Verify `prefers-reduced-motion` guard**

Open browser DevTools → Rendering tab → check "Emulate CSS media feature prefers-reduced-motion: reduce". Hover over Hook and Feature CTAs — shimmer should NOT appear (the `::after` is `display: none` under reduced motion).

- [ ] **Step 8: Commit verification note**

```bash
git commit --allow-empty -m "chore(v08): visual verification passed — all 8 acceptance criteria confirmed"
```

---

## Task 10: Run accuracy gate

**Files:** None (gate only)

- [ ] **Step 1: Run the one-command accuracy gate**

```bash
node scripts/accuracy_report.mjs
```

Report the actual `N/N` output line. Any failures unrelated to these changes (pre-existing) can be noted separately — the goal is no new failures introduced by this work.

- [ ] **Step 2: If new failures appear, investigate and fix**

Common causes:
- Hardcoded hex values (the `blob` variant uses `rgba(143,227,188,0.38)` inline in Tailwind arbitrary value — this is a Tailwind token expression, not a CSS hardcode, so `lint_hardcodes.py` should not flag it)
- WCAG contrast on mint bg: `text-cta` on `--lp-blob-3` (#8FE3BC) — navy #2D2640 on mint #8FE3BC should pass 4.5:1 (large color contrast ratio). Verify the actual ratio from the gate output.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore(v08): accuracy gate passed — v08 visual redesign complete"
```
