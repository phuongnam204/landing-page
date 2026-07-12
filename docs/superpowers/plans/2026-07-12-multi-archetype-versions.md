# Multi-Archetype Version System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build 20 landing page versions from 5 archetypes × 4 variations each. Same workflow, same content, only visual presentation changes.

**Architecture:** Subdirectory-per-archetype inside each slot's variants folder. Registry IDs: `<archetype>-<variation>`. New `theme-magenta` CSS class. Extended `theme-golden` with dark-band tokens. Content always imported from `src/content/` — never hardcoded in component TSX. Minigame slot wraps `FaceMapMinigame` to reuse face-map logic while styling varies per archetype theme.

**Build order:** Playful → Clinical → Natural → Bold → Electric. Within each archetype: `classic` first, then derive the 3 variations.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 3, CSS custom properties (`var(--lp-*)`)

**Spec:** `docs/superpowers/specs/2026-07-12-multi-archetype-versions-design.md`

---

## File Map

| Path | Action | Purpose |
|---|---|---|
| `src/landing/themes.css` | Modify | Add `.theme-magenta`, extend `.theme-golden` dark-band tokens |
| `src/landing/variants/hook/<archetype>/<variation>.tsx` | Create ×20 | Hook variants |
| `src/landing/variants/minigame/<archetype>/<variation>.tsx` | Create ×20 | Minigame wrappers |
| `src/landing/variants/payoff/<archetype>/<variation>.tsx` | Create ×20 | Payoff variants |
| `src/landing/variants/programs/<archetype>/<variation>.tsx` | Create ×20 | Programs variants |
| `src/landing/variants/conversion/<archetype>/<variation>.tsx` | Create ×20 | Conversion variants |
| `src/landing/variants/done/<archetype>/<variation>.tsx` | Create ×20 | Done variants |
| `src/landing/registry.ts` | Modify | Add 120 new variant imports + registry entries |
| `src/landing/recipes/v05-*.ts` … `v24-*.ts` | Create ×20 | One recipe file per version |
| `src/landing/recipes/index.ts` | Modify | Add v05–v24 to `allRecipes` |

---

## Task 1: Infrastructure — themes

**Files:**
- Modify: `src/landing/themes.css`

- [ ] **Step 1: Add theme-magenta and extend theme-golden**

Open `src/landing/themes.css` and append after the last existing theme block:

```css
/* === theme-magenta (Electric Magenta archetype) === */
.theme-magenta {
  --lp-bg-hero:        #1a0533;
  --lp-bg-minigame:    #2d1058;
  --lp-bg-payoff:      #3b0764;
  --lp-bg-programs:    #2d1058;
  --lp-bg-card:        #1e0a42;
  --lp-primary:        #f0e6ff;
  --lp-accent:         #db2777;
  --lp-border:         #7e22ce;
  --lp-blob-1:         #9333ea;
  --lp-blob-2:         #db2777;
  --lp-blob-3:         #6b21a8;
  --lp-radius-card:    20px;
  --lp-radius-btn:     20px;
  --lp-pastel-pink:    #2d1b69;
  --lp-pastel-lavender:#1a0533;
  --lp-pastel-mint:    #3b0764;
  --lp-border-pink:    #9333ea;
  --lp-border-mint:    #7e22ce;
  --lp-border-lavender:#6b21a8;
  --lp-label-purple:   #db2777;
  /* dark-band vars (inherited by all archetypes, only used by bold) */
  --lp-band-bg:        #1a0533;
  --lp-band-text:      #f0e6ff;
  --lp-band-accent:    #db2777;
}
```

Then find `.theme-golden { ... }` and add these 3 vars at the end of the block (before the closing `}`):

```css
  /* dark amber band — contrast anchor for Bold Golden archetype */
  --lp-band-bg:     #92400e;
  --lp-band-text:   #FCD34D;
  --lp-band-accent: #F59E0B;
```

Also add fallback `--lp-band-*` vars to the remaining 3 themes (blossom, ocean, sage, midnight) so the CSS var is always defined — add before closing `}` of each:

```css
  /* band tokens (not used by this archetype, fallback only) */
  --lp-band-bg:     var(--lp-accent);
  --lp-band-text:   #ffffff;
  --lp-band-accent: var(--lp-accent);
```

- [ ] **Step 2: Verify themes load**

Run dev server and open `http://localhost:3000` in browser — no CSS errors in console. Then run:

```bash
npx vitest run src/landing/__tests__/
```

Expected: all tests PASS (no theme tests — this confirms the rest of the system still works).

- [ ] **Step 3: Commit**

