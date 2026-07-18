# Ken Burns Hero Carousel — Design Spec

**Date:** 2026-07-18  
**Status:** Awaiting review

---

## Tổng quan

Nâng cấp `Carousel.tsx` hiện tại từ dạng card-grid sang full-screen hero carousel với Ken Burns effect. Mỗi slide dùng image phóng to làm background, headline lớn overlay bên trong, arrows hai bên, CTA trực tiếp trên background.

**File:** `src/landing/variants/payoff/feature-layouts/Carousel.tsx` (sửa in-place)  
**Data source:** `O2SKIN_FEATURES` (3 items, dùng `title` làm headline, `body` làm subtitle, `image` làm background)

---

## Anatomy một Slide

Các layer stack theo z-index từ dưới lên:

```
Container (relative, w-full, min-h-[100dvh], overflow-hidden)
  z0 — <img> background          absolute inset-0, object-cover, Ken Burns animation
  z1 — Dark overlay               absolute inset-0, gradient to top (rgba black)
  z2 — Slide content              absolute inset-0, flex center, header + subtitle
  z3 — Arrows + Dots + CTA        absolute, luôn on top, không bị ảnh hưởng bởi slide transition
```

---

## Animation Timeline — Một chu kỳ

```
0ms ─────────────────── 600ms ──────────── 3500ms ─── 4100ms
│                        │                  │           │
│←── slide fade-in ─────→│                  │           │
│←── ken-burns scale 1.0 ────────────────→ 1.12        │
│    (delay 0ms)         │                  │           │
│←── header-enter ──────→│  (visible)       │←exit──────│
│    (delay 200ms)       │                  │           │
│                        │                  │←slide-out→│
```

- `SLIDE_DURATION` = 3500ms (Ken Burns duration)
- `TRANSITION_DURATION` = 650ms (crossfade duration)
- Ken Burns: `animation-fill-mode: forwards` — image giữ scale 1.12 cho đến khi fade out

**Arrow click:** `clearTimeout(timerRef)` → `goTo(next)` ngay lập tức, không cần đợi hết 3500ms.

---

## Crossfade Architecture — Two-slot Rendering

Khi chuyển slide, cả `prevIdx` và `activeIdx` cùng tồn tại trong DOM:

```
prevIdx slide   z-index: 1   opacity 1→0 (600ms)   header-exit animation
                             Sau 650ms: unmount khỏi DOM

activeIdx slide z-index: 0   opacity 0→1 (600ms)   header-enter animation (delay 200ms)
                             <img key={activeIdx}>  → React remount → Ken Burns restart
```

**Trick cốt lõi:** `key={activeIdx}` trên `<img>` — React unmount/remount element, CSS `@keyframes` animation tự restart từ đầu. Không cần JS Animation API, không cần thêm/xóa class thủ công.

---

## Keyframes

```css
@keyframes ken-burns {
  from { transform: scale(1.0); }
  to   { transform: scale(1.12); }
}
/* duration: 3.5s, timing: linear, fill-mode: forwards */

@keyframes header-enter {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* duration: 500ms, ease-out, delay: 200ms */

@keyframes header-exit {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(-10px); }
}
/* duration: 350ms, ease-in */
```

Slide fade-in/out dùng CSS `opacity` transition trên wrapper div (không cần `@keyframes` riêng).

---

## State Management

```ts
const [activeIdx, setActiveIdx] = useState(0);
const [prevIdx, setPrevIdx]     = useState<number | null>(null);
const timerRef                  = useRef<ReturnType<typeof setTimeout>>();

function goTo(next: number) {
  clearTimeout(timerRef.current);
  setPrevIdx(activeIdx);
  setActiveIdx(next);
  setTimeout(() => setPrevIdx(null), 650); // TRANSITION_DURATION + buffer
  scheduleNext(next);
}

function scheduleNext(fromIdx: number) {
  timerRef.current = setTimeout(
    () => goTo((fromIdx + 1) % n),
    3500, // SLIDE_DURATION
  );
}

// Khởi động khi mount
useEffect(() => { scheduleNext(0); return () => clearTimeout(timerRef.current); }, []);
```

