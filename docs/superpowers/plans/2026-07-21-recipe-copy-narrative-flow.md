# Recipe Copy Layer — Narrative Flow Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tách text hardcode ra khỏi component JSX vào một `copy` layer trong Recipe, đồng thời fix narrative flow của v23.

**Architecture:** Tạo `src/landing/copy.ts` định nghĩa types. `Recipe` type nhận thêm `copy?: RecipeCopy`. Mỗi slot props nhận `copy?` tương ứng. `LandingFlow` chuyển tiếp copy từ recipe xuống component. Mỗi component giữ `DEFAULT_COPY` const làm fallback — recipe chỉ override field nào cần thay đổi.

**Tech Stack:** TypeScript, Next.js App Router, React 19, Vitest (test hiện tại cho validateRecipe/registry)

---

## File Map

| File | Hành động | Mục đích |
|------|-----------|----------|
| `src/landing/copy.ts` | Tạo mới | Schema types cho copy layer |
| `src/landing/validateRecipe.ts` | Sửa | Thêm `copy?: RecipeCopy` vào `Recipe` |
| `src/landing/slots.ts` | Sửa | Thêm `copy?` vào 3 slot props |
| `src/landing/LandingFlow.tsx` | Sửa | Truyền `recipe.copy?.slot` xuống component |
| `src/landing/variants/hook/electric/soft-dark.tsx` | Sửa | DEFAULT_COPY + dùng `c.*` trong JSX |
| `src/landing/variants/minigame/electric/soft-swipe.tsx` | Sửa | DEFAULT_COPY + dùng `c.*` trong 4 phase |
| `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx` | Sửa | Forward `copy?.resultCard` xuống ResultCard |
| `src/landing/variants/payoff/result-layouts/ResultCard.tsx` | Sửa | Nhận `copy?` prop, thay HEADERS const |
| `src/landing/recipes/v23-electric-soft-dark.ts` | Sửa | Thêm `copy` block với narrative mới |

---

## Task 1: Tạo copy type schema

**Files:**
- Create: `src/landing/copy.ts`

- [ ] **Tạo file `src/landing/copy.ts` với nội dung sau:**

```ts
export type HookCopy = {
  badge?:         string;
  heading?:       string;
  headingAccent?: string;
  subtext?:       string;
  cta?:           string;
  hookImage?:     string;   // path đến ảnh hero — component dùng làm fallback '/face-map-hook.svg'
};

export type MinigameCopy = {
  intro?:    { heading?: string; subtext?: string; cta?: string };
  wheel?:    { heading?: string; subtext?: string };
  faceMap?:  { heading?: string; subtext?: string };
  scanning?: { heading?: string };
};

export type PayoffCopy = {
  resultCard?: {
    concern?:  string;
    positive?: string;
  };
};

export type RecipeCopy = {
  hook?:     HookCopy;
  minigame?: MinigameCopy;
  payoff?:   PayoffCopy;
};
```

- [ ] **Verify file tồn tại:**

```bash
npx tsc --noEmit 2>&1 | head -5
```

Expected: không có lỗi liên quan đến `copy.ts`.

- [ ] **Commit:**

```bash
git add src/landing/copy.ts
git commit -m "feat(copy): add copy type schema for recipe narrative layer"
```

---

## Task 2: Thêm `copy` vào Recipe type và slot contracts

**Files:**
- Modify: `src/landing/validateRecipe.ts`
- Modify: `src/landing/slots.ts`

- [ ] **Sửa `src/landing/validateRecipe.ts` — thêm import và field `copy`:**

Thêm import ở đầu file (trước `export type RecipeSlots`):

```ts
import type { RecipeCopy } from './copy';
```

Thêm `copy?: RecipeCopy;` vào `Recipe` type:

```ts
export type Recipe = {
  id: string;
  label: string;
  theme?: string;
  chipColor?: { bg: string; text: string; label: string };
  slots: RecipeSlots;
  copy?: RecipeCopy;
};
```

- [ ] **Sửa `src/landing/slots.ts` — thêm import và copy props:**

Thêm import ở cuối phần imports hiện tại (sau import `ScoredProgram`):

```ts
import type { HookCopy, MinigameCopy, PayoffCopy } from './copy';
```

Sửa 3 slot props:

```ts
export type HookSlotProps = {
  onStart: () => void;
  copy?: HookCopy;
};

export type MinigameSlotProps = {
  onComplete: (result: MinigameResult) => void;
  copy?: MinigameCopy;
};

export type PayoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
  copy?: PayoffCopy;
};
```

Các slot props còn lại (`ProgramsSlotProps`, `ConversionSlotProps`, v.v.) giữ nguyên.

- [ ] **Chạy TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 error (hoặc chỉ có lỗi không liên quan đến file này).

- [ ] **Commit:**

```bash
git add src/landing/validateRecipe.ts src/landing/slots.ts
git commit -m "feat(copy): add copy field to Recipe type and slot contracts"
```

---

## Task 3: LandingFlow truyền copy xuống component

**Files:**
- Modify: `src/landing/LandingFlow.tsx`

- [ ] **Sửa 3 chỗ trong `LandingFlow.tsx` để truyền copy:**

**Dòng 63** — hook:
```tsx
{step === 'hook' && Hook && <Hook onStart={nextAfterHook} copy={recipe.copy?.hook} />}
```