```bash
git add src/landing/themes.css
git commit -m "feat(theme): add theme-magenta + dark-band tokens for bold-golden archetype"
```

---

## Task 2: Playful Blossom — classic variation (6 slots)

**Theme:** `blossom` (existing)
**Recipe ID:** `v05-playful-classic`
**Files:** 6 new components + registry additions + 1 recipe

### Reference slot contracts (from `src/landing/slots.ts`)
```ts
HookSlotProps       = { onStart: () => void }
MinigameSlotProps   = { onComplete: (result: MinigameResult) => void }
PayoffSlotProps     = { result: MinigameResult; onContinue: () => void }
ProgramsSlotProps   = { suggestedPrograms: ScoredProgram[]; onContinue: (programId: ProgramId) => void }
ConversionSlotProps = { selectedProgramId: ProgramId | null; minigameResult: MinigameResult | null; onSubmit: (name: string, phone: string) => void }
DoneSlotProps       = { selectedProgramId: ProgramId | null }
```

- [ ] **Step 1: Create hook — `src/landing/variants/hook/playful/classic.tsx`**

```tsx
'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden relative px-6 bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)]">
      <div className="absolute w-80 h-80 rounded-full bg-[var(--lp-blob-1)] opacity-35 blur-3xl -top-24 -right-24 pointer-events-none" />
      <div className="absolute w-56 h-56 rounded-full bg-[var(--lp-blob-2)] opacity-25 blur-2xl bottom-8 -left-12 pointer-events-none" />
      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-4xl w-full">
        <div className="flex-1 flex justify-center">
          <img src="/face-map-hook.svg" alt="Phân tích vùng da mụn"
            className="h-48 md:h-[420px] w-auto object-contain drop-shadow-xl" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-cta leading-tight mb-4">
            Da bạn đang{' '}
            <span className="text-[var(--lp-accent)]">giấu</span>{' '}
            điều gì?
          </h1>
          <p className="text-base text-cta/70 mb-6 leading-relaxed max-w-sm">
            Tìm những "bạn nhỏ" ẩn náu và khám phá điều da bạn thực sự cần.
          </p>
          <div className="flex justify-center md:justify-start">
            <CtaButton onClick={onStart} size="lg">Soi da ngay →</CtaButton>
          </div>
          <p className="text-sm text-cta/50 mt-3">Chỉ mất 60 giây</p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create minigame — `src/landing/variants/minigame/playful/classic.tsx`**

Minigame logic is complex — wrap `FaceMapMinigame` with an archetype-specific background container. CSS vars handle all color differences automatically.

```tsx
'use client';
import type { MinigameSlotProps } from '../../../slots';
import { FaceMapMinigame } from '../../face-map';

export function PlayfulClassicMinigame(props: MinigameSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-minigame)]">
      <FaceMapMinigame {...props} />
    </div>
  );
}
```

- [ ] **Step 3: Create payoff — `src/landing/variants/payoff/playful/classic.tsx`**

Wrap `ConfettiCardWhyPayoff` with archetype-specific container:

```tsx
'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../../ConfettiCardWhyPayoff';

