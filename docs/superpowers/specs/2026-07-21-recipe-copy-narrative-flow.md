# Spec: Recipe Copy Layer — Narrative Flow Fix

**Date:** 2026-07-21  
**Scope:** Systemic — tất cả variant, bắt đầu từ v23

---

## Vấn đề

Text của landing page đang hardcode trực tiếp trong JSX của từng component, khiến narrative flow giữa các slot (hook → minigame → payoff) bị rời rạc và khó quản lý. Cụ thể với v23:

| Step | Text hiện tại | Vấn đề |
|------|--------------|--------|
| Hook | "Có một lý do da bạn chưa khỏi hẳn." | Mở đầu tốt — tạo tension |
| Minigame intro | "Chọn tình trạng da của bạn" | Khô, không connect với hook |
| Minigame wheel | "Da của bạn dạo này thế nào?" | Hỏi lại điều hook đã nói, đứt mạch |
| Payoff result | "Hmm, có điều bạn cần biết về da mình..." | Lặp lại premise của hook thay vì resolve |

Ngoài vấn đề narrative, không có chỗ nào nhìn được toàn bộ "kịch bản" của một version — phải mở 4 file component riêng biệt.

---

## Giải pháp: Copy Layer trong Recipe

Recipe được mở rộng với field `copy?` chứa toàn bộ text có thể override cho từng slot. Component giữ `DEFAULT_COPY` làm fallback — hoạt động bình thường nếu recipe không khai báo copy.

---

## Kiến trúc

### 1. File mới: `src/landing/copy.ts`

Khai báo schema copy — type thuần, không có runtime value:

```ts
export type HookCopy = {
  badge?:         string;
  heading?:       string;
  headingAccent?: string;
  subtext?:       string;
  cta?:           string;
};

export type MinigameCopy = {
  intro?:    { heading?: string; subtext?: string; cta?: string; };
  wheel?:    { heading?: string; subtext?: string; };
  faceMap?:  { heading?: string; subtext?: string; };
  scanning?: { heading?: string; };
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

### 2. `src/landing/validateRecipe.ts` — thêm `copy?` vào Recipe type

```ts
import type { RecipeCopy } from './copy';

export type Recipe = {
  id:     string;
  label:  string;
  theme:  string;
  slots:  { ... };   // không đổi
  copy?:  RecipeCopy; // ← thêm mới, optional
};
```

### 3. `src/landing/slots.ts` — thêm `copy?` vào slot props

```ts
import type { HookCopy, MinigameCopy, PayoffCopy } from './copy';

export type HookSlotProps     = { onStart:    () => void;             copy?: HookCopy;     };
export type MinigameSlotProps = { onComplete: (r: MinigameResult) => void; copy?: MinigameCopy; };
export type PayoffSlotProps   = { result: MinigameResult; onContinue: () => void; copy?: PayoffCopy; };
// TeaserPayoffSlotProps không cần copy (text tĩnh, không có narrative dependency)
```

### 4. `src/landing/LandingFlow.tsx` — truyền copy xuống component

```ts
// Khi render hook:
<HookComponent onStart={...} copy={recipe.copy?.hook} />

// Khi render minigame:
<MinigameComponent onComplete={...} copy={recipe.copy?.minigame} />

// Khi render payoff:
<PayoffComponent result={...} onContinue={...} copy={recipe.copy?.payoff} />
```

### 5. Pattern trong mỗi component

Mỗi variant component khai báo `DEFAULT_COPY` ở đầu file, sau đó merge với `props.copy`:

```ts
// hook/electric/soft-dark.tsx
const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích vùng da',
  heading:       'Có một lý do da bạn',
  headingAccent: 'chưa khỏi hẳn',
  subtext:       'Vuốt trái / phải để xác định đúng tình trạng da — chỉ mất 30 giây.',
  cta:           'Bắt đầu vuốt →',
};

export function ElectricSoftDarkHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  // dùng c.badge, c.heading, c.headingAccent, c.subtext, c.cta
}
```

- `Required<HookCopy>` bắt TypeScript báo lỗi nếu component thiếu default cho bất kỳ field nào.
- Spread `{ ...DEFAULT_COPY, ...copy }` đảm bảo recipe chỉ cần override field cần đổi.

---

## Narrative v23 sau khi fix

```ts
// src/landing/recipes/v23-electric-soft-dark.ts
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
```

**Luồng mới:**

| Step | Text mới | Vai trò |
|------|----------|---------|
| Hook | "Da bạn chưa khỏi hẳn? **Cùng tìm hiểu nguyên nhân nhé!**" | Đặt vấn đề + mời khám phá |
| Minigame intro | "Cho chúng tôi biết tình trạng da của bạn nha!" | Thu thập input — tone thân thiện |
| Minigame wheel | "Vuốt sang phải để lựa chọn tình trạng da của bạn" | Hướng dẫn thao tác — không hỏi lại |
| Payoff | "Hmm, da của bạn đang cần được chú ý..." | Bắt đầu resolve — không lặp hook |

---

## Phạm vi thay đổi

| File | Loại thay đổi |
|------|--------------|
| `src/landing/copy.ts` | Tạo mới — định nghĩa types |
| `src/landing/validateRecipe.ts` | Thêm `copy?: RecipeCopy` vào `Recipe` type |
| `src/landing/slots.ts` | Thêm `copy?` vào `HookSlotProps`, `MinigameSlotProps`, `PayoffSlotProps` |
| `src/landing/LandingFlow.tsx` | Truyền `recipe.copy?.hook/minigame/payoff` xuống component |
| `src/landing/variants/hook/electric/soft-dark.tsx` | Thêm `DEFAULT_COPY`, dùng `c.*` thay hardcode |
| `src/landing/variants/minigame/electric/soft-swipe.tsx` | Thêm `DEFAULT_COPY`, dùng `c.*` thay hardcode |
| `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx` | Forward `copy?.resultCard` xuống `ResultCard` |
| `src/landing/variants/payoff/result-layouts/ResultCard.tsx` | Nhận `copy?: PayoffCopy['resultCard']`; dùng thay `HEADERS` const hiện tại |
| `src/landing/recipes/v23-electric-soft-dark.ts` | Thêm `copy` block với narrative mới |

### Không thay đổi

- Các recipe khác (không có `copy` → dùng DEFAULT_COPY của component)
- Các variant không phải hook/minigame/payoff của v23
- `TeaserPayoffSlotProps` — text của teaserPayoff không phụ thuộc narrative
- Data layer: `src/content/quiz.ts`, `CONDITION_EDUCATION`, `CARDS` trong minigame

---

## Quyết định thiết kế

**Type vs const:** Type (`HookCopy` v.v.) sống trong `copy.ts`, độc lập với component. DEFAULT_COPY là const runtime trong từng component — hai thứ phục vụ hai mục đích khác nhau.

**`Required<HookCopy>` cho DEFAULT_COPY:** Nếu sau này thêm field mới vào `HookCopy`, TypeScript sẽ báo lỗi tại mọi component chưa khai báo default — không thể bỏ sót.

**Optional vs Required trên Recipe:** `copy` là optional ở mọi level (`RecipeCopy?`, `HookCopy?`, từng field `?`) — recipe nào không cần override thì không phải khai báo gì.
