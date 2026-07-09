# Design Tokens + Atomic Design — Landing Page Refactor

**Date:** 2026-07-09  
**Scope:** `src/landing/`, `src/components/`, `tokens/`, `src/landing/themes.css`, `tailwind.config.mjs`  
**Approach:** Token-first → Atoms/Molecules → Organisms + Variant refactor (Approach 2)

---

## Goal

Thống nhất hệ thống màu sắc và tổ chức component cho landing page theo hai chuẩn:

1. **Design Tokens** — `tokens/*.json` (DTCG) là single source of truth, sinh ra `themes.css` qua Style Dictionary. Không còn hardcode hex, không còn generic Tailwind utilities như `bg-amber-50` trong variant files.
2. **Atomic Design (Level 3)** — atoms và molecules vào `src/components/`, organisms vào `src/landing/organisms/`, variant files trở thành thin wrappers.

---

## Phase 1 — Token Build Pipeline

### 1.1 Token Files cho 5 themes

Tạo mới thư mục `tokens/themes/` với 5 file, mỗi file encode đúng 13 CSS var của theme đó:

```
tokens/themes/
├── blossom.json    ← brand chính o2skin (primary: navy #2D2640, pastel palette)
├── ocean.json      ← primary: #0c4a6e, blue palette
├── sage.json       ← primary: #14532d, green palette
├── golden.json     ← primary: #78350f, amber palette
└── midnight.json   ← primary: #e2e8f0, dark palette
```

Mỗi file theo cấu trúc DTCG với **20 vars** (13 gốc + 7 pastel/border color mới để thay thế hardcode trong Tailwind):

```json
{
  "theme": {
    "bg-hero":       { "$type": "color", "$value": "#FFEFF4" },
    "bg-minigame":   { "$type": "color", "$value": "#EDE9FF" },
    "bg-payoff":     { "$type": "color", "$value": "#A8E6CF" },
    "bg-programs":   { "$type": "color", "$value": "#C7CEEA" },
    "bg-card":       { "$type": "color", "$value": "#ffffff" },
    "primary":       { "$type": "color", "$value": "{primitive.navy.600}" },
    "accent":        { "$type": "color", "$value": "#7C3AED" },
    "border":        { "$type": "color", "$value": "{primitive.lavender.300}" },
    "blob-1":        { "$type": "color", "$value": "#FFB8D4" },
    "blob-2":        { "$type": "color", "$value": "#B39DFF" },
    "blob-3":        { "$type": "color", "$value": "#8FE3BC" },
    "radius-card":   { "$type": "dimension", "$value": "20px" },
    "radius-btn":    { "$type": "dimension", "$value": "20px" },
    "pastel-pink":   { "$type": "color", "$value": "#FFD3E0" },
    "pastel-lavender":{ "$type": "color", "$value": "#C7CEEA" },
    "pastel-mint":   { "$type": "color", "$value": "#A8E6CF" },
    "border-pink":   { "$type": "color", "$value": "#FFB8CE" },
    "border-mint":   { "$type": "color", "$value": "#9FE6BD" },
    "border-lavender":{ "$type": "color", "$value": "#B6BCEE" },
    "label-purple":  { "$type": "color", "$value": "#9b8fc4" }
  }
}
```

Blossom theme được phép tham chiếu `{primitive.navy.600}` từ `tokens/colors.json`. Các theme còn lại dùng giá trị hex trực tiếp cho tất cả 20 vars (màu pastel/border sẽ khác nhau per theme).

### 1.2 Style Dictionary Setup

Cài đặt:
```
npm install --save-dev style-dictionary
```

Tạo `style-dictionary.config.mjs` — chạy 5 lần, mỗi lần với 1 theme file, output vào class selector tương ứng. Kết quả được gộp thành `src/landing/themes.css` (generated file, không edit tay).

Thêm script vào `package.json`:
```json
"tokens": "node style-dictionary.config.mjs"
```

`src/landing/themes.css` sau khi generate trông như cũ về nội dung nhưng là output tự động:
```css
/* AUTO-GENERATED — chạy `npm run tokens` để cập nhật */
.theme-blossom {
  --lp-primary: #2D2640;
  --lp-bg-hero: #FFEFF4;
  /* ... */
}
```

### 1.3 Tailwind Config Update

