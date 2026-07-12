# Multi-Archetype Version System — Design Spec

**Date:** 2026-07-12
**Status:** Approved

---

## Goal

Generate 20 landing page versions from the same workflow and content, varying only visual presentation. Each version belongs to one of 5 archetypes × 4 variations. Content from `src/content/` is the single source of truth across all 20 versions — no copy is hardcoded in any component.

---

## Architecture Overview

The existing slot/variant/recipe system scales directly to this goal. No new primitives needed — only more variants and recipes.

```
5 archetypes × 4 variations = 20 recipes
Each recipe: 6 custom slot variants (hook/minigame/payoff/programs/conversion/done)
All variants read content from src/content/ — zero hardcoded copy
```

---

## Archetype × Variation Matrix

| # | Archetype | Theme | V1 | V2 | V3 | V4 |
|---|---|---|---|---|---|---|
| 1 | Playful Blossom | blossom | classic | minimal | immersive | dark-accent |
| 2 | Clinical Ocean | ocean | classic | compact | dashboard | editorial |
| 3 | Electric Magenta | magenta (new) | classic | glow-heavy | soft-dark | light-pop |
| 4 | Natural Sage | sage | classic | spa | editorial | minimal |
| 5 | Bold Golden | golden (extended) | classic | stacked | diagonal | typographic |

### Archetype Visual Directions

**Playful Blossom** — pastel pink/lavender/mint, large rounded corners, confetti-heavy animations, bubbly Gen-Z energy. Hook uses split layout with large face-map SVG. Zone highlights use blossom accent.

**Clinical Ocean** — clean blue/white, sharp corners, data-forward layout, typographic hierarchy like medical reports. Payoff slot displays skin analysis as structured report (table + numbers). Conversion form is minimal with no decorative elements.