**Dòng 88-98** — minigame (thêm `copy` prop):
```tsx
{step === 'minigame' && Minigame && (
  <Minigame onComplete={(result) => {
    setMinigameResult(result);
    const conditionIds = result.conditions.map(c => c.id);
    const ranked = recommendPrograms(conditionIds);
    setSuggestedPrograms(ranked);
    setSelectedProgram(ranked[0]?.program.id ?? null);
    trackEvent('minigame_complete', { resultId: result.condition.id });
    transitionTo('payoff');
  }} copy={recipe.copy?.minigame} />
)}
```

**Dòng 100-105** — payoff (thêm `copy` prop):
```tsx
{step === 'payoff' && Payoff && minigameResult && (
  <Payoff result={minigameResult} onContinue={() => {
    trackEvent('payoff_view', { resultId: minigameResult.condition.id });
    nextAfterPayoff();
  }} copy={recipe.copy?.payoff} />
)}
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 error mới.

- [ ] **Commit:**

```bash
git add src/landing/LandingFlow.tsx
git commit -m "feat(copy): pass recipe copy props through LandingFlow to slot components"
```

---

## Task 4: Hook component nhận và dùng copy

**Files:**
- Modify: `src/landing/variants/hook/electric/soft-dark.tsx`

- [ ] **Sửa toàn bộ file thành nội dung sau** (thêm import, DEFAULT_COPY, và dùng `c.*` thay hardcode):

```tsx
'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích vùng da',
  heading:       'Có một lý do da bạn',
  headingAccent: 'chưa khỏi hẳn',
  subtext:       'Vuốt trái / phải để xác định đúng tình trạng da — chỉ mất 30 giây.',
  cta:           'Bắt đầu vuốt →',
  hookImage:     '/face-map-hook.svg',
};

export function ElectricSoftDarkHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] relative flex items-center justify-center overflow-hidden">
      <div
        className="absolute -top-32 -right-32 w-112 h-112 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--lp-accent) 12%, transparent) 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-112 h-112 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--lp-primary) 8%, transparent) 0%, transparent 70%)' }}
      />

      <div className="max-w-5xl mx-auto w-full px-5 relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-14 animate-fade-in-up">
        <div className="shrink-0 flex items-center justify-center">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da mụn"
            className="h-52 md:h-[340px] w-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 28px color-mix(in srgb, var(--lp-accent) 50%, transparent))' }}
          />
        </div>

        <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
          <div
            className="inline-block px-4 py-1.5 rounded-full"
            style={{
              background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>{c.badge}</span>
          </div>

          <h1 className="font-extrabold text-4xl md:text-6xl leading-snug md:leading-snug [text-wrap:balance]" style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-plus-jakarta)' }}>
            {c.heading}<br />
            <span style={{ color: 'var(--lp-accent)' }}>{c.headingAccent}</span>
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
            {c.subtext}
          </p>

          <button
            onClick={onStart}
            className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--lp-accent)] focus-visible:ring-offset-2"
            style={{
              background: 'var(--lp-accent)',
              color: '#fff',
              boxShadow: 'color-mix(in srgb, var(--lp-accent) 30%, transparent) 0 0 12px',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'color-mix(in srgb, var(--lp-accent) 50%, transparent) 0 0 20px'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = 'color-mix(in srgb, var(--lp-accent) 30%, transparent) 0 0 12px'; }}
          >
            {c.cta}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 error mới.

- [ ] **Commit:**

```bash
git add src/landing/variants/hook/electric/soft-dark.tsx
git commit -m "feat(copy): extract hook text to DEFAULT_COPY, accept copy prop"
```

---

## Task 5: Minigame component nhận và dùng copy

**Files:**
- Modify: `src/landing/variants/minigame/electric/soft-swipe.tsx`

- [ ] **Thêm import `MinigameCopy`** — `MinigameSlotProps` đã import sẵn ở dòng 3, chỉ cần thêm dòng mới ngay bên dưới:

```ts
// Dòng 3 (hiện tại):
import type { MinigameSlotProps } from '../../../slots';
// Thêm dòng 4:
import type { MinigameCopy } from '../../../copy';
```

- [ ] **Thêm `DEFAULT_COPY` const** ngay sau khối `// ─── Constants ───` (sau dòng khai báo `const MIN_ANGLE`, `MAX_ANGLE`):

```ts
const DEFAULT_COPY: Required<MinigameCopy> = {
  intro:    { heading: 'Chọn tình trạng da của bạn', subtext: 'Xoay bánh xe để duyệt qua các tình trạng da phổ biến, rồi chạm vào thẻ ở giữa để chọn.', cta: 'Bắt đầu →' },
  wheel:    { heading: 'Da của bạn dạo này thế nào?', subtext: 'Vuốt sang trái để chọn mô tả phù hợp nhất' },
  faceMap:  { heading: 'Vùng da nào bị ảnh hưởng?', subtext: 'Chạm để chọn hoặc bỏ chọn từng vùng' },
  scanning: { heading: 'Đang phân tích...' },
};
```

- [ ] **Sửa signature của component** (dòng 96):

```ts
// Trước:
export function ElectricSoftSwipeMinigame({ onComplete }: MinigameSlotProps) {

// Sau:
export function ElectricSoftSwipeMinigame({ onComplete, copy }: MinigameSlotProps) {
```

- [ ] **Thêm `c` const ngay sau phần khai báo state** (sau dòng `const [checkCardIdx, setCheckCardIdx] = useState...`):

```ts
const c = {
  intro:    { ...DEFAULT_COPY.intro,    ...copy?.intro    },
  wheel:    { ...DEFAULT_COPY.wheel,    ...copy?.wheel    },
  faceMap:  { ...DEFAULT_COPY.faceMap,  ...copy?.faceMap  },
  scanning: { ...DEFAULT_COPY.scanning, ...copy?.scanning },
};
```