`prevIdx !== null` là đủ để biết đang trong transition — không cần state `transitioning` riêng.

---

## Layout Structure

```
Container  relative w-full min-h-[100dvh] overflow-hidden bg-black
│
├── [prevIdx slide]  absolute inset-0, z-10, opacity transition 0→1 in CSS
│     ├── <img>  absolute inset-0 w-full h-full object-cover
│     │          (không có key thay đổi → Ken Burns giữ nguyên trạng thái, fade out cùng slide)
│     ├── overlay  absolute inset-0, gradient
│     └── SlideContent  absolute inset-0, flex center
│           header với header-exit animation class
│
├── [activeIdx slide]  absolute inset-0, z-0, opacity transition
│     ├── <img key={activeIdx}>  absolute inset-0, ken-burns animation
│     ├── overlay  absolute inset-0, gradient
│     └── SlideContent  absolute inset-0, flex center
│           header với header-enter animation class
│
├── Arrow left   absolute left-4 top-1/2 -translate-y-1/2 z-20
├── Arrow right  absolute right-4 top-1/2 -translate-y-1/2 z-20
├── CTA button   absolute bottom-14 left-1/2 -translate-x-1/2 z-20
└── Dots         absolute bottom-5 left-1/2 -translate-x-1/2 z-20
```

---

## SlideContent

```tsx
function SlideContent({ title, body, isExiting }: {
  title: string;
  body: string;
  isExiting: boolean;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center gap-4 pointer-events-none">
      <h2
        className="font-black text-4xl md:text-6xl text-white leading-tight [text-wrap:balance] max-w-3xl"
        style={{ animation: isExiting ? 'header-exit 350ms ease-in forwards' : 'header-enter 500ms ease-out 200ms both' }}
      >
        {title}
      </h2>
      <p
        className="text-sm md:text-base text-white/75 max-w-lg leading-relaxed"
        style={{ animation: isExiting ? 'header-exit 350ms ease-in forwards' : 'header-enter 500ms ease-out 300ms both' }}
      >
        {body}
      </p>
    </div>
  );
}
```

Subtitle delay thêm 100ms sau headline để tạo stagger nhỏ.

---

## Overlay

```tsx
<div
  className="absolute inset-0 pointer-events-none"
  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)' }}
/>
```

---

## Arrows + Dots + CTA

Arrows và Dots render **ngoài** slide layers, ở z-20 — không bị ảnh hưởng bởi opacity transition của slide.

Arrows: `w-10 h-10 rounded-full bg-white/20 hover:bg-white/35`, SVG icon, `onClick={() => goTo(...)}`.

Dots: mỗi dot là button `w-2 h-2 rounded-full`, active dot `bg-white scale-125`, inactive `bg-white/40`.

CTA: `<CtaButton variant="dark">` wrap trong `pointer-events-auto`, gọi `onContinue`.

---

## Accessibility

- `<img>` có `alt` từ `PayoffItem.alt`
- Arrows có `aria-label="Slide trước"` / `aria-label="Slide tiếp"`  
- Dots có `aria-label={Slide ${i+1}}` + `aria-current` trên active dot
- `prefers-reduced-motion`: nếu user tắt animation, bỏ Ken Burns và dùng instant slide switch

```tsx
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// Ken Burns animation: style={{ animation: reduceMotion ? 'none' : 'ken-burns 3.5s linear forwards' }}
```

---

## Out of scope

- Không hỗ trợ swipe gesture trên mobile (arrows đủ dùng)
- Không autoplay pause khi tab hidden (có thể thêm sau)
- Không thay đổi `PayoffItem` interface — dùng `title` và `body` sẵn có
