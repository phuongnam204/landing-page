# Next.js Migration + Minigame Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the landing page from Astro + React islands to a pure Next.js App Router app, and replace the 6-question trắc nghiệm quiz with a hidden-object "Soi Da Tìm Bạn Nhỏ" minigame, per `docs/superpowers/specs/2026-07-02-nextjs-migration-design.md` and `docs/superpowers/specs/2026-07-02-minigame-redesign-design.md`.

**Architecture:** Next.js App Router hosts a single client-rendered route (`src/app/page.tsx` → `AppFlow`), preserving today's single-route site. `AppFlow.tsx` keeps orchestrating step transitions (hero → minigame → payoff → programs → conversion → done), but the quiz step is replaced by a new `SkinScanScreen` component backed by `src/components/MinigameCore/skinScanLogic.ts`, which generates a randomized board of 8 hidden mascot characters and derives one of the five existing skin-profile results by tallying which character type appears most.

**Tech Stack:** Next.js (App Router), React 19, TypeScript, Tailwind CSS 3, Vitest, next/font.

---

## Task 1: Remove Astro, install Next.js

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Uninstall Astro packages**

Run: `npm uninstall astro @astrojs/react @astrojs/tailwind @astrojs/check`
Expected: package.json `dependencies`/`devDependencies` no longer list these four packages.

- [ ] **Step 2: Install Next.js**

Run: `npm install next@latest`
Expected: `next` appears under `dependencies` in package.json, `react`/`react-dom` stay at their existing 19.x versions (npm will bump only if a peer dependency requires it).

- [ ] **Step 3: Update npm scripts**

Edit `package.json` so the `scripts` block reads:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "test": "vitest run"
}
```

Remove the `"astro": "astro"` entry entirely (no longer needed).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: swap Astro for Next.js in package.json"
```

---

## Task 2: Add Next.js TypeScript config

**Files:**
- Modify: `tsconfig.json`
- Create: `next-env.d.ts`

- [ ] **Step 1: Replace tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 2: Create next-env.d.ts**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json next-env.d.ts
git commit -m "chore: switch tsconfig to Next.js defaults"
```

---

## Task 3: Add next.config.mjs, remove astro.config.mjs, clean build artifacts

**Files:**
- Create: `next.config.mjs`
- Delete: `astro.config.mjs`
- Modify: `.gitignore`

- [ ] **Step 1: Create next.config.mjs**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
```

