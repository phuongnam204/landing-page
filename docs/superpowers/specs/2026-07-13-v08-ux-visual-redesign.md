# v08 Playful Dark-Accent — Visual Redesign

**Date:** 2026-07-13
**Branch:** fix/landing-ux-review
**Scope:** 11 changes — `CtaButton` + `themes.css` + recipe label + 4 slot variants + `FeatureCarousel` + `ConfettiCardWhyPayoff` prop + `playful/dark-accent.tsx` wiring + extract `VideoStage` + rebuild `PlayfulDarkAccentDone`

---

## Problem Statement

v08-playful-dark-accent has four confirmed visual issues discovered in browser testing:

1. **Hook CTA button invisible** — `className="bg-white text-[var(--lp-accent)]"` appended after `variant="primary"` loses the text color to Tailwind's CSS generation order; `text-white` from the variant wins, producing white text on a white pill.

2. **Programs slot diverges from architecture** — custom implementation shows `suggestedPrograms` as plain cards without `ProgramDetailDrawer`, FAQ section, or combo support, bypassing `GridWithFaqPrograms` which already implements this correctly in v04.

3. **Conversion slot layout broken** — `ConversionOrganism` renders its own `SectionShell` with a 2-column grid internally, but the slot wraps it inside a `max-w-md` narrow card, causing text to collapse to single characters per line.