- [ ] **Sửa phase `intro` JSX** — thay 3 hardcode strings:

Tìm đoạn `{phase === 'intro' && (` và sửa các text sau:

```tsx
// Heading (dòng ~377):
<h2 className="font-extrabold text-xl mb-2" style={{ color: 'var(--lp-primary)' }}>
  {c.intro.heading}
</h2>

// Subtext (dòng ~380):
<p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
  {c.intro.subtext}
</p>

// CTA button (dòng ~389):
<button onClick={() => setPhase('wheel')} ...>
  {c.intro.cta}
</button>
```

- [ ] **Sửa phase `wheel` JSX** — thay 2 hardcode strings:

Tìm đoạn `{phase === 'wheel' && (` và sửa:

```tsx
// Heading (dòng ~399):
<h2 className="font-extrabold text-2xl md:text-4xl leading-snug" style={{ color: 'var(--lp-primary)' }}>
  {c.wheel.heading}
</h2>

// Subtext (dòng ~402):
<p className="text-sm md:text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
  {c.wheel.subtext}
</p>
```

- [ ] **Sửa phase `face-map` JSX** — thay 2 hardcode strings:

Tìm đoạn `{phase === 'face-map' && (` và sửa:

```tsx
// Heading (dòng ~527):
<h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
  {c.faceMap.heading}
</h2>

// Subtext (dòng ~530):
<p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
  {c.faceMap.subtext}
</p>
```

- [ ] **Sửa phase `scanning` JSX** — thay 1 hardcode string:

Tìm đoạn `{phase === 'scanning' && (` và sửa:

