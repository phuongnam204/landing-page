# Hook Diversity + Payoff Layout Refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** (1) Give each of the 15 hook files a unique headline + subtext. (2) Decouple content from the 4 feature-layout components using a `PayoffItem` type so any layout can render either features or benefits.

**Architecture:** Part 1 is 15 edit-in-place swaps — no new files, no architecture. Part 2 creates a `PayoffItem` interface, adapter exports in constants, default-prop upgrades in 4 layout components, and a new `BenefitComponent` prop in `ConfettiCardWhyPayoff`. Existing payoff variant files remain unchanged because all layout props default to current data.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind 3, no new dependencies.

---

## Part 2 — Payoff Layout Refactor

Do Part 2 first: it creates the types that existing consumers already pass through defaults, so there are no breaking changes and it can be verified via TypeScript alone.

---

### Task 1: Create `PayoffItem` type and update the barrel export

**Files:**
- Create: `src/landing/variants/payoff/feature-layouts/types.ts`
- Modify: `src/landing/variants/payoff/feature-layouts/index.ts`

- [ ] **Step 1: Create the type file**

```typescript
// src/landing/variants/payoff/feature-layouts/types.ts
export interface PayoffItem {
  title: string;
  body: string;
  image?: string;
  alt?: string;
  unit?: string;
}
```

- [ ] **Step 2: Re-export from the barrel**

Replace the contents of `src/landing/variants/payoff/feature-layouts/index.ts` with:

```typescript
export { Carousel } from './Carousel';
export { CirclesWithBackground } from './CirclesWithBackground';
export { NumberedBadgeCirclesRight } from './NumberedBadgeCirclesRight';
export { CardListCirclesLeft } from './CardListCirclesLeft';
export type { PayoffItem } from './types';
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors related to `PayoffItem`.

---

### Task 2: Create Stats constant, add adapters to Features and Benefit

**Files:**
- Create: `src/landing/variants/payoff/constant/Stats.tsx`
- Modify: `src/landing/variants/payoff/constant/Features.tsx`
- Modify: `src/landing/variants/payoff/constant/Benefit.tsx`

- [ ] **Step 1: Create `Stats.tsx`**

```typescript
// src/landing/variants/payoff/constant/Stats.tsx
import type { PayoffItem } from '../feature-layouts/types';

export const o2skinStats: PayoffItem[] = [
  { title: '4–6',  unit: ' buổi', body: 'Thấy kết quả rõ rệt' },
  { title: '0h',   unit: '',      body: 'Thời gian nghỉ dưỡng' },
  { title: '100%', unit: '',      body: 'Tự do dừng bất cứ lúc' },
  { title: '98%',  unit: '',      body: 'Khách hàng hài lòng' },
];
```

- [ ] **Step 2: Add `featuresAsItems` adapter to `Features.tsx`**

Append after the existing `O2SKIN_FEATURES` export in `src/landing/variants/payoff/constant/Features.tsx`:

```typescript
import type { PayoffItem } from '../feature-layouts/types';

export const featuresAsItems: PayoffItem[] = O2SKIN_FEATURES.map(f => ({
  title: f.title,
  body: f.body,
  image: f.image,
  alt: f.alt,
}));
```

The final file should be:

```typescript
// src/landing/variants/payoff/constant/Features.tsx
import type { PayoffItem } from '../feature-layouts/types';

export const O2SKIN_FEATURES = [
  {
    title: 'Cơ Sở Vật Chất Hiện Đại, Đạt Chuẩn Y Tế',
    body: 'Không gian phòng khám thông thoáng và sạch sẽ, thiết kế hiện đại và tiện nghi, mang đến trải nghiệm điều trị thoải mái cho khách hàng.',
    image: '/feature/co-so-vat-chat-hien-dai.jpg',
    alt: 'Cơ sở vật chất hiện đại tại O2Skin',
  },
  {
    title: 'Thiết Bị IPL / Laser Nhập Khẩu Chính Hãng',
    body: 'Nhập khẩu chính ngạch với chứng nhận y tế, phát xung chính xác — kiểm soát an toàn và hiệu quả tối đa.',
    image: '/feature/thiet-bi-laze-nhap-khau.jpg',
    alt: 'Điều trị IPL tại O2Skin',
  },
  {
    title: 'Nhà Thuốc Đạt Chuẩn GPP',
    body: 'Cung cấp dược mỹ phẩm chính hãng của các thương hiệu uy tín hàng đầu thế giới, giúp khách hàng an tâm về chất lượng sản phẩm.',
    image: '/feature/nha-thuoc-2.jpg',
    alt: 'Nhà thuốc đạt chuẩn GPP',
  },
];

