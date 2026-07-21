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

**`hookImage` trong HookCopy:** Để các hook variant hiển thị ảnh có thể hoán đổi qua recipe, `HookCopy` thêm field `hookImage?: string` — component dùng `c.hookImage ?? '/face-map-hook.svg'` làm fallback.

---

## Phần bổ sung: Các thay đổi ngoài copy layer

### A. Cải thiện minigame `electric-soft-swipe`

Sau khi tách text ra copy layer, minigame cần 4 cải thiện độc lập nhau:

| # | Vấn đề | Fix |
|---|--------|-----|
| 1 | Card style khác với face-map-cards gốc | Border 2px solid, background `var(--lp-bg-card)`, center card highlight màu accent |
| 2 | Desktop: card bị co cụm, không tận dụng chiều ngang | `arcR` scale theo `offsetWidth` thay vì `offsetHeight` khi `isWide` |
| 3 | Card phụ hai bên quá đậm | Giảm opacity: `Math.max(0.08, 1 - t * 0.55)` thay vì `max(0.12, 1 - t * 0.42)` |
| 4 | Swipe quá nhạy | Tăng `DRAG_SENS` từ 4.2 lên 6.5 |

**Card style mục tiêu** (dựa theo `face-map-cards.tsx`):
- Non-center: `border: '2px solid var(--lp-border)'`, background `var(--lp-bg-card)`
- Center: `border: '2px solid var(--lp-accent)'`, background `color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))` + shadow nhẹ

**Desktop arcR công thức mới:**
```ts
const arcR = isWide
  ? Math.max(350, Math.round(container.offsetWidth * 0.32))
  : Math.max(280, Math.round(container.offsetHeight * 0.72));
```

### B. Áp dụng `electric-soft-swipe` cho v01 và v02

Sau khi cải thiện xong, áp dụng minigame này vào v01 và v02 kèm teaserPayoff `bold-classic`.

**v01** (`v01-baseline.ts`): thêm `minigame: 'electric-soft-swipe'`, thêm `teaserPayoff: 'bold-classic'`.

**v02** (`v02-lilac.ts`): thêm `minigame: 'electric-soft-swipe'`, thêm `teaserPayoff: 'bold-classic'`.

Cả hai version đã có hook phù hợp, không cần thêm slot khác.

### C. V16 — minigame và hook

**Minigame:** Đổi từ `'natural-minimal'` sang `'story-day'` — đã có trong registry.

**Hook — thử nghiệm `face-map-hook-2`:**
- Asset mới: `/face-map-v1/face-map-hook-2.svg` (đã có sẵn trong `public/`)
- `NaturalMinimalHook` hiện tại dùng `/face-map-hook.svg`. Sau khi Task 4 của copy layer cập nhật `HookSlotProps` với `copy?: HookCopy`, hook này có thể nhận `copy.hookImage`
- V16 recipe thêm `copy.hook.hookImage = '/face-map-v1/face-map-hook-2.svg'` để swap ảnh mà không đổi layout

`HookCopy` cần thêm field:
```ts
export type HookCopy = {
  badge?:         string;
  heading?:       string;
  headingAccent?: string;
  subtext?:       string;
  cta?:           string;
  hookImage?:     string;  // ← thêm mới
};
```

`NaturalMinimalHook` sẽ destructure `copy` và dùng `copy?.hookImage ?? '/face-map-hook.svg'`.

### D. Bug: Conversion không scroll được trên mobile

**Root cause:** `ConversionOrganism.tsx` (line 145) truyền `overflow="hidden"` vào `SectionShell`, trong khi `SectionShell` đặt `h-[100dvh]`. Trên mobile, layout là `flex-col` (form trên, testimonials dưới) — nội dung dưới bị clip, người dùng không scroll xuống được.

**Fix:** Đổi `overflow="hidden"` thành `overflow="auto"` trong `ConversionOrganism`.

