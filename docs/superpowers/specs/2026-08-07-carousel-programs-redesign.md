# CarouselPrograms Redesign

**Date:** 2026-08-07
**Scope:** `src/landing/variants/programs/CarouselPrograms.tsx`
**Type:** Experimental — can roll back at any time

---

## 1. Mục tiêu

Nâng cấp visual cho màn hình chọn liệu trình (CarouselPrograms):

- Card carousel sống động hơn nhờ ảnh thực thay thế màu solid ở topbar
- Tỉ lệ card 40:60 (image:text) cho không gian đọc tốt hơn
- Background toàn màn hình dùng ảnh nhà thuốc O2 Skin thay color token
- Hover animation desktop tinh tế (lift + bottom color bar)

---

## 2. Background toàn màn hình

**File:** `/background/nha-thuoc-3-new.jpg`

**CSS applied to outermost div (thay thế `background: var(--lp-bg-programs)`):**

```css
background-image:
  linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.58)),
  url('/background/nha-thuoc-3-new.jpg');
background-size: cover;
background-position: center center;
```

**Plan B (nếu mobile crop xấu):** Đổi `background-position` từ `center center` → `center top`.

**Áp dụng:** Tất cả version của carousel (không phân biệt theme/recipe).

**Text color adaptation:** Với dark background, toàn bộ UI text trên carousel (header, dots, arrows, counter, back button) chuyển sang white/near-white:

| Element | Trước | Sau |
|---|---|---|
| Label "Tất cả liệu trình" | `var(--lp-accent)` | `rgba(255,255,255,0.7)` |
| H2 title | `text-cta` | `white` |
| Subtitle "Vuốt hoặc kéo" | `text-cta/45` | `rgba(255,255,255,0.5)` |
| Dot indicators | `var(--lp-accent)` | `white` (active) / `rgba(255,255,255,0.3)` (inactive) |
| Arrow buttons border + icon | `var(--lp-accent)` | `rgba(255,255,255,0.55)` |
| Counter text | `text-cta/40` | `rgba(255,255,255,0.45)` |
| Back button | `var(--lp-accent)` | `rgba(255,255,255,0.65)` |

---

## 3. Card redesign

### 3.1 Dimensions

| Constant | Trước | Sau |
|---|---|---|
| `CARD_WIDTH` | 260px | 260px (không đổi) |
| `CARD_STEP` | 240px | 240px (không đổi) |
| `CARD_HEIGHT` | (không có, auto) | 360px (mới) |
| Stage height | 320px | 380px |

Tỉ lệ: image area = 144px (40%), text area = 216px (60%).

### 3.2 Image area (top 40% = 144px)

```
position: relative; overflow: hidden; height: 144px
```

**Background strategy:**

```tsx
const bg = prog.images?.[0]
  ? `url('${prog.images[0]}')`
  : undefined;

style={{
  background: bg
    ? `linear-gradient(to bottom, rgba(0,0,0,0) 30%, rgba(0,0,0,0.52) 100%), ${bg} center top / cover no-repeat`
    : color,   // PALETTE color fallback
}}
```

- `background-position: center top` — ảnh treatment/clinic thường có subject quan trọng ở phần trên
- Gradient overlay chỉ đủ để chip đọc được ở bottom, không đè lên toàn bộ ảnh
- Fallback về solid PALETTE color khi không có ảnh (`microneedling-repair`)

**Chip (sessions + VIP):**

```tsx
// Vị trí: absolute, bottom-left
// Style:
background: `rgba(R, G, B, 0.78)`  // PALETTE color parsed to RGB
backdrop-filter: blur(6px)
border: 1px solid rgba(255,255,255,0.25)
border-radius: 20px
padding: 3px 10px
font-size: 11px; font-weight: 700; color: white
```

Hiển thị: `"{sessions} buổi"` nếu có sessions, `"VIP"` nếu `isVip`, cả hai nếu cả hai cùng tồn tại (VIP trước).

Không hiển thị chip nếu cả hai đều absent.