export const featuresAsItems: PayoffItem[] = O2SKIN_FEATURES.map(f => ({
  title: f.title,
  body: f.body,
  image: f.image,
  alt: f.alt,
}));
```

- [ ] **Step 3: Update `Benefit.tsx` — add `image` field and `benefitsAsItems` adapter**

Replace the entire file `src/landing/variants/payoff/constant/Benefit.tsx`:

```typescript
// src/landing/variants/payoff/constant/Benefit.tsx
import type { PayoffItem } from '../feature-layouts/types';

export const O2SKIN_BENEFIT = [
  {
    value: 'Thấy kết quả từ buổi 4–6',
    label: 'Không phải đợi hết tháng thứ 3 — da giảm mụn và bớt thâm có thể thấy được từ những buổi điều trị đầu tiên.',
    image: '/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg',
  },
  {
    value: 'Không bị ép gói',
    label: 'Trả tiền từng buổi, toàn quyền quyết định tiếp tục hay dừng — không có hợp đồng ràng buộc nào cả.',
    image: '/benefit/soi-ba-nhon-3n.jpg',
  },
  {
    value: 'Đi làm ngay hôm đó',
    label: 'Không cần nghỉ dưỡng sau điều trị — đỏ da nhẹ tạm thời tự hết trong vài giờ, sinh hoạt bình thường.',
    image: '/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg',
  },
  {
    value: 'Mụn hết từ nguyên nhân',
    label: 'Phác đồ cá nhân hoá nhắm đúng loại mụn của bạn, không chỉ che triệu chứng bên ngoài để mụn không quay lại kiểu cũ.',
    image: '/benefit/soi-ba-nhon-3n.jpg',
  },
];

export const benefitsAsItems: PayoffItem[] = O2SKIN_BENEFIT.map(b => ({
  title: b.value,
  body: b.label,
  image: b.image,
  alt: b.value,
}));
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 3: Update `NumberedBadgeCirclesRight`

**Files:**
- Modify: `src/landing/variants/payoff/feature-layouts/NumberedBadgeCirclesRight.tsx`

- [ ] **Step 1: Replace file**

```typescript
// src/landing/variants/payoff/feature-layouts/NumberedBadgeCirclesRight.tsx
import type { PayoffItem } from './types';
import { benefitsAsItems } from '../constant/Benefit';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_ACCENT_IMAGES: [string, string] = [
  '/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg',
  '/benefit/soi-ba-nhon-3n.jpg',
];

export function NumberedBadgeCirclesRight({
  onContinue,
  items = benefitsAsItems,
  accentImages = DEFAULT_ACCENT_IMAGES,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
  accentImages?: [string, string];
}) {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--lp-bg-minigame)] flex items-center overflow-hidden px-5 py-16">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:gap-16 md:items-center">

          {/* ─── Left: title + numbered benefit list + CTA ─── */}
          <div className="flex flex-col gap-7 relative">
            {/* Orbit / radar decoration */}
            <div className="absolute -top-8 -left-10 w-52 h-52 text-cta opacity-[0.08] pointer-events-none" aria-hidden="true">
              <svg viewBox="0 0 134.5 134.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="67.25" cy="67.25" r="17.88" stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="67.25" cy="67.25" r="33.24" stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="67.25" cy="67.25" r="54"    stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="67.25" cy="67.25" r="67.24" stroke="currentColor" strokeWidth="0.8"/>
              </svg>
            </div>

            <div className="relative">
              <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-tight">
                Lợi ích khi chọn<br className="hidden md:block" /> trị mụn ở O2skin
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-cta text-white font-black text-base flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-black text-xl md:text-2xl text-cta leading-none">{item.title}</p>
                    <p className="text-sm text-cta/75 leading-snug mt-0.5">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <CtaButton onClick={onContinue}>
              Xem chương trình phù hợp &#8594;
            </CtaButton>
          </div>

          {/* ─── Right: overlapping circle images ─── */}
          <div className="relative h-[320px] md:h-[420px]">
            <div className="absolute top-0 right-0 w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img
                src={accentImages[0]}
                alt="Điều trị theo phác đồ chuẩn tại O2skin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-20 md:right-28 w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-[var(--lp-border)] shadow-2xl">
              <img
                src={accentImages[1]}
                alt="Soi da cùng chuyên viên O2skin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 4: Update `CardListCirclesLeft`

**Files:**
- Modify: `src/landing/variants/payoff/feature-layouts/CardListCirclesLeft.tsx`

- [ ] **Step 1: Replace file**

```typescript
// src/landing/variants/payoff/feature-layouts/CardListCirclesLeft.tsx
import type { PayoffItem } from './types';
import { featuresAsItems } from '../constant/Features';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_ACCENT_IMAGES: [string, string] = [
  '/feature/IMG_1619.jpg',
  '/feature/co-so-vat-chat-hien-dai-3.jpg',
];