```tsx
// Trước:
<SectionShell bgVar="--lp-bg-payoff" overflow="hidden">

// Sau:
<SectionShell bgVar="--lp-bg-payoff" overflow="auto">
```

Áp dụng cho tất cả version dùng `ConversionOrganism` (hầu hết conversion variants).

---

## Phần bổ sung Batch 3: UI polish, contrast, content và feature layouts

### E. V15 — Cải thiện editorial-journey programs

**File:** `src/landing/variants/programs/natural/editorial-journey.tsx`

Component hiện tại render tĩnh — item xuất hiện ngay lập tức, không có animation. Cần:

1. **Staggered entrance** — IntersectionObserver trên `ref={listRef}`, mỗi milestone item fade+slide từ trái với delay tăng dần (100ms, 240ms, 380ms). Header section cũng fade+slide up.
2. **Vertical connector line** — `<div>` absolutely positioned bên trái danh sách, scale từ 0 → 1 theo `transform: scaleY()` khi visible (origin-top), tạo cảm giác timeline "grow".
3. **Enhanced milestone circles** — active/completed circle dùng gradient từ `--lp-accent` sang `color-mix(in srgb, --lp-accent 70%, --lp-primary)`. Active circle có glow ring `box-shadow: 0 0 0 4px accent/15%`.
4. **Smooth description expand** — thay conditional render bằng `max-height: 0 → 80px` + `opacity: 0 → 1` transition 300ms. Không còn layout shift đột ngột khi click.
5. **CTA entrance** — fade in sau các item với delay 500ms.

**Không thay đổi:** logic `activeStep`, `program`, `handleContinue`, text content trong `MILESTONES`.

---

### F. V07 — Contrast WhySection (berry theme)

**File:** `src/landing/themes.css`

Berry theme (`theme-berry`) có `--lp-bg-payoff: #E879F9` — fuchsia rất bão hòa. WhySection (section đọc nhiều nhất) dùng background này làm nền, khiến văn bản `text-cta` (`#4A044E` = dark purple) bị "chìm" về mặt cảm quan dù WCAG contrast ratio ~ 6:1 về mặt kỹ thuật.

**Fix:** Giảm bão hòa `--lp-bg-payoff` từ `#E879F9` → `#F0ABFC`.

```css
/* themes.css — theme-berry */
/* Trước: */
--lp-bg-payoff: #E879F9;

/* Sau: */
--lp-bg-payoff: #F0ABFC;
```

Các section khác dùng cùng biến (`ResultCard`, `ClinicIntroSection`, scroll container) đều được hưởng lợi — background bớt chói, text dễ đọc hơn.

---

### G. ConditionEducation — whyTitle diversity

**File:** `src/landing/variants/payoff/constant/ConditionEducation.tsx`

5 conditions có title generic hoặc lặp lại nhau (3 condition cùng dùng "Điều gì xảy ra bên dưới làn da của bạn?"):

| Condition | Cũ | Mới |
|-----------|-----|-----|
| `da-nhon-mun-viem` | "Điều gì xảy ra bên dưới làn da của bạn?" | "Tại sao da nhờn vẫn bị mụn viêm dù rửa mặt cẩn thận?" |
| `lo-chan-long` | "Điều gì xảy ra bên dưới làn da của bạn?" | "Tại sao lỗ chân lông to ra dù dùng nhiều sản phẩm thu nhỏ?" |
| `da-nhay-cam` | "Điều gì đang xảy ra với làn da của bạn?" | "Tại sao làn da của bạn phản ứng với hầu hết mọi thứ?" |
| `mun-noi-tiet` | "Điều gì đang xảy ra trên da của bạn?" | "Tại sao mụn bùng phát theo chu kỳ dù bạn chăm sóc da đúng cách?" |
| `mun-trung-ca` | "Điều gì xảy ra bên dưới làn da của bạn?" | "Tại sao mụn trứng cá cứ tái phát dù bạn đã dùng nhiều cách?" |