export function PlayfulClassicPayoff(props: PayoffSlotProps) {
  return (
    <div className="bg-[var(--lp-bg-payoff)]">
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
```

- [ ] **Step 4: Create programs — `src/landing/variants/programs/playful/classic.tsx`**

```tsx
'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulClassicPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-programs)] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-extrabold text-cta text-center mb-2">
          Liệu trình dành cho bạn
        </h2>
        <p className="text-center text-cta/60 text-sm mb-8">Dựa trên kết quả phân tích da</p>
        <div className="flex flex-col gap-4">
          {suggestedPrograms.map((sp) => (
            <div key={sp.program.id}
              className="bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] border border-[var(--lp-border)] p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-bold text-cta text-lg leading-tight">{sp.program.name}</h3>
                {sp.score >= 2 && (
                  <span className="text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: 'var(--lp-pastel-pink)', color: 'var(--lp-accent)' }}>
                    Gợi ý
                  </span>
                )}
              </div>
              <p className="text-sm text-cta/70 mb-4 leading-relaxed">{sp.program.description}</p>
              <CtaButton onClick={() => onContinue(sp.program.id as ProgramId)} size="md">
                Chọn liệu trình này →
              </CtaButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create conversion — `src/landing/variants/conversion/playful/classic.tsx`**

```tsx
'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function PlayfulClassicConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <h2 className="text-3xl font-extrabold text-cta text-center mb-2">Đặt lịch ngay</h2>
        <p className="text-center text-cta/60 text-sm mb-8">
          Tư vấn miễn phí — không ép mua thêm
        </p>
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
```

> Note: `ConversionOrganism` at `src/landing/organisms/ConversionOrganism.tsx` handles the form logic. Check it exists; if not, use `ShortFormConversion` from `src/landing/variants/conversion/short-form.tsx` as the base instead.

- [ ] **Step 6: Create done — `src/landing/variants/done/playful/classic.tsx`**

```tsx
'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function PlayfulClassicDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-payoff)] px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        <div className="text-5xl mb-4" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="mx-auto">
            <circle cx="24" cy="24" r="22" fill="var(--lp-pastel-mint)" stroke="var(--lp-accent)" strokeWidth="2"/>
            <path d="M14 24l8 8 14-14" stroke="var(--lp-accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-cta mb-3">Đã nhận yêu cầu!</h2>
        <p className="text-cta/70 text-base mb-10 leading-relaxed">
          Đội ngũ o2skin sẽ liên hệ trong vòng 30 phút để xác nhận lịch hẹn.
        </p>
        <div className="bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] border border-[var(--lp-border)] p-5 text-left">
          <h3 className="font-bold text-cta text-sm mb-3 uppercase tracking-wide opacity-60">
            Chi nhánh o2skin
          </h3>
          <ul className="flex flex-col gap-3">
            {branches.map((b) => (
              <li key={b.id} className="text-sm text-cta">
                <span className="font-semibold">{b.name}</span>
                {b.address && <span className="text-cta/60 ml-2">{b.address}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

> Check `src/content/branches.ts` to confirm the `Branch` type — at minimum `{ id: string; name: string; address?: string }`. If `address` doesn't exist, remove that line.

- [ ] **Step 7: Add Playful Blossom classic to registry**

Open `src/landing/registry.ts` and add imports at the top (after existing imports):

```ts
// Playful Blossom
import { PlayfulClassicHook }       from './variants/hook/playful/classic';
import { PlayfulClassicMinigame }   from './variants/minigame/playful/classic';
import { PlayfulClassicPayoff }     from './variants/payoff/playful/classic';
import { PlayfulClassicPrograms }   from './variants/programs/playful/classic';
import { PlayfulClassicConversion } from './variants/conversion/playful/classic';
import { PlayfulClassicDone }       from './variants/done/playful/classic';
```

Then add to the registry object:

```ts
hook:       { ...existing, 'playful-classic': PlayfulClassicHook },
minigame:   { ...existing, 'playful-classic': PlayfulClassicMinigame },
payoff:     { ...existing, 'playful-classic': PlayfulClassicPayoff },
programs:   { ...existing, 'playful-classic': PlayfulClassicPrograms },
conversion: { ...existing, 'playful-classic': PlayfulClassicConversion },
done:       { ...existing, 'playful-classic': PlayfulClassicDone },
```

> Note: Replace `...existing` with the actual current entries (the registry uses object literals, not spread). Just add the new key to each existing object.

- [ ] **Step 8: Create recipe — `src/landing/recipes/v05-playful-classic.ts`**

```ts
import type { Recipe } from '../validateRecipe';

export const v05PlayfulClassic: Recipe = {
  id: 'v05-playful-classic',
  label: 'v05 — Playful Blossom / Classic',
  theme: 'blossom',
  slots: {
    hook:       'playful-classic',
    minigame:   'playful-classic',
    payoff:     'playful-classic',
    programs:   'playful-classic',
    conversion: 'playful-classic',
    done:       'playful-classic',
  },
};
```

- [ ] **Step 9: Register recipe in index**

Open `src/landing/recipes/index.ts` and add:

```ts
import { v05PlayfulClassic } from './v05-playful-classic';
// ...
export const allRecipes: Recipe[] = [v01Baseline, v03Facemap, v04Combined, v05PlayfulClassic];
```

- [ ] **Step 10: Run tests**

```bash
npx vitest run
```

Expected: all PASS.

- [ ] **Step 11: Visual verify**

Open `http://localhost:3000/?recipe=v05-playful-classic` and walk the full flow. Confirm:
- Hook: blossom gradient, face-map SVG, CTA visible on mobile
- Minigame: face-map zones with blossom colors
- Payoff: confetti fires, result card shows blossom styling
- Programs: cards with `--lp-border` blossom border
- Conversion: form shows on blossom background
- Done: branch list renders

- [ ] **Step 12: Commit**

```bash
git add src/landing/variants/hook/playful/ src/landing/variants/minigame/playful/ \
        src/landing/variants/payoff/playful/ src/landing/variants/programs/playful/ \
        src/landing/variants/conversion/playful/ src/landing/variants/done/playful/ \
        src/landing/registry.ts src/landing/recipes/v05-playful-classic.ts \
        src/landing/recipes/index.ts
git commit -m "feat(v05): Playful Blossom classic — 6 slots + recipe"
```

---

## Task 3: Playful Blossom — minimal variation

**Recipe ID:** `v06-playful-minimal`
**Delta from classic:** More whitespace, blobs removed, smaller headings, no gradient (solid `--lp-bg-hero`).

- [ ] **Step 1: Create 6 minimal slot files**

For each slot, duplicate the classic file into `playful/minimal.tsx` with these changes:

**hook/playful/minimal.tsx** — key changes vs classic:
```tsx
// Remove absolute blob divs entirely
// Change container: remove gradient, use solid bg
<div className="h-[100dvh] w-full flex flex-col items-center justify-center px-8 bg-[var(--lp-bg-hero)]">
// Reduce heading size
<h1 className="text-3xl md:text-5xl font-extrabold text-cta leading-tight mb-3">
// Remove subtext decorative elements
```

**minigame/playful/minimal.tsx** — same as classic (minigame logic doesn't change for minimal):
```tsx
export function PlayfulMinimalMinigame(props: MinigameSlotProps) {
  return <div className="min-h-[100dvh] bg-[var(--lp-bg-minigame)]"><FaceMapMinigame {...props} /></div>;
}
```

**payoff/playful/minimal.tsx** — same delegate pattern:
```tsx
export function PlayfulMinimalPayoff(props: PayoffSlotProps) {
  return <div className="bg-[var(--lp-bg-payoff)]"><ConfettiCardWhyPayoff {...props} /></div>;
}
```

**programs/playful/minimal.tsx** — key changes: remove score badge, reduce card padding:
```tsx
// Remove the {sp.score >= 2 && <span>Gợi ý</span>} block
// Change card padding: p-4 instead of p-5
// Change bg: bg-white/80 instead of bg-[var(--lp-bg-card)]
```

**conversion/playful/minimal.tsx** — remove section heading and subtext, just form:
```tsx
export function PlayfulMinimalConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center py-12 px-6">
      <div className="max-w-sm mx-auto w-full">
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
```

**done/playful/minimal.tsx** — remove checkmark SVG, simpler layout:
```tsx
export function PlayfulMinimalDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] px-6 py-20">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-extrabold text-cta mb-2">Đã nhận yêu cầu!</h2>
        <p className="text-cta/70 text-sm mb-8">Đội ngũ o2skin sẽ liên hệ trong 30 phút.</p>
        <ul className="flex flex-col gap-2">
          {branches.map((b) => (
            <li key={b.id} className="text-sm text-cta/80">{b.name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add to registry**

Same pattern as Task 2 Step 7 — add `'playful-minimal': PlayfulMinimalHook` etc. to each slot entry.

- [ ] **Step 3: Create recipe — `src/landing/recipes/v06-playful-minimal.ts`**

```ts
import type { Recipe } from '../validateRecipe';
export const v06PlayfulMinimal: Recipe = {
  id: 'v06-playful-minimal',
  label: 'v06 — Playful Blossom / Minimal',
  theme: 'blossom',
  slots: { hook: 'playful-minimal', minigame: 'playful-minimal', payoff: 'playful-minimal',
           programs: 'playful-minimal', conversion: 'playful-minimal', done: 'playful-minimal' },
};
```

- [ ] **Step 4: Add to `recipes/index.ts`, run tests, visual verify, commit**

```bash
npx vitest run
# Open http://localhost:3000/?recipe=v06-playful-minimal — confirm airy/minimal feel
git add src/landing/variants/*/playful/minimal.tsx src/landing/registry.ts \
        src/landing/recipes/v06-playful-minimal.ts src/landing/recipes/index.ts
git commit -m "feat(v06): Playful Blossom minimal variation"
```

---

## Task 4: Playful Blossom — immersive variation

**Recipe ID:** `v07-playful-immersive`
**Delta from classic:** Full-bleed sections, larger imagery, hook image fills more vertical space, programs cards have colored background fills.

- [ ] **Step 1: Create 6 immersive slot files in `playful/immersive.tsx`**

**hook/playful/immersive.tsx** — full-bleed: image fills left half, text overlaid on gradient:
```tsx
export function PlayfulImmersiveHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full relative flex items-end md:items-center overflow-hidden">
      {/* Full-bleed background */}
      <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-[var(--lp-bg-hero)] to-[var(--lp-bg-minigame)]" />
      {/* Large face-map fills the frame */}
      <img src="/face-map-hook.svg" alt=""
        className="absolute right-0 top-0 h-full w-auto object-cover opacity-60 md:opacity-90 pointer-events-none" />
      {/* Text overlay */}
      <div className="relative z-10 px-6 pb-16 md:pb-0 md:pl-12 max-w-lg">
        <h1 className="text-5xl md:text-7xl font-extrabold text-cta leading-tight mb-4 drop-shadow-sm">
          Da bạn đang <span className="text-[var(--lp-accent)]">giấu</span> điều gì?
        </h1>
        <CtaButton onClick={onStart} size="lg">Soi da ngay →</CtaButton>
      </div>
    </div>
  );
}
```

**Other 5 slots:** Same delegate wrappers as classic but add `bg-[var(--lp-bg-*)]` fills and increased padding:
- minigame: same wrapper
- payoff: same wrapper
- programs: add `style={{ background: 'var(--lp-pastel-pink)' }}` to each card
- conversion: add a decorative blob behind the form
- done: add the checkmark SVG with larger size (64px circle)

Create each file following the above patterns, exporting `PlayfulImmersive<Slot>` functions.

- [ ] **Step 2–4: Registry + recipe + tests + verify + commit**

Recipe `v07-playful-immersive.ts` — same structure, `theme: 'blossom'`, all slots `'playful-immersive'`.

```bash
git commit -m "feat(v07): Playful Blossom immersive variation"
```

---

## Task 5: Playful Blossom — dark-accent variation

**Recipe ID:** `v08-playful-dark-accent`
**Delta from classic:** Inverted sections — hero background is `--lp-accent` (purple), text is white. Programs section uses `--lp-bg-minigame` dark tone. Creates high-contrast "night mode" feel while staying in blossom palette.

- [ ] **Step 1: Create 6 dark-accent slot files in `playful/dark-accent.tsx`**

**hook/playful/dark-accent.tsx**:
```tsx
export function PlayfulDarkAccentHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center relative overflow-hidden px-6"
      style={{ background: 'var(--lp-accent)' }}>
      <div className="absolute w-64 h-64 rounded-full opacity-20 blur-3xl -top-20 right-0"
        style={{ background: 'var(--lp-blob-1)' }} />
      <div className="relative z-10 text-center max-w-md">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4">
          Da bạn đang <span className="text-[var(--lp-blob-3)]">giấu</span> điều gì?
        </h1>
        <p className="text-base text-white/70 mb-6">
          Tìm những vùng da cần chăm sóc và nhận gợi ý liệu trình phù hợp.
        </p>
        <div className="flex justify-center">
          <button onClick={onStart}
            className="bg-white text-[var(--lp-accent)] font-bold text-base px-8 py-3.5 rounded-[var(--lp-radius-btn)] hover:opacity-90 transition-opacity">
            Soi da ngay →
          </button>
        </div>
      </div>
    </div>
  );
}
```

Other slots: same structure but with inverted accent background on section headers. Programs cards: white background with `var(--lp-accent)` text for headings. Conversion: `var(--lp-accent)` as page bg, white form card.

- [ ] **Step 2–4: Registry + recipe v08 + tests + verify + commit**

```bash
git commit -m "feat(v08): Playful Blossom dark-accent variation"
```

---

## Task 6: Clinical Ocean — all 4 variations

**Theme:** `ocean` (existing)
**Recipes:** `v09-clinical-classic`, `v10-clinical-compact`, `v11-clinical-dashboard`, `v12-clinical-editorial`
**Key visual rules:** Sharp corners (`--lp-radius-card: 14px`), blue/white, data-forward layout, no decorative blobs.

- [ ] **Step 1: Create classic — `src/landing/variants/hook/clinical/classic.tsx`**

```tsx
'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function ClinicalClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex items-center bg-[var(--lp-bg-hero)] relative overflow-hidden px-6">
      {/* Subtle grid lines */}
      <div className="absolute inset-0 opacity-[0.06]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,var(--lp-accent) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,var(--lp-accent) 40px)' }} />
      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-10 md:gap-16">
        <div className="flex-1">
          {/* Tag line */}
          <div className="inline-flex items-center gap-2 bg-[var(--lp-bg-minigame)] border border-[var(--lp-border)] text-[var(--lp-accent)] text-xs font-bold px-3 py-1.5 rounded mb-4">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
              <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="6" cy="6" r="2" />
            </svg>
            Phân tích da chính xác
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-cta leading-tight mb-4">
            Biết chính xác{' '}
            <span className="text-[var(--lp-accent)]">da bạn cần gì</span>{' '}
            trong 60 giây
          </h1>
          <p className="text-base text-cta/65 mb-8 max-w-md leading-relaxed">
            Sử dụng bản đồ vùng da để xác định loại mụn và nhận liệu trình điều trị phù hợp.
          </p>
          <CtaButton onClick={onStart} size="lg">Bắt đầu phân tích →</CtaButton>
        </div>
        <div className="flex-shrink-0">
          <div className="bg-[var(--lp-bg-minigame)] border border-[var(--lp-border)] rounded-[var(--lp-radius-card)] p-4 shadow-sm">
            <img src="/face-map-hook.svg" alt="Bản đồ vùng da"
              className="h-44 md:h-80 w-auto object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create remaining 5 classic slots in `clinical/classic.tsx` per slot dir**

For each slot, follow the patterns from Task 2 but apply Clinical Ocean visual rules:
- No blobs, no gradients — use solid `var(--lp-bg-*)` fills
- Grid lines as subtle background texture (as in hook above)
- Cards use `border border-[var(--lp-border)]` with `rounded-[var(--lp-radius-card)]` (14px = sharper)
- Programs: show as data rows with small text labels instead of description paragraphs
- Payoff: delegate to `ConfettiCardWhyPayoff` (same as Playful) — ocean theme handles color
- Conversion: form on white card with ocean accent border
- Done: clean table-style branch list

- [ ] **Step 3: Create variation slots**

**compact (v10):** Reduced padding (`p-3` cards), smaller headings (`text-2xl`), tighter gaps. Suitable for desktop-first users who want to scan quickly.

**dashboard (v11):** Programs slot shows a 2-column data table layout. Payoff adds a "skin score" bar chart using CSS widths (no chart library). Hook adds a simulated data readout panel.

**editorial (v12):** Large serif-style headings (use `font-serif` Tailwind class), generous whitespace, magazine-layout programs slot with 1 featured program full-width + 2 secondary.

- [ ] **Step 4: Add all 4 Clinical variants to registry, create v09–v12 recipes, update index**

Recipe pattern (same as Playful — just change `id`, `label`, `theme: 'ocean'`, and slot IDs):
```ts
export const v09ClinicalClassic: Recipe = {
  id: 'v09-clinical-classic', label: 'v09 — Clinical Ocean / Classic',
  theme: 'ocean',
  slots: { hook: 'clinical-classic', minigame: 'clinical-classic', payoff: 'clinical-classic',
           programs: 'clinical-classic', conversion: 'clinical-classic', done: 'clinical-classic' },
};
```

- [ ] **Step 5: Tests + visual verify all 4 recipes + commit**

```bash
npx vitest run
# Verify: /?recipe=v09-clinical-classic through /?recipe=v12-clinical-editorial
git commit -m "feat(v09-v12): Clinical Ocean — 4 variations"
```

---

## Task 7: Natural Sage — all 4 variations

**Theme:** `sage` (existing)
**Recipes:** `v13-natural-classic`, `v14-natural-spa`, `v15-natural-editorial`, `v16-natural-minimal`
**Key visual rules:** Organic shapes, botanical motifs, airy spacing, earth tones, generous rounded corners (`--lp-radius-card: 24px`).

- [ ] **Step 1: Create classic hook — `src/landing/variants/hook/natural/classic.tsx`**

```tsx
export function NaturalClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex items-center overflow-hidden relative bg-[var(--lp-bg-hero)] px-6">
      {/* Organic leaf shapes */}
      <div className="absolute right-0 top-0 w-48 h-64 bg-[var(--lp-blob-1)] opacity-30"
        style={{ borderRadius: '0 0 0 80%' }} />
      <div className="absolute right-16 top-8 w-32 h-48 bg-[var(--lp-blob-3)] opacity-20"
        style={{ borderRadius: '0 0 0 60%', transform: 'rotate(-15deg)' }} />
      <div className="max-w-5xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-cta leading-snug mb-4">
            Lắng nghe điều{' '}
            <span className="text-[var(--lp-accent)]">làn da</span>{' '}
            bạn đang nói
          </h1>
          <p className="text-base text-cta/70 mb-8 max-w-sm leading-relaxed">
            Khám phá vùng da cần chăm sóc và tìm liệu trình thuận tự nhiên nhất.
          </p>
          <CtaButton onClick={onStart} size="lg">Soi da ngay →</CtaButton>
        </div>
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 scale-110 blur-xl opacity-30 rounded-full"
            style={{ background: 'var(--lp-blob-3)' }} />
          <img src="/face-map-hook.svg" alt="Bản đồ da"
            className="relative h-52 md:h-[400px] w-auto object-contain" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create remaining 5 classic slots + 3 variation sets**

Apply natural visual rules to each slot:
- Organic `border-radius` using `rounded-[var(--lp-radius-card)]` (24px)
- Programs cards: add a subtle botanical border accent using `border-l-4 border-[var(--lp-accent)]`
- Payoff: delegate to `ConfettiCardWhyPayoff`; sage theme handles color
- Spa variation: extra-airy padding (`py-20 px-8`), zen-inspired sparse layout, single program per "row" with full width
- Editorial variation: large italic heading font, pull-quote style testimonials
- Minimal variation: remove all decorative elements, text-only layouts

- [ ] **Step 3: Registry + v13–v16 recipes + index + tests + verify + commit**

```bash
git commit -m "feat(v13-v16): Natural Sage — 4 variations"
```

---

## Task 8: Bold Golden — all 4 variations

**Theme:** `golden` (extended in Task 1)
**Recipes:** `v17-bold-classic`, `v18-bold-stacked`, `v19-bold-diagonal`, `v20-bold-typographic`
**Key visual rules:** Dark amber band (`var(--lp-band-bg)` / `var(--lp-band-text)`) as the contrast anchor in every slot. Warm cream base (`var(--lp-bg-hero)` = `#FFFBEB`). Display-scale typography.

- [ ] **Step 1: Create classic hook — `src/landing/variants/hook/bold/classic.tsx`**

```tsx
export function BoldClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      {/* Dark amber band — top third */}
      <div className="flex-1 flex items-center px-6 md:px-12"
        style={{ background: 'var(--lp-band-bg)' }}>
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl md:text-8xl font-extrabold leading-[0.95] tracking-tight"
            style={{ color: 'var(--lp-band-text)' }}>
            DA BẠN<br />
            <span style={{ color: 'var(--lp-band-accent)' }}>CẦN GÌ</span>?
          </h1>
        </div>
      </div>
      {/* Cream zone — bottom two thirds */}
      <div className="flex-[2] flex items-center px-6 md:px-12 bg-[var(--lp-bg-hero)]">
        <div className="max-w-4xl w-full flex flex-col md:flex-row items-center md:items-start gap-8">
          <div>
            <p className="text-lg text-cta/70 mb-6 max-w-sm leading-relaxed">
              Bản đồ vùng da giúp bạn xác định chính xác loại mụn và nhận liệu trình phù hợp.
            </p>
            <CtaButton onClick={onStart} size="lg">Soi da ngay →</CtaButton>
          </div>
          <img src="/face-map-hook.svg" alt="Bản đồ da"
            className="h-36 md:h-52 w-auto object-contain drop-shadow-lg flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create remaining 5 classic slots**

Every slot must include a `var(--lp-band-bg)` zone:
- **programs:** card header bar uses `style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}`
- **payoff:** section title bar uses band colors
- **conversion:** page heading section uses band bg
- **done:** confirmation header uses band bg
- **minigame:** wrap FaceMapMinigame with a band-colored title bar at the top

- [ ] **Step 3: Create variation slots**

**stacked (v18):** Sections stack vertically with alternating cream / band-bg backgrounds. No horizontal split.

**diagonal (v19):** Hook uses a diagonal CSS clip-path divider between band and cream zones:
```tsx
// Add to the cream zone div:
style={{ clipPath: 'polygon(0 8%, 100% 0, 100% 100%, 0 100%)', marginTop: '-32px', paddingTop: '48px' }}
```

**typographic (v20):** Massively large display type (8xl–9xl), minimal imagery, programs slot displays as a numbered list with huge type.

- [ ] **Step 4: Registry + v17–v20 recipes + index + tests + verify + commit**

```bash
git commit -m "feat(v17-v20): Bold Golden — 4 variations"
```

---

## Task 9: Electric Magenta — all 4 variations

**Theme:** `magenta` (created in Task 1)
**Recipes:** `v21-electric-classic`, `v22-electric-glow-heavy`, `v23-electric-soft-dark`, `v24-electric-light-pop`
**Key visual rules:** Dark purple base (`--lp-bg-hero: #1a0533`), hot pink accent (`--lp-accent: #db2777`), glow/bloom effects using CSS `filter: blur() + opacity`, white text. No warm tones.