```tsx
// Heading (dòng ~592):
<h2 className="font-extrabold text-lg" style={{ color: 'var(--lp-primary)' }}>
  {c.scanning.heading}
</h2>
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 error mới.

- [ ] **Commit:**

```bash
git add src/landing/variants/minigame/electric/soft-swipe.tsx
git commit -m "feat(copy): extract minigame text to DEFAULT_COPY, accept copy prop"
```

---

## Task 6: Payoff chain — ResultCard và ConfettiCardWhyPayoff

**Files:**
- Modify: `src/landing/variants/payoff/result-layouts/ResultCard.tsx`
- Modify: `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx`

### 6a: ResultCard nhận copy prop

- [ ] **Thêm import vào `ResultCard.tsx`** (dòng 125, sau `import React from 'react'`):

```ts
import type { PayoffCopy } from '../../../../copy';
```

- [ ] **Thêm `copy?` vào `ResultCardProps` type** (dòng ~119):

```ts
export type ResultCardProps = {
  result: MinigameResult;
  onScrollDown: () => void;
  containerRef?: React.Ref<HTMLDivElement>;
  copy?: PayoffCopy['resultCard'];
};
```

- [ ] **Sửa `HEADERS` const** — giữ nguyên làm default, nhưng component sẽ merge với copy:

`HEADERS` const hiện tại ở dòng ~112 **giữ nguyên** — nó trở thành DEFAULT_COPY của ResultCard:

```ts
const HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe!',
  concern:  'Hmm, có điều bạn cần biết về da mình...',
};
```

- [ ] **Sửa signature của `ResultCard`** — thêm `copy` vào destructure (dòng ~127):

```ts
export function ResultCard({ result, onScrollDown, containerRef, copy }: ResultCardProps) {
```

- [ ] **Sửa dòng render heading** — dùng copy nếu có, fallback về HEADERS (dòng ~147):

```tsx
// Trước:
{HEADERS[result.condition.tone]}

// Sau:
{copy?.[result.condition.tone] ?? HEADERS[result.condition.tone]}
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

### 6b: ConfettiCardWhyPayoff forward copy xuống ResultCard

- [ ] **Sửa `ConfettiCardWhyPayoff.tsx`** — thêm `copy` vào prop destructure và forward xuống ResultCard.

Tìm dòng destructure của `ConfettiCardWhyPayoff` (dòng ~109):

```ts
// Trước:
export function ConfettiCardWhyPayoff({
  result,
  onContinue,
  FeatureComponent: FeatureComp = CarouselKenBurn,
  BenefitComponent: BenefitComp = NumberedBadgeCirclesRight,
  ResultComponent: ResultComp = ResultCard,
  topbarConfig,
}: PayoffSlotProps & {

// Sau:
export function ConfettiCardWhyPayoff({
  result,
  onContinue,
  copy,
  FeatureComponent: FeatureComp = CarouselKenBurn,
  BenefitComponent: BenefitComp = NumberedBadgeCirclesRight,
  ResultComponent: ResultComp = ResultCard,
  topbarConfig,
}: PayoffSlotProps & {
```

- [ ] **Sửa render `ResultComp`** — truyền `copy?.resultCard` xuống (dòng ~197):

```tsx
// Trước:
<ResultComp
  containerRef={resultSectRef}
  result={result}
  onScrollDown={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })}
/>

// Sau:
<ResultComp
  containerRef={resultSectRef}
  result={result}
  onScrollDown={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })}
  copy={copy?.resultCard}
/>
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 error mới.

- [ ] **Commit:**

```bash
git add src/landing/variants/payoff/result-layouts/ResultCard.tsx src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx
git commit -m "feat(copy): ResultCard and ConfettiCardWhyPayoff accept copy prop for payoff headers"
```

---

## Task 7: V23 recipe — narrative mới

**Files:**
- Modify: `src/landing/recipes/v23-electric-soft-dark.ts`

- [ ] **Sửa `v23-electric-soft-dark.ts` thành:**

```ts
import type { Recipe } from '../validateRecipe';

export const v23ElectricSoftDark: Recipe = {
  id: 'v23-electric-soft-dark',
  label: 'v23 — Electric Magenta / Soft Dark',
  theme: 'periwinkle',
  slots: {
    hook:       'electric-soft-dark',
    minigame:   'electric-soft-swipe',
    payoff:     'electric-soft-dark',
    programs:   'electric-soft-dark',
    conversion: 'electric-soft-dark',
    done:       'electric-soft-dark',
  },
  copy: {
    hook: {
      heading:       'Da bạn chưa khỏi hẳn?',
      headingAccent: 'Cùng tìm hiểu nguyên nhân nhé!',
      cta:           'Bắt đầu →',
    },
    minigame: {
      intro: {
        heading: 'Cho chúng tôi biết tình trạng da của bạn nha!',
        subtext: 'Xoay bánh xe để duyệt, chạm vào thẻ ở giữa để chọn.',
      },
      wheel: {
        heading: 'Vuốt sang phải để lựa chọn tình trạng da của bạn',
      },
    },
    payoff: {
      resultCard: {
        concern: 'Hmm, da của bạn đang cần được chú ý...',
      },
    },
  },
};
```

- [ ] **Commit:**

```bash
git add src/landing/recipes/v23-electric-soft-dark.ts
git commit -m "feat(v23): apply new narrative copy — hook to payoff flow connected"
```

---

## Task 8: Verification

- [ ] **TypeScript check toàn bộ:**

```bash
npx tsc --noEmit
```

Expected: 0 error.

- [ ] **Chạy test suite:**

```bash
npx vitest run
```

Expected: tất cả test hiện tại pass (không có test mới cần viết — thay đổi này là type-only và copy-override, validateRecipe không kiểm tra `copy` field).

- [ ] **Mở browser để verify v23:**

Truy cập `http://localhost:3000/v/v23-electric-soft-dark` (hoặc chạy dev server trước: `npm run dev`).

Kiểm tra từng step:
1. Hook: heading "Da bạn chưa khỏi hẳn?" + accent "Cùng tìm hiểu nguyên nhân nhé!" + nút "Bắt đầu →"
2. Minigame intro: "Cho chúng tôi biết tình trạng da của bạn nha!"
3. Minigame wheel: "Vuốt sang phải để lựa chọn tình trạng da của bạn"
4. Payoff (concern): "Hmm, da của bạn đang cần được chú ý..."

- [ ] **Verify các version khác không bị ảnh hưởng:**

Truy cập một version khác (vd `http://localhost:3000/v/v21-electric-classic`) — text phải vẫn là DEFAULT_COPY (text cũ), không bị thay đổi.

- [ ] **Commit cuối nếu có hotfix nhỏ, sau đó done.**

---

## Task 9: Cải thiện minigame `electric-soft-swipe`

**Files:**
- Modify: `src/landing/variants/minigame/electric/soft-swipe.tsx`

### 9a: Giảm độ nhạy swipe và opacity card phụ

- [ ] **Sửa 2 hằng số ở đầu file:**

```ts
// Trước:
const DRAG_SENS = 4.2;

// Sau:
const DRAG_SENS = 6.5;
```

```ts
// Trong hàm cardVisual, tìm dòng:
opacity: Math.max(0.12, 1 - t * 0.42),

// Sửa thành:
opacity: Math.max(0.08, 1 - t * 0.55),
```

### 9b: Fix desktop — arcR scale theo chiều ngang

- [ ] **Trong hàm `renderFrame`, tìm dòng tính `arcR`:**

```ts
// Trước:
const arcR = Math.max(280, Math.round(container.offsetHeight * 0.72));

// Sau:
const arcR = isWide
  ? Math.max(350, Math.round(container.offsetWidth * 0.32))
  : Math.max(280, Math.round(container.offsetHeight * 0.72));
```

Lưu ý: biến `isWide` đã được khai báo ngay sau đó trong cùng hàm — di chuyển khai báo `isWide` lên TRƯỚC dòng `arcR` để dùng được:

```ts
// Thứ tự mới trong renderFrame:
const cx = container.offsetWidth / 2;
const cy = container.offsetHeight + ARC_CY_OFFSET;
const isWide = container.offsetWidth >= 600;
const arcR = isWide
  ? Math.max(350, Math.round(container.offsetWidth * 0.32))
  : Math.max(280, Math.round(container.offsetHeight * 0.72));
const baseW = Math.min(275, Math.max(200, Math.round(
  isWide ? container.offsetWidth * 0.36 : container.offsetWidth * 0.52
)));
```

### 9c: Card style giống `face-map-cards`

- [ ] **Trong `renderFrame`, tìm khối `if (v.isCenter) { ... } else { ... }` và sửa toàn bộ:**

```ts
if (v.isCenter) {
  el.style.background = 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))';
  el.style.boxShadow = '0 8px 28px color-mix(in srgb, var(--lp-accent) 22%, transparent)';
  el.style.border = '2px solid var(--lp-accent)';
  el.style.backdropFilter = 'none';
} else {
  el.style.background = 'var(--lp-bg-card)';
  el.style.boxShadow = 'none';
  el.style.border = '2px solid var(--lp-border)';
  el.style.backdropFilter = 'none';
}
```

- [ ] **Trong JSX card template**, tìm `style={{ ... border: '1px solid ... }}` ở initial style object và sửa border thành 2px + thêm background mặc định:

```tsx
style={{
  position: 'absolute',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px 10px',
  borderRadius: 16,
  cursor: 'pointer',
  userSelect: 'none',
  textAlign: 'center',
  border: '2px solid var(--lp-border)',
  background: 'var(--lp-bg-card)',
  willChange: 'transform, opacity',
  transition: 'none',
} as React.CSSProperties}
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit:**

```bash
git add src/landing/variants/minigame/electric/soft-swipe.tsx
git commit -m "fix(soft-swipe): card style, desktop arc spread, opacity and swipe sensitivity"
```

---

## Task 10: Áp dụng `electric-soft-swipe` cho v01 và v02

**Files:**
- Modify: `src/landing/recipes/v01-baseline.ts`
- Modify: `src/landing/recipes/v02-lilac.ts`

- [ ] **Sửa `v01-baseline.ts`** — thêm `teaserPayoff` và đổi minigame:

```ts
import type { Recipe } from '../validateRecipe';

export const v01Baseline: Recipe = {
  id: 'v01-baseline',
  label: 'v01 — Facemap + blossom + v04 workflow',
  theme: 'blossom',
  slots: {
    hook:         'two-column',
    teaserPayoff: 'bold-classic',
    minigame:     'electric-soft-swipe',
    payoff:       'confetti-card-why',
    programs:     'grid-with-faq',
    conversion:   'short-form-with-testimonials',
    done:         'contact-info-with-video',
  },
};
```

- [ ] **Sửa `v02-lilac.ts`** — thêm `teaserPayoff` và đổi minigame:

```ts
import type { Recipe } from '../validateRecipe';

export const vPreviewWizard: Recipe = {
  id: 'v02-lilac',
  label: 'Lilac',
  theme: 'lilac',
  slots: {
    hook:         'face-dual',
    teaserPayoff: 'bold-classic',
    minigame:     'electric-soft-swipe',
    payoff:       'playful-immersive',
    programs:     'playful-immersive',
    conversion:   'playful-immersive',
    done:         'playful-immersive',
  },
};
```

- [ ] **Chạy tests để verify validateRecipe vẫn pass:**

```bash
npx vitest run
```

Expected: tất cả test pass.

- [ ] **Commit:**

```bash
git add src/landing/recipes/v01-baseline.ts src/landing/recipes/v02-lilac.ts
git commit -m "feat(v01,v02): add teaserPayoff and switch to electric-soft-swipe minigame"
```

---

## Task 11: V16 — đổi minigame và thử hook image mới

**Files:**
- Modify: `src/landing/recipes/v16-natural-minimal.ts`
- Modify: `src/landing/variants/hook/natural/minimal.tsx`

### 11a: NaturalMinimalHook nhận copy (hookImage)

`HookSlotProps` đã có `copy?: HookCopy` sau Task 2. `NaturalMinimalHook` chỉ cần destructure và dùng `hookImage`:

- [ ] **Sửa `src/landing/variants/hook/natural/minimal.tsx`:**

```tsx
'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Mụn không phải lỗi của bạn.',
  headingAccent: 'Nhưng cách xử lý',
  subtext:       'Hiểu đúng — để lần này làm khác đi.',
  cta:           'Soi da ngay →',
  hookImage:     '/face-map-hook.svg',
};