4. **Color incoherence across the 6-screen flow** — Hook uses full saturated `--lp-accent` purple (#7C3AED), making the face illustration blend into the background. Done also uses full purple, which conflicts with the "warm journey complete" tone and breaks color variety across screens.

---

## Design Decisions

### Color direction: hook bold → pastel transition

Hook uses dark navy (`--lp-primary` #2D2640) instead of the saturated accent purple. This maximises contrast for the face illustration without softening the bold first impression. From Minigame onward, blossom pastel palette takes over. Conversion stays blush — the "commitment" moment needs warmth. Done breaks the blush repetition with bright mint (`--lp-blob-3` #8FE3BC), creating a color resolution: the mint CTA pill the user has clicked throughout the journey becomes the final landing surface.

| Screen     | Background token    | Hex     |
|------------|---------------------|---------|
| Hook       | `--lp-primary`      | #2D2640 |
| Minigame   | `--lp-bg-minigame`  | #EDE9FF |
| Payoff     | `--lp-bg-payoff`    | #A8E6CF |
| Programs   | `--lp-bg-programs`  | #C7CEEA |
| Conversion | `--lp-bg-hero`      | #FFEFF4 |
| Done       | `--lp-blob-3`       | #8FE3BC |

### Hook CTA and Feature CTA: mint pill via new `blob` variant

On dark navy, a white pill with purple text feels disconnected — the purple text references nothing else on screen. Mint (`--lp-blob-3` #8FE3BC) is already used as the accent word color in the h1 ("giấu"), establishing a deliberate accent system: navy base → white body text → mint accents. The CTA echoes this by adopting the same mint.

The mint pill requires a new CtaButton variant (`blob`) because appending the color via `className` is unreliable — Tailwind's CSS generation order can allow the variant's `text-white` to override `className`-appended text colors, which is exactly what caused the original invisible-button bug.

Feature's `variant="golden"` is also replaced with `variant="blob"` — the golden variant has a broken hover state (`hover:bg-[#2196F3]`) and visually clashes with Feature's dark gradient background. Blob is the correct choice: dark screens use mint CTA.

### `blob` variant hover: shimmer sweep

The hover interaction for `blob` is a light shimmer sweep — a white gradient that slides across the button surface on hover, paired with a soft mint glow shadow and the existing base lift (`hover:-translate-y-0.5`). This replaces the default `hover:opacity-90`, which is too subtle on dark backgrounds. The shimmer uses a CSS `::after` pseudo-element triggered on `:hover`, defined in `themes.css`. It is suppressed under `prefers-reduced-motion: reduce`.

### Programs: delegate entirely to GridWithFaqPrograms

`GridWithFaqPrograms` is the canonical implementation for this slot. It already handles:
- Showing only `suggestedPrograms` (1 primary + optional combo, not all programs)
- `ProgramDetailDrawer` with focus trap, Escape key, and slide-up animation
- `ComboHighlight` for conditions that map to 2 programs
- `FaqSection` keyed to the user's matched condition
- Golden CTA: "Đặt lịch với liệu trình này"

The playful-dark-accent variant replaces its entire custom implementation with a CSS custom property scoping wrapper that overrides `--lp-bg-payoff` to `--lp-bg-programs` (lavender), so Programs feels visually distinct from Payoff even though both components internally read from `--lp-bg-payoff`.

### Conversion: delegate to ConversionOrganism, blush background

The broken narrow-card wrapper is removed entirely. `ConversionOrganism` manages its own `SectionShell` and 2-column responsive grid internally. The variant only applies a CSS scope to override `--lp-bg-payoff` to `--lp-bg-hero` (blush), giving Conversion its own background while leaving the organism's layout untouched.

### Done: mint background + embedded social proof (video)

Done screen background changes from blush to bright mint (`--lp-blob-3` #8FE3BC) — the same color used for the blob CTA pill throughout the flow. This creates a **color resolution**: the mint accent the user has been clicking becomes the landing surface at the end of the journey.

`PlayfulDarkAccentDone` is rebuilt from scratch to match the pattern of v04's `ContactInfoWithVideoDone`: a 2-column layout embedding video (social proof) and contact info in one screen, removing the need for a separate `socialProof` slot. V08's recipe already has no `socialProof` slot; this stays correct.

Layout (at `md+`):
- **Left column**: `VideoStage` (autoplay video — quy trình trị mụn tại O2Skin) + subtitle
- **Right column**: white card with hotline (1800 9292) + branch addresses with Maps links

Top header: purple filled-circle checkmark (`fill="var(--lp-accent)"` + white check path) + h1 + confirmation copy.

`VideoStage` is extracted from `contact-info-with-video.tsx` into a shared file `src/landing/variants/done/VideoStage.tsx` so both v04 and v08 use the same component without duplication.

---

## File Changes

### 1. `src/components/atoms/CtaButton.tsx`

Add `'blob'` to the `CtaButtonVariant` union type and add its class string to the `VARIANT` map. The variant includes `relative overflow-hidden` (required for the shimmer pseudo-element) and `cta-shimmer` (CSS class defined in change 2 below). `hover:opacity-90` is omitted — the shimmer provides richer hover feedback.

```typescript
type CtaButtonVariant = 'primary' | 'secondary' | 'accent' | 'inverse' | 'golden' | 'blob';

// In VARIANT map, add:
blob: 'relative overflow-hidden bg-[var(--lp-blob-3)] text-[var(--lp-primary)] cta-shimmer hover:shadow-[0_4px_16px_rgba(143,227,188,0.38)]',
```

No changes to the focus ring — the existing `ring-white ring-offset-2 ring-offset-[var(--lp-accent)]` works correctly on all backgrounds.

### 2. `src/landing/themes.css`

Append at the end of the file:

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

### 3. `src/landing/variants/hook/playful/dark-accent.tsx`

Two targeted line changes:

- Root div: `bg-[var(--lp-accent)]` → `bg-[var(--lp-primary)]`
- CtaButton: remove `className="bg-white text-[var(--lp-accent)]"`, add `variant="blob"`

All other elements (h1 white text, mint accent span, body paragraph, micro-copy, blob decoration) remain unchanged.

### 4. `src/landing/variants/programs/playful/dark-accent.tsx`

Replace the entire file body (currently a custom card list bypassing GridWithFaqPrograms):

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

The CSS custom property override on the wrapper div scopes `--lp-bg-payoff` to lavender only within this subtree, leaving `GridWithFaqPrograms` internals completely unmodified.

### 5. `src/landing/variants/conversion/playful/dark-accent.tsx`

Replace the entire file body (currently a narrow-card wrapper breaking the 2-column layout):

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

### 6. `src/landing/variants/done/VideoStage.tsx` (new shared file)

Extract the `VideoStage` component from `src/landing/variants/done/contact-info-with-video.tsx` into a standalone file. This component wraps an `<video>` element (autoplay, muted, loop, playsInline) and handles the loading/play overlay. Both v04's `ContactInfoWithVideoDone` and v08's `PlayfulDarkAccentDone` import it.

### 6b. `src/landing/variants/done/contact-info-with-video.tsx`

Replace the local `VideoStage` definition with an import from `./VideoStage`. No other changes.

### 6c. `src/landing/variants/done/playful/dark-accent.tsx`

Rebuild the file entirely. The new implementation follows the 2-column pattern of `ContactInfoWithVideoDone`:

```tsx
'use client';
import { VideoStage } from '../VideoStage';
import { SectionShell } from '../../shells/SectionShell';
import type { DoneSlotProps } from '../../slots';

export function PlayfulDarkAccentDone({ content }: DoneSlotProps) {
  return (
    <div style={{ '--lp-bg-payoff': 'var(--lp-blob-3)' } as React.CSSProperties}>
      <SectionShell bgVar="--lp-bg-payoff">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mb-4">
            <circle cx="24" cy="24" r="21" fill="var(--lp-accent)" />
            <path d="M14 25l7 7 13-14" stroke="white" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-2xl font-black text-cta mb-2">Đã nhận yêu cầu!</h1>
          <p className="text-cta/80 text-sm">
            Đội ngũ o2skin sẽ liên hệ trong vòng <b className="text-cta">30 phút</b>.
          </p>
        </div>

        {/* 2-column: video left, contact info right */}
        <div className="md:grid md:grid-cols-2 md:gap-10 space-y-6 md:space-y-0">
          {/* Left: video social proof */}
          <div className="md:order-1">
            <VideoStage />
            <p className="mt-2 text-xs text-cta/70 text-center">
              Trị mụn chuẩn y khoa cùng bác sĩ da liễu tại O2Skin
            </p>
          </div>

          {/* Right: contact info */}
          <div className="md:order-2 bg-white rounded-soft p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-wide text-cta/60 mb-3">
              Chi nhánh o2skin
            </p>
            {content.branches.map((branch) => (
              <a key={branch.name} href={branch.mapsUrl} target="_blank" rel="noreferrer"
                 className="block mb-3 last:mb-0">
                <p className="font-bold text-cta text-sm">{branch.name}</p>
                <p className="text-cta/70 text-xs">{branch.address}</p>
              </a>
            ))}
            <div className="mt-4 pt-4 border-t border-[var(--lp-border)]">
              <p className="text-xs text-cta/60 mb-1">Hotline</p>
              <a href="tel:18009292" className="text-lg font-black text-cta">1800 9292</a>
            </div>
          </div>
        </div>
      </SectionShell>
    </div>
  );
}
```

The CSS scope wrapper overrides `--lp-bg-payoff` to `--lp-blob-3` (bright mint) within this subtree, so `SectionShell bgVar="--lp-bg-payoff"` resolves to the bright mint without touching the blossom theme token.

### 7. `src/landing/recipes/v08-playful-dark-accent.ts`

Update `label` to reflect the new visual identity:

```typescript
label: 'v08 — Playful Dark-Accent / Navy × Mint Finale',
```

`theme: 'blossom'` stays unchanged — the blossom theme already provides all necessary tokens (`--lp-primary`, `--lp-accent`, `--lp-blob-3`). Individual variant files handle per-screen bg overrides via CSS scope wrappers.

### 8. Feature screen — carousel layout (v08-only, already implemented)

`Feature.tsx` (shared, used by 20+ versions) is left untouched. Instead, v08 gets its own `FeatureCarousel.tsx` and a wiring mechanism via an optional prop — so other versions are completely unaffected.

**`src/landing/variants/payoff/FeatureCarousel.tsx`** (new file — already exists):
- Dark gradient background identical to `Feature.tsx` (`--lp-primary` → `--lp-accent` diagonal)
- Header: mint uppercase subtitle + white `font-black` title "Những gì O2skin có"
- **Desktop** (`md+`): 3-column grid, auto-cycling highlight (mint border + scale 1.025) on active card
- **Mobile**: single-card sliding carousel, 85%-width cards, prev/next arrows, 350ms `ease-in-out` translate
- Dot indicators (3 dots), active dot mint and scaled up
- Auto-advance every 4s via `setInterval`
- CTA: `variant="blob" size="lg"` "Xem chương trình phù hợp →"

Cards data (defined inline in the file):
| Image | Caption |
|-------|---------|
| `/feature/co-so-vat-chat-hien-dai-3.jpg` | Cơ Sở Vật Chất Hiện Đại, Đạt Chuẩn Y Tế |
| `/feature/IMG_1619.jpg` | Thiết Bị IPL / Laser Nhập Khẩu Chính Hãng |
| `/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg` | Nhà Thuốc Đạt Chuẩn GPP |

Card overlay: dark navy gradient bottom-fade (`rgba(45,38,64,0.92)` → transparent) + `opacity: 0.18` accent tint for brand cohesion.

**`src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx`** (already updated):
Add optional prop `FeatureComponent?: React.ComponentType<{ onContinue: () => void }>` defaulting to `Feature`. Section 4 renders `<FeatureComp onContinue={onContinue} />` instead of the hardcoded `<Feature>`. All 20+ existing callers pass no prop → unchanged.

**`src/landing/variants/payoff/playful/dark-accent.tsx`** (already updated):
Imports `FeatureCarousel` and passes `FeatureComponent={FeatureCarousel}` to `ConfettiCardWhyPayoff`.

---

## Out of Scope

- `golden` variant hover bug (`hover:bg-[#2196F3] hover:text-white`) — `Feature.tsx` is unchanged, so the golden CTA in other versions retains this bug. Not fixed here.
- `Feature.tsx` itself is untouched — the shared component remains as-is for all non-v08 versions.
- WCAG contrast re-verification — to be run post-implementation via `node scripts/accuracy_report.mjs`. The navy/white combination on Hook is high-contrast by definition; the mint/dark-navy CTA pair will be measured then.
- Other v08 slots (minigame, payoff) — already correct, no changes needed.

---

## Acceptance Criteria

1. Hook screen: navy bg (#2D2640), face illustration clearly visible, mint pill CTA with dark text readable, h1 + body text white.
2. Hook CTA button text is not invisible in any state (default / hover / focus).
3. Programs screen: lavender bg (#C7CEEA), only `suggestedPrograms` shown (not all programs), `ProgramDetailDrawer` slides up on "Xem chi tiết", FAQ section present below program card(s).
4. Conversion screen: blush bg (#FFEFF4), 2-column layout intact at `md` and above, no text wrapping to single characters, form card white on blush.
5. Done screen: bright mint bg (#8FE3BC), purple circle + white checkmark visible, 2-column layout (video left / contact info right) at `md+`, hotline 1800 9292 + branch addresses readable in dark `text-cta`.
6. Hook CTA and Feature CTA: shimmer sweep visible on hover; no animation under `prefers-reduced-motion: reduce`.
7. Feature screen (v08): dark gradient background preserved, 3-col image carousel at desktop, 1-card slide at mobile, mint CTA blob, no blue hover flash.
8. `node scripts/accuracy_report.mjs` passes (or reports only pre-existing failures unrelated to these changes).