Các condition còn lại (`clean-skin`, `da-moi-bat-dau`, `da-mun-tham-seo`, `da-tham-do`, `da-nep-nhan`, `tan-nhang`, `da-tho-rap`, `da-seo-ro`) đã có title đủ specific — giữ nguyên.

---

### H. V03 — Phục hồi payoff sections + đổi minigame

**File:** `src/landing/recipes/v03-facemap.ts`

**Root cause payoff chỉ hiện Section 1:** V03 dùng `payoff: 'confetti-card'` → `ConfettiCardPayoff` → `PayoffOrganism({ layout: "confetti" })`. Component `PayoffOrganism` chỉ render Section 1 (ResultCard). Đây là payoff "cũ" trước khi `ConfettiCardWhyPayoff` được xây dựng — không có WhySection, ClinicIntroSection, BenefitSection, hay FeatureSection.

**Fix payoff:** Đổi sang `'confetti-card-why-circles-quad'` (variant mới tạo ở Section K) — bao gồm toàn bộ sections + layout CirclesWithBackground + NumberedBadgeQuadGrid.

**Fix minigame:** Đổi `'face-map'` → `'skin-scan-chat'`.

**V03 recipe mới:**
```ts
export const v03Facemap: Recipe = {
  id: 'v03-facemap',
  label: 'Face-map tự khai + ocean',
  theme: 'opal',
  slots: {
    hook:     'bold-single',
    minigame: 'skin-scan-chat',
    payoff:   'confetti-card-why-circles-quad',
    programs: 'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:     'contact-info-with-video',
  },
};
```

---

### I. V25 — story-day minigame

**File:** `src/landing/recipes/v25-playful-cotton-candy.ts`

Đổi `minigame: 'face-map'` → `'story-day'`.

---

### J. Đăng ký skin-scan-chat vào registry

`SkinScanChatMinigame` đã có ở `src/landing/variants/minigame/skin-scan-chat.tsx` (export: `SkinScanChatMinigame`) nhưng **chưa được đăng ký** trong `src/landing/registry.ts`.

Cần thêm:
```ts
// Import:
import { SkinScanChatMinigame } from './variants/minigame/skin-scan-chat';

// Registry minigame object:
'skin-scan-chat': SkinScanChatMinigame,
```

---

### K. Tạo 2 shared payoff layout variants

**Vấn đề:** `ConfettiCardWhyPayoff` nhận `BenefitComponent` và `FeatureComponent` là extra props không thuộc `PayoffSlotProps`. Các payoff variant hiện tại chỉ forward `PayoffSlotProps` → không thể customize feature layout từ recipe level.

**Giải pháp:** Tạo 2 thin-wrapper variant mới. Mỗi variant hardcode đúng combo layout — không thay đổi `PayoffSlotProps`.

**`src/landing/variants/payoff/confetti-card-why-video-split.tsx`:**
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

**`src/landing/variants/payoff/confetti-card-why-circles-quad.tsx`:**
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

Đăng ký trong `registry.ts`:
```ts
'confetti-card-why-video-split': ConfettiCardWhyVideoSplitPayoff,
'confetti-card-why-circles-quad': ConfettiCardWhyCirclesQuadPayoff,
```

---

### L. Áp dụng feature layout variants vào recipes

| Version | Payoff slot cũ | Payoff slot mới |
|---------|---------------|----------------|
| v04 | `confetti-card-why` | `confetti-card-why-video-split` |
| v07 | `playful-immersive` | `confetti-card-why-video-split` |
| v14 | `natural-spa` | `confetti-card-why-video-split` |
| v25 | `playful-classic` | `confetti-card-why-video-split` |
| v03 | `confetti-card` *(+ fix sections)* | `confetti-card-why-circles-quad` |
| v21 | `electric-classic` | `confetti-card-why-circles-quad` |
| v10 | `clinical-compact` | `confetti-card-why-circles-quad` |