export function NaturalMinimalHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col items-center gap-6 text-center animate-fade-in-up">
        <img
          src={c.hookImage}
          alt="Phân tích vùng da"
          className="h-36 md:h-52 w-auto object-contain"
        />
        <h1 className="font-bold text-4xl md:text-5xl text-cta leading-snug md:leading-snug [text-wrap:balance]" style={{ fontFamily: 'var(--font-nunito)' }}>
          {c.heading}{' '}
          <span className="text-[var(--lp-accent)]">{c.headingAccent}</span>{' '}
          thì có thể.
        </h1>
        <p className="text-sm text-cta/55 max-w-xs leading-relaxed">
          {c.subtext}
        </p>
        <CtaButton onClick={onStart} size="md">
          {c.cta}
        </CtaButton>
      </div>
    </div>
  );
}
```

### 11b: Cập nhật recipe v16

- [ ] **Sửa `v16-natural-minimal.ts`:**

```ts
import type { Recipe } from '../validateRecipe';

export const v16NaturalMinimal: Recipe = {
  id: 'v16-natural-minimal',
  label: 'v16 — Natural Sage / Minimal',
  theme: 'matcha',
  slots: {
    hook:       'natural-minimal',
    minigame:   'story-day',
    payoff:     'natural-minimal',
    programs:   'natural-minimal',
    conversion: 'natural-minimal',
    done:       'natural-minimal',
  },
  copy: {
    hook: {
      hookImage: '/face-map-v1/face-map-hook-2.svg',
    },
  },
};
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

- [ ] **Commit:**

```bash
git add src/landing/variants/hook/natural/minimal.tsx src/landing/recipes/v16-natural-minimal.ts
git commit -m "feat(v16): switch to story-day minigame, try face-map-hook-2 image"
```

---

## Task 12: Fix conversion scroll bug trên mobile

**Files:**
- Modify: `src/landing/organisms/ConversionOrganism.tsx`

**Root cause:** `SectionShell` có `h-[100dvh]` và default `overflow="hidden"`. Trên mobile, layout là `flex-col` (form + testimonials xếp chồng). Testimonials bị clip — không scroll được.

