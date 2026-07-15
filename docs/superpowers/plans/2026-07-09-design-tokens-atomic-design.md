# Design Tokens + Atomic Design Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor landing page thành token-driven design system với Atomic Design — `tokens/themes/*.json` generate `themes.css`, atoms/molecules trong `src/components/`, organisms trong `src/landing/organisms/`, variant files thành thin wrappers.

**Architecture:** Token-first: Node.js build script đọc `tokens/themes/*.json` → ghi `src/landing/themes.css`. Tailwind config chỉ reference CSS vars. Atoms/molecules được tách từ variant files vào `src/components/`. Organisms compose molecules và kiểm soát layout. Variant files = thin wrappers truyền SlotProps xuống organism.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS, TypeScript, Node.js built-in `fs` (build script, không cần npm package mới)

**Spec:** `docs/superpowers/specs/2026-07-09-design-tokens-atomic-design.md`

---

## File Map

### Tạo mới
```
tokens/themes/blossom.json
tokens/themes/ocean.json
tokens/themes/sage.json
tokens/themes/golden.json
tokens/themes/midnight.json
scripts/build-tokens.mjs
src/components/atoms/CtaButton.tsx
src/components/atoms/SectionShell.tsx
src/components/atoms/ColoredDot.tsx
src/components/atoms/StatChip.tsx
src/components/molecules/ProgramCard.tsx
src/components/molecules/FaqAccordion.tsx
src/components/molecules/BridgeBlock.tsx
src/components/molecules/StatChipGroup.tsx
src/landing/organisms/PayoffOrganism.tsx
src/landing/organisms/ProgramsOrganism.tsx
src/landing/organisms/ConversionOrganism.tsx
```

### Sửa đổi
```
package.json                                          ← thêm "tokens" script
tailwind.config.mjs                                   ← hex → CSS vars
src/landing/themes.css                                ← generated (overwrite)
src/landing/variants/payoff/ConfettiCardPayoff.tsx    ← thin wrapper
src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx ← thin wrapper
src/landing/variants/payoff/Benefit.tsx               ← thin wrapper
src/landing/variants/payoff/Feature.tsx               ← thin wrapper
src/landing/variants/programs/GridPrograms.tsx        ← thin wrapper
src/landing/variants/programs/CarouselPrograms.tsx    ← thin wrapper
src/landing/variants/programs/GridWithFaqPrograms.tsx ← thin wrapper
src/landing/variants/conversion/short-form.tsx        ← thin wrapper
src/landing/variants/conversion/short-form-with-testimonials.tsx ← thin wrapper
src/landing/variants/hook/bold-single.tsx             ← dùng CtaButton + SectionShell
src/landing/variants/hook/two-column.tsx              ← dùng CtaButton + SectionShell
src/landing/variants/socialProof/video-proof.tsx      ← dùng SectionShell
src/landing/variants/done/contact-info.tsx            ← dùng CtaButton + SectionShell
src/landing/variants/done/contact-info-with-video.tsx ← dùng CtaButton + SectionShell
```

---

## Phase 1 — Token Build Pipeline

### Task 1: Tạo 5 theme token files

**Files:**
- Create: `tokens/themes/blossom.json`
- Create: `tokens/themes/ocean.json`
- Create: `tokens/themes/sage.json`
- Create: `tokens/themes/golden.json`
- Create: `tokens/themes/midnight.json`

- [ ] **Tạo `tokens/themes/blossom.json`**

```json
{
  "$description": "o2skin brand theme — Playful Pastel",
  "theme": {
    "bg-hero":        { "$type": "color", "$value": "#FFEFF4" },
    "bg-minigame":    { "$type": "color", "$value": "#EDE9FF" },
    "bg-payoff":      { "$type": "color", "$value": "#A8E6CF" },
    "bg-programs":    { "$type": "color", "$value": "#C7CEEA" },
    "bg-card":        { "$type": "color", "$value": "#ffffff" },
    "primary":        { "$type": "color", "$value": "#2D2640" },
    "accent":         { "$type": "color", "$value": "#7C3AED" },
    "border":         { "$type": "color", "$value": "#B6BCEE" },
    "blob-1":         { "$type": "color", "$value": "#FFB8D4" },
    "blob-2":         { "$type": "color", "$value": "#B39DFF" },
    "blob-3":         { "$type": "color", "$value": "#8FE3BC" },
    "radius-card":    { "$type": "dimension", "$value": "20px" },
    "radius-btn":     { "$type": "dimension", "$value": "20px" },
    "pastel-pink":    { "$type": "color", "$value": "#FFD3E0" },
    "pastel-lavender":{ "$type": "color", "$value": "#C7CEEA" },
    "pastel-mint":    { "$type": "color", "$value": "#A8E6CF" },
    "border-pink":    { "$type": "color", "$value": "#FFB8CE" },
    "border-mint":    { "$type": "color", "$value": "#9FE6BD" },
    "border-lavender":{ "$type": "color", "$value": "#B6BCEE" },
    "label-purple":   { "$type": "color", "$value": "#9b8fc4" }
  }
}
```

- [ ] **Tạo `tokens/themes/ocean.json`**

