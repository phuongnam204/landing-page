# Design Spec: Hook Diversity + Payoff Layout Refactor

**Date:** 2026-07-16
**Scope:** Two independent improvements to increase landing page diversity

---

## Part 1 — Hook Copy Diversity

### Problem

22 hook variant files share only 5–6 unique headline concepts. The natural group (4 variants) all share "Lắng nghe điều làn da bạn đang nói". The electric group (4 variants) all share "Da bạn đang nói gì?". Bold group (4 variants) all share "DA BẠN CẦN GÌ?". Clinical group (3 out of 4) share the same headline.

### Approach

Edit-in-place: update the copy (headline + subtext) directly inside each existing hook component file. No new files, no architecture change. 7 hooks are kept as-is; 15 files receive new copy.

### Hooks to keep (7 files, unchanged)

| File | Hook |
|---|---|
| `playful/classic.tsx` | "Mụn của bạn đang giấu bí mật gì?" |
| `playful/dark-accent.tsx` | "Da mụn không tự hết đâu" |
| `playful/immersive.tsx` | "Đã thử đủ thứ, vẫn mụn?" |
| `two-column.tsx` | "Da bạn đang giấu điều gì?" |
| `clinical/classic.tsx` | "Biết chính xác da bạn cần gì trong 60 giây" |
| `bold/classic.tsx` | "DA BẠN CẦN GÌ?" |
| `electric/classic.tsx` | "Da bạn đang nói gì?" |

### Hook assignments (15 files to update)

Each file: update `<h1>` text and the `<p>` subtext below it.

| File | New headline | Subtext | Hook type |
|---|---|---|---|
| `playful/minimal.tsx` | "Skincare không cần nhiều. Cần đúng." | "Biết đúng điều da cần mới quan trọng hơn số bước." | Contrarian minimal |
| `bold-single.tsx` | "Cùng sản phẩm, người kia hết mụn — bạn thì không. Tại sao?" | "Vì da mỗi người khác nhau. Phác đồ cũng phải vậy." | Curiosity gap |
| `clinical/compact.tsx` | "60 giây để biết điều mà 2 năm thử sản phẩm không nói ra." | "Phân tích da miễn phí — không cần đăng ký." | Specific promise |
| `clinical/dashboard.tsx` | "Sản phẩm xịn không trị được da — hiểu đúng da mới làm được." | "Đúng sản phẩm cho sai da còn tệ hơn không dùng gì." | Contrarian |
| `clinical/editorial.tsx` | "Da bạn xứng đáng được hiểu — không chỉ được che." | "Không che. Không filter. Chỉ cần đúng phác đồ." | Identity/dignity |
| `natural/classic.tsx` | "Da bạn đang phản bội bạn — hay bạn đang hiểu nhầm nó?" | "Câu trả lời khác hoàn toàn tùy vào góc nhìn." | Curiosity reframe |
| `natural/editorial.tsx` | "Bạn Google 'cách trị mụn' lần thứ mấy rồi?" | "Bạn biết câu trả lời rồi — và vẫn chưa tìm được đúng chỗ." | Humor / self-aware |
| `natural/spa.tsx` | "Chỉ cần da tốt hơn tuần trước. Không cần perfect." | "Bắt đầu từ việc hiểu đúng da bạn." | Soft aspiration |
| `natural/minimal.tsx` | "Mụn không phải lỗi của bạn. Nhưng cách xử lý thì có thể." | "Hiểu đúng — để lần này làm khác đi." | Empathy |
| `bold/stacked.tsx` | "Hết mụn này, mụn khác mọc. Vòng lặp đó có thể kết thúc." | "Khi xử lý đúng nguyên nhân, không phải triệu chứng." | Pain + promise |
| `bold/diagonal.tsx` | "Đã filter đến mức không nhận ra mình nữa chưa?" | "Da thật không cần filter — chỉ cần đúng cách chăm." | Pain point GenZ |
| `bold/typographic.tsx` | "Không phải bạn. Là cách tiếp cận." | "Tìm đúng hướng chỉ mất 60 giây." | Contrarian (ngắn, phù hợp big type) |
| `electric/glow-heavy.tsx` | "Skincare routine dài hơn cả bộ phim. Da vẫn tệ." | "Không phải bạn lười. Là cách tiếp cận." | Humor |
| `electric/soft-dark.tsx` | "Có một lý do da bạn chưa khỏi hẳn." | "Và nó thường không phải thứ bạn đang điều trị." | Curiosity gap |
| `electric/light-pop.tsx` | "Một ngày không cần nghĩ đến mụn. Nghe hay không?" | "Không cần perfect — chỉ cần đúng hướng." | Soft aspiration |

### Rules

- Only `<h1>` and the main `<p>` subtext change. No layout, no styling, no CTA text changes.
- The `<p>` below CTA ("Miễn phí..." / "Chỉ 60 giây...") is a trust signal — keep as-is unless it contradicts the new headline.
- Bold/typographic uses split `<h1>` across two `<div>` bands — treat "Không phải bạn." + "Là cách tiếp cận." as the split.

---

## Part 2 — Payoff Layout Refactor: Content/Component Separation

### Problem

4 feature-layout components have content hardcoded:
- `CirclesWithBackground` — STATS array and BG_IMAGE hardcoded inline
- `CardListCirclesLeft`, `Carousel` — import `O2SKIN_FEATURES` directly
- `NumberedBadgeCirclesRight` — imports `O2SKIN_BENEFIT` directly