- [ ] **Sửa dòng 145 trong `ConversionOrganism.tsx`:**

```tsx
// Trước:
<SectionShell bgVar="--lp-bg-payoff" overflow="hidden">

// Sau:
<SectionShell bgVar="--lp-bg-payoff" overflow="auto">
```

- [ ] **Verify trên mobile viewport:**

Truy cập bất kỳ version có conversion (vd `http://localhost:3000/v/v01-baseline`), đi đến bước conversion. Trên mobile (375px width), scroll xuống — phải thấy được TestimonialsBlock phía dưới form.

- [ ] **Verify desktop không bị ảnh hưởng:**

Trên desktop, conversion dùng `md:grid md:grid-cols-2` — form và testimonials song song, không cần scroll. Kiểm tra layout vẫn bình thường.

- [ ] **Commit:**

```bash
git add src/landing/organisms/ConversionOrganism.tsx
git commit -m "fix(conversion): allow mobile scroll to testimonials (overflow hidden → auto)"
```

---

## Task 13: V15 — editorial-journey UI polish

**Files:**
- Modify: `src/landing/variants/programs/natural/editorial-journey.tsx`

- [ ] **Thay toàn bộ nội dung file thành:**

```tsx
'use client';
import { useState, useEffect, useRef } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import { getPrograms } from '../../../../content/catalog';
import type { ProgramId } from '../../../../content/programs';
import { trackEvent } from '../../../../lib/trackEvent';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const MILESTONES = [
  { step: 1, label: 'Thăm da & tư vấn', desc: 'Chuyên viên sẽ phân tích da và tư vấn liệu trình phù hợp.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { step: 2, label: 'Liệu trình cá nhân hóa', desc: 'Liệu trình được thiết kế riêng cho tình trạng da của bạn.', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
  { step: 3, label: 'Theo dõi & điều chỉnh', desc: 'Theo dõi định kỳ và điều chỉnh để đạt kết quả tốt nhất.', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
];

export function NaturalEditorialJourneyPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const program = suggestedPrograms[0]?.program ?? getPrograms()[0];
  const programId = program.id as ProgramId;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function handleContinue() {
    trackEvent('programs_journey_continue', { programId });
    onContinue(programId);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center px-5 py-8">
        <div className="max-w-lg w-full flex flex-col gap-6">

          {/* Header */}
          <div
            className="text-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(12px)',
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              Hành trình của bạn
            </p>
            <h2 className="text-xl font-extrabold mt-2" style={{ color: 'var(--lp-primary)' }}>
              {program.name}
            </h2>
            <p className="text-sm mt-2 leading-relaxed"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
              {program.description}
            </p>
          </div>

          {/* Timeline */}
          <div ref={listRef} className="flex flex-col relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-[1.125rem] top-9 bottom-9 w-0.5 origin-top pointer-events-none"
              style={{
                background: 'color-mix(in srgb, var(--lp-accent) 22%, transparent)',
                transform: visible ? 'scaleY(1)' : 'scaleY(0)',
                transition: 'transform 700ms ease-out 180ms',
              }}
            />

            {MILESTONES.map((m, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              const delay = `${100 + i * 140}ms`;
              return (
                <button
                  key={m.step}
                  onClick={() => setActiveStep(i)}
                  className="flex items-start gap-4 rounded-soft p-4 text-left relative z-10"
                  style={{
                    background: isActive ? 'color-mix(in srgb, var(--lp-accent) 8%, white)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--lp-accent)' : '3px solid transparent',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateX(-10px)',
                    transition: `opacity 420ms ease-out ${delay}, transform 420ms ease-out ${delay}, background 200ms ease, border-color 200ms ease`,
                  }}
                >
                  {/* Circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isPast
                        ? 'var(--lp-accent)'
                        : isActive
                          ? `linear-gradient(135deg, var(--lp-accent), color-mix(in srgb, var(--lp-accent) 70%, var(--lp-primary)))`
                          : 'color-mix(in srgb, var(--lp-accent) 15%, white)',
                      boxShadow: isActive ? '0 0 0 4px color-mix(in srgb, var(--lp-accent) 15%, transparent)' : 'none',
                      transition: 'background 300ms ease, box-shadow 300ms ease',
                    }}
                  >
                    {isPast ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={isActive ? 'white' : 'var(--lp-accent)'}
                        strokeWidth="2" strokeLinecap="round">
                        <path d={m.icon} />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: isActive ? 'var(--lp-primary)' : 'color-mix(in srgb, var(--lp-primary) 60%, transparent)',
                        transition: 'color 200ms ease',
                      }}
                    >
                      {m.label}
                    </p>
                    {/* Smooth expand */}
                    <div
                      className="overflow-hidden"
                      style={{
                        maxHeight: isActive ? '80px' : '0',
                        opacity: isActive ? 1 : 0,
                        transition: 'max-height 300ms ease-in-out, opacity 250ms ease-in-out',
                      }}
                    >
                      <p className="text-xs mt-1 leading-relaxed pt-0.5"
                        style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
                        {m.desc}
                      </p>
                    </div>
                  </div>

                  {!isPast && !isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--lp-accent)" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(8px)',
              transition: 'opacity 500ms ease-out 500ms, transform 500ms ease-out 500ms',
            }}
          >
            <CtaButton variant="golden" fullWidth onClick={handleContinue}>
              Bắt đầu hành trình
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Commit:**

```bash
git add src/landing/variants/programs/natural/editorial-journey.tsx
git commit -m "feat(v15): animate editorial-journey programs — entrance, timeline connector, smooth expand"
```

---

## Task 14: V07 — Fix berry theme contrast

**Files:**
- Modify: `src/landing/themes.css`

- [ ] **Tìm dòng trong `.theme-berry` và sửa:**

```css
/* Trước: */
--lp-bg-payoff:      #E879F9;