```json
{
  "$description": "Ocean theme — blue palette",
  "theme": {
    "bg-hero":        { "$type": "color", "$value": "#EFF8FF" },
    "bg-minigame":    { "$type": "color", "$value": "#E0F2FE" },
    "bg-payoff":      { "$type": "color", "$value": "#BAE6FD" },
    "bg-programs":    { "$type": "color", "$value": "#E0F2FE" },
    "bg-card":        { "$type": "color", "$value": "#ffffff" },
    "primary":        { "$type": "color", "$value": "#0c4a6e" },
    "accent":         { "$type": "color", "$value": "#0284c7" },
    "border":         { "$type": "color", "$value": "#7DD3FC" },
    "blob-1":         { "$type": "color", "$value": "#7DD3FC" },
    "blob-2":         { "$type": "color", "$value": "#38BDF8" },
    "blob-3":         { "$type": "color", "$value": "#BAE6FD" },
    "radius-card":    { "$type": "dimension", "$value": "14px" },
    "radius-btn":     { "$type": "dimension", "$value": "14px" },
    "pastel-pink":    { "$type": "color", "$value": "#DBEAFE" },
    "pastel-lavender":{ "$type": "color", "$value": "#E0F2FE" },
    "pastel-mint":    { "$type": "color", "$value": "#BAE6FD" },
    "border-pink":    { "$type": "color", "$value": "#93C5FD" },
    "border-mint":    { "$type": "color", "$value": "#7DD3FC" },
    "border-lavender":{ "$type": "color", "$value": "#60A5FA" },
    "label-purple":   { "$type": "color", "$value": "#0284c7" }
  }
}
```

- [ ] **Tạo `tokens/themes/sage.json`**

```json
{
  "$description": "Sage theme — green palette",
  "theme": {
    "bg-hero":        { "$type": "color", "$value": "#F0FDF4" },
    "bg-minigame":    { "$type": "color", "$value": "#DCFCE7" },
    "bg-payoff":      { "$type": "color", "$value": "#BBF7D0" },
    "bg-programs":    { "$type": "color", "$value": "#DCFCE7" },
    "bg-card":        { "$type": "color", "$value": "#ffffff" },
    "primary":        { "$type": "color", "$value": "#14532d" },
    "accent":         { "$type": "color", "$value": "#16a34a" },
    "border":         { "$type": "color", "$value": "#86EFAC" },
    "blob-1":         { "$type": "color", "$value": "#86EFAC" },
    "blob-2":         { "$type": "color", "$value": "#4ADE80" },
    "blob-3":         { "$type": "color", "$value": "#BBF7D0" },
    "radius-card":    { "$type": "dimension", "$value": "24px" },
    "radius-btn":     { "$type": "dimension", "$value": "24px" },
    "pastel-pink":    { "$type": "color", "$value": "#D1FAE5" },
    "pastel-lavender":{ "$type": "color", "$value": "#DCFCE7" },
    "pastel-mint":    { "$type": "color", "$value": "#BBF7D0" },
    "border-pink":    { "$type": "color", "$value": "#6EE7B7" },
    "border-mint":    { "$type": "color", "$value": "#86EFAC" },
    "border-lavender":{ "$type": "color", "$value": "#A7F3D0" },
    "label-purple":   { "$type": "color", "$value": "#16a34a" }
  }
}
```

- [ ] **Tạo `tokens/themes/golden.json`**

```json
{
  "$description": "Golden theme — amber palette",
  "theme": {
    "bg-hero":        { "$type": "color", "$value": "#FFFBEB" },
    "bg-minigame":    { "$type": "color", "$value": "#FEF3C7" },
    "bg-payoff":      { "$type": "color", "$value": "#FDE68A" },
    "bg-programs":    { "$type": "color", "$value": "#FEF3C7" },
    "bg-card":        { "$type": "color", "$value": "#ffffff" },
    "primary":        { "$type": "color", "$value": "#78350f" },
    "accent":         { "$type": "color", "$value": "#d97706" },
    "border":         { "$type": "color", "$value": "#FCD34D" },
    "blob-1":         { "$type": "color", "$value": "#FCD34D" },
    "blob-2":         { "$type": "color", "$value": "#FBBF24" },
    "blob-3":         { "$type": "color", "$value": "#FDE68A" },
    "radius-card":    { "$type": "dimension", "$value": "20px" },
    "radius-btn":     { "$type": "dimension", "$value": "20px" },
    "pastel-pink":    { "$type": "color", "$value": "#FEF9C3" },
    "pastel-lavender":{ "$type": "color", "$value": "#FEF3C7" },
    "pastel-mint":    { "$type": "color", "$value": "#FDE68A" },
    "border-pink":    { "$type": "color", "$value": "#FDE047" },
    "border-mint":    { "$type": "color", "$value": "#FCD34D" },
    "border-lavender":{ "$type": "color", "$value": "#FBBF24" },
    "label-purple":   { "$type": "color", "$value": "#d97706" }
  }
}
```

- [ ] **Tạo `tokens/themes/midnight.json`**

```json
{
  "$description": "Midnight theme — dark palette",
  "theme": {
    "bg-hero":        { "$type": "color", "$value": "#0f0c1a" },
    "bg-minigame":    { "$type": "color", "$value": "#1a1030" },
    "bg-payoff":      { "$type": "color", "$value": "#130f23" },
    "bg-programs":    { "$type": "color", "$value": "#1a1030" },
    "bg-card":        { "$type": "color", "$value": "#1e1a2e" },
    "primary":        { "$type": "color", "$value": "#e2e8f0" },
    "accent":         { "$type": "color", "$value": "#a78bfa" },
    "border":         { "$type": "color", "$value": "#4c1d95" },
    "blob-1":         { "$type": "color", "$value": "#4c1d95" },
    "blob-2":         { "$type": "color", "$value": "#1e40af" },
    "blob-3":         { "$type": "color", "$value": "#312e81" },
    "radius-card":    { "$type": "dimension", "$value": "20px" },
    "radius-btn":     { "$type": "dimension", "$value": "20px" },
    "pastel-pink":    { "$type": "color", "$value": "#2d1b69" },
    "pastel-lavender":{ "$type": "color", "$value": "#1a1030" },
    "pastel-mint":    { "$type": "color", "$value": "#130f23" },
    "border-pink":    { "$type": "color", "$value": "#6d28d9" },
    "border-mint":    { "$type": "color", "$value": "#4c1d95" },
    "border-lavender":{ "$type": "color", "$value": "#5b21b6" },
    "label-purple":   { "$type": "color", "$value": "#a78bfa" }
  }
}
```

- [ ] **Commit**

