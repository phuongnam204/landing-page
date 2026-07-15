# Programs Hero Split Desktop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** On desktop (`>= lg`), replace the 2-col whitespace-heavy layout with a full-viewport split-background hero (blue left | glassmorphism card center | pink right) followed by a full-width FAQ section.

**Architecture:** Single file change in `GridWithFaqPrograms.tsx`. A new `HeroSplitDesktop` component renders only on `>= lg` via a `hidden lg:block` wrapper; the existing mobile layout is wrapped in `lg:hidden` and left untouched. Entrance animations use a `mounted` boolean state toggled in `useEffect` with inline style transitions — no animation library.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Next.js 16 App Router. `'use client'` directive already present.

---

## Files

| Action | Path |
|--------|------|
| Modify | `src/landing/variants/programs/GridWithFaqPrograms.tsx` |

---

### Task 1: Add `HeroSplitDesktop` static component (no animations)

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx`

- [ ] **Step 1: Add `HeroSplitDesktop` component before the `GridWithFaqPrograms` export**

Insert the following component after the `FaqSection` function and before `GridWithFaqPrograms`:

```tsx
function HeroSplitDesktop({ program, tint, suggestedProgramId, onContinue, onOpenDrawer, faqItems }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  suggestedProgramId: ProgramId;
  onContinue: (id: ProgramId) => void;
  onOpenDrawer: () => void;
  faqItems: FaqItem[];
}) {
  return (
    <div className="flex flex-col">
      {/* Hero split — full viewport height */}
      <div className="relative h-[100dvh]">
        {/* Two coloured background halves */}
        <div className="absolute inset-0 flex">
          {/* Left: doctor side */}
          <div className="flex-1 relative overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #c3ddf5, #e6f3fb)' }}>
            <img
              src="/mascots/nurse-cheer.png"
              alt=""
              aria-hidden="true"
              className="absolute bottom-0 right-0 h-[90%] w-auto object-contain object-bottom select-none"
            />
          </div>
          {/* Right: patient side */}
          <div className="flex-1 relative overflow-hidden"
            style={{ background: 'linear-gradient(200deg, #fce8f4, #fff1f8)' }}>
            <img
              src="/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover object-top select-none"
            />
          </div>
        </div>

        {/* Glassmorphism card — centred over both halves */}
        <div className="absolute inset-0 z-10 flex items-center justify-center px-6 pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
            style={{
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              background: 'rgba(255, 255, 255, 0.88)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.14), inset 0 0 0 1px rgba(255,255,255,0.5)',
            }}
          >
            {/* Card header */}
            <div className="px-6 pt-6 pb-4 border-b border-black/[0.06]">
              <p className="text-xs font-bold uppercase tracking-widest text-cta/50 mb-3">
                Gợi ý liệu trình cho bạn
              </p>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-cta"
                  style={{ background: `${tint}70` }}>
                  Phù hợp nhất
                </span>
                {program.sessions && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full text-cta/70"
                    style={{ background: `${tint}40` }}>
                    {program.sessions} buổi
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-extrabold text-cta">{program.name}</h2>
            </div>

            {/* Card body */}
            <div className="px-6 py-5 flex flex-col gap-4">
              {program.summary && program.summary.length > 0 ? (
                <ul className="flex flex-col gap-2.5">
                  {program.summary.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-cta/75">
                      <svg className="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" fill={tint} opacity="0.2" />
                        <path d="M5 8l2.5 2.5L11 5.5" stroke={tint} strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round"
                          style={{ filter: 'brightness(0.7)' }} />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {program.treatsConditionIds.map(cid => (
                  <ConditionTagSmall key={cid} conditionId={cid} />
                ))}
              </div>

              <CtaButton variant="golden" size="md" fullWidth
                onClick={() => onContinue(suggestedProgramId)}>
                Đặt lịch với liệu trình này
              </CtaButton>

              <button
                onClick={onOpenDrawer}
                className="text-sm font-semibold text-cta/50 hover:text-cta transition-colors text-center py-1"
              >
                Xem chi tiết liệu trình
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ — full width, below hero */}
      <div className="bg-[var(--lp-bg-payoff)] px-5 py-8">
        <div className="max-w-3xl mx-auto">
          <FaqSection items={faqItems} />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `GridWithFaqPrograms` root to conditionally render desktop vs mobile**

Replace the existing `return (...)` block in `GridWithFaqPrograms`:

```tsx
export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const program = getPrograms().find(p => p.id === suggestedProgramId);
  const primaryConditionId = (program?.treatsConditionIds[0] ?? 'da-nhon-mun-viem') as ConditionId;
  const cond = program?.treatsConditionIds
    .map(id => getConditionById(id as ConditionId))
    .find(c => c !== undefined) ?? null;
  const tint = cond?.color ?? '#A0AEC0';
  const faqItems = FAQ_BY_CONDITION[primaryConditionId] ?? FAQ_BY_CONDITION['da-nhon-mun-viem'] ?? [];

  if (!program) return null;

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    trackEvent('program_detail_open', { programId: suggestedProgramId });
  };

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      {/* Desktop: hero split layout */}
      <div className="hidden lg:block">
        <HeroSplitDesktop
          program={program}
          tint={tint}
          suggestedProgramId={suggestedProgramId}
          onContinue={onContinue}
          onOpenDrawer={handleOpenDrawer}
          faqItems={faqItems}
        />
      </div>

      {/* Mobile: existing stacked layout */}
      <div className="lg:hidden max-w-5xl mx-auto px-5 py-8">
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8 md:items-start">
          <ProgramHighlight
            program={program}
            tint={tint}
            onContinue={onContinue}
            suggestedProgramId={suggestedProgramId}
            onOpenDrawer={handleOpenDrawer}
          />
          <FaqSection items={faqItems} />
        </div>
        <div className="h-4" />
      </div>

      <ProgramDetailDrawer
        program={program}
        tint={tint}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBook={() => onContinue(suggestedProgramId)}
      />
    </div>
  );
}
```

Note: `handleOpenDrawer` is extracted to avoid duplicating the `trackEvent` call between desktop and mobile paths.

- [ ] **Step 3: Check TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors. If there are errors, read them and fix — common issues are missing import for `React.CSSProperties` (not needed since we use object literals directly) or prop type mismatches.

- [ ] **Step 4: Start dev server and check desktop layout**

```bash
npm run dev
```

Open `http://localhost:3000` (or the running port), navigate to the programs screen (complete the minigame to reach it), then resize browser to `>= 1024px wide`. Expected: blue half on left with nurse image, pink half on right with patient photo, white glassmorphism card in center.

- [ ] **Step 5: Check mobile layout has no regression**

Resize browser to `< 1024px`. Expected: original stacked layout (program card above, FAQ below) — no visual change from before.

- [ ] **Step 6: Commit**

```bash
git add src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "feat(programs): add HeroSplitDesktop component with split-background layout for lg+ screens"
```

---

### Task 2: Add entrance animations with `prefers-reduced-motion` support

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx`

- [ ] **Step 1: Add `mounted` state and `useEffect` to `HeroSplitDesktop`**

Replace the opening lines of `HeroSplitDesktop` (before the `return`):

```tsx
function HeroSplitDesktop({ program, tint, suggestedProgramId, onContinue, onOpenDrawer, faqItems }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  suggestedProgramId: ProgramId;
  onContinue: (id: ProgramId) => void;
  onOpenDrawer: () => void;
  faqItems: FaqItem[];
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setMounted(true);
      return;
    }
    // Small delay so initial styles are painted before transition begins
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);
```

- [ ] **Step 2: Add animation style helpers inside `HeroSplitDesktop`**

Add these two helpers between the `useEffect` and the `return`:

```tsx
  const imgStyle = (dx: number, delay: number): React.CSSProperties => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateX(0px)' : `translateX(${dx}px)`,
    transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
  });

  const cardStyle: React.CSSProperties = {
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'scale(1)' : 'scale(0.95)',
    transition: 'opacity 450ms ease-out, transform 450ms ease-out',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    background: 'rgba(255, 255, 255, 0.88)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.14), inset 0 0 0 1px rgba(255,255,255,0.5)',
  };
```

- [ ] **Step 3: Apply animation styles to the three animated elements**

3a. Left image — add `style={imgStyle(-50, 80)}` to the nurse `<img>`:

```tsx
<img
  src="/mascots/nurse-cheer.png"
  alt=""
  aria-hidden="true"
  className="absolute bottom-0 right-0 h-[90%] w-auto object-contain object-bottom select-none"
  style={imgStyle(-50, 80)}
/>
```

3b. Right image — add `style={imgStyle(50, 160)}` to the patient `<img>`:

```tsx
<img
  src="/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg"
  alt=""
  aria-hidden="true"
  className="absolute inset-0 h-full w-full object-cover object-top select-none"
  style={imgStyle(50, 160)}
/>
```

3c. Card — remove the separate `style` props on the card `div` and replace with `style={cardStyle}`:

```tsx
<div
  className="pointer-events-auto w-full max-w-md rounded-2xl overflow-hidden"
  style={cardStyle}
>
```

- [ ] **Step 4: Add `React.CSSProperties` import if not already present**

Check line 1 of the file. If `React` is not imported, add to the top of the import block:

```tsx
import type React from 'react';
```

If `react` is already imported via `{ useState, useEffect }`, you can use the type inline — `React.CSSProperties` works only if `React` namespace is imported. Alternatively, type the helpers as:

```tsx
const imgStyle = (dx: number, delay: number) => ({
  opacity: mounted ? 1 : 0,
  transform: mounted ? 'translateX(0px)' : `translateX(${dx}px)`,
  transition: `opacity 600ms ease-out ${delay}ms, transform 600ms ease-out ${delay}ms`,
} as const satisfies React.CSSProperties);
```

Or simply omit the explicit type annotation — TypeScript will infer it correctly from context without annotation.

- [ ] **Step 5: Verify animations in browser**

Navigate to the programs screen on desktop. Expected:
- On mount: images slide in from outside (left image from left, right image from right), card fades in and scales up
- Animation is smooth, ~600ms duration
- Refresh a few times to confirm the initial state (hidden) is visible before mount

- [ ] **Step 6: Verify reduced-motion behaviour**

In browser DevTools: open Rendering panel → "Emulate CSS media feature `prefers-reduced-motion`" → set to `reduce`. Reload page. Expected: all three elements appear immediately with no transition animation.

- [ ] **Step 7: Commit**

```bash
git add src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "feat(programs): add entrance animations to HeroSplitDesktop with prefers-reduced-motion support"
```

---

### Task 3: Final visual polish + acceptance check

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx` (minor fixes only if found)

- [ ] **Step 1: Check card readability on both image backgrounds**

On the dev server, verify that the white glassmorphism card text is readable. If the nurse image bleeds too much into the card (image visible through the blur), increase card opacity: change `rgba(255, 255, 255, 0.88)` → `rgba(255, 255, 255, 0.93)`. If the card looks too opaque/flat, reduce to `0.82`.

- [ ] **Step 2: Check FAQ visibility below the hero**

Scroll down past the hero on the programs desktop screen. Expected: FAQ accordion appears on a `var(--lp-bg-payoff)` background, full width, centred at `max-w-3xl`. If text is illegible or background bleeds incorrectly, check that the parent `div` wrapping `FaqSection` has `bg-[var(--lp-bg-payoff)]` set.

- [ ] **Step 3: Check drawer still works on desktop**

Click "Xem chi tiết liệu trình" inside the glassmorphism card on desktop (>= lg). Expected: bottom drawer slides up from the bottom of the screen, showing program description and benefit. Close button and backdrop dismiss work. CTA inside drawer triggers `onBook`.

- [ ] **Step 4: Check TypeScript is clean**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit final polish (only if step 1–3 needed fixes)**

```bash
git add src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "fix(programs): polish HeroSplitDesktop card opacity and FAQ background"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Covered in task |
|------------------|-----------------|
| Desktop `>= lg`: split hero, full viewport | Task 1 Step 1 |
| Left panel: blue gradient + nurse-cheer.png | Task 1 Step 1 |
| Right panel: pink gradient + patient photo | Task 1 Step 1 |
| Card: glassmorphism, badge/sessions/name/bullets/tags/CTA/"Xem chi tiết" | Task 1 Step 1 |
| FAQ: full width below hero, max-w-3xl | Task 1 Step 1 |
| Mobile: unchanged | Task 1 Step 2 |
| Entrance animations: images slide-in, card scale+fade | Task 2 |
| `prefers-reduced-motion`: instant appear | Task 2 Step 6 |
| Drawer still works from desktop card | Task 3 Step 3 |
| Single file change only | All tasks |

**Placeholder scan:** No TBD, no "similar to above", all code blocks are complete.

**Type consistency:** `handleOpenDrawer` defined in `GridWithFaqPrograms` and passed as `onOpenDrawer` to both `HeroSplitDesktop` and `ProgramHighlight`. `imgStyle` and `cardStyle` used only inside `HeroSplitDesktop`. `FaqItem`, `FaqSection`, `ConditionTagSmall`, `CtaButton`, `ProgramDetailDrawer` all defined earlier in the same file — no cross-task inconsistencies.