/* Sau: */
--lp-bg-payoff:      #F0ABFC;
```

- [ ] **Commit:**

```bash
git add src/landing/themes.css
git commit -m "fix(v07): soften berry bg-payoff color for WhySection readability"
```

---

## Task 15: ConditionEducation — diversify whyTitle

**Files:**
- Modify: `src/landing/variants/payoff/constant/ConditionEducation.tsx`

- [ ] **Sửa 5 whyTitle (dùng Edit, thay từng dòng một):**

```ts
// da-nhon-mun-viem — cũ:
whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
// Mới:
whyTitle: 'Tại sao da nhờn vẫn bị mụn viêm dù rửa mặt cẩn thận?',
```

```ts
// lo-chan-long — cũ:
whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
// Mới:
whyTitle: 'Tại sao lỗ chân lông to ra dù dùng nhiều sản phẩm thu nhỏ?',
```

```ts
// da-nhay-cam — cũ:
whyTitle: 'Điều gì đang xảy ra với làn da của bạn?',
// Mới:
whyTitle: 'Tại sao làn da của bạn phản ứng với hầu hết mọi thứ?',
```

```ts
// mun-noi-tiet — cũ:
whyTitle: 'Điều gì đang xảy ra trên da của bạn?',
// Mới:
whyTitle: 'Tại sao mụn bùng phát theo chu kỳ dù bạn chăm sóc da đúng cách?',
```

```ts
// mun-trung-ca — cũ:
whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
// Mới:
whyTitle: 'Tại sao mụn trứng cá cứ tái phát dù bạn đã dùng nhiều cách?',
```

Lưu ý: `lo-chan-long` và `da-nhon-mun-viem` có cùng whyTitle cũ — phải sửa cả 2, dùng `replace_all: false` và thêm context xung quanh để phân biệt.

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -10
```

- [ ] **Commit:**

```bash
git add src/landing/variants/payoff/constant/ConditionEducation.tsx
git commit -m "feat(payoff): diversify whyTitle per condition for richer payoff narrative"
```

---

## Task 16: Đăng ký skin-scan-chat + tạo 2 payoff layout variants

**Files:**
- Modify: `src/landing/registry.ts`
- Create: `src/landing/variants/payoff/confetti-card-why-video-split.tsx`
- Create: `src/landing/variants/payoff/confetti-card-why-circles-quad.tsx`

### 16a: Tạo variant video-split

- [ ] **Tạo `src/landing/variants/payoff/confetti-card-why-video-split.tsx`:**

```tsx
'use client';
import type { PayoffSlotProps } from '../../slots';
import { ConfettiCardWhyPayoff } from './ConfettiCardWhyPayoff';
import { NumberedBadgeVideoSplit, CarouselGrid } from './feature-layouts';

export function ConfettiCardWhyVideoSplitPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      BenefitComponent={NumberedBadgeVideoSplit}
      FeatureComponent={CarouselGrid}
    />
  );
}
```

### 16b: Tạo variant circles-quad

- [ ] **Tạo `src/landing/variants/payoff/confetti-card-why-circles-quad.tsx`:**

```tsx
'use client';
import type { PayoffSlotProps } from '../../slots';
import { ConfettiCardWhyPayoff } from './ConfettiCardWhyPayoff';
import { CirclesWithBackground, NumberedBadgeQuadGrid } from './feature-layouts';

export function ConfettiCardWhyCirclesQuadPayoff(props: PayoffSlotProps) {
  return (
    <ConfettiCardWhyPayoff
      {...props}
      BenefitComponent={CirclesWithBackground}
      FeatureComponent={NumberedBadgeQuadGrid}
    />
  );
}
```

### 16c: Đăng ký tất cả vào registry

- [ ] **Sửa `src/landing/registry.ts` — thêm 3 entries:**

**Thêm 2 import** (ngay sau dòng `import { BoldClassicTeaserPayoff }...`):

```ts
import { ConfettiCardWhyVideoSplitPayoff } from './variants/payoff/confetti-card-why-video-split';
import { ConfettiCardWhyCirclesQuadPayoff } from './variants/payoff/confetti-card-why-circles-quad';
import { SkinScanChatMinigame } from './variants/minigame/skin-scan-chat';
```

**Trong `registry.minigame`**, thêm entry `'skin-scan-chat'` vào cuối object (trước closing `}`):

```ts
'skin-scan-chat': SkinScanChatMinigame,
```

**Trong `registry.payoff`**, thêm 2 entries vào cuối object:

```ts
'confetti-card-why-video-split': ConfettiCardWhyVideoSplitPayoff,
'confetti-card-why-circles-quad': ConfettiCardWhyCirclesQuadPayoff,
```

- [ ] **TypeScript check:**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: 0 error.

- [ ] **Commit:**

```bash
git add src/landing/variants/payoff/confetti-card-why-video-split.tsx src/landing/variants/payoff/confetti-card-why-circles-quad.tsx src/landing/registry.ts
git commit -m "feat(payoff): add video-split and circles-quad layout variants + register skin-scan-chat"
```

---

## Task 17: V03 — skin-scan-chat + phục hồi payoff sections

**Files:**
- Modify: `src/landing/recipes/v03-facemap.ts`