- [ ] **Step 1: Create classic hook — `src/landing/variants/hook/electric/classic.tsx`**

```tsx
export function ElectricClassicHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex items-center justify-center relative overflow-hidden px-6"
      style={{ background: 'var(--lp-bg-hero)' }}>
      {/* Pink glow orb */}
      <div className="absolute w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(219,39,119,.35) 0%, transparent 70%)', top: '-80px', right: '-60px' }} />
      {/* Purple glow orb */}
      <div className="absolute w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(147,51,234,.3) 0%, transparent 70%)', bottom: '-40px', left: '-40px' }} />
      <div className="relative z-10 text-center max-w-lg">
        <div className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1.5 rounded"
          style={{ background: 'rgba(219,39,119,.2)', color: 'var(--lp-accent)', border: '1px solid rgba(219,39,119,.3)' }}>
          Phân tích vùng da
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 text-white">
          Da bạn<br />
          <span style={{ color: 'var(--lp-accent)', filter: 'drop-shadow(0 0 20px var(--lp-accent))' }}>
            đang nói gì
          </span>?
        </h1>
        <p className="text-base mb-8 leading-relaxed" style={{ color: 'rgba(240,230,255,.7)' }}>
          Khám phá ngay — chỉ mất 60 giây.
        </p>
        <button onClick={onStart}
          className="font-bold text-base px-8 py-3.5 rounded-[var(--lp-radius-btn)] transition-all duration-200 text-white"
          style={{ background: 'var(--lp-accent)', boxShadow: '0 0 24px rgba(219,39,119,.5)' }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 36px rgba(219,39,119,.7)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 24px rgba(219,39,119,.5)')}>
          Soi da ngay →
        </button>
      </div>
    </div>
  );
}
```