export function CardListCirclesLeft({
  onContinue,
  items = featuresAsItems,
  accentImages = DEFAULT_ACCENT_IMAGES,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
  accentImages?: [string, string];
}) {
  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-5 py-12"
      style={{ background: 'linear-gradient(135deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 50%, var(--lp-accent)) 50%, var(--lp-accent) 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.07) 0%, transparent 55%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-16 md:items-center">

          {/* ─── Left: overlapping circle images + IPL badge ─── */}
          <div className="relative h-[300px] md:h-[460px]">
            <div className="absolute top-0 left-0 w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img
                src={accentImages[0]}
                alt="Điều trị IPL tại O2Skin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-20 md:left-28 w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
              <img
                src={accentImages[1]}
                alt="Cơ sở vật chất hiện đại tại O2skin"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating tech badge */}
            <div className="absolute bottom-6 right-0 bg-white rounded-soft px-4 py-2.5 shadow-xl">
              <p className="text-xs font-black text-cta uppercase tracking-wider leading-none">IPL / Laser</p>
              <p className="text-xs text-cta/55 mt-1">Thiết bị nhập khẩu chính hãng</p>
            </div>
          </div>

          {/* ─── Right: title + feature cards + CTA ─── */}
          <div className="flex flex-col gap-7">
            <h2 className="font-extrabold text-2xl md:text-3xl text-white leading-tight">
              Những gì O2skin có
            </h2>

            <div className="flex flex-col gap-4">
              {items.map((item, i) => (
                <div key={i} className="bg-white/90 rounded-soft p-4 md:p-5 flex flex-col gap-1.5">
                  <p className="font-extrabold text-xs md:text-sm text-cta uppercase tracking-wider leading-snug">
                    {item.title}
                  </p>
                  <p className="text-sm text-cta/70 leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>

            <CtaButton variant="dark" size="lg" onClick={onContinue} className="shadow-lg">
              Xem chương trình phù hợp &#8594;
            </CtaButton>
          </div>

        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 5: Update `Carousel`

**Files:**
- Modify: `src/landing/variants/payoff/feature-layouts/Carousel.tsx`

- [ ] **Step 1: Replace file**

```typescript
// src/landing/variants/payoff/feature-layouts/Carousel.tsx
'use client';
import { useState, useEffect } from 'react';
import type { PayoffItem } from './types';
import { featuresAsItems } from '../constant/Features';
import { CtaButton } from '../../../../components/atoms/CtaButton';

function CarouselCard({
  image, alt, title, highlighted,
}: {
  image?: string; alt?: string; title: string; highlighted?: boolean;
}) {
  return (
    <div
      className="relative rounded-soft overflow-hidden transition-all duration-300"
      style={{
        aspectRatio: '3/4',
        border: highlighted ? '2px solid rgba(143,227,188,0.55)' : '1px solid rgba(255,255,255,0.12)',
        transform: highlighted ? 'scale(1.025)' : 'scale(1)',
      }}
    >
      {image && (
        <img src={image} alt={alt ?? ''} className="absolute inset-0 w-full h-full object-cover" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(45,38,64,0.92) 0%, rgba(45,38,64,0.25) 50%, transparent 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, var(--lp-accent), var(--lp-primary))', opacity: 0.18 }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-white font-bold text-sm md:text-base leading-snug">{title}</p>
      </div>
    </div>
  );
}

export function Carousel({
  onContinue,
  items = featuresAsItems,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
}) {
  const [idx, setIdx] = useState(0);
  const n = items.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center gap-8 overflow-hidden px-5 py-16"
      style={{ background: 'linear-gradient(135deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 50%, var(--lp-accent)) 50%, var(--lp-accent) 100%)' }}
    >
      <div className="text-center">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--lp-blob-3)' }}
        >
          Đảm bảo chất lượng chuyên sâu
        </p>
        <h2 className="font-black text-3xl md:text-4xl text-white leading-tight">
          Những gì O2skin có
        </h2>
      </div>

      {/* Desktop: 3-column grid, active card highlighted by auto-cycling dot */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-5 w-full max-w-5xl mx-auto">
        {items.map((item, i) => (
          <CarouselCard key={i} image={item.image} alt={item.alt} title={item.title} highlighted={i === idx} />
        ))}
      </div>

      {/* Mobile: single-card sliding carousel */}
      <div className="md:hidden w-full relative">
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(calc(-${idx} * (85% + 12px)))`,
              transition: 'transform 350ms ease-in-out',
            }}
          >
            {items.map((item, i) => (
              <div key={i} className="shrink-0" style={{ width: '85%', marginRight: '12px' }}>
                <CarouselCard image={item.image} alt={item.alt} title={item.title} highlighted={i === idx} />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIdx(i => (i - 1 + n) % n)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all z-10"
          aria-label="Trước"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={() => setIdx(i => (i + 1) % n)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all z-10"
          aria-label="Tiếp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === idx ? 'var(--lp-blob-3)' : 'rgba(255,255,255,0.35)',
              transform: i === idx ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <CtaButton variant="dark" size="lg" onClick={onContinue}>
        Xem chương trình phù hợp &#8594;
      </CtaButton>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 6: Update `CirclesWithBackground`

**Files:**
- Modify: `src/landing/variants/payoff/feature-layouts/CirclesWithBackground.tsx`

- [ ] **Step 1: Replace file**

```typescript
// src/landing/variants/payoff/feature-layouts/CirclesWithBackground.tsx
'use client';
import type { PayoffItem } from './types';
import { o2skinStats } from '../constant/Stats';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function CirclesWithBackground({
  onContinue,
  items = o2skinStats,
  bgImage = '/benefit/hinh-co-so-vat-chat.jpg',
}: {
  onContinue: () => void;
  items?: PayoffItem[];
  bgImage?: string;
}) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.65) 100%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-5 py-16 flex flex-col items-center gap-10">
        <h2 className="font-black text-3xl md:text-4xl text-white text-center leading-tight">
          Chúng tôi luôn đảm bảo<br className="hidden md:block" /> chất lượng dịch vụ
        </h2>

        {/* Stat circles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          {items.map((item, i) => (
            <div key={i} className="flex justify-center">
              <div
                className="w-36 h-36 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center px-4 shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.95)' }}
              >
                <p
                  className="font-black text-2xl md:text-3xl leading-none text-center"
                  style={{ color: 'var(--lp-accent)' }}
                >
                  {item.title}
                  {item.unit && (
                    <span className="text-lg md:text-xl">{item.unit}</span>
                  )}
                </p>
                <p
                  className="text-xs md:text-sm text-center font-semibold mt-2 leading-snug"
                  style={{ color: 'var(--lp-primary)' }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <CtaButton variant="dark" size="lg" onClick={onContinue}>
          Xem chương trình phù hợp &#8594;
        </CtaButton>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

### Task 7: Add `BenefitComponent` prop to `ConfettiCardWhyPayoff`

**Files:**
- Modify: `src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx`

- [ ] **Step 1: Update the component signature and Section 3**

Find these two lines and change them:

Old signature (line ~170–175):
```tsx
export function ConfettiCardWhyPayoff({
  result,
  onContinue,
  FeatureComponent: FeatureComp = Carousel,
  topbarConfig,
}: PayoffSlotProps & { FeatureComponent?: React.ComponentType<{ onContinue: () => void }>; topbarConfig?: TopbarConfig }) {
```

New signature:
```tsx
export function ConfettiCardWhyPayoff({
  result,
  onContinue,
  FeatureComponent: FeatureComp = Carousel,
  BenefitComponent: BenefitComp = NumberedBadgeCirclesRight,
  topbarConfig,
}: PayoffSlotProps & {
  FeatureComponent?: React.ComponentType<{ onContinue: () => void }>;
  BenefitComponent?: React.ComponentType<{ onContinue: () => void }>;
  topbarConfig?: TopbarConfig;
}) {
```

Old Section 3 (line ~324):
```tsx
      {/* Section 3: Benefit */}
      <div ref={statsRef}>
        <NumberedBadgeCirclesRight onContinue={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
```

New Section 3:
```tsx
      {/* Section 3: Benefit */}
      <div ref={statsRef}>
        <BenefitComp onContinue={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit Part 2**

```bash
git add src/landing/variants/payoff/feature-layouts/types.ts \
        src/landing/variants/payoff/feature-layouts/index.ts \
        src/landing/variants/payoff/feature-layouts/NumberedBadgeCirclesRight.tsx \
        src/landing/variants/payoff/feature-layouts/CardListCirclesLeft.tsx \
        src/landing/variants/payoff/feature-layouts/Carousel.tsx \
        src/landing/variants/payoff/feature-layouts/CirclesWithBackground.tsx \
        src/landing/variants/payoff/constant/Stats.tsx \
        src/landing/variants/payoff/constant/Features.tsx \
        src/landing/variants/payoff/constant/Benefit.tsx \
        src/landing/variants/payoff/ConfettiCardWhyPayoff.tsx

git commit -m "refactor(payoff): decouple content from layout components via PayoffItem type

- Add PayoffItem interface and barrel export
- Extract o2skinStats to Stats.tsx; add featuresAsItems and benefitsAsItems adapters
- All 4 layout components accept items prop (default = existing data, no breaking changes)
- ConfettiCardWhyPayoff gains BenefitComponent prop (default = NumberedBadgeCirclesRight)"
```

---

## Part 1 — Hook Copy Diversity

Change only `<h1>` content and the main `<p>` subtext in each file. No layout, no styling, no CTA text changes.

---

### Task 8: `playful/minimal` + `bold-single`

**Files:**
- Modify: `src/landing/variants/hook/playful/minimal.tsx`
- Modify: `src/landing/variants/hook/bold-single.tsx`

- [ ] **Step 1: Update `playful/minimal.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-3xl md:text-5xl text-cta leading-tight">
  Da bạn cần được{' '}
  <span className="text-[var(--lp-accent)]">hiểu đúng</span>
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-3xl md:text-5xl text-cta leading-tight">
  Skincare không cần nhiều.{' '}
  <span className="text-[var(--lp-accent)]">Cần đúng.</span>
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base md:text-lg text-cta/70 mt-5">
  Không phải mua thêm — chỉ cần biết chính xác điều da bạn đang thực sự cần.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base md:text-lg text-cta/70 mt-5">
  Biết đúng điều da cần mới quan trọng hơn số bước.
</p>
```

- [ ] **Step 2: Update `bold-single.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-7xl text-cta leading-[1.05] tracking-tight">
  Da bạn đang{' '}
  <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
    nói gì
  </span>{' '}
  với bạn?
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-7xl text-cta leading-[1.05] tracking-tight">
  Cùng sản phẩm, người kia hết mụn — bạn thì không.{' '}
  <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
    Tại sao?
  </span>
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-cta/55 max-w-xs leading-relaxed">
  Chỉ mất 60 giây để biết da bạn thực sự cần gì.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-cta/55 max-w-xs leading-relaxed">
  Vì da mỗi người khác nhau. Phác đồ cũng phải vậy.
</p>
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

---

### Task 9: Clinical group — `compact`, `dashboard`, `editorial`

**Files:**
- Modify: `src/landing/variants/hook/clinical/compact.tsx`
- Modify: `src/landing/variants/hook/clinical/dashboard.tsx`
- Modify: `src/landing/variants/hook/clinical/editorial.tsx`

- [ ] **Step 1: Update `clinical/compact.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-3xl md:text-5xl text-[var(--lp-text)] leading-tight">
  Biết chính xác{' '}
  <span className="text-[var(--lp-accent)]">da bạn cần gì</span>{' '}
  trong 60 giây
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-3xl md:text-5xl text-[var(--lp-text)] leading-tight">
  60 giây để biết điều mà{' '}
  <span className="text-[var(--lp-accent)]">2 năm thử sản phẩm</span>{' '}
  không nói ra.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-[var(--lp-text)]/60 max-w-sm">
  Hệ thống phân tích vùng da mặt bằng bản đồ mụn — nhanh và trực quan.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-[var(--lp-text)]/60 max-w-sm">
  Phân tích da miễn phí — không cần đăng ký.
</p>
```

- [ ] **Step 2: Update `clinical/dashboard.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-5xl text-[var(--lp-primary)] leading-tight">
  Phân tích da{' '}
  <span className="text-[var(--lp-accent)]">chính xác</span> bằng dữ liệu
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-5xl text-[var(--lp-primary)] leading-tight">
  Sản phẩm xịn không trị được da —{' '}
  <span className="text-[var(--lp-accent)]">hiểu đúng da</span>{' '}
  mới làm được.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base text-[var(--lp-primary)]/60 max-w-md">
  Hệ thống bản đồ mụn khuếch đại vùng da có vấn đề — cho bạn cái nhìn rõ ràng nhất.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base text-[var(--lp-primary)]/60 max-w-md">
  Đúng sản phẩm cho sai da còn tệ hơn không dùng gì.
</p>
```

- [ ] **Step 3: Update `clinical/editorial.tsx`**

Old h1:
```tsx
<h1 className="font-bold text-4xl md:text-6xl text-[var(--lp-primary)] leading-snug">
  Biết chính xác{' '}
  <span className="text-[var(--lp-accent)]">da bạn cần gì</span>{' '}
  trong 60 giây
</h1>
```

New h1:
```tsx
<h1 className="font-bold text-4xl md:text-6xl text-[var(--lp-primary)] leading-snug">
  Da bạn xứng đáng được{' '}
  <span className="text-[var(--lp-accent)]">hiểu</span>{' '}
  — không chỉ được che.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base md:text-lg text-[var(--lp-primary)]/55 max-w-md leading-relaxed">
  Hệ thống phân tích vùng da mặt bằng bản đồ mụn — một phương pháp nhanh, trực quan, và được thiết kế riêng cho từng người.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base md:text-lg text-[var(--lp-primary)]/55 max-w-md leading-relaxed">
  Không che. Không filter. Chỉ cần đúng phác đồ.
</p>
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

---

### Task 10: Natural group — `classic`, `editorial`, `spa`, `minimal`

**Files:**
- Modify: `src/landing/variants/hook/natural/classic.tsx`
- Modify: `src/landing/variants/hook/natural/editorial.tsx`
- Modify: `src/landing/variants/hook/natural/spa.tsx`
- Modify: `src/landing/variants/hook/natural/minimal.tsx`

- [ ] **Step 1: Update `natural/classic.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl text-cta leading-tight">
  Lắng nghe điều{' '}
  <span className="text-[var(--lp-accent)]">làn da</span>{' '}
  bạn đang nói
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl text-cta leading-tight">
  Da bạn đang phản bội bạn —{' '}
  hay{' '}
  <span className="text-[var(--lp-accent)]">bạn đang hiểu nhầm</span>{' '}
  nó?
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-cta/60 max-w-sm leading-relaxed">
  Chỉ mất 60 giây để biết làn da bạn thực sự cần gì — và liệu trình nào phù hợp nhất.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-cta/60 max-w-sm leading-relaxed">
  Câu trả lời khác hoàn toàn tùy vào góc nhìn.
</p>
```

- [ ] **Step 2: Update `natural/editorial.tsx`**

Old h1:
```tsx
<h1 className="font-serif font-bold text-4xl md:text-6xl text-cta leading-tight italic">
  Lắng nghe điều{' '}
  <span className="text-[var(--lp-accent)] not-italic">làn da</span>{' '}
  bạn đang nói
</h1>
```

New h1:
```tsx
<h1 className="font-serif font-bold text-4xl md:text-6xl text-cta leading-tight italic">
  Bạn Google{' '}
  <span className="text-[var(--lp-accent)] not-italic">&lsquo;cách trị mụn&rsquo;</span>{' '}
  lần thứ mấy rồi?
</h1>
```

Old subtext `<p>`:
```tsx
<p className="font-serif italic text-base md:text-lg text-cta/55 max-w-sm leading-relaxed">
  Chỉ mất 60 giây để biết làn da bạn thực sự cần gì — và liệu trình nào phù hợp nhất.
</p>
```

New subtext `<p>`:
```tsx
<p className="font-serif italic text-base md:text-lg text-cta/55 max-w-sm leading-relaxed">
  Bạn biết câu trả lời rồi — và vẫn chưa tìm được đúng chỗ.
</p>
```

- [ ] **Step 3: Update `natural/spa.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-5xl md:text-6xl text-cta leading-tight">
  Lắng nghe điều{' '}
  <span className="text-[var(--lp-accent)]">làn da</span>{' '}
  bạn đang nói
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-5xl md:text-6xl text-cta leading-tight">
  Chỉ cần da{' '}
  <span className="text-[var(--lp-accent)]">tốt hơn tuần trước</span>.
  Không cần perfect.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base md:text-lg text-cta/55 max-w-lg leading-relaxed">
  Chỉ mất 60 giây để biết làn da bạn thực sự cần gì — và liệu trình nào phù hợp nhất.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base md:text-lg text-cta/55 max-w-lg leading-relaxed">
  Bắt đầu từ việc hiểu đúng da bạn.
</p>
```

- [ ] **Step 4: Update `natural/minimal.tsx`**

Old h1:
```tsx
<h1 className="font-bold text-4xl md:text-5xl text-cta leading-snug">
  Lắng nghe điều{' '}
  <span className="text-[var(--lp-accent)]">làn da</span>{' '}
  bạn đang nói
</h1>
```

New h1:
```tsx
<h1 className="font-bold text-4xl md:text-5xl text-cta leading-snug">
  Mụn không phải lỗi của bạn.{' '}
  <span className="text-[var(--lp-accent)]">Nhưng cách xử lý</span>{' '}
  thì có thể.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-sm text-cta/55 max-w-xs leading-relaxed">
  Chỉ mất 60 giây để biết làn da bạn thực sự cần gì.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-sm text-cta/55 max-w-xs leading-relaxed">
  Hiểu đúng — để lần này làm khác đi.
</p>
```

- [ ] **Step 5: TypeScript check**

```bash
npx tsc --noEmit
```

---

### Task 11: Bold group — `stacked`, `diagonal`, `typographic`

**Files:**
- Modify: `src/landing/variants/hook/bold/stacked.tsx`
- Modify: `src/landing/variants/hook/bold/diagonal.tsx`
- Modify: `src/landing/variants/hook/bold/typographic.tsx`

- [ ] **Step 1: Update `bold/stacked.tsx`**

This hook has a two-band layout: top band with h1, bottom section with p subtext.

Old h1 in top band:
```tsx
<h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center leading-tight" style={{ color: 'var(--lp-band-text)' }}>
  DA BẠN CẦN GÌ?
</h1>
```

New h1:
```tsx
<h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-center leading-tight" style={{ color: 'var(--lp-band-text)' }}>
  Hết mụn này, mụn khác mọc. Vòng lặp đó có thể kết thúc.
</h1>
```

Old subtext `<p>` in bottom section:
```tsx
<p className="text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed">
  Phân tích vùng da mặt chỉ trong 60 giây — để biết làn da bạn thực sự cần gì.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed">
  Khi xử lý đúng nguyên nhân, không phải triệu chứng.
</p>
```

- [ ] **Step 2: Update `bold/diagonal.tsx`**

Top band h1 (has `<br/>` and `<span>`):

Old:
```tsx
<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center leading-[1.1]" style={{ color: 'var(--lp-band-text)' }}>
  DA BẠN
  <br />
  <span style={{ color: 'var(--lp-band-accent)' }}>CẦN GÌ?</span>
</h1>
```

New:
```tsx
<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-center leading-[1.1]" style={{ color: 'var(--lp-band-text)' }}>
  Đã filter đến mức
  <br />
  <span style={{ color: 'var(--lp-band-accent)' }}>không nhận ra mình nữa?</span>
</h1>
```

Old subtext `<p>` in bottom section:
```tsx
<p className="text-sm md:text-base text-cta/70 max-w-xs md:max-w-sm leading-relaxed">
  Phân tích vùng da mặt chỉ trong 60 giây — để biết làn da bạn thực sự cần gì và liệu trình nào phù hợp nhất.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-sm md:text-base text-cta/70 max-w-xs md:max-w-sm leading-relaxed">
  Da thật không cần filter — chỉ cần đúng cách chăm.
</p>
```

- [ ] **Step 3: Update `bold/typographic.tsx`**

This hook has top band with h1 "DA BẠN" and bottom section with a `<p>` for "CẦN GÌ?" and a separate `<p>` for the subtext.

Old top band h1:
```tsx
<h1 className="text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]" style={{ color: 'var(--lp-band-text)' }}>
  DA BẠN
</h1>
```

New top band h1:
```tsx
<h1 className="text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]" style={{ color: 'var(--lp-band-text)' }}>
  Không phải bạn.
</h1>
```

Old big text `<p>` in bottom (`.hook-can-text`):
```tsx
<p className="hook-can-text text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]" style={{ color: 'var(--lp-band-accent)' }}>
  CẦN GÌ?
</p>
```

New:
```tsx
<p className="hook-can-text text-6xl md:text-9xl font-extrabold tracking-tight text-center leading-[0.9]" style={{ color: 'var(--lp-band-accent)' }}>
  Là cách tiếp cận.
</p>
```

Old subtext `<p>` (`.hook-fade-in`):
```tsx
<p className="hook-fade-in text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed" style={{ animationDelay: '0.55s' }}>
  Phân tích vùng da mặt chỉ trong 60 giây.
</p>
```

New:
```tsx
<p className="hook-fade-in text-sm md:text-base text-cta/60 text-center max-w-md leading-relaxed" style={{ animationDelay: '0.55s' }}>
  Tìm đúng hướng chỉ mất 60 giây.
</p>
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

---

### Task 12: Electric group — `glow-heavy`, `soft-dark`, `light-pop`

**Files:**
- Modify: `src/landing/variants/hook/electric/glow-heavy.tsx`
- Modify: `src/landing/variants/hook/electric/soft-dark.tsx`
- Modify: `src/landing/variants/hook/electric/light-pop.tsx`

Note: The electric variants use a custom `<button>` (not `CtaButton`) and do not import from the components directory. The badge above h1 says "Phân tích vùng da" — keep it unchanged.

- [ ] **Step 1: Update `electric/glow-heavy.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl leading-tight" style={{ color: 'var(--lp-band-text)' }}>
  Da bạn<br />
  <span style={{ color: 'var(--lp-accent)', filter: 'drop-shadow(0 0 30px var(--lp-accent))' }}>đang nói gì</span>?
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl leading-tight" style={{ color: 'var(--lp-band-text)' }}>
  Skincare routine dài<br />
  <span style={{ color: 'var(--lp-accent)', filter: 'drop-shadow(0 0 30px var(--lp-accent))' }}>hơn cả bộ phim</span>. Da vẫn tệ.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-band-text) 65%, transparent)' }}>
  Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-band-text) 65%, transparent)' }}>
  Không phải bạn lười. Là cách tiếp cận.
</p>
```

- [ ] **Step 2: Update `electric/soft-dark.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl leading-tight" style={{ color: 'var(--lp-primary)' }}>
  Da bạn<br />
  <span style={{ color: 'var(--lp-accent)' }}>đang nói gì</span>?
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl leading-tight" style={{ color: 'var(--lp-primary)' }}>
  Có một lý do da bạn<br />
  <span style={{ color: 'var(--lp-accent)' }}>chưa khỏi hẳn</span>.
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
  Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base md:text-lg max-w-md leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
  Và nó thường không phải thứ bạn đang điều trị.
</p>
```

- [ ] **Step 3: Update `electric/light-pop.tsx`**

Old h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-5" style={{ color: 'var(--lp-primary)' }}>
  Da bạn<br />
  <span style={{ color: 'var(--lp-accent)' }}>đang nói gì</span>?
</h1>
```

New h1:
```tsx
<h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-5" style={{ color: 'var(--lp-primary)' }}>
  Một ngày không cần<br />
  <span style={{ color: 'var(--lp-accent)' }}>nghĩ đến mụn</span>. Nghe hay không?
</h1>
```

Old subtext `<p>`:
```tsx
<p className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
  Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
</p>
```

New subtext `<p>`:
```tsx
<p className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
  Không cần perfect — chỉ cần đúng hướng.
</p>
```

- [ ] **Step 4: TypeScript check + commit Part 1**

```bash
npx tsc --noEmit
```

```bash
git add src/landing/variants/hook/playful/minimal.tsx \
        src/landing/variants/hook/bold-single.tsx \
        src/landing/variants/hook/clinical/compact.tsx \
        src/landing/variants/hook/clinical/dashboard.tsx \
        src/landing/variants/hook/clinical/editorial.tsx \
        src/landing/variants/hook/natural/classic.tsx \
        src/landing/variants/hook/natural/editorial.tsx \
        src/landing/variants/hook/natural/spa.tsx \
        src/landing/variants/hook/natural/minimal.tsx \
        src/landing/variants/hook/bold/stacked.tsx \
        src/landing/variants/hook/bold/diagonal.tsx \
        src/landing/variants/hook/bold/typographic.tsx \
        src/landing/variants/hook/electric/glow-heavy.tsx \
        src/landing/variants/hook/electric/soft-dark.tsx \
        src/landing/variants/hook/electric/light-pop.tsx

git commit -m "feat(hooks): update 15 hook files with unique headlines

Each of the 22 landing page versions now has a distinct hook concept.
Groups updated: playful/minimal, bold-single, all clinical, all natural, bold stacked/diagonal/typographic, all electric."
```