- [ ] **Sửa `v03-facemap.ts`:**

```ts
import type { Recipe } from '../validateRecipe';

export const v03Facemap: Recipe = {
  id: 'v03-facemap',
  label: 'Face-map tự khai + ocean',
  theme: 'opal',
  slots: {
    hook:       'bold-single',
    minigame:   'skin-scan-chat',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
};
```

- [ ] **Chạy tests:**

```bash
npx vitest run
```

Expected: all pass.

- [ ] **Commit:**

```bash
git add src/landing/recipes/v03-facemap.ts
git commit -m "feat(v03): skin-scan-chat minigame + circles-quad payoff (restore all sections)"
```

---

## Task 18: V25 — story-day minigame

**Files:**
- Modify: `src/landing/recipes/v25-playful-cotton-candy.ts`

- [ ] **Sửa `v25-playful-cotton-candy.ts`:**

```ts
import type { Recipe } from '../validateRecipe';

export const v25PlayfulCottonCandy: Recipe = {
  id: 'v25-playful-cotton-candy',
  label: 'v25 — Playful Cotton Candy',
  theme: 'cotton-candy',
  slots: {
    hook:       'playful-classic',
    minigame:   'story-day',
    payoff:     'confetti-card-why-video-split',
    programs:   'playful-classic',
    conversion: 'playful-classic',
    done:       'playful-classic',
  },
};
```

Lưu ý: task này kết hợp cả đổi minigame (story-day) lẫn áp dụng feature layout mới (video-split) cho v25.

- [ ] **Commit:**

```bash
git add src/landing/recipes/v25-playful-cotton-candy.ts
git commit -m "feat(v25): story-day minigame + video-split payoff layout"
```

---

## Task 19: Áp dụng video-split payoff cho v04, v07, v14

**Files:**
- Modify: `src/landing/recipes/v04-combined.ts`
- Modify: `src/landing/recipes/v07-playful-immersive.ts`
- Modify: `src/landing/recipes/v14-natural-spa.ts`

- [ ] **Sửa `v04-combined.ts`** — đổi `payoff`:

```ts
import type { Recipe } from '../validateRecipe';

export const v04Combined: Recipe = {
  id: 'v04-combined',
  label: 'v04 — Programs+FAQ / Conversion+Testimonial',
  theme: 'coral',
  slots: {
    hook:       'bold-single',
    minigame:   'face-map',
    payoff:     'confetti-card-why-video-split',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
};
```

- [ ] **Sửa `v07-playful-immersive.ts`** — đổi `payoff`:

```ts
import type { Recipe } from '../validateRecipe';

export const v07PlayfulImmersive: Recipe = {
  id: 'v07-playful-immersive',
  label: 'v07 — Playful Blossom / Immersive',
  theme: 'berry',
  slots: {
    hook:       'playful-immersive',
    minigame:   'playful-immersive',
    payoff:     'confetti-card-why-video-split',
    programs:   'playful-immersive',
    conversion: 'playful-immersive',
    done:       'playful-immersive',
  },
};
```

- [ ] **Sửa `v14-natural-spa.ts`** — đổi `payoff`:

```ts
import type { Recipe } from '../validateRecipe';

export const v14NaturalSpa: Recipe = {
  id: 'v14-natural-spa',
  label: 'v14 — Natural Sage / Spa',
  theme: 'dusty-rose',
  slots: {
    hook:          'natural-spa',
    minigame:      'natural-spa',
    payoff:        'confetti-card-why-video-split',
    programs:      'natural-spa',
    conversion:    'natural-spa',
    done:          'natural-spa',
    expertHandoff: 'natural-spa',
  },
};
```

- [ ] **Chạy tests:**

```bash
npx vitest run
```

- [ ] **Commit:**

```bash
git add src/landing/recipes/v04-combined.ts src/landing/recipes/v07-playful-immersive.ts src/landing/recipes/v14-natural-spa.ts
git commit -m "feat(v04,v07,v14): apply video-split + carousel-grid payoff layout"
```

---

## Task 20: Áp dụng circles-quad payoff cho v21 và v10

**Files:**
- Modify: `src/landing/recipes/v21-electric-classic.ts`
- Modify: `src/landing/recipes/v10-clinical-compact.ts`

- [ ] **Sửa `v21-electric-classic.ts`** — đổi `payoff`:

```ts
import type { Recipe } from '../validateRecipe';

export const v21ElectricClassic: Recipe = {
  id: 'v21-electric-classic',
  label: 'v21 — Electric Magenta / Classic',
  theme: 'magenta',
  slots: {
    hook:       'electric-classic',
    minigame:   'face-map',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'electric-classic',
    conversion: 'electric-classic',
    done:       'electric-classic',
  },
};
```

- [ ] **Sửa `v10-clinical-compact.ts`** — đổi `payoff`:

```ts
import type { Recipe } from '../validateRecipe';

export const v10ClinicalCompact: Recipe = {
  id: 'v10-clinical-compact',
  label: 'v10 — Clinical Ocean / Compact',
  theme: 'ice',
  slots: {
    hook:       'clinical-compact',
    minigame:   'clinical-compact',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'clinical-compact',
    conversion: 'clinical-compact',
    done:       'clinical-compact',
  },
};
```

- [ ] **Chạy tests:**

```bash
npx vitest run
```

- [ ] **Commit:**

```bash
git add src/landing/recipes/v21-electric-classic.ts src/landing/recipes/v10-clinical-compact.ts
git commit -m "feat(v21,v10): apply circles-with-bg + quad-grid payoff layout"
```