### 3.3 Text area (bottom 60% = 216px)

Layout: flex column, justify-between, padding `16px 16px 14px`.

**Background text area:** `var(--lp-bg-card)` — nền sáng tự tạo ra sự tách biệt với background tối toàn màn hình. Text trong area này dùng màu tối (dark on light), **không phải white**.

**Program name:** font-size 16px, font-weight 700, `color: var(--lp-cta)` (dark), line-height 1.3. Tối đa 2 dòng (`overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical`).

**Summary bullets:** 3 items từ `prog.summary`. Mỗi item: checkmark SVG (stroke màu `color` của card từ PALETTE) + text 12px, `color: var(--lp-cta)` tại opacity 0.65.

**CTA:** text link thay thế full-width button, dùng màu PALETTE của card làm màu text/icon:

```tsx
<button
  style={{ color: cardColor }}
  className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-80"
>
  Xem chi tiết liệu trình
  <svg /* arrow-right 14px, stroke=currentColor */ />
</button>
```

### 3.4 Hover animation (desktop only — `@media (hover: hover)`)

Option C: lift + bottom color bar.

**Implementation:** CSS custom property approach — không trigger React re-render.

1. Mỗi card div nhận inline style `--card-color: {hexColor}` (PALETTE color của card đó).
2. Inject một `<style>` block duy nhất vào JSX (cùng chỗ với `@keyframes sheet-in/sheet-out` hiện tại):

```css
@media (hover: hover) {
  .carousel-card {
    border-bottom: 3px solid transparent;
    transition: transform 200ms ease, border-bottom-color 200ms ease;
  }
  .carousel-card:hover {
    transform: translateY(-5px);
    border-bottom-color: var(--card-color);
  }
}
```

3. Card div thêm `className="carousel-card"` — không ảnh hưởng đến animation RAF hiện tại vì `transform` từ RAF override CSS transform ở mọi frame khi đang drag. Hover chỉ hoạt động khi carousel đứng yên (không drag).

**Edge case:** Trong khi spring đang chạy, `renderFrame` overrides `transform` bằng `el.style.transform` trực tiếp → CSS hover transform bị vô hiệu hóa tự động → không conflict.

### 3.5 Active card styling

Card đang active (`idx === activeIdx`) nhận thêm:
- Box shadow: `0 16px 48px {color}40, 0 4px 16px rgba(0,0,0,0.15)` (giữ nguyên logic hiện tại từ `renderFrame`)
- Không thêm gì khác — glow shadow đã đủ phân biệt

---

## 4. Không thay đổi

- Toàn bộ carousel mechanics: spring physics, drag, touch events, snap, edge damping
- Detail sheet overlay (`GridWithFaqPrograms`)
- Dot indicators (chỉ đổi màu sang white)
- Arrow navigation + keyboard
- Back button (chỉ đổi màu sang white)
- `CARD_STEP`, `CARD_WIDTH`, `SPRING_K`, `SPRING_THRESH`, `SNAP_THRESHOLD`, `EDGE_DAMPING`

---

## 5. Rủi ro & mitigation

| Rủi ro | Mitigation |
|---|---|
| Ảnh background crop xấu trên mobile portrait | Plan B: `background-position: center top` |
| PALETTE color → RGB cho chip bg khó parse | Thêm helper `hexToRgb()` đơn giản |
| Hover state qua inline style cần per-card tracking | Dùng CSS custom property `--card-hover-color` + inject `<style>` một lần |
| Text area dark bg có thể không match với theme | `--lp-bg-card` với opacity 0.92 đủ flexible |
| `microneedling-repair` không có ảnh | Fallback PALETTE color đã được handle |

---

## 6. Files bị ảnh hưởng

- `src/landing/variants/programs/CarouselPrograms.tsx` — toàn bộ thay đổi
- Không có file nào khác cần sửa

---

## 7. Roll-back

Revert file `CarouselPrograms.tsx` về commit trước. Không có migration, không có data change.