```bash
git add tokens/themes/
git commit -m "feat(tokens): add DTCG theme files for all 5 themes"
```

---

### Task 2: Build script + npm run tokens

**Files:**
- Create: `scripts/build-tokens.mjs`
- Modify: `package.json`

- [ ] **Tạo thư mục `scripts/` nếu chưa có**

```bash
mkdir -p scripts
```

- [ ] **Tạo `scripts/build-tokens.mjs`**

```js
// scripts/build-tokens.mjs
// Reads tokens/themes/*.json → writes src/landing/themes.css
// No external dependencies — uses Node.js built-in fs only.
import { readFileSync, writeFileSync } from 'fs';

const THEMES = ['blossom', 'ocean', 'sage', 'golden', 'midnight'];

function resolveValue(val) {
  // Strip DTCG alias syntax — theme files should use direct hex, but guard anyway
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    console.warn(`[build-tokens] Unresolved alias: ${val} — replace with direct hex in theme file`);
    return val;
  }
  return val;
}

function buildThemeCSS(themeName) {
  const raw = readFileSync(`tokens/themes/${themeName}.json`, 'utf-8');
  const data = JSON.parse(raw);
  const vars = Object.entries(data.theme)
    .map(([key, token]) => `  --lp-${key}: ${resolveValue(token.$value)};`)
    .join('\n');
  return `.theme-${themeName} {\n${vars}\n}`;
}

const header = `/* AUTO-GENERATED — run \`npm run tokens\` to update.\n   Edit tokens/themes/*.json, not this file. */\n\n`;
const body = THEMES.map(buildThemeCSS).join('\n\n');
writeFileSync('src/landing/themes.css', header + body + '\n', 'utf-8');
console.log('✓ src/landing/themes.css generated from tokens/themes/*.json');
```

- [ ] **Aggiungere script a `package.json`** (dentro `"scripts": { ... }`)

Aprire `package.json`, cercare il blocco `"scripts"` e aggiungere:

```json
"tokens": "node scripts/build-tokens.mjs"
```

- [ ] **Chạy build và verify output**

```bash
npm run tokens
```

Expected output:
```
✓ src/landing/themes.css generated from tokens/themes/*.json
```

- [ ] **Kiểm tra `src/landing/themes.css` được generate đúng**

File phải bắt đầu bằng comment `AUTO-GENERATED` và chứa đủ 5 class selectors: `.theme-blossom`, `.theme-ocean`, `.theme-sage`, `.theme-golden`, `.theme-midnight`, mỗi cái có 20 CSS vars `--lp-*`.

- [ ] **Commit**

```bash
git add scripts/build-tokens.mjs package.json src/landing/themes.css
git commit -m "feat(tokens): add build-tokens script, generate themes.css from DTCG sources"
```

---

### Task 3: Update tailwind.config.mjs — hex → CSS vars

**Files:**
- Modify: `tailwind.config.mjs`

- [ ] **Thay toàn bộ nội dung `tailwind.config.mjs`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cta:               'var(--lp-primary)',
        accent:            'var(--lp-accent)',
        'lp-border':       'var(--lp-border)',
        'pastel-pink':     'var(--lp-pastel-pink)',
        'pastel-lavender': 'var(--lp-pastel-lavender)',
        'pastel-mint':     'var(--lp-pastel-mint)',
        'border-pink':     'var(--lp-border-pink)',
        'border-mint':     'var(--lp-border-mint)',
        'border-lavender': 'var(--lp-border-lavender)',
        'label-purple':    'var(--lp-label-purple)',
      },
      fontFamily: { sans: ['var(--font-be-vietnam-pro)', 'Inter', 'sans-serif'] },
      borderRadius: { soft: 'var(--lp-radius-card)' },
    },
  },
  plugins: [],
};
```

- [ ] **Checkpoint: dev server vẫn render đúng**

```bash
npm run dev
```

Mở `http://localhost:3000` và navigate qua ít nhất 1 landing flow đầy đủ (hook → minigame → payoff → programs → conversion). Visual phải giống hệt trước thay đổi.

- [ ] **TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add tailwind.config.mjs
git commit -m "refactor(tokens): tailwind config references CSS vars only, no hardcoded hex"
```

---

## Phase 2 — Atoms + Molecules

### Task 4: Atoms — CtaButton + SectionShell

**Files:**
- Create: `src/components/atoms/CtaButton.tsx`
- Create: `src/components/atoms/SectionShell.tsx`

- [ ] **Tạo `src/components/atoms/CtaButton.tsx`**

```tsx
'use client';

type CtaButtonVariant = 'primary' | 'secondary' | 'accent';
type CtaButtonSize = 'sm' | 'md' | 'lg';

interface CtaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: CtaButtonVariant;
  size?: CtaButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const SIZE: Record<CtaButtonSize, string> = {
  sm:  'py-2.5 px-6 text-xs',
  md:  'py-3.5 px-9 text-sm',
  lg:  'py-4 px-10 text-base',
};

const VARIANT: Record<CtaButtonVariant, string> = {
  primary:   'bg-cta text-white hover:opacity-90',
  secondary: 'bg-white text-cta border-2 border-[var(--lp-border)] hover:bg-[var(--lp-bg-hero)]',
  accent:    'bg-[var(--lp-accent)] text-white hover:opacity-90',
};