> Note: Direct style manipulation on hover events avoids Tailwind arbitrary value issues for glow effects.

- [ ] **Step 2: Create remaining 5 classic slots**

All slots use dark bg from `var(--lp-bg-*)` (all dark shades in theme-magenta). White text throughout (`style={{ color: 'var(--lp-primary)' }}` = `#f0e6ff`). Pink accent for CTAs and highlights. Cards use `var(--lp-bg-card)` = `#1e0a42`.

- [ ] **Step 3: Create variation slots**

**glow-heavy (v22):** Increase glow orb opacity to `.6`, add `filter: blur(80px)` on orbs, add text-glow on headings with `filter: drop-shadow(0 0 30px var(--lp-accent))`.

**soft-dark (v23):** Reduce saturation — orbs removed, backgrounds use `opacity-50` lighter dark tones. More subtle, softer energy. Hook uses `--lp-bg-minigame` instead of `--lp-bg-hero`.

**light-pop (v24):** Inverted variant — light background (`#fdf4ff`, very light lavender) with dark purple text and magenta accent. Gives the archetype a daytime-accessible feel while keeping the magenta identity.

- [ ] **Step 4: Registry + v21–v24 recipes + index + tests + verify + commit**

```bash
npx vitest run
# Verify: /?recipe=v21-electric-classic through /?recipe=v24-electric-light-pop
git commit -m "feat(v21-v24): Electric Magenta — 4 variations"
```