`tailwind.config.mjs` sau Phase 1 — chỉ còn CSS var references, không còn hex:

```js
colors: {
  cta:              'var(--lp-primary)',
  accent:           'var(--lp-accent)',
  'lp-border':      'var(--lp-border)',
  'pastel-pink':    'var(--lp-pastel-pink)',
  'pastel-lavender':'var(--lp-pastel-lavender)',
  'pastel-mint':    'var(--lp-pastel-mint)',
  'border-pink':    'var(--lp-border-pink)',
  'border-mint':    'var(--lp-border-mint)',
  'border-lavender':'var(--lp-border-lavender)',
  'label-purple':   'var(--lp-label-purple)',
},
```

Mỗi `--lp-*` var đều được Style Dictionary generate từ `tokens/themes/*.json` — thay đổi per theme tự động.

**Checkpoint Phase 1:** `npm run tokens` chạy thành công, app render giống hệt cũ, không có visual change.

---

## Phase 2 — Atoms + Molecules

### 2.1 Atoms (`src/components/atoms/`)

| File | Thay thế | Props chính |
|------|----------|-------------|
| `CtaButton.tsx` | Inline `<button className="bg-cta...">` ở tất cả variant files | `variant: 'primary'\|'secondary'`, `size: 'sm'\|'md'\|'lg'`, `fullWidth?`, `onClick`, `children` |
| `ColoredDot.tsx` | `<span style={{ background: color }}>` inline | `color: string`, `size?: 'sm'\|'md'` |
| `StatChip.tsx` | `<span className="payoff-stat-chip...">` trong ConfettiCardPayoff | `dotColor: string`, `animationDelay?: string`, `children: ReactNode` |
| `SectionShell.tsx` | `<div className="h-screen w-full bg-[var(--lp-bg-*)]...">` ở mọi variant | `bgVar: '--lp-bg-hero'\|'--lp-bg-payoff'\|...`, `center?: boolean`, `overflow?: string` |

### 2.2 Molecules (`src/components/molecules/`)

| File | Thay thế | Props chính |
|------|----------|-------------|
| `ProgramCard.tsx` | Card inline định nghĩa khác nhau trong Grid/Carousel/GridWithFaq | `program: Program`, `isSelected?: boolean`, `onSelect: (id) => void` |
| `FaqAccordion.tsx` | `FaqAccordion` function + `ChevronIcon` inline trong GridWithFaqPrograms | `items: FaqItem[]`, `onOpen?: (idx: number) => void` |
| `BridgeBlock.tsx` | `<p className="bg-violet-50 border-l-2 border-violet-500...">` trong ConfettiCardPayoff | `children: ReactNode`, `tone?: 'neutral'\|'accent'` |
| `StatChipGroup.tsx` | Array.map chip + triggerNote inline trong ConfettiCardPayoff | `foundCount: number`, `zoneLabel: string`, `triggerNote?: string` |

### 2.3 Quy tắc viết

1. Tất cả màu dùng CSS var (`--lp-primary`, `--lp-border`…), không hardcode hex, không `bg-amber-50`.
2. Size/spacing dùng Tailwind scale (`py-3.5`, `px-9`…) — đây không phải design token.
3. Animation class (`payoff-stat-chip`, `animate-fade-in-up`…) giữ nguyên từ `globals.css`.
4. Không dùng emoji — `ColoredDot` thay visual dot, SVG inline thay icon.
5. Named export (không default export) để hỗ trợ tree-shaking.

**Checkpoint Phase 2:** Tạo trang `/test-atoms` (hoặc dùng Storybook) render tất cả atoms/molecules. Verify visual đúng.

---

## Phase 3 — Organisms + Variant Refactor

### 3.1 Organisms có shared structure (`src/landing/organisms/`)

**Điều kiện tạo organism:** slot có 2+ variants chia sẻ cùng cấu trúc visual.

#### PayoffOrganism

Composes: `SectionShell(bg-payoff)` + canvas animation slot + `StatChipGroup` + `BridgeBlock` + `CtaButton`

Props: `PayoffSlotProps` + `animation: 'confetti' | 'worry-particles'` + `variant: 'default' | 'why'`

