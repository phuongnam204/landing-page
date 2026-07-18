# Opencode Prompt — Ken Burns Hero Carousel

> Đây là prompt bàn giao đầy đủ context cho opencode. Copy toàn bộ phần dưới dấu `---` để dán vào opencode.

---

## Task

Rewrite `src/landing/variants/payoff/feature-layouts/Carousel.tsx` để biến nó thành một full-screen Ken Burns hero carousel. Giữ nguyên export name `Carousel` và interface `{ onContinue, items? }` để không break các caller.

## Stack

- Next.js 15 App Router, `'use client'` components
- TypeScript strict
- Tailwind CSS v3 (class-based), kết hợp inline `style={}` cho dynamic values
- CSS custom properties: `--lp-primary`, `--lp-accent`, `--lp-radius-card` (mapped qua tailwind: `cta`, `accent`, `rounded-soft`)

## File cần sửa

**`src/landing/variants/payoff/feature-layouts/Carousel.tsx`** — nội dung hiện tại:

```tsx
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
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--lp-blob-3)' }}>
          Đảm bảo chất lượng chuyên sâu
        </p>
        <h2 className="font-black text-3xl md:text-4xl text-white leading-tight">
          Những gì O2skin có
        </h2>
      </div>

      {/* Desktop: 3-column grid */}
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
        <button onClick={() => setIdx(i => (i - 1 + n) % n)} className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all z-10" aria-label="Trước">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <button onClick={() => setIdx(i => (i + 1) % n)} className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all z-10" aria-label="Tiếp">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <div className="flex gap-2.5">
        {items.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} className="w-2 h-2 rounded-full transition-all duration-300"
            style={{ background: i === idx ? 'var(--lp-blob-3)' : 'rgba(255,255,255,0.35)', transform: i === idx ? 'scale(1.4)' : 'scale(1)' }}
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

## Files tham chiếu (không sửa)

**`src/landing/variants/payoff/feature-layouts/types.ts`:**
```ts
export interface PayoffItem {
  title: string;
  body: string;
  image?: string;
  alt?: string;
  unit?: string;
}
```

**`src/landing/variants/payoff/constant/Features.tsx`** (data source, không sửa):
```tsx
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
export const featuresAsItems: PayoffItem[] = O2SKIN_FEATURES.map(f => ({ ...f }));
```

**`src/components/atoms/CtaButton.tsx`** — giữ nguyên, dùng `variant="inverse"` (nền trắng, text đậm) hoặc `variant="dark"` tuỳ aesthetic.

## Yêu cầu implementation

### Behaviour

1. **Full-screen hero**: Container `w-full min-h-[100dvh] relative overflow-hidden bg-black`. Mỗi slide là `absolute inset-0`, image fill toàn màn hình `object-cover`.
2. **Ken Burns**: Image trong active slide chạy CSS animation `scale(1.0) → scale(1.12)` trong `3500ms`, `linear`, `fill-mode: forwards`. Bắt buộc dùng `key={activeIdx}` trên `<img>` để React remount element và restart animation khi đổi slide.
3. **Crossfade**: Dùng `prevIdx: number | null` để render đồng thời slide cũ (đang fade out, z-10) và slide mới (đang fade in, z-0). Sau `650ms` thì set `prevIdx = null` để unmount slide cũ.
4. **Header animations**: Dùng inline `style={{ animation: ... }}` với `@keyframes` được khai báo trong `<style>` tag bên trong component.
   - Slide active: `header-enter` — `opacity:0 + translateY(16px) → opacity:1 + translateY(0)`, `500ms ease-out`, delay `200ms`, `fill-mode: both`
   - Slide exiting (prevIdx): `header-exit` — `opacity:1 + translateY(0) → opacity:0 + translateY(-10px)`, `350ms ease-in`, `fill-mode: forwards`
   - Subtitle stagger delay thêm 100ms so với headline
5. **Timer**: Dùng `useRef<ReturnType<typeof setTimeout>>` — KHÔNG dùng `setInterval`. Hàm `goTo(next)` gọi `clearTimeout` trước khi set slide mới. Auto-advance sau `3500ms`.
6. **Arrow click**: Gọi `goTo()` ngay lập tức, cancel timer hiện tại. Arrows và Dots render ngoài slide layers ở `z-20`, không bị ảnh hưởng bởi fade animation.
7. **CTA**: `<CtaButton variant="inverse" size="lg">` render tại `absolute bottom-16 left-1/2 -translate-x-1/2 z-20`. Gọi `onContinue`.
8. **Dots**: `absolute bottom-6 left-1/2 -translate-x-1/2 z-20`, active dot `bg-white scale-125`, inactive `bg-white/40`.
9. **Overlay**: `linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.1) 100%)` — đủ tối để text trắng readable.
10. **Reduced motion**: Nếu `prefers-reduced-motion: reduce`, bỏ Ken Burns và crossfade duration về `0ms`.

### State

```ts
const [activeIdx, setActiveIdx] = useState(0);
const [prevIdx, setPrevIdx]     = useState<number | null>(null);
const timerRef = useRef<ReturnType<typeof setTimeout>>();
const activeIdxRef = useRef(activeIdx); // giải quyết stale closure trong timer
```

`goTo` function:
```ts
function goTo(next: number) {
  clearTimeout(timerRef.current);
  setPrevIdx(prev => (prev !== null ? prev : activeIdxRef.current));
  setActiveIdx(next);
  activeIdxRef.current = next;
  setTimeout(() => setPrevIdx(null), 650);
  timerRef.current = setTimeout(() => goTo((next + 1) % items.length), 3500);
}
```

Khởi động khi mount:
```ts
useEffect(() => {
  timerRef.current = setTimeout(() => goTo(1 % items.length), 3500);
  return () => clearTimeout(timerRef.current);
}, []); // eslint-disable-line react-hooks/exhaustive-deps
```

### Keyframes (khai báo trong `<style>` tag bên trong JSX)

```css
@keyframes ken-burns {
  from { transform: scale(1); }
  to   { transform: scale(1.12); }
}
@keyframes header-enter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes header-exit {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-10px); }
}
```

### Structure gợi ý

```tsx
export function Carousel({ onContinue, items = featuresAsItems }) {
  // ... state, timer logic ...

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-black">
      <style>{`/* keyframes đây */`}</style>

      {/* Slide layers */}
      {[prevIdx, activeIdx].filter((v, i, a) => v !== null && a.indexOf(v) === i).map(slideIdx => {
        const isExiting = slideIdx === prevIdx && slideIdx !== activeIdx;
        const item = items[slideIdx!];
        return (
          <div
            key={slideIdx}
            className="absolute inset-0"
            style={{
              zIndex: isExiting ? 10 : 0,
              opacity: ..., // transition opacity
              transition: 'opacity 600ms ease-in-out',
            }}
          >
            <img
              key={isExiting ? `exit-${slideIdx}` : `active-${activeIdx}`}
              src={item.image}
              alt={item.alt ?? ''}
              className="absolute inset-0 w-full h-full object-cover"
              style={isExiting ? {} : {
                animation: 'ken-burns 3.5s linear forwards',
                transformOrigin: 'center center',
              }}
            />
            {/* overlay */}
            <SlideContent title={item.title} body={item.body} isExiting={isExiting} />
          </div>
        );
      })}

      {/* Arrows — z-20, ngoài slide layers */}
      <button onClick={() => goTo((activeIdx - 1 + n) % n)} ...>
      <button onClick={() => goTo((activeIdx + 1) % n)} ...>

      {/* CTA */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
        <CtaButton variant="inverse" size="lg" onClick={onContinue}>
          Xem chương trình phù hợp →
        </CtaButton>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5"> ... </div>
    </div>
  );
}
```

## Constraints

- Không thay đổi `PayoffItem` interface
- Không thay đổi export signature của `Carousel`
- Không import thêm thư viện ngoài (không dùng framer-motion, swiper, v.v.)
- Không dùng `setInterval` — chỉ dùng `setTimeout` chain để dễ cancel
- Không xoá `CarouselCard` nếu muốn giữ, nhưng nó sẽ không được dùng nữa sau rewrite — có thể xoá
- File phải có `'use client'` directive ở dòng đầu

## Verify sau khi implement

1. Mở `/v/v24-electric-light-pop` (hoặc bất kỳ version nào dùng Carousel), kéo xuống phần Feature section
2. Kiểm tra: image fill toàn màn hình, text overlay rõ, Ken Burns zoom nhẹ sau 1-2s
3. Click arrow trái/phải: chuyển slide ngay, không lag
4. Để tự chạy: sau ~3.5s tự chuyển sang slide tiếp theo, crossfade mượt
5. Headline và subtitle có entrance animation (fade up) khi slide mới vào
6. CTA button hiển thị trên background, click → chuyển sang section Programs