**Electric Magenta** — deep purple (#1a0533) to hot pink (#DB2777) gradient backgrounds, glow/bloom light effects, neon-cool aesthetic. No warm tones (no red/orange/yellow). Dark backgrounds across all slots. TikTok-native beauty aesthetic.

**Natural Sage** — green/white, organic shapes, botanical textures, airy generous spacing. Hook uses watercolor-style background. Zone highlights use sage green. Programs cards have soft organic border treatment.

**Bold Golden** — warm cream (#FFFBEB) base with dark amber band (#92400e) as a contrast anchor in every slot. CTA uses amber fill (#D97706) with white text. Display-scale typography. The dark band prevents the palette from looking muted — every slot has at least one `var(--lp-band-bg)` zone.

### Variation Dimensions

Each variation differs along two axes:
- **Layout density**: airy (more whitespace, fewer elements) vs. compact (dense, more content visible)
- **Visual weight**: imagery-heavy (large visuals dominate) vs. type-heavy (typography drives hierarchy)

"Classic" is always the balanced default and is built first. Variations 2–4 are derived from classic via a delta spec — only what changes needs to be specified.

---

## File Architecture

### Variant Files — Subdirectory per archetype

```
src/landing/variants/
  hook/
    playful/
      classic.tsx
      minimal.tsx
      immersive.tsx
      dark-accent.tsx
    clinical/
      classic.tsx
      compact.tsx
      dashboard.tsx
      editorial.tsx
    electric/
      classic.tsx
      glow-heavy.tsx
      soft-dark.tsx
      light-pop.tsx
    natural/
      classic.tsx
      spa.tsx
      editorial.tsx
      minimal.tsx
    bold/
      classic.tsx
      stacked.tsx
      diagonal.tsx
      typographic.tsx
    two-column.tsx       ← existing, kept
    bold-single.tsx      ← existing, kept
  minigame/              ← same subdirectory structure
  payoff/                ← same
  programs/              ← same
  conversion/            ← same
  done/                  ← same
```

Total new files: 5 archetypes × 4 variations × 6 slots = **120 new component files**.

### Registry IDs

Format: `<archetype>-<variation>`. Examples: `playful-classic`, `clinical-dashboard`, `electric-glow-heavy`, `bold-typographic`.

Existing variant IDs (`two-column`, `bold-single`, `face-map`, etc.) are unchanged.

### Recipe Files

```
src/landing/recipes/
  v05-playful-classic.ts
  v06-playful-minimal.ts
  v07-playful-immersive.ts
  v08-playful-dark-accent.ts
  v09-clinical-classic.ts
  v10-clinical-compact.ts
  v11-clinical-dashboard.ts
  v12-clinical-editorial.ts
  v13-electric-classic.ts
  v14-electric-glow-heavy.ts
  v15-electric-soft-dark.ts
  v16-electric-light-pop.ts
  v17-natural-classic.ts
  v18-natural-spa.ts
  v19-natural-editorial.ts
  v20-natural-minimal.ts
  v21-bold-classic.ts
  v22-bold-stacked.ts
  v23-bold-diagonal.ts
  v24-bold-typographic.ts
```

Each recipe is a pure data object — no component code.

---

## Theme System Changes

### New: theme-magenta

Add `.theme-magenta` to `src/landing/themes.css` (and source JSON in `tokens/`):

```css
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
}
```

### Extended: theme-golden — dark band tokens

Add 3 new vars to `.theme-golden` in `themes.css`:

```css
.theme-golden {
  /* ... existing vars unchanged ... */
  --lp-band-bg:     #92400e;
  --lp-band-text:   #FCD34D;
  --lp-band-accent: #F59E0B;
}
```

Bold Golden variant components use `var(--lp-band-bg)` / `var(--lp-band-text)` for their contrast anchor section. Other archetypes do not use these vars — adding them to theme-golden only causes no side effects.

---

## Content Constraint Rule

**Non-negotiable:** Every variant component imports display content exclusively from `src/content/`. No copy strings, program names, benefit text, or testimonials are hardcoded in TSX.

Allowed patterns:
```tsx
import { programs } from '../../../content/programs';
import { quizQuestions } from '../../../content/quiz';
```

Forbidden patterns (will fail code review):
```tsx
const title = "Da bạn đang giấu điều gì?";   // hardcoded copy
const programs = [{ name: "IPL Trị mụn" }];  // hardcoded data
```

The existing `scripts/lint_hardcodes.py` checks for hardcoded hex/px. Content copy enforcement is a code review checklist item — no new script required.

---

## Build Order

Build archetypes in this order to minimize risk and catch architectural issues early:

1. **Playful Blossom** — closest to current blossom theme, least unknown
2. **Clinical Ocean** — ocean theme exists, data-viz patterns to establish
3. **Natural Sage** — sage theme exists, organic shape patterns to establish
4. **Bold Golden** — golden theme exists, dark band mechanism to establish
5. **Electric Magenta** — new theme, most novel — saved for last

Within each archetype: build `classic` variation first → verify full flow → derive the other 3 variations.

---

## Generation Workflow per Archetype

### Step 1 — Archetype Brief (1 doc)
Write a 1-page visual rules document: typography choices, spacing rhythm, decorative motifs, color usage rules, animation character. This brief is the source of truth for all 4 variations.

### Step 2 — Classic spec (ux-ui-design-claude skill)
Use `ux-ui-design-claude` to produce a full spec for each of the 6 slots under the classic variation:
- Anatomy diagram per slot
- Token mapping (all values reference `var(--lp-*)`)
- Responsive behavior (mobile-first)
- State documentation (hover/focus/active/disabled)

### Step 3 — Implement classic
6 component files + registry entries + recipe file. Verify at `/?recipe=vXX-<archetype>-classic`.

### Step 4 — Derive variations 2–4
Each variation needs only a delta spec vs. classic: which layout changes, which density/weight axis shifts. Approximately 60% less work than classic. Implement, register, recipe.

### Step 5 — Verify
Walk full flow for each of the 4 recipes. Spot-check: theme CSS vars apply correctly, no hardcoded content, mobile viewport fits without overflow.

---

## Checklist Before Shipping Any Version

- [ ] All slot variants import content from `src/content/` only
- [ ] All CSS values use `var(--lp-*)` — no hardcoded hex/px
- [ ] Recipe ID is unique and registered in `allRecipes`
- [ ] `/versions` gallery shows the new version correctly
- [ ] Full flow walkthrough passes on mobile viewport (375px)
- [ ] Theme CSS vars apply consistently across all 6 slots
