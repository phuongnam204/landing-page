# UX Polish — v20, v21, v22, v23

Date: 2026-07-14

## Scope

4 batches of changes across versions v20–v23 and shared CTA component.

---

## 1. CTA Button Hover (global — `primary` + `dark` variants)

**Current:** `hover:opacity-90` — no color change.

**New:** On hover, transition bg → `var(--lp-accent)`, text → white, add `box-shadow` glow using accent color. Duration 0.22s ease. Also keep `hover:-translate-y-0.5`.

**Affected file:** `src/components/atoms/CtaButton.tsx`

```
primary: bg-cta text-white → hover: bg-[var(--lp-accent)] text-white + shadow
dark:    bg-[var(--lp-primary)] text-white → hover: bg-[var(--lp-accent)] text-white + shadow
```

The `blob` variant already has shimmer — leave it unchanged.

---

## 2. v21 — Electric Classic / Magenta (dark hook + light sections)

**Problem:** All section backgrounds are dark purple (#2d1058, #3b0764) — everything sinks.

**Solution:** Hybrid dark hook + light sections.

### 2a. Electric-Classic Hook (`src/landing/variants/hook/electric/classic.tsx`)
- h1 text: `var(--lp-primary)` → `var(--lp-band-text)` (light on dark bg)
- Paragraph: `rgba(240,230,255,.7)` → `color-mix(in srgb, var(--lp-band-text) 65%, transparent)`
- Accent span, badge, button: unchanged (already use CSS vars)

### 2b. Magenta theme (`src/landing/themes.css` — `.theme-magenta`)
```css
--lp-bg-hero:     #1a0533;  /* dark — hook bg unchanged */
--lp-bg-minigame: #F5F0FF;  /* light lavender */
--lp-bg-payoff:   #EDE9FE;
--lp-bg-programs: #F5F0FF;
--lp-bg-card:     #ffffff;
--lp-primary:     #6D28D9;  /* dark violet — text-cta in light sections */
--lp-band-text:   #F0E6FF;  /* light — hook h1 text */
--lp-band-bg:     #1a0533;
--lp-band-accent: #DB2777;
--lp-blob-3:      #C4B5FD;  /* medium lavender for blob CTA */
--lp-blob-1:      #9333ea;  /* unchanged */
--lp-blob-2:      #db2777;  /* unchanged */
```

---

## 3. v22 — Electric Glow Heavy / Crimson (dark hook + light sections)

**Problem:** Near-black sections (#1F0010, #300018) — everything invisible.

**Solution:** Same hybrid as v21 but with crimson/rose palette.

### 3a. Electric-Glow-Heavy Hook (`src/landing/variants/hook/electric/glow-heavy.tsx`)
- h1 text: `var(--lp-primary)` → `var(--lp-band-text)`
- Paragraph: `rgba(240,230,255,.7)` → `color-mix(in srgb, var(--lp-band-text) 65%, transparent)`

### 3b. Crimson theme (`.theme-crimson`)
```css
--lp-bg-hero:     #0F0005;  /* near-black — hook bg unchanged */
--lp-bg-minigame: #FFF0F3;  /* light rose */
--lp-bg-payoff:   #FFD6E0;
--lp-bg-programs: #FFF0F3;
--lp-bg-card:     #ffffff;
--lp-primary:     #881337;  /* dark crimson — text-cta in light sections */
--lp-band-text:   #FFE4E6;  /* light pink — hook h1 text */
--lp-band-bg:     #0F0005;
--lp-band-accent: #E11D48;
--lp-blob-3:      #FDA4AF;  /* light pink for blob CTA */
--lp-blob-1:      #9F1239;
--lp-blob-2:      #BE123C;
```

---

## 4. v23 — Electric Soft Dark / Forest → Periwinkle

**Problem:** Forest green theme clashes with hardcoded pink rgba in soft-dark hook.

**Solution:** Change theme to Periwinkle (light indigo). Fix hook to use CSS vars.

### 4a. Recipe change (`src/landing/recipes/v23-electric-soft-dark.ts`)
- `theme: 'forest'` → `theme: 'periwinkle'`

### 4b. Electric-Soft-Dark Hook (`src/landing/variants/hook/electric/soft-dark.tsx`)
- Badge bg: `rgba(219,39,119,.12)` → `color-mix(in srgb, var(--lp-accent) 12%, transparent)`
- Badge border: `rgba(219,39,119,.2)` → `color-mix(in srgb, var(--lp-accent) 20%, transparent)`
- Paragraph: `rgba(240,230,255,.7)` → `color-mix(in srgb, var(--lp-primary) 65%, transparent)`
- Button shadow hover: `rgba(219,39,119,.5)` → `color-mix(in srgb, var(--lp-accent) 50%, transparent)`
- Button shadow rest: `rgba(219,39,119,.3)` → `color-mix(in srgb, var(--lp-accent) 30%, transparent)`
- h1 text keeps `var(--lp-primary)` — for light themes this is already dark, correct

Periwinkle theme already exists and is well-defined — no changes needed to it.

---

## 5. v20 — Bold Typographic Hook Entrance Animation

**Component:** `src/landing/variants/hook/bold/typographic.tsx`

**Current:** Two stacked containers — "DA BẠN" (band-bg) and "CẦN GÌ?" (bg-hero) — static.

**New:** Slide-in entrance animation on mount:
- "DA BẠN" slides in from **left** (`translateX(-100%) → translateX(0)`)
- "CẦN GÌ?" slides in from **right** (`translateX(100%) → translateX(0)`)
- Duration: 0.65s, `cubic-bezier(0.22, 1, 0.36, 1)` (spring-like ease-out)
- Other elements (subtitle, CTA button): fade-in-up with 0.3s delay after text settles
- Use CSS animation with `@keyframes` or inline `animation` style — no JS needed
- Respect `prefers-reduced-motion`: fall back to simple fade-in

---

## 6. v20 — Payoff Topbar Dynamic Label

**Current:** `BoldTypographicPayoff` renders a static "KET QUA PHAN TICH" topbar above `ConfettiCardWhyPayoff`.

**Problem:** Topbar is outside the scroll container (`ConfettiCardWhyPayoff` is `h-[100dvh] overflow-y-auto`). Cannot track inner scroll for label changes.

**Solution:** Move the topbar INSIDE `ConfettiCardWhyPayoff` as a sticky element. Add an optional `topbarConfig` prop to `ConfettiCardWhyPayoff`.

### Architecture

```tsx
// ConfettiCardWhyPayoff — new prop
topbarConfig?: {
  labels: {
    result: string;   // "Kết quả phân tích"
    why: string;      // "Tìm hiểu nguyên nhân"
    benefit: string;  // "Hãy đến O2skin!"
  };
  style?: React.CSSProperties;
  className?: string;
}
```

### Topbar behavior
- `position: sticky; top: 0; z-index: 50` inside the scroll container
- Font: increase from `text-sm` → `text-base md:text-lg`, keep `font-bold tracking-widest uppercase`
- IntersectionObserver with `root: scrollContainerRef.current`, `threshold: 0.4`:
  - `resultSectRef` visible → label = `labels.result`
  - `whyRef` visible → label = `labels.why`
  - `statsRef` or `featureRef` visible → label = `labels.benefit`
- Label transition animation: crossfade (opacity 0→1, slight translateY -4px→0) over 0.3s ease

### BoldTypographicPayoff changes
- Remove standalone topbar div
- Pass `topbarConfig` to `ConfettiCardWhyPayoff`

---

## Constraints

- All CSS vars used → no hardcoded colors introduced
- 49/49 tests must remain green
- No changes to slot interface contracts (PayoffSlotProps stays unchanged)
- `topbarConfig` is optional — existing callers of `ConfettiCardWhyPayoff` unaffected