(`ignoreDuringBuilds` avoids `next build` prompting to set up ESLint, since this project has no ESLint config and doesn't use one today.)

- [ ] **Step 2: Delete astro.config.mjs**

Delete the file `astro.config.mjs`.

- [ ] **Step 3: Update .gitignore**

Replace the `.astro/` line with `.next/`, and remove the now-unused `dist/` line (Next.js never writes there). The relevant block should read:

```
node_modules/
.next/
.env
.env.production
.superpowers/
.claude/
```

- [ ] **Step 4: Remove stale build directories**

Run: `rm -rf .astro dist`
Expected: both directories are gone from the working tree (they were gitignored build output, safe to delete).

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs .gitignore
git rm astro.config.mjs
git commit -m "chore: add next.config.mjs, remove astro.config.mjs"
```

---

## Task 4: Move global CSS into the Next.js app directory

**Files:**
- Create: `src/app/globals.css`
- Delete: `src/styles/global.css`
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Create src/app/globals.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  overflow: hidden;
}

html {
  scroll-behavior: smooth;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}

html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }

/* Hero skin texture — light: subtle multiply, dark: glowing screen */
.hero-texture {
  opacity: 0.09;
  mix-blend-mode: multiply;
}
@media (prefers-color-scheme: dark) {
  .hero-texture {
    opacity: 0.28;
    mix-blend-mode: screen;
  }
}

@keyframes payoffShake {
  0%,100% { transform: translateX(0); }
  18%      { transform: translateX(-6px); }
  36%      { transform: translateX(6px); }
  54%      { transform: translateX(-4px); }
  72%      { transform: translateX(4px); }
  88%      { transform: translateX(-2px); }
}
.payoff-concern-enter {
  animation: fadeInUp 0.5s ease-out both, payoffShake 420ms 0.5s ease both;
}
```

Note: the `body { font-family: ... }` rule and `.quiz-slide-in` keyframes from the old file are intentionally dropped — font is now applied via `next/font` + Tailwind in Task 5, and `.quiz-slide-in` was only used by the quiz screen being removed in Task 10.

- [ ] **Step 2: Delete src/styles/global.css**

Delete the file `src/styles/global.css` (and the now-empty `src/styles` directory).

- [ ] **Step 3: Update tailwind.config.mjs**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cta: '#2D2640',
        'pastel-pink': '#FFD3E0',
        'pastel-lavender': '#C7CEEA',
        'pastel-mint': '#A8E6CF',
        'border-pink': '#FFB8CE',
        'border-mint': '#9FE6BD',
        'border-lavender': '#B6BCEE',
        'label-purple': '#9b8fc4',
      },
      fontFamily: {
        sans: ['var(--font-be-vietnam-pro)', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        soft: '20px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css tailwind.config.mjs
git rm -r src/styles
git commit -m "chore: move global CSS into src/app, drop stale font-family rule"
```

---

## Task 5: Create the Next.js root layout

**Files:**
- Create: `src/app/layout.tsx`
- Delete: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create src/app/layout.tsx**

```tsx
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '700', '800'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: 'Tìm giải pháp cho làn da của bạn',
  description: 'Khám phá vấn đề da của bạn qua một minigame ngắn để tìm ra giải pháp chăm sóc da phù hợp.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className="overflow-x-hidden font-sans">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Delete src/layouts/BaseLayout.astro**

Delete the file `src/layouts/BaseLayout.astro` (and the now-empty `src/layouts` directory).

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx
git rm -r src/layouts
git commit -m "feat: add Next.js root layout with next/font"
```

---

## Task 6: Create the Next.js home page

**Files:**
- Create: `src/app/page.tsx`
- Delete: `src/pages/index.astro`

- [ ] **Step 1: Create src/app/page.tsx**

```tsx
import AppFlow from '../components/AppFlow';

export default function Home() {
  return <AppFlow />;
}
```

- [ ] **Step 2: Delete src/pages/index.astro**

Delete the file `src/pages/index.astro` (and the now-empty `src/pages` directory).

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git rm -r src/pages
git commit -m "feat: add Next.js home page rendering AppFlow"
```

---

## Task 7: Verify the Next.js scaffold with the existing quiz flow

This checkpoint confirms the Next.js setup itself is correct (fonts, Tailwind, layout, routing) using the current app content, before the minigame swap in later tasks changes application logic.

**Files:**
- Modify: `src/components/AppFlow.tsx:1`

- [ ] **Step 1: Add the 'use client' directive**

Add this as the very first line of `src/components/AppFlow.tsx` (before the existing `import React, ...` line):

```tsx
'use client';
```

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`
Expected: server starts on `http://localhost:3000` with no build errors in the terminal.

- [ ] **Step 3: Manually verify the full flow in a browser**

Open `http://localhost:3000` and confirm, in order: the Hero screen renders with the gradient headline and both portrait images; clicking "Khám phá ngay" opens the 6-question quiz with a working progress bar; answering all questions reaches the PayoffView with the confetti/particle canvas animation; "Xem chương trình phù hợp" opens ProgramsScreen; selecting a program and continuing opens the ConversionForm; submitting name+phone reaches the DoneScreen. Also confirm dark mode (OS-level dark mode toggle) still switches the hero gradient and texture as before.

- [ ] **Step 4: Stop the dev server and commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "chore: mark AppFlow as a client component for Next.js"
```

---

## Task 8: Write skinScanLogic.ts (board generation + result derivation)

**Files:**
- Create: `src/components/MinigameCore/skinScanLogic.ts`
- Test: `src/components/MinigameCore/skinScanLogic.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest';
import { generateBoard, computeResultFromBoard, type BoardCharacter, type CharacterKind } from './skinScanLogic';

describe('generateBoard', () => {
  it('always produces exactly 8 characters, all unfound, at unique positions', () => {
    for (let trial = 0; trial < 50; trial++) {
      const board = generateBoard();
      expect(board).toHaveLength(8);
      expect(board.every((c) => !c.found)).toBe(true);
      const positions = new Set(board.map((c) => `${c.x},${c.y}`));
      expect(positions.size).toBe(8);
    }
  });

  it('distribution is always either 3-2-2-1 (dominant kind) or 2-2-2-2 (tie)', () => {
    for (let trial = 0; trial < 200; trial++) {
      const board = generateBoard();
      const counts: Partial<Record<CharacterKind, number>> = {};
      for (const c of board) counts[c.kind] = (counts[c.kind] ?? 0) + 1;
      expect(Object.keys(counts)).toHaveLength(4);
      const values = Object.values(counts).sort((a, b) => (b as number) - (a as number));
      const isDominant = values.join(',') === '3,2,2,1';
      const isTie = values.join(',') === '2,2,2,2';
      expect(isDominant || isTie).toBe(true);
    }
  });
});

describe('computeResultFromBoard', () => {
  function boardWithCounts(counts: Partial<Record<CharacterKind, number>>): BoardCharacter[] {
    const board: BoardCharacter[] = [];
    let i = 0;
    for (const [kind, count] of Object.entries(counts)) {
      for (let j = 0; j < (count ?? 0); j++) {
        board.push({ id: `c${i++}`, kind: kind as CharacterKind, x: 0, y: 0, found: true });
      }
    }
    return board;
  }

  it('returns da-nhon-mun-viem when mun-viem dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 3, 'dau-den': 2, 'man-do': 2, 'da-sang-khoe': 1 });
    expect(computeResultFromBoard(board).id).toBe('da-nhon-mun-viem');
  });

  it('returns lo-chan-long when dau-den dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 3, 'man-do': 2, 'da-sang-khoe': 1 });
    expect(computeResultFromBoard(board).id).toBe('lo-chan-long');
  });

  it('returns da-nhay-cam when man-do dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 1, 'man-do': 3, 'da-sang-khoe': 2 });
    expect(computeResultFromBoard(board).id).toBe('da-nhay-cam');
  });

  it('returns clean-skin when da-sang-khoe dominates', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 2, 'man-do': 1, 'da-sang-khoe': 3 });
    expect(computeResultFromBoard(board).id).toBe('clean-skin');
  });

  it('returns da-moi-bat-dau fallback on a tie', () => {
    const board = boardWithCounts({ 'mun-viem': 2, 'dau-den': 2, 'man-do': 2, 'da-sang-khoe': 2 });
    expect(computeResultFromBoard(board).id).toBe('da-moi-bat-dau');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run src/components/MinigameCore/skinScanLogic.test.ts`
Expected: FAIL — `Cannot find module './skinScanLogic'` (the module doesn't exist yet).

- [ ] **Step 3: Write the implementation**

```ts
import { quizResults, type QuizResult } from '../../content/quiz';

export type CharacterKind = 'mun-viem' | 'dau-den' | 'man-do' | 'da-sang-khoe';

export interface BoardCharacter {
  id: string;
  kind: CharacterKind;
  x: number;
  y: number;
  found: boolean;
}

const ALL_KINDS: CharacterKind[] = ['mun-viem', 'dau-den', 'man-do', 'da-sang-khoe'];

const DOMINANT_WEIGHTS: Record<CharacterKind, number> = {
  'mun-viem': 0.275,
  'dau-den': 0.275,
  'man-do': 0.275,
  'da-sang-khoe': 0.175,
};

const TIE_ROUND_CHANCE = 0.1;

const BOARD_SLOTS: { x: number; y: number }[] = [
  { x: 15, y: 22 },
  { x: 38, y: 15 },
  { x: 62, y: 20 },
  { x: 85, y: 25 },
  { x: 20, y: 68 },
  { x: 42, y: 78 },
  { x: 65, y: 65 },
  { x: 83, y: 72 },
];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function pickDominantKind(): CharacterKind {
  const roll = Math.random();
  let cumulative = 0;
  for (const kind of ALL_KINDS) {
    cumulative += DOMINANT_WEIGHTS[kind];
    if (roll <= cumulative) return kind;
  }
  return ALL_KINDS[ALL_KINDS.length - 1];
}

function generateCounts(): Record<CharacterKind, number> {
  const counts = { 'mun-viem': 0, 'dau-den': 0, 'man-do': 0, 'da-sang-khoe': 0 } as Record<CharacterKind, number>;
  if (Math.random() < TIE_ROUND_CHANCE) {
    for (const kind of ALL_KINDS) counts[kind] = 2;
    return counts;
  }
  const dominant = pickDominantKind();
  const others = shuffle(ALL_KINDS.filter((kind) => kind !== dominant));
  counts[dominant] = 3;
  counts[others[0]] = 2;
  counts[others[1]] = 2;
  counts[others[2]] = 1;
  return counts;
}

export function generateBoard(): BoardCharacter[] {
  const counts = generateCounts();
  const kinds: CharacterKind[] = [];
  for (const kind of ALL_KINDS) {
    for (let i = 0; i < counts[kind]; i++) kinds.push(kind);
  }
  const shuffledKinds = shuffle(kinds);
  const positions = shuffle(BOARD_SLOTS);
  return shuffledKinds.map((kind, index) => ({
    id: `${kind}-${index}`,
    kind,
    x: positions[index].x,
    y: positions[index].y,
    found: false,
  }));
}

const KIND_TO_PROFILE_ID: Record<CharacterKind, string> = {
  'mun-viem': 'da-nhon-mun-viem',
  'dau-den': 'lo-chan-long',
  'man-do': 'da-nhay-cam',
  'da-sang-khoe': 'clean-skin',
};

export function computeResultFromBoard(board: BoardCharacter[]): QuizResult {
  const counts = { 'mun-viem': 0, 'dau-den': 0, 'man-do': 0, 'da-sang-khoe': 0 } as Record<CharacterKind, number>;
  for (const character of board) {
    counts[character.kind] += 1;
  }
  const maxCount = Math.max(...ALL_KINDS.map((kind) => counts[kind]));
  const leaders = ALL_KINDS.filter((kind) => counts[kind] === maxCount);
  if (leaders.length !== 1) {
    return quizResults['da-moi-bat-dau'];
  }
  return quizResults[KIND_TO_PROFILE_ID[leaders[0]]];
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run src/components/MinigameCore/skinScanLogic.test.ts`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/MinigameCore/skinScanLogic.ts src/components/MinigameCore/skinScanLogic.test.ts
git commit -m "feat: add skin-scan board generation and result logic"
```

---

## Task 9: Build the SkinScanScreen component

**Files:**
- Create: `src/components/SkinScanScreen.tsx`

- [ ] **Step 1: Write the component**

```tsx
'use client';

import { useRef, useState, type CSSProperties } from 'react';
import {
  generateBoard,
  computeResultFromBoard,
  type BoardCharacter,
  type CharacterKind,
} from './MinigameCore/skinScanLogic';
import type { QuizResult } from '../content/quiz';

const TOTAL_CHARACTERS = 8;
const CATCH_RADIUS = 9;

type EarShape = 'flame' | 'straight' | 'petal';

const CHARACTER_VISUALS: Record<
  CharacterKind,
  { top: string; bottom: string; ear: string; gem: string; earShape: EarShape; glow?: boolean }
> = {
  'mun-viem': { top: '#FF8177', bottom: '#E5544A', ear: '#E53935', gem: '#FFC94D', earShape: 'flame' },
  'dau-den': { top: '#B0A99F', bottom: '#8D8378', ear: '#8D8378', gem: '#6D4C41', earShape: 'straight' },
  'man-do': { top: '#FFD3E0', bottom: '#FFB6C9', ear: '#FFB6C9', gem: '#FFC94D', earShape: 'petal' },
  'da-sang-khoe': { top: '#C2F0DC', bottom: '#8FE3BC', ear: '#8FE3BC', gem: '#FFC94D', earShape: 'petal', glow: true },
};

function earStyle(shape: EarShape, color: string, side: 'left' | 'right'): CSSProperties {
  const rotate = side === 'left' ? -30 : 30;
  const base: CSSProperties = {
    position: 'absolute',
    [side]: '2px',
    top: '-2px',
    background: color,
    transform: `rotate(${rotate}deg)`,
  };
  if (shape === 'flame') {
    return { ...base, width: '14px', height: '20px', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' };
  }
  if (shape === 'straight') {
    return { ...base, width: '6px', height: '18px', borderRadius: '3px' };
  }
  return {
    ...base,
    width: '10px',
    height: '20px',
    borderRadius: side === 'left' ? '100% 0 100% 30%' : '0 100% 30% 100%',
  };
}

function findNearestUnfound(board: BoardCharacter[], x: number, y: number): BoardCharacter | null {
  let nearest: BoardCharacter | null = null;
  let nearestDist = Infinity;
  for (const character of board) {
    if (character.found) continue;
    const dist = Math.hypot(character.x - x, character.y - y);
    if (dist <= CATCH_RADIUS && dist < nearestDist) {
      nearest = character;
      nearestDist = dist;
    }
  }
  return nearest;
}

export function SkinScanScreen({ onComplete }: { onComplete: (result: QuizResult) => void }) {
  const [board, setBoard] = useState<BoardCharacter[]>(() => generateBoard());
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const boardRef = useRef<HTMLDivElement>(null);
  const boardStateRef = useRef(board);
  boardStateRef.current = board;

  const foundCount = board.filter((c) => c.found).length;

  function handlePointer(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const nearest = findNearestUnfound(boardStateRef.current, x, y);
    if (!nearest) {
      setLensPos({ x, y });
      return;
    }
    setLensPos({ x: nearest.x, y: nearest.y });
    const nextBoard = boardStateRef.current.map((c) =>
      c.id === nearest.id ? { ...c, found: true } : c
    );
    boardStateRef.current = nextBoard;
    setBoard(nextBoard);
    if (nextBoard.every((c) => c.found)) {
      onComplete(computeResultFromBoard(nextBoard));
    }
  }

  return (
    <div className="h-screen w-full bg-pastel-mint flex flex-col items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full">
        <div className="text-xs font-bold text-label-purple uppercase mb-1">
          Đã tìm {foundCount} / {TOTAL_CHARACTERS}
        </div>
        <div className="h-[5px] bg-violet-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full"
            style={{ width: `${(foundCount / TOTAL_CHARACTERS) * 100}%`, transition: 'width 300ms ease' }}
          />
        </div>
        <div
          ref={boardRef}
          onPointerDown={(e) => handlePointer(e.clientX, e.clientY)}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            handlePointer(e.clientX, e.clientY);
          }}
          className="relative w-full aspect-[4/3] rounded-soft overflow-hidden touch-none select-none"
          style={{ background: 'radial-gradient(circle at 30% 30%, #FFE3D0 0%, #FBCFA0 40%, #F5B98A 100%)' }}
        >
          {board.map((character) => (
            <MascotCharacter key={character.id} character={character} />
          ))}
          <div
            className="absolute rounded-full border-4 border-cta pointer-events-none"
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
              width: '84px',
              height: '84px',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.25)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            }}
          />
        </div>
        <p className="text-xs text-cta/50 text-center mt-3">👆 Chạm và kéo kính lúp khắp vùng da</p>
      </div>
    </div>
  );
}

function MascotCharacter({ character }: { character: BoardCharacter }) {
  const visual = CHARACTER_VISUALS[character.kind];
  return (
    <div
      className="absolute"
      style={{
        left: `${character.x}%`,
        top: `${character.y}%`,
        transform: 'translate(-50%, -50%)',
        width: '46px',
        height: '58px',
        opacity: character.found ? 1 : 0.12,
        transition: 'opacity 200ms ease',
      }}
    >
      <div style={earStyle(visual.earShape, visual.ear, 'left')} />
      <div style={earStyle(visual.earShape, visual.ear, 'right')} />
      {visual.glow && (
        <span style={{ position: 'absolute', left: '-2px', top: '-10px', fontSize: '10px' }}>✨</span>
      )}
      <div
        style={{
          position: 'absolute',
          left: '7px',
          top: '10px',
          width: '32px',
          height: '24px',
          background: visual.top,
          clipPath: 'polygon(50% 0%, 100% 34%, 80% 100%, 20% 100%, 0% 34%)',
        }}
      >
        <div style={{ position: 'absolute', left: '9px', top: '10px', width: '4px', height: '5px', background: '#2D2640', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: '9px', top: '10px', width: '4px', height: '5px', background: '#2D2640', borderRadius: '50%' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '32px',
          width: '24px',
          height: '26px',
          background: `linear-gradient(to bottom, ${visual.top} 55%, ${visual.bottom} 100%)`,
          borderRadius: '14px 14px 12px 12px',
          boxShadow: visual.glow ? `0 0 10px 2px ${visual.bottom}` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: '9px',
            width: '8px',
            height: '8px',
            background: visual.gem,
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
          }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SkinScanScreen.tsx
git commit -m "feat: add SkinScanScreen hidden-object minigame component"
```

(No automated test for this file — it's a UI component, consistent with the rest of the codebase where screens like `HeroScreen`/`PayoffView`/`ConversionForm` are verified manually rather than unit tested. It gets wired in and manually verified in Task 10.)

---

## Task 10: Wire SkinScanScreen into AppFlow, trim old quiz content

**Files:**
- Modify: `src/components/AppFlow.tsx`
- Modify: `src/content/quiz.ts`

- [ ] **Step 1: Trim src/content/quiz.ts**

Replace the entire file content with:

```ts
export type ProgramId = 'khoi-dau' | 'toan-dien' | 'chuyen-sau';
export type Tone = 'positive' | 'concern';

export interface QuizResult {
  id: string;
  tone: Tone;
  body: string; // HTML fragment — internal data only, never user input
  solution: string;
  suggestedProgram: ProgramId;
}

export const quizResults: Record<string, QuizResult> = {
  'clean-skin': {
    id: 'clean-skin',
    tone: 'positive',
    body: 'Da bạn <b>đang ổn định</b> — chưa có dấu hiệu mụn viêm hay lỗ chân lông to rõ ràng. Đây là nền tảng tốt để xây dựng thói quen chăm sóc da bền vững.',
    solution:
      'Xây dựng routine đơn giản: cleanser nhẹ, moisturizer phù hợp da, SPF hàng ngày. Phòng ngừa tốt hơn điều trị.',
    suggestedProgram: 'khoi-dau',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    tone: 'concern',
    body: 'Da bạn <b>nhạy cảm, dễ kích ứng</b> — dễ nổi mẩn đỏ, ửng đỏ từng mảng khi thay đổi thời tiết hoặc dùng sản phẩm không phù hợp.',
    solution:
      'Phục hồi hàng rào bảo vệ da (ceramide, niacinamide) trước, sau đó mới điều trị chuyên sâu. Tránh acid mạnh và scrub vật lý.',
    suggestedProgram: 'toan-dien',
  },
  'da-nhon-mun-viem': {
    id: 'da-nhon-mun-viem',
    tone: 'concern',
    body: 'Da bạn <b>nhờn + mụn viêm</b> — tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm liên tục đặc biệt vùng chữ T.',
    solution:
      'Kiểm soát dầu + kháng khuẩn nhẹ, BHA thông tắc lỗ chân lông, niacinamide giảm bã nhờn.',
    suggestedProgram: 'chuyen-sau',
  },
  'lo-chan-long': {
    id: 'lo-chan-long',
    tone: 'concern',
    body: 'Da bạn có <b>lỗ chân lông to + mụn đầu đen</b> — không có mụn viêm nhưng lỗ chân lông rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm.',
    solution:
      'Exfoliating routine nhẹ (BHA 1–2%), clay mask 1–2 lần/tuần. Không cần kháng sinh hay kháng viêm.',
    suggestedProgram: 'khoi-dau',
  },
  'da-moi-bat-dau': {
    id: 'da-moi-bat-dau',
    tone: 'positive',
    body: 'Da bạn <b>chưa có routine rõ ràng</b> — chưa có dấu hiệu cụ thể hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.',
    solution:
      'Bắt đầu từ basic routine: cleanser nhẹ + moisturizer + SPF. Tư vấn 1:1 để xác định nhu cầu.',
    suggestedProgram: 'khoi-dau',
  },
};
```

Note: `mun-noi-tiet` is removed (folded into `da-nhon-mun-viem`, per the minigame spec — the two are visually indistinguishable). The `da-nhay-cam` copy is reworded from the old behavior-based description ("da căng rát sau rửa mặt... dùng sản phẩm") to the new visually-observed framing ("nổi mẩn đỏ, ửng đỏ từng mảng"), matching the Mẩn Đỏ/Kích Ứng mascot.

- [ ] **Step 2: Update imports at the top of AppFlow.tsx**

Replace lines 2-4 (the four import lines after `'use client';` and the `import React...` line):

```tsx
import { quizQuestions, q6Options } from '../content/quiz';
import type { QuizResult, ProgramId } from '../content/quiz';
import { computeResult } from './InteractiveCore/quizLogic';
import { trackEvent } from '../lib/trackEvent';
```

with:

```tsx
import type { QuizResult, ProgramId } from '../content/quiz';
import { SkinScanScreen } from './SkinScanScreen';
import { trackEvent } from '../lib/trackEvent';
```

- [ ] **Step 3: Rename the 'quiz' step to 'minigame'**

Change:

```tsx
type Step = 'hero' | 'quiz' | 'payoff' | 'programs' | 'conversion' | 'done';
```

to:

```tsx
type Step = 'hero' | 'minigame' | 'payoff' | 'programs' | 'conversion' | 'done';
```

- [ ] **Step 4: Replace the AppFlow component body**

Replace the entire `AppFlow` function (from `export default function AppFlow()` through its closing `}`, i.e. everything that was between the type alias and the `// ─── Screens ───` comment) with:

```tsx
export default function AppFlow() {
  const [step, setStep] = useState<Step>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);

  function transitionTo(nextStep: Step) {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }

  const containerClass = `transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`;

  return (
    <div className={containerClass}>
      {step === 'hero' && <HeroScreen onStart={() => transitionTo('minigame')} />}

      {step === 'minigame' && (
        <SkinScanScreen
          onComplete={(result) => {
            setQuizResult(result);
            setSelectedProgram(result.suggestedProgram);
            trackEvent('minigame_complete', { resultId: result.id });
            transitionTo('payoff');
          }}
        />
      )}

      {step === 'payoff' && quizResult && (
        <PayoffView
          result={quizResult}
          onContinue={() => {
            trackEvent('payoff_view', { resultId: quizResult.id });
            transitionTo('programs');
          }}
        />
      )}

      {step === 'programs' && (
        <ProgramsScreen
          initialSelected={selectedProgram ?? 'khoi-dau'}
          onContinue={(programId) => {
            setSelectedProgram(programId);
            transitionTo('conversion');
          }}
        />
      )}

      {step === 'conversion' && (
        <ConversionForm
          selectedProgram={selectedProgram}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { name, phone, program: selectedProgram });
            transitionTo('done');
          }}
        />
      )}

      {step === 'done' && <DoneScreen />}
    </div>
  );
}
```

- [ ] **Step 5: Delete the QuizScreen function**

Delete the entire `QuizScreen` function (the block starting at `function QuizScreen({` and ending at its closing `}`, immediately before the `// ─── PayoffView helpers ───` comment).

- [ ] **Step 6: Make PAYOFF_HEADERS gender-neutral**

Replace:

```tsx
const PAYOFF_HEADERS: Record<'positive' | 'concern', Record<'nu' | 'nam', string>> = {
  positive: {
    nu: 'Tuyệt vời cô gái, da bạn đang rất khỏe! 🌸',
    nam: 'Tuyệt vời chàng trai, da bạn đang rất khỏe! 💪',
  },
  concern: {
    nu: 'Hmm cô gái ơi, có điều bạn cần biết về da mình... 😟',
    nam: 'Hmm chàng trai ơi, có điều bạn cần biết về da mình... 😟',
  },
};
```

with:

```tsx
const PAYOFF_HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe! 🌸',
  concern: 'Hmm, có điều bạn cần biết về da mình... 😟',
};
```

(The gender-specific copy is dropped because the minigame no longer collects a gender signal — see `docs/superpowers/specs/2026-07-02-minigame-redesign-design.md`.)

- [ ] **Step 7: Update PayoffView to drop the gender prop**

Replace the `PayoffView` function signature and header lookup:

```tsx
function PayoffView({
  result,
  gender,
  onContinue,
}: {
  result: QuizResult;
  gender: 'nu' | 'nam';
  onContinue: () => void;
}) {
```

with:

```tsx
function PayoffView({
  result,
  onContinue,
}: {
  result: QuizResult;
  onContinue: () => void;
}) {
```

and replace:

```tsx
  const header = PAYOFF_HEADERS[result.tone][gender];
```

with:

```tsx
  const header = PAYOFF_HEADERS[result.tone];
```

(The rest of the `PayoffView` function body — the canvas effect, `bridge`, `isPositive`, and the returned JSX — stays exactly as-is.)

- [ ] **Step 8: Run the dev server and manually verify**

Run: `npm run dev`
Open `http://localhost:3000` and confirm: Hero → clicking "Khám phá ngay" opens the new hidden-object board with 8 faint mascot shapes and a "Đã tìm 0 / 8" counter; dragging across the board reveals mascots as the lens passes near them and the counter increments; after the 8th is found, the screen automatically transitions to PayoffView with a header that no longer mentions "cô gái"/"chàng trai"; the rest of the flow (Programs → ConversionForm → Done) still works unchanged.

- [ ] **Step 9: Commit**

```bash
git add src/components/AppFlow.tsx src/content/quiz.ts
git commit -m "feat: replace quiz screen with SkinScanScreen minigame"
```

---

## Task 11: Remove the old quiz logic module

**Files:**
- Delete: `src/components/InteractiveCore/quizLogic.ts`
- Delete: `src/components/InteractiveCore/quizLogic.test.ts`

- [ ] **Step 1: Delete the old logic and test files**

Delete `src/components/InteractiveCore/quizLogic.ts` and `src/components/InteractiveCore/quizLogic.test.ts` (and the now-empty `src/components/InteractiveCore` directory).

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS — only `skinScanLogic.test.ts` tests run (the old `quizLogic.test.ts` is gone), no leftover references to the deleted module anywhere.

- [ ] **Step 3: Commit**

```bash
git rm -r src/components/InteractiveCore
git commit -m "chore: remove old quizLogic module, superseded by skinScanLogic"
```

---

## Task 12: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all `skinScanLogic.test.ts` tests green, no other test files remain.

- [ ] **Step 2: Run a production build**

Run: `npm run build`
Expected: PASS — Next.js reports the home route as prerendered (static), no TypeScript or build errors.

- [ ] **Step 3: Run the production server and do a full manual walkthrough**

Run: `npm start`
Open `http://localhost:3000` and walk the entire flow once more end-to-end: Hero → SkinScanScreen (drag to find all 8 mascots) → PayoffView → ProgramsScreen → ConversionForm → DoneScreen. Confirm no console errors in the browser dev tools.

- [ ] **Step 4: Confirm git status is clean**

Run: `git status`
Expected: working tree clean, no untracked Astro leftovers (`.astro/`, `dist/`), no uncommitted changes.