export function CtaButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
}: CtaButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'font-bold rounded-soft transition-opacity duration-200',
        'disabled:opacity-60 flex items-center justify-center gap-2',
        SIZE[size],
        VARIANT[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
```

- [ ] **Tạo `src/components/atoms/SectionShell.tsx`**

```tsx
type BgVar =
  | '--lp-bg-hero'
  | '--lp-bg-minigame'
  | '--lp-bg-payoff'
  | '--lp-bg-programs'
  | '--lp-bg-card';

interface SectionShellProps {
  children: React.ReactNode;
  bgVar: BgVar;
  center?: boolean;
  overflow?: 'hidden' | 'auto' | 'visible';
  className?: string;
}

export function SectionShell({
  children,
  bgVar,
  center = false,
  overflow = 'hidden',
  className = '',
}: SectionShellProps) {
  return (
    <div
      className={[
        'h-[100dvh] w-full relative px-5',
        center ? 'flex items-center justify-center' : '',
        overflow === 'hidden' ? 'overflow-hidden'
          : overflow === 'auto' ? 'overflow-y-auto'
          : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ background: `var(${bgVar})` }}
    >
      {children}
    </div>
  );
}
```

- [ ] **TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Commit**

```bash
git add src/components/atoms/CtaButton.tsx src/components/atoms/SectionShell.tsx
git commit -m "feat(atoms): add CtaButton and SectionShell"
```

---

### Task 5: Atoms — ColoredDot + StatChip

**Files:**
- Create: `src/components/atoms/ColoredDot.tsx`
- Create: `src/components/atoms/StatChip.tsx`

- [ ] **Tạo `src/components/atoms/ColoredDot.tsx`**

```tsx
interface ColoredDotProps {
  color: string;
  size?: 'sm' | 'md';
}

const DOT_SIZE = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5' };

export function ColoredDot({ color, size = 'md' }: ColoredDotProps) {
  return (
    <span
      className={`inline-block ${DOT_SIZE[size]} rounded-full shrink-0`}
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Tạo `src/components/atoms/StatChip.tsx`**

```tsx
import { ColoredDot } from './ColoredDot';

interface StatChipProps {
  dotColor: string;
  children: React.ReactNode;
  animationDelay?: string;
}

export function StatChip({ dotColor, children, animationDelay }: StatChipProps) {
  return (
    <span
      className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm font-semibold text-cta"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <ColoredDot color={dotColor} />
      {children}
    </span>
  );
}
```

- [ ] **TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/atoms/ColoredDot.tsx src/components/atoms/StatChip.tsx
git commit -m "feat(atoms): add ColoredDot and StatChip"
```

---

### Task 6: Molecules — FaqAccordion, BridgeBlock, StatChipGroup

**Files:**
- Create: `src/components/molecules/FaqAccordion.tsx`
- Create: `src/components/molecules/BridgeBlock.tsx`
- Create: `src/components/molecules/StatChipGroup.tsx`

- [ ] **Tạo `src/components/molecules/FaqAccordion.tsx`**

Tách từ `GridWithFaqPrograms.tsx` — đọc file đó để lấy `FaqItem` type và `ChevronIcon`.

```tsx
'use client';
import { useState } from 'react';

export type FaqItem = { q: string; a: string };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FaqAccordionProps {
  items: FaqItem[];
  onOpen?: (index: number) => void;
}

export function FaqAccordion({ items, onOpen }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-soft border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-bg-card)]">
      {items.map((item, i) => (
        <div key={i} className={i < items.length - 1 ? 'border-b border-[var(--lp-border)]' : ''}>
          <button
            type="button"
            onClick={() => {
              const next = openIdx === i ? null : i;
              setOpenIdx(next);
              if (next !== null) onOpen?.(next);
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-cta hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span>{item.q}</span>
            <ChevronIcon open={openIdx === i} />
          </button>
          {openIdx === i && (
            <div className="px-4 pb-3.5 text-sm text-cta/70 leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Tạo `src/components/molecules/BridgeBlock.tsx`**

```tsx
interface BridgeBlockProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent';
}

export function BridgeBlock({ children, tone = 'accent' }: BridgeBlockProps) {
  const styles =
    tone === 'accent'
      ? 'bg-[var(--lp-accent)]/5 border-[var(--lp-accent)]'
      : 'bg-[var(--lp-bg-hero)] border-[var(--lp-border)]';
  return (
    <p className={`text-sm md:text-base text-cta/70 leading-snug px-3 py-2.5 border-l-2 rounded-r-lg ${styles}`}>
      {children}
    </p>
  );
}
```

- [ ] **Tạo `src/components/molecules/StatChipGroup.tsx`**

```tsx
import { StatChip } from '../atoms/StatChip';

interface StatChipGroupProps {
  foundCount: number;
  zoneLabel: string;
  triggerNote?: string;
}

const CHIPS = [
  { key: 'found', color: '#FF5C9E', delay: '0.5s' },
  { key: 'zone',  color: '#B39DFF', delay: '0.68s' },
];

export function StatChipGroup({ foundCount, zoneLabel, triggerNote }: StatChipGroupProps) {
  return (
    <div className="mb-4">
      <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
      <div className="flex flex-wrap gap-2 mb-2.5">
        <StatChip dotColor={CHIPS[0].color} animationDelay={CHIPS[0].delay}>
          đã soi <b>{foundCount}</b> nốt mụn
        </StatChip>
        <StatChip dotColor={CHIPS[1].color} animationDelay={CHIPS[1].delay}>
          da bạn hay bị ở <b>{zoneLabel}</b>
        </StatChip>
      </div>
      {triggerNote && (
        <p
          className="payoff-stat-chip text-xs md:text-sm text-cta/80 bg-[var(--lp-accent)]/5 border border-[var(--lp-border)] rounded-lg px-3 py-2 leading-relaxed"
          style={{ animationDelay: '0.86s' }}
        >
          {triggerNote}
        </p>
      )}
    </div>
  );
}
```

- [ ] **TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/molecules/
git commit -m "feat(molecules): add FaqAccordion, BridgeBlock, StatChipGroup"
```

---

### Task 7: Molecule — ProgramCard

**Files:**
- Create: `src/components/molecules/ProgramCard.tsx`

- [ ] **Tạo `src/components/molecules/ProgramCard.tsx`**

Tách từ `GridPrograms.tsx`. VIP badge đổi từ `bg-amber-100 text-amber-800` sang CSS var để token-driven.

```tsx
import type { Program } from '../../content/programs';
import { getConditionById } from '../../content/catalog';
import { ColoredDot } from '../atoms/ColoredDot';

interface ProgramCardProps {
  program: Program;
  selected: boolean;
  isSuggested: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
}

export function ProgramCard({ program, selected, isSuggested, onSelect, style }: ProgramCardProps) {
  const cond = getConditionById(program.treatsConditions[0]);
  const tint = cond?.color ?? '#A0AEC0';
  return (
    <button
      onClick={onSelect}
      style={style}
      className={[
        'ps-cardUp text-left rounded-soft shadow-md shadow-cta/10 flex flex-col overflow-hidden border-2 transition-colors duration-[160ms]',
        selected ? 'border-[var(--lp-accent)]' : 'border-transparent',
      ].join(' ')}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${tint}CC` }}>
        <div className="font-bold text-base text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>
          {program.name}
        </div>
        {selected && <span className="font-bold text-sm text-white" aria-label="Đã chọn">✓</span>}
      </div>
      <div
        className="px-4 py-3 flex flex-col gap-2 flex-1"
        style={{ background: selected ? `${tint}0A` : 'var(--lp-bg-card)' }}
      >
        {program.isVip && (
          <span className="self-start inline-flex items-center rounded-full bg-[var(--lp-accent)]/10 px-2 py-0.5 text-xs font-bold text-[var(--lp-accent)]">
            VIP
          </span>
        )}
        <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {program.treatsConditions.map(cid => {
            const c = getConditionById(cid);
            return (
              <span
                key={cid}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: c ? `${c.color}30` : '#e8e8e8',
                  color: c ? c.color : '#555',
                  filter: c ? 'brightness(0.82)' : 'none',
                }}
              >
                <ColoredDot color={c?.color ?? '#999'} size="sm" />
                {c?.label ?? cid}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
```

- [ ] **TypeScript check + commit**

```bash
npx tsc --noEmit
git add src/components/molecules/ProgramCard.tsx
git commit -m "feat(molecules): add ProgramCard extracted from GridPrograms"
```

---

## Phase 3 — Organisms + Variant Refactor

### Task 8: PayoffOrganism + refactor payoff variants

**Files:**
- Create: `src/landing/organisms/PayoffOrganism.tsx`
- Modify: `src/landing/variants/payoff/ConfettiCardPayoff.tsx`
- Modify: `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx`
- Modify: `src/landing/variants/payoff/Benefit.tsx`
- Modify: `src/landing/variants/payoff/Feature.tsx`

- [ ] **Đọc `ConfettiCardPayoff.tsx`, `ConfettiCardWhyPayoff.tsx`, `Benefit.tsx`, `Feature.tsx` để nắm nội dung**

- [ ] **Tạo `src/landing/organisms/PayoffOrganism.tsx`**

Organism chứa tất cả shared structure của payoff slot: `SectionShell`, canvas effect, `StatChipGroup`, `BridgeBlock`, `CtaButton`. Layout khác nhau theo `layout` prop.

```tsx
'use client';
import React, { useEffect, useRef } from 'react';
import type { PayoffSlotProps } from '../slots';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';
import { StatChipGroup } from '../../components/molecules/StatChipGroup';
import { BridgeBlock } from '../../components/molecules/BridgeBlock';

// ── Canvas effects (moved from ConfettiCardPayoff) ──────────────────────────
const CONFETTI_COLORS = ['#ff6b9d','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ff4d6d','#48cae4'];

function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
    y: -8 - Math.random() * 50, vx: (Math.random() - 0.5) * 3.5,
    vy: 2.5 + Math.random() * 4, size: 6 + Math.random() * 8,
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 12,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    isCircle: Math.random() > 0.45,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y < canvas.height + 20) {
        alive = true; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isCircle) { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        else { ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2); }
        ctx.restore();
      }
    }
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

function runWorryParticles(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 25 }, () => ({
    x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
    y: canvas.height * 0.55 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 1.2, vy: -1.2 - Math.random() * 1.5,
    size: 3 + Math.random() * 4, alpha: 0.5 + Math.random() * 0.4,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.008;
      if (p.y > -20 && p.alpha > 0) {
        alive = true; ctx.globalAlpha = p.alpha; ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}
// ────────────────────────────────────────────────────────────────────────────

const HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe!',
  concern: 'Hmm, có điều bạn cần biết về da mình...',
};
const BRIDGE: Record<'positive' | 'concern', string> = {
  positive: 'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài. Hãy xem chương trình chúng tôi chuẩn bị cho bạn.',
  concern: 'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng. Tại o2skin, chúng tôi đã thiết kế chương trình phù hợp ngay cho bạn.',
};

export type PayoffLayout = 'confetti' | 'confetti-why' | 'benefit' | 'feature';

interface PayoffOrganismProps extends PayoffSlotProps {
  layout: PayoffLayout;
  /** Extra content rendered above the main card body (used by benefit/feature variants) */
  headerSlot?: React.ReactNode;
  /** Extra content rendered in the card body (used by benefit/feature variants) */
  bodySlot?: React.ReactNode;
}

export function PayoffOrganism({ result, onContinue, layout, headerSlot, bodySlot }: PayoffOrganismProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPositive = result.condition.tone === 'positive';
  const showCanvas = layout === 'confetti' || layout === 'confetti-why';

  useEffect(() => {
    if (!showCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isPositive) return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [isPositive, showCanvas]);

  const cardAnimClass = isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter';

  return (
    <SectionShell bgVar="--lp-bg-payoff" center overflow="hidden">
      {showCanvas && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      )}
      <div
        className={`max-w-lg md:max-w-3xl w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative ${cardAnimClass}`}
        style={{ zIndex: 10 }}
      >
        {headerSlot}
        {!headerSlot && (
          <p className={`font-extrabold text-xl md:text-2xl mb-4 ${isPositive ? 'text-teal-800' : 'text-amber-900'}`}>
            {HEADERS[result.condition.tone]}
          </p>
        )}

        <StatChipGroup
          foundCount={result.foundCount}
          zoneLabel={result.zoneLabel}
          triggerNote={result.triggerNote}
        />

        {bodySlot}
        {!bodySlot && (
          <>
            <p className="text-sm md:text-base text-cta/80 leading-relaxed mb-3"
              dangerouslySetInnerHTML={{ __html: result.condition.body }} />
            <BridgeBlock>{BRIDGE[result.condition.tone]}</BridgeBlock>
          </>
        )}

        <CtaButton onClick={onContinue} fullWidth className="mt-5">
          Khám phá chương trình dành cho bạn →
        </CtaButton>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Refactor `ConfettiCardPayoff.tsx` thành thin wrapper**

```tsx
'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';

export function ConfettiCardPayoff(props: PayoffSlotProps) {
  return <PayoffOrganism {...props} layout="confetti" />;
}
```

- [ ] **Refactor `ConfettiCardWhyPayoff.tsx` thành thin wrapper**

Đọc file hiện tại, xác định copy/header khác nhau, truyền qua `headerSlot` hoặc `bodySlot` nếu cần. Minimal:

```tsx
'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';

export function ConfettiCardWhyPayoff(props: PayoffSlotProps) {
  return <PayoffOrganism {...props} layout="confetti-why" />;
}
```

- [ ] **Refactor `Benefit.tsx` và `Feature.tsx`**

Đọc từng file, nếu chúng render content đặc biệt (benefit list, feature list) thì giữ content đó và truyền qua `bodySlot`:

```tsx
// Benefit.tsx
'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';
import { BenefitContent } from './constant/Benefit'; // giữ nguyên sub-component

export function Benefit(props: PayoffSlotProps) {
  return (
    <PayoffOrganism {...props} layout="benefit" bodySlot={<BenefitContent result={props.result} />} />
  );
}
```

```tsx
// Feature.tsx — tương tự
'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';
import { FeatureContent } from './constant/Features';

export function Feature(props: PayoffSlotProps) {
  return (
    <PayoffOrganism {...props} layout="feature" bodySlot={<FeatureContent result={props.result} />} />
  );
}
```

*Lưu ý: đọc `constant/Benefit.tsx` và `constant/Features.tsx` trước để biết chúng export gì, điều chỉnh import cho đúng.*

- [ ] **TypeScript check + visual verify payoff flow**

```bash
npx tsc --noEmit
npm run dev
# Navigate: hook → minigame → payoff — verify card hiển thị đúng
```

- [ ] **Commit**

```bash
git add src/landing/organisms/PayoffOrganism.tsx src/landing/variants/payoff/
git commit -m "feat(organisms): PayoffOrganism + refactor payoff variants to thin wrappers"
```

---

### Task 9: ProgramsOrganism + refactor programs variants

**Files:**
- Create: `src/landing/organisms/ProgramsOrganism.tsx`
- Modify: `src/landing/variants/programs/GridPrograms.tsx`
- Modify: `src/landing/variants/programs/CarouselPrograms.tsx`
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx`

- [ ] **Đọc `CarouselPrograms.tsx` và `GridWithFaqPrograms.tsx`** để nắm layout + FAQ data

- [ ] **Tạo `src/landing/organisms/ProgramsOrganism.tsx`**

```tsx
'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../slots';
import type { ProgramId } from '../../content/programs';
import { getPrograms } from '../../content/catalog';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';
import { ProgramCard } from '../../components/molecules/ProgramCard';
import { FaqAccordion, type FaqItem } from '../../components/molecules/FaqAccordion';
import { trackEvent } from '../../lib/trackEvent';

export type ProgramsLayout = 'grid' | 'carousel' | 'grid-faq';

interface ProgramsOrganismProps extends ProgramsSlotProps {
  layout: ProgramsLayout;
  faqItems?: FaqItem[];
}

export function ProgramsOrganism({ suggestedProgramId, onContinue, layout, faqItems }: ProgramsOrganismProps) {
  const [selected, setSelected] = useState<ProgramId>(suggestedProgramId);
  const allPrograms = getPrograms();
  const selectedProgram = allPrograms.find(p => p.id === selected);

  return (
    <SectionShell bgVar="--lp-bg-programs" overflow="auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-5xl mb-5">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <img src="/mascots/nurse-cheer.png" alt="" className="ps-popCheer ps-floaty w-16 md:w-24 h-auto object-contain" style={{ zIndex: 20 }} />
            <h2 className="ps-fadeDown text-xl md:text-2xl font-extrabold text-cta text-center [animation-delay:0.1s]">
              Các gói dịch vụ tại O2Skin
            </h2>
            <img src="/mascots/nurse-review.png" alt="" className="ps-popCheer ps-floaty hidden sm:block w-16 md:w-24 h-auto object-contain" style={{ animationDelay: '0.2s', zIndex: 20 }} />
          </div>
        </div>

        {/* Program list — grid or carousel */}
        {layout === 'carousel' ? (
          <div className="w-full max-w-5xl flex gap-4 overflow-x-auto pb-2 mb-6 snap-x snap-mandatory">
            {allPrograms.map((program, idx) => (
              <div key={program.id} className="snap-start shrink-0 w-56 md:w-64">
                <ProgramCard
                  program={program}
                  selected={selected === program.id}
                  isSuggested={program.id === suggestedProgramId}
                  onSelect={() => setSelected(program.id)}
                  style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-5xl grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
            {allPrograms.map((program, idx) => (
              <ProgramCard
                key={program.id}
                program={program}
                selected={selected === program.id}
                isSuggested={program.id === suggestedProgramId}
                onSelect={() => setSelected(program.id)}
                style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
              />
            ))}
          </div>
        )}

        {/* FAQ section — only when layout="grid-faq" */}
        {layout === 'grid-faq' && faqItems && faqItems.length > 0 && (
          <div className="w-full max-w-5xl mb-6">
            <FaqAccordion
              items={faqItems}
              onOpen={idx => trackEvent('faq_item_open', { index: idx })}
            />
          </div>
        )}

        <CtaButton onClick={() => onContinue(selected)} variant="accent" size="md">
          {`Đăng ký chương trình ${selectedProgram?.name ?? ''} →`}
        </CtaButton>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Refactor `GridPrograms.tsx`**

```tsx
'use client';
import type { ProgramsSlotProps } from '../../slots';
import { ProgramsOrganism } from '../../organisms/ProgramsOrganism';

export function GridPrograms(props: ProgramsSlotProps) {
  return <ProgramsOrganism {...props} layout="grid" />;
}
```

- [ ] **Refactor `CarouselPrograms.tsx`**

```tsx
'use client';
import type { ProgramsSlotProps } from '../../slots';
import { ProgramsOrganism } from '../../organisms/ProgramsOrganism';

export function CarouselPrograms(props: ProgramsSlotProps) {
  return <ProgramsOrganism {...props} layout="carousel" />;
}
```

- [ ] **Refactor `GridWithFaqPrograms.tsx`**

Đọc file để lấy `FAQ_BY_CONDITION` data, chuyển thành faqItems prop:

```tsx
'use client';
import type { ProgramsSlotProps } from '../../slots';
import type { ConditionId } from '../../../content/quiz';
import { ProgramsOrganism } from '../../organisms/ProgramsOrganism';
import type { FaqItem } from '../../../components/molecules/FaqAccordion';

// Di chuyển FAQ_BY_CONDITION từ file cũ vào đây
const FAQ_BY_CONDITION: Record<ConditionId, FaqItem[]> = {
  // --- copy toàn bộ object từ GridWithFaqPrograms.tsx cũ ---
};

export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  // suggestedProgramId quyết định FAQ set nào hiển thị
  // Lấy conditionId từ suggestedProgramId nếu cần, hoặc pass tất cả FAQ
  const faqItems = FAQ_BY_CONDITION[suggestedProgramId as ConditionId] ?? [];
  return (
    <ProgramsOrganism
      suggestedProgramId={suggestedProgramId}
      onContinue={onContinue}
      layout="grid-faq"
      faqItems={faqItems}
    />
  );
}
```

*Lưu ý: `FAQ_BY_CONDITION` được index bởi `ConditionId`, nhưng `suggestedProgramId` là `ProgramId`. Đọc file cũ để hiểu logic mapping — có thể cần lấy conditionId từ minigame result thay vì từ programId.*

- [ ] **TypeScript check + visual verify programs flow**

```bash
npx tsc --noEmit
npm run dev
# Navigate đến programs screen, test grid + FAQ expand
```

- [ ] **Commit**

```bash
git add src/landing/organisms/ProgramsOrganism.tsx src/landing/variants/programs/
git commit -m "feat(organisms): ProgramsOrganism + refactor programs variants to thin wrappers"
```

---

### Task 10: ConversionOrganism + refactor conversion variants

**Files:**
- Create: `src/landing/organisms/ConversionOrganism.tsx`
- Modify: `src/landing/variants/conversion/short-form.tsx`
- Modify: `src/landing/variants/conversion/short-form-with-testimonials.tsx`

- [ ] **Đọc `short-form-with-testimonials.tsx`** để xem testimonials content

- [ ] **Tạo `src/landing/organisms/ConversionOrganism.tsx`**

Extract toàn bộ form logic từ `ShortFormConversion`, thêm `showTestimonials` prop:

```tsx
'use client';
import React, { useState } from 'react';
import type { ConversionSlotProps } from '../slots';
import { getPrograms } from '../../content/catalog';
import { branches } from '../../content/branches';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';

const PHONE_RE = /(^0[0-9]{9}$)|(^\+84[0-9]{9}$)/;
type UXState = 'idle' | 'pending' | 'error';

function PendingSpinner() {
  return (
    <svg className="inline-block animate-spin -ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8A6 6 0 0 1 2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

interface ConversionOrganismProps extends ConversionSlotProps {
  showTestimonials?: boolean;
  /** Testimonials content — rendered below form when showTestimonials=true */
  testimonialsSlot?: React.ReactNode;
}

export function ConversionOrganism({ selectedProgramId, minigameResult, onSubmit, showTestimonials, testimonialsSlot }: ConversionOrganismProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uxState, setUxState] = useState<UXState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const programName = selectedProgramId ? getPrograms().find(p => p.id === selectedProgramId)?.name : null;

  function validatePhone(val: string): boolean {
    if (!val.trim()) { setPhoneError(''); return false; }
    if (!PHONE_RE.test(val.trim())) { setPhoneError('Số điện thoại không hợp lệ (10 số, bắt đầu 0 hoặc +84)'); return false; }
    setPhoneError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uxState === 'pending') return;
    if (!name.trim() || !validatePhone(phone) || !branch) return;
    setUxState('pending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(), branch,
          skinCondition: minigameResult?.condition.label ?? '',
          programId: selectedProgramId ?? '',
          recipeId: '',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể gửi thông tin, thử lại sau.');
      onSubmit(name.trim(), phone.trim());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể gửi thông tin, thử lại sau.');
      setUxState('error');
    }
  }

  return (
    <SectionShell bgVar="--lp-bg-payoff" center overflow="hidden">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3 animate-fade-in-up"
      >
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && (
          <p className="text-sm text-cta/70 -mt-2 mb-1">
            Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.
          </p>
        )}

        <input type="text" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta" />

        <div>
          <input type="tel" placeholder="Số điện thoại" value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
            onBlur={e => validatePhone(e.target.value)} required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full" />
          {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
        </div>

        <select value={branch} onChange={e => setBranch(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta bg-white">
          <option value="" disabled>Chọn chi nhánh gần bạn</option>
          {branches.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
        </select>

        {minigameResult && (
          <div className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta/60 bg-[var(--lp-bg-hero)]">
            <div className="font-semibold text-cta">{minigameResult.condition.label}</div>
            <div className="text-[11px] mt-0.5">Dựa trên kết quả kiểm tra của bạn</div>
          </div>
        )}

        <CtaButton type="submit" fullWidth disabled={uxState === 'pending'} className="mt-2">
          {uxState === 'pending' ? <><PendingSpinner />Đang gửi...</> : 'Gửi thông tin'}
        </CtaButton>

        {uxState === 'error' && errorMessage && (
          <p className="text-xs text-red-500 text-center mt-1">{errorMessage}</p>
        )}
        <p className="text-xs text-cta/50 text-center mt-1">
          Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn.
        </p>
      </form>

      {showTestimonials && testimonialsSlot}
    </SectionShell>
  );
}
```

- [ ] **Refactor `short-form.tsx`**

```tsx
'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';

export function ShortFormConversion(props: ConversionSlotProps) {
  return <ConversionOrganism {...props} />;
}
```

- [ ] **Refactor `short-form-with-testimonials.tsx`**

Đọc file hiện tại, tách testimonials content ra `testimonialsSlot`:

```tsx
'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';

// Testimonials content — copy từ file cũ
function TestimonialsBlock() {
  // paste testimonials JSX từ file cũ vào đây
  return null; // placeholder — thay bằng nội dung thực
}

export function ShortFormWithTestimonialsConversion(props: ConversionSlotProps) {
  return (
    <ConversionOrganism
      {...props}
      showTestimonials
      testimonialsSlot={<TestimonialsBlock />}
    />
  );
}
```

- [ ] **TypeScript check + visual verify conversion form**

```bash
npx tsc --noEmit
npm run dev
# Test form submit flow — verify validation + API call hoạt động
```

- [ ] **Commit**

```bash
git add src/landing/organisms/ConversionOrganism.tsx src/landing/variants/conversion/
git commit -m "feat(organisms): ConversionOrganism + refactor conversion variants to thin wrappers"
```

---

### Task 11: Refactor hook, socialProof, done — atoms only

**Files:**
- Modify: `src/landing/variants/hook/bold-single.tsx`
- Modify: `src/landing/variants/hook/two-column.tsx`
- Modify: `src/landing/variants/socialProof/video-proof.tsx`
- Modify: `src/landing/variants/done/contact-info.tsx`
- Modify: `src/landing/variants/done/contact-info-with-video.tsx`

- [ ] **Đọc từng file, sau đó apply 3 thay đổi cho mỗi file:**

1. Thay root `<div className="h-screen w-full bg-[var(--lp-bg-*)] ...">` → `<SectionShell bgVar="--lp-bg-*" ...>`
2. Thay inline `<button className="bg-cta text-white ...">` → `<CtaButton>`
3. Thay inline `<button className="bg-[var(--lp-accent)] ...">` → `<CtaButton variant="accent">`

Ví dụ pattern cho hook/bold-single.tsx:

```tsx
// TRƯỚC:
<div className="h-screen w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
  ...
  <button onClick={onStart} className="bg-cta text-white font-bold ...">
    Bắt đầu kiểm tra da →
  </button>
</div>

// SAU:
import { SectionShell } from '../../../components/atoms/SectionShell';
import { CtaButton } from '../../../components/atoms/CtaButton';

<SectionShell bgVar="--lp-bg-hero" center>
  ...
  <CtaButton onClick={onStart} fullWidth>
    Bắt đầu kiểm tra da →
  </CtaButton>
</SectionShell>
```

- [ ] **TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Commit**

```bash
git add src/landing/variants/hook/ src/landing/variants/socialProof/ src/landing/variants/done/
git commit -m "refactor(variants): use CtaButton and SectionShell atoms in hook/socialProof/done"
```

---

### Task 12: Final verification

- [ ] **Full TypeScript check**

```bash
npx tsc --noEmit
```

Expected: 0 errors.

- [ ] **Build check**

```bash
npm run build
```

Expected: build thành công, no warnings về missing exports.

- [ ] **Visual end-to-end flow**

```bash
npm run dev
```

Navigate toàn bộ flow:
1. `http://localhost:3000` — hook screen hiển thị đúng theme blossom
2. Click CTA → minigame screen
3. Complete minigame → payoff screen (confetti + StatChipGroup + BridgeBlock)
4. Click tiếp → programs screen (grid hoặc carousel, ProgramCard selectable)
5. Click đăng ký → conversion form (validate phone, branch dropdown)
6. Submit → done screen

Verify: không có hardcoded `bg-amber-50`, `text-amber-900`, `bg-violet-50` trong variant files (chỉ được có trong organisms hoặc atoms).

- [ ] **Kiểm tra không còn hardcode trong variant files**

```bash
# Tìm hardcoded Tailwind color utilities còn sót trong variant files
grep -rn "bg-amber\|bg-violet\|bg-red\|bg-green\|text-amber\|text-violet" src/landing/variants/
```

Expected: không có kết quả (hoặc chỉ ở trong file constant/ nếu có lý do đặc biệt).

- [ ] **Commit cuối**

```bash
git add -A
git commit -m "refactor(landing): complete Design Tokens + Atomic Design refactor

- tokens/themes/*.json: DTCG source of truth for all 5 themes
- scripts/build-tokens.mjs: generates themes.css from tokens
- src/components/atoms/: CtaButton, SectionShell, ColoredDot, StatChip
- src/components/molecules/: ProgramCard, FaqAccordion, BridgeBlock, StatChipGroup
- src/landing/organisms/: PayoffOrganism, ProgramsOrganism, ConversionOrganism
- variant files: thin wrappers passing SlotProps to organisms"
```