---

## Task 10: Final registry + allRecipes cleanup

- [ ] **Step 1: Verify registry has all 120 new entries**

Run TypeScript check:
```bash
npx tsc --noEmit
```

Expected: no errors. Any missing import or typo will surface here.

- [ ] **Step 2: Verify allRecipes has all 20 new recipes**

Open `src/landing/recipes/index.ts` and confirm `allRecipes` contains `v01` through `v24` (minus v02 which was removed).

- [ ] **Step 3: Verify /versions gallery**

Open `http://localhost:3000/versions`. Confirm 23 recipe cards render (v01, v03–v24). Click a few to verify routing.

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Expected: all PASS.

- [ ] **Step 5: Final commit**

```bash
git add src/landing/registry.ts src/landing/recipes/index.ts
git commit -m "feat: complete 20-version multi-archetype system (v05–v24)"
```

---

## Quick Reference — Component Shell Pattern

Use this as a starting template for any new slot component:

```tsx
'use client';
import type { <Slot>SlotProps } from '../../../slots';
// Content imports (only from src/content/ — never hardcode):
// import { branches } from '../../../../content/branches';       ← for done slot
// import { getPrograms } from '../../../../content/catalog';     ← for programs slot

export function <Archetype><Variation><Slot>({ ...props }: <Slot>SlotProps) {
  return (
    <div className="min-h-[100dvh]" style={{ background: 'var(--lp-bg-<section>)' }}>
      {/* All colors via var(--lp-*) — never hardcode hex */}
      {/* Content from src/content/ — never hardcode strings */}
    </div>
  );
}
```

**Registry ID format:** `<archetype>-<variation>` (e.g., `electric-glow-heavy`)
**File path:** `src/landing/variants/<slot>/<archetype>/<variation>.tsx`
**Export name:** `<Archetype><Variation><Slot>` (PascalCase, e.g., `ElectricGlowHeavyHook`)
