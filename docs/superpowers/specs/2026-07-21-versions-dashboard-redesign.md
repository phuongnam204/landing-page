# /versions Dashboard Redesign — Design Spec

**Approach:** Dark Studio (Option A)

## Layout

- Page background: `#F1F3F8`
- Header bar: `#18181B` (charcoal) with eyebrow + title + version count
- Card grid: `max-width: 1200px`, responsive 1/2/3 columns

## Card Anatomy

```
┌───────────────────────────────┐
│  [gradient band 54px tall]    │  ← theme bg → accent gradient
│  [v01 badge]    [Blossom ■]  │  ← version id left, theme name right
├───────────────────────────────┤
│  Label text (semibold)        │  ← white body
│  [hook] [mini] [payoff] ...   │  ← slot chips, accent-colored
└───────────────────────────────┘
```

- Band gradient: `linear-gradient(135deg, chip.bg, color-mix(in srgb, chip.bg 35%, accent))`
- Dark themes (midnight, charcoal, forest, crimson, magenta): band-id badge uses white/translucent bg
- Hover: `translateY(-3px)` + glow `box-shadow` using `--card-accent` CSS custom property

## Data

`THEME_CHIPS` gains an `accent` field per theme (solid color for chip bg and glow).
Slot chips show abbreviated names: hook, teaser, mini, payoff, prog, conv, done, expert, path.

## Files changed

- `src/app/versions/page.tsx` — full rewrite