Additionally, `ConfettiCardWhyPayoff` hardcodes Section 3 (Benefit) to `NumberedBadgeCirclesRight`. Only Section 4 (Feature) is pluggable via `FeatureComponent` prop.

Result: only 4 combinations possible. Target: 8 combinations (4 layouts × 2 content sources).

### New type

**File: `src/landing/variants/payoff/feature-layouts/types.ts`**

```typescript
export interface PayoffItem {
  title: string;    // main bold text
  body: string;     // supporting text
  image?: string;   // for Carousel and CardListCirclesLeft
  alt?: string;
  unit?: string;    // for CirclesWithBackground ("buổi", "%")
}
```

### Content files

**`constant/Features.tsx`** — keep `O2SKIN_FEATURES` as-is, add adapter export:
```typescript
export const featuresAsItems: PayoffItem[] = O2SKIN_FEATURES.map(f => ({
  title: f.title, body: f.body, image: f.image, alt: f.alt,
}));
```

**`constant/Benefit.tsx`** — add `image` field to each benefit item, add adapter export:
```typescript
// Each O2SKIN_BENEFIT item gains image field (reuse existing photos for missing ones)
export const benefitsAsItems: PayoffItem[] = O2SKIN_BENEFIT.map(b => ({
  title: b.value, body: b.label, image: b.image, alt: b.value,
}));
```

Benefit image assignments (reuse existing photos):
- Buổi 4–6 → `/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg`
- Không bị ép gói → `/benefit/soi-ba-nhon-3n.jpg`
- Đi làm ngay hôm đó → `/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg`
- Mụn hết từ nguyên nhân → `/benefit/soi-ba-nhon-3n.jpg`

**`constant/Stats.tsx`** — new file, extract hardcoded stats from `CirclesWithBackground`:
```typescript
export const o2skinStats: PayoffItem[] = [
  { title: '4–6',  unit: ' buổi', body: 'Thấy kết quả rõ rệt' },
  { title: '0h',   unit: '',      body: 'Không cần nghỉ dưỡng' },
  { title: '100%', unit: '',      body: 'Tự do dừng bất cứ lúc' },
  { title: '98%',  unit: '',      body: 'Khách hàng hài lòng' },
];
```

### Layout component changes

All 4 components: remove hardcoded content imports, accept `items: PayoffItem[]` prop **with a default** so existing consumers don't break.

**`CardListCirclesLeft`**
- Remove `import { O2SKIN_FEATURES }`
- Add props: `items: PayoffItem[] = featuresAsItems`, `accentImages?: [string, string]`
- `accentImages` default: `['/feature/IMG_1619.jpg', '/feature/co-so-vat-chat-hien-dai-3.jpg']`

**`Carousel`**
- Remove `import { O2SKIN_FEATURES }`
- Add prop: `items: PayoffItem[] = featuresAsItems`
- If `item.image` is absent: hide img element, show title-only card

**`NumberedBadgeCirclesRight`**
- Remove `import { O2SKIN_BENEFIT }`
- Add props: `items: PayoffItem[] = benefitsAsItems`, `accentImages?: [string, string]`
- `accentImages` default: `['/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg', '/benefit/soi-ba-nhon-3n.jpg']`

**`CirclesWithBackground`**
- Remove inline `STATS` and `BG_IMAGE` constants
- Add props: `items: PayoffItem[] = o2skinStats`, `bgImage?: string`
- `bgImage` default: `/benefit/hinh-co-so-vat-chat.jpg`
- `items` default: `o2skinStats` (imported from `constant/Stats`)
- Render: `item.title + item.unit` as the large number, `item.body` as label

Using default prop values means all existing payoff variant files that already pass one of these components as `FeatureComponent` continue to work unchanged — they still only receive `onContinue`, and the component self-sources its content via the default.

### `ConfettiCardWhyPayoff` changes

Add `BenefitComponent` prop, analogous to existing `FeatureComponent`:

```typescript
// New prop signature addition
BenefitComponent?: React.ComponentType<{ onContinue: () => void }>;

// Section 3 changes from hardcoded:
<NumberedBadgeCirclesRight onContinue={...} />
// To pluggable:
<BenefitComp onContinue={...} />
```

Default value: `NumberedBadgeCirclesRight` (which already defaults to `benefitsAsItems` internally) — so existing payoff variants that don't specify `BenefitComponent` render identically to before.

### Combination matrix

| Layout | Feature slot content | Benefit slot content |
|---|---|---|
| `CardListCirclesLeft` | `featuresAsItems` | `benefitsAsItems` |
| `Carousel` | `featuresAsItems` | `benefitsAsItems` (with images) |
| `NumberedBadgeCirclesRight` | `featuresAsItems` | `benefitsAsItems` |
| `CirclesWithBackground` | `o2skinStats` | `o2skinStats` |

**8 valid combinations** (up from 4).

### Out of scope

- Updating existing payoff variant files to use new combinations — that is a separate task after this refactor lands.
- Adding new benefit/feature content items.

---

## Definition of Done

- Part 1: All 15 hook files have updated `<h1>` and subtext. `npx tsc --noEmit` passes.
- Part 2: All 4 layout components accept `items` prop. `ConfettiCardWhyPayoff` has `BenefitComponent` prop. Existing payoff variants render identically (no visual regression). `npx tsc --noEmit` passes.
