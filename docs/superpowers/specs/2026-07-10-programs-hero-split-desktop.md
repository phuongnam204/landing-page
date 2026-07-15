# Spec: Programs Screen — Hero Split Desktop Layout

**Date:** 2026-07-10
**Branch:** fix/landing-ux-review
**Status:** Approved

## Problem

On desktop (`>= lg`), `GridWithFaqPrograms` renders a 2-col grid (program card | FAQ) that leaves significant whitespace below because the content does not fill viewport height. Mobile layout is fine.

## Solution

Option C: split-background hero fills the full viewport height on desktop. Doctor image left, glassmorphism program card center, patient image right. FAQ below at full width.

## Layout — Desktop (`>= lg`)

```
┌──────────────┬──────────────────────────┬─────────────────┐
│ Blue grad bg │   Glassmorphism card     │  Pink grad bg   │
│ nurse-cheer  │  Badge: "Phù hợp nhất"  │  patient photo  │
│ .png, bottom │  Sessions badge          │  object-cover   │
│ right anchor │  Program name (h2)       │  bottom left    │
│              │  Summary bullets (svg ✓) │  anchor         │
│              │  Condition tags          │                 │
│              │  [Golden CTA button]     │                 │
│              │  "Xem chi tiết" link     │                 │
└──────────────┴──────────────────────────┴─────────────────┘
┌──────────────────────────────────────────────────────────┐
│   "Câu hỏi thường gặp" header + FaqAccordion            │
│   max-w-3xl, centered, px-5 py-6                        │
└──────────────────────────────────────────────────────────┘
```

**Hero height:** `min-h-[100dvh]` — fills full viewport, images stretch to fill.

**Layout implementation:** `position: relative` hero container, left+right panels as `flex-1` divs side-by-side, card as `absolute inset-0 flex items-center justify-center z-10`.

## Layout — Mobile (`< lg`)

Unchanged from current implementation:
- ProgramHighlight stacked above FaqSection
- No images
- `max-w-md mx-auto`

## Visual Specs

### Left panel (doctor side)
- Background: `linear-gradient(160deg, #c3ddf5, #e6f3fb)`
- Image: `/mascots/nurse-cheer.png`
- Position: `absolute bottom-0 right-0`, `height: 90%`, `object-fit: contain`, `object-position: bottom right`
- Width: `30%` of hero (flex)

### Center card (glassmorphism)
- `backdrop-filter: blur(16px)`
- `background: rgba(255, 255, 255, 0.88)`
- Dark mode: `rgba(30, 20, 50, 0.82)` — handled via CSS var or Tailwind dark modifier
- `border-radius: 20px` (`rounded-2xl`)
- `box-shadow: 0 20px 60px rgba(0,0,0,0.14), 0 0 0 1px rgba(255,255,255,0.5) inset`
- Width: `min(420px, 40%)`, centered via absolute positioning
- Content: same as `ProgramHighlight` — badge, sessions, h2, summary bullets, condition tags, CTA, "Xem chi tiết"

### Right panel (patient side)
- Background: `linear-gradient(200deg, #fce8f4, #fff1f8)`
- Image: `/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg`
- Position: `absolute bottom-0 left-0`, `height: 100%`, `width: 100%`, `object-fit: cover`, `object-position: top center`
- Width: `30%` of hero (flex)

## Entrance Animations

All animations trigger on mount via `useEffect` toggling a boolean state that switches between initial and final CSS values. Respects `prefers-reduced-motion` — if reduced motion, all elements appear immediately without transition.

| Element | Initial | Final | Duration | Delay |
|---------|---------|-------|----------|-------|
| Left image | `opacity: 0, translateX(-50px)` | `opacity: 1, translateX(0)` | 600ms ease-out | 80ms |
| Right image | `opacity: 0, translateX(50px)` | `opacity: 1, translateX(0)` | 600ms ease-out | 160ms |
| Card | `opacity: 0, scale(0.95)` | `opacity: 1, scale(1)` | 450ms ease-out | 0ms |

Animation implemented as inline style objects controlled by a `mounted` boolean state. No external animation library.

## Component Structure

All changes confined to `src/landing/variants/programs/GridWithFaqPrograms.tsx`.

New sub-component `HeroSplitDesktop` renders the 3-panel hero. It receives same props as `ProgramHighlight` plus `tint` and `onOpenDrawer`. `HeroSplitDesktop` is only rendered on `>= lg` (CSS class `hidden lg:block` wrapper).

`ProgramHighlight` and `FaqSection` continue to exist as before, rendered inside a `lg:hidden` wrapper for mobile.

Drawer remains unchanged — mounted once at root, toggled by both mobile and desktop card.

## File Changes

- `src/landing/variants/programs/GridWithFaqPrograms.tsx` — sole change, add `HeroSplitDesktop` component + conditional rendering

## Out of Scope

- Image acquisition — using assets already in `public/` only
- FAQ layout changes
- Drawer changes
- Any other variant or organism