Variants trở thành thin wrappers:
- `ConfettiCardPayoff` → `<PayoffOrganism animation="confetti" {...props} />`
- `ConfettiCardWhyPayoff` → `<PayoffOrganism animation="confetti" variant="why" {...props} />`
- `Benefit` → `<PayoffOrganism layout="benefit" {...props} />`
- `Feature` → `<PayoffOrganism layout="feature" {...props} />`

#### ProgramsOrganism

Composes: `SectionShell(bg-programs)` + heading + `ProgramCard[]` + `FaqAccordion` (optional) + `CtaButton`

Props: `ProgramsSlotProps` + `layout: 'grid' | 'carousel'` + `showFaq?: boolean`

Variants trở thành thin wrappers:
- `GridPrograms` → `<ProgramsOrganism layout="grid" {...props} />`
- `CarouselPrograms` → `<ProgramsOrganism layout="carousel" {...props} />`
- `GridWithFaqPrograms` → `<ProgramsOrganism layout="grid" showFaq {...props} />`

#### ConversionOrganism

Composes: `SectionShell(bg-hero)` + form fields + `CtaButton(submit)` + testimonials slot (optional)

Props: `ConversionSlotProps` + `showTestimonials?: boolean`

Variants trở thành thin wrappers:
- `short-form` → `<ConversionOrganism {...props} />`
- `short-form-with-testimonials` → `<ConversionOrganism showTestimonials {...props} />`

### 3.2 Slots không có organism

Chỉ refactor nội dung dùng atoms, giữ nguyên cấu trúc file:

| Slot | Lý do | Việc cần làm |
|------|-------|-------------|
| **Hook** | `bold-single` và `two-column` quá khác nhau về layout | Replace inline `<button>` → `CtaButton`, wrap root div → `SectionShell` |
| **Minigame** | Game logic chuyên biệt, không có shared UI structure | Chỉ replace root div wrapper → `SectionShell` |
| **SocialProof** | 1 variant duy nhất | Replace button, normalize màu |
| **Done** | 2 variants nhưng quá đơn giản | Replace button → `CtaButton`, normalize màu |

### 3.3 Pattern thin wrapper

```tsx
// src/landing/variants/programs/GridPrograms.tsx — SAU REFACTOR
'use client';
import { ProgramsOrganism } from '../../organisms/ProgramsOrganism';
import type { ProgramsSlotProps } from '../../slots';

export function GridPrograms(props: ProgramsSlotProps) {
  return <ProgramsOrganism {...props} layout="grid" />;
}
```

**Checkpoint Phase 3:** Landing flow chạy đầy đủ end-to-end từ hook → minigame → payoff → programs → conversion → done. Không có visual regression.

---

## File Structure Sau Khi Hoàn Thành

```
tokens/
├── colors.json          (DTCG, source of truth)
├── typography.json      (Be Vietnam Pro làm sans)
├── spacing.json, ...    (các token khác)
└── themes/
    ├── blossom.json     (13 vars)
    ├── ocean.json
    ├── sage.json
    ├── golden.json
    └── midnight.json

src/
├── components/
│   ├── atoms/
│   │   ├── CtaButton.tsx
│   │   ├── ColoredDot.tsx
│   │   ├── StatChip.tsx
│   │   └── SectionShell.tsx
│   ├── molecules/
│   │   ├── ProgramCard.tsx
│   │   ├── FaqAccordion.tsx
│   │   ├── BridgeBlock.tsx
│   │   └── StatChipGroup.tsx
│   └── minigame/        (không đổi)
└── landing/
    ├── organisms/
    │   ├── PayoffOrganism.tsx
    │   ├── ProgramsOrganism.tsx
    │   └── ConversionOrganism.tsx
    ├── variants/        (thin wrappers sau refactor)
    ├── themes.css       (GENERATED — chạy npm run tokens)
    └── slots.ts         (không đổi)

style-dictionary.config.mjs    (build script)
tailwind.config.mjs            (chỉ còn CSS var references)
```

---

## Constraints

- Minigame game logic (`src/components/MinigameCore/`, `src/components/minigame/`) không bị đụng đến trong Phase 2/3.
- `slots.ts` không thay đổi — SlotProps là interface ổn định giữa recipe system và variants.
- Animation keyframes trong `globals.css` giữ nguyên, chỉ được tham chiếu từ atoms/molecules.
- `themes.css` sau Phase 1 là generated file — không edit tay, chỉ sửa qua `tokens/themes/*.json` + `npm run tokens`.
