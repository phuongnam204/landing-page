# CarouselPrograms Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign CarouselPrograms với background ảnh nhà thuốc, card 40:60 image/text, hover animation desktop (lift + bottom color bar).

**Architecture:** Toàn bộ thay đổi nằm trong một file duy nhất `CarouselPrograms.tsx`. Card được tách thành 2 lớp DOM — outer div (RAF positioning, ref) và inner `.carousel-card` div (CSS hover) — để 2 loại transform không xung đột. Không có test file vì đây là visual component; xác minh bằng dev server.

**Tech Stack:** React, TypeScript, Tailwind CSS, CSS custom properties, `requestAnimationFrame`

---

### Task 1: Thêm `CARD_HEIGHT` constant, `hexToRgb` helper, cập nhật stage height

**Files:**
- Modify: `src/landing/variants/programs/CarouselPrograms.tsx`

- [ ] **Step 1: Thêm `CARD_HEIGHT` vào Constants block**

Tìm block constants (dòng 10–17), thêm `CARD_HEIGHT` ngay sau `CARD_WIDTH`:

```tsx
const CARD_STEP      = 240;
const CARD_WIDTH     = 260;
const CARD_HEIGHT    = 360;   // px card total height (40% image + 60% text)
const SPRING_K       = 0.22;
const SPRING_THRESH  = 0.4;
const SNAP_THRESHOLD = CARD_STEP * 0.3;
const EDGE_DAMPING   = 0.22;
```

- [ ] **Step 2: Thêm `hexToRgb` helper vào Helpers block**

Ngay sau hàm `cardColor` (dòng 32–34), thêm:

```tsx
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
```

- [ ] **Step 3: Cập nhật stage height từ 320px → 380px**

Tìm div card stage (dòng ~257–261):

```tsx
style={{ height: '320px', overflow: 'visible' }}
```

Thay thành:

```tsx
style={{ height: `${CARD_HEIGHT + 20}px`, overflow: 'visible' }}
```

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/programs/CarouselPrograms.tsx
git commit -m "feat(carousel): add CARD_HEIGHT const + hexToRgb helper, expand stage"
```

---

### Task 2: Background màn hình + màu chrome + inject hover CSS

**Files:**
- Modify: `src/landing/variants/programs/CarouselPrograms.tsx`

- [ ] **Step 1: Thay background `--lp-bg-programs` bằng ảnh + overlay**

Tìm outer carousel div (dòng ~231–245), thay `background: 'var(--lp-bg-programs)'` bằng:

```tsx
<div
  className="h-[100dvh] w-full flex flex-col items-center justify-center gap-5 select-none"
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.58)),url('/background/nha-thuoc-3-new.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    cursor: 'grab',
    transition: 'transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 380ms ease',
    transform: sheetOpen ? 'scale(0.91) translateY(-18px)' : 'scale(1) translateY(0)',
    opacity: sheetOpen ? 0.42 : 1,
    transformOrigin: 'top center',
    pointerEvents: detailId ? 'none' : 'auto',
  }}
  onPointerDown={handlePointerDown}
  onPointerMove={handlePointerMove}
  onPointerUp={handlePointerUp}
  onPointerCancel={handlePointerUp}
>
```

- [ ] **Step 2: Cập nhật màu Header**

Tìm block Header (dòng ~247–254), thay toàn bộ:

```tsx
{/* Header */}
<div className="text-center px-5 shrink-0 pointer-events-none">
  <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
    Tất cả liệu trình
  </p>
  <h2 className="font-extrabold text-2xl leading-snug" style={{ color: 'white' }}>
    Chọn liệu trình phù hợp
  </h2>
  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
    Vuốt hoặc kéo để xem thêm
  </p>
</div>
```

- [ ] **Step 3: Cập nhật màu Dot indicators**

Tìm block dot indicators (dòng ~331–348), thay 2 style properties:

```tsx
style={{
  width:      idx === activeIdx ? '20px' : '8px',
  height:     '8px',
  background: idx === activeIdx ? 'white' : 'rgba(255,255,255,0.3)',
  opacity:    1,
}}
```

Xoá `opacity` property cũ (đã merged vào `background`).

- [ ] **Step 4: Cập nhật màu Arrow buttons và Counter**

Tìm block arrow navigation (dòng ~351–379):

Nút trái:
```tsx
style={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.55)' }}
```

Counter span:
```tsx
<span className="text-sm font-semibold tabular-nums min-w-[48px] text-center"
      style={{ color: 'rgba(255,255,255,0.45)' }}>
  {activeIdx + 1} / {allPrograms.length}
</span>
```

Nút phải:
```tsx
style={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.55)' }}
```

- [ ] **Step 5: Cập nhật màu Back button**

Tìm back button (dòng ~382–394):

```tsx
style={{ color: 'rgba(255,255,255,0.65)' }}
```

- [ ] **Step 6: Inject hover CSS vào `<style>` block**

Tìm `<style>` block hiện tại (dòng ~219–228), thêm vào sau `@keyframes sheet-out`:

```tsx
<style>{`
  @keyframes sheet-in {
    from { transform: translateY(100%); border-radius: 24px 24px 0 0; }
    to   { transform: translateY(0);    border-radius: 0 0 0 0; }
  }
  @keyframes sheet-out {
    from { transform: translateY(0);    border-radius: 0 0 0 0; }
    to   { transform: translateY(105%); border-radius: 24px 24px 0 0; }
  }
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
`}</style>
```

- [ ] **Step 7: Khởi động dev server, kiểm tra màn hình programs**

```bash
npm run dev
```

Mở browser, navigate đến màn hình programs. Xác nhận:
- Background ảnh nhà thuốc hiển thị với dark overlay
- Header text trắng/near-white rõ ràng
- Dots, arrows, counter, back button màu trắng

- [ ] **Step 8: Commit**

```bash
git add src/landing/variants/programs/CarouselPrograms.tsx
git commit -m "feat(carousel): dark image bg + white chrome colors + hover CSS"
```

---

### Task 3: Rebuild card image area (40% = 144px)

**Files:**
- Modify: `src/landing/variants/programs/CarouselPrograms.tsx`

Toàn bộ phần card JSX (bên trong `allPrograms.map`) được rewrite. Task này xử lý phần outer wrapper và image area.

- [ ] **Step 1: Thay outer card structure**

Tìm card div bắt đầu bằng `key={prog.id}` (dòng ~262–284), thay outer wrapper và xoá toàn bộ inner content (sẽ viết lại ở các step sau):

```tsx
<div
  key={prog.id}
  ref={el => { cardRefs.current[idx] = el; }}
  style={{
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${CARD_WIDTH}px`,
    willChange: 'transform, opacity',
    transition: 'box-shadow 200ms ease',
    cursor: 'pointer',
  }}
  onClick={() => {
    if (!isDragging.current && Math.abs(dragX.current) < 8) {
      const isActive = idx === activeIdxRef.current;
      if (isActive) openDetail(prog.id as ProgramId);
      else goTo(idx);
    }
  }}
>
  {/* Inner visual card — hover animation via CSS, separate from RAF outer div */}
  <div
    className="carousel-card"
    style={{
      '--card-color': color,
      borderRadius: '14px',
      overflow: 'hidden',
    } as React.CSSProperties}
  >
    {/* IMAGE AREA — placeholder, Task 3 fills this */}
    {/* TEXT AREA — placeholder, Task 4 fills this */}
  </div>
</div>
```

- [ ] **Step 2: Viết image area**

Thay `{/* IMAGE AREA — placeholder */}` bằng:

```tsx
{/* Image area: 40% of CARD_HEIGHT */}
<div
  style={{
    position: 'relative',
    height: `${CARD_HEIGHT * 0.4}px`,
    background: prog.images?.[0]
      ? `linear-gradient(to bottom,rgba(0,0,0,0) 30%,rgba(0,0,0,0.52) 100%),url('${prog.images[0]}') center top/cover no-repeat`
      : color,
  }}
>
  {(prog.sessions || prog.isVip) && (
    <span
      style={{
        position: 'absolute',
        bottom: 8,
        left: 8,
        background: `rgba(${hexToRgb(color)},0.78)`,
        backdropFilter: 'blur(6px)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: 20,
        padding: '3px 10px',
        fontSize: 11,
        fontWeight: 700,
        color: 'white',
        lineHeight: 1.4,
      }}
    >
      {prog.isVip && 'VIP'}
      {prog.isVip && prog.sessions ? ' · ' : ''}
      {prog.sessions ? `${prog.sessions} buổi` : ''}
    </span>
  )}
</div>
```

- [ ] **Step 3: Kiểm tra dev server**

Lúc này text area chưa có (placeholder), nhưng image area phải hiển thị đúng:
- Ảnh thực của từng program, crop từ `center top`
- Chip "4 buổi" / "VIP" ở bottom-left với màu accent + backdrop blur
- `microneedling-repair` (không có images) hiển thị solid PALETTE color

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/programs/CarouselPrograms.tsx
git commit -m "feat(carousel): card image area — real photo bg + chip overlay"
```

---

### Task 4: Rebuild card text area (60% = 216px)

**Files:**
- Modify: `src/landing/variants/programs/CarouselPrograms.tsx`

- [ ] **Step 1: Viết text area**

Thay `{/* TEXT AREA — placeholder */}` bằng:

```tsx
{/* Text area: 60% of CARD_HEIGHT */}
<div
  style={{
    padding: '14px 14px 13px',
    background: 'var(--lp-bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: 7,
  }}
>
  {/* Program name */}
  <h3
    style={{
      fontSize: 15,
      fontWeight: 700,
      color: 'var(--lp-cta)',
      lineHeight: 1.3,
      margin: 0,
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
    }}
  >
    {prog.name}
  </h3>

  {/* Summary bullets */}
  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
    {(prog.summary ?? []).slice(0, 3).map((s, i) => (
      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        <svg
          width="13" height="13" viewBox="0 0 14 14" fill="none"
          style={{ flexShrink: 0, marginTop: 2 }}
          aria-hidden="true"
        >
          <path d="M2.5 7l3 3 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontSize: 11, lineHeight: 1.45, color: 'var(--lp-cta)', opacity: 0.65 }}>
          {s}
        </span>
      </div>
    ))}
  </div>

  {/* CTA text link */}
  <button
    onPointerDown={e => e.stopPropagation()}
    onClick={e => {
      e.stopPropagation();
      const isActive = idx === activeIdxRef.current;
      if (isActive) openDetail(prog.id as ProgramId);
      else goTo(idx);
    }}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      background: 'none',
      border: 'none',
      padding: 0,
      cursor: 'pointer',
      fontSize: 12,
      fontWeight: 700,
      color,
      marginTop: 2,
    }}
  >
    Xem chi tiết liệu trình
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
</div>
```

- [ ] **Step 2: Kiểm tra toàn bộ card trên dev server**

Xác nhận:
- Card hiển thị đúng tỉ lệ image (trên) / text (dưới)
- Text area có nền sáng (`--lp-bg-card`), text màu tối, dễ đọc
- CTA màu PALETTE tương ứng từng card
- Chip trong image area hiển thị đúng
- Hover (trên desktop): card lift 5px + viền màu xuất hiện ở đáy
- Drag, spring, dots, arrows vẫn hoạt động bình thường
- Kiểm tra mobile (resize browser xuống 375px width): không bị vỡ layout, đủ thấy tất cả elements

- [ ] **Step 3: Kiểm tra mobile background**

Resize browser xuống 375×812 (iPhone portrait). Nếu ảnh background bị crop xấu:
- Tìm dòng `backgroundPosition: 'center center'` (Task 2 Step 1)
- Đổi thành `backgroundPosition: 'center top'`

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/programs/CarouselPrograms.tsx
git commit -m "feat(carousel): card text area — name, bullets, text-link CTA"
```

---

## Self-review

**Spec coverage:**
- [x] Background image `/background/nha-thuoc-3-new.jpg` + overlay 0.58 → Task 2
- [x] Tất cả version (không phân biệt theme) → background hard-coded vào JSX, không qua CSS var
- [x] Chrome text → white variants → Task 2
- [x] `CARD_HEIGHT = 360`, stage 380px, ratio 40:60 → Task 1 + Task 3
- [x] Image area 144px, bg từ `prog.images?.[0]`, fallback PALETTE → Task 3
- [x] Chip bottom-left, `rgba(hexToRgb,0.78)` + white text → Task 3
- [x] Chip hiển thị sessions + VIP, không hiển thị nếu absent → Task 3
- [x] Text area `--lp-bg-card`, dark text, name + 3 bullets + CTA → Task 4
- [x] CTA text link với PALETTE color thay full-width button → Task 4
- [x] Hover Option C via CSS custom property `--card-color` → Task 2 Step 6
- [x] `hexToRgb` helper → Task 1
- [x] Plan B mobile background-position → Task 4 Step 3
- [x] `microneedling-repair` fallback → Task 3 Step 2 (condition `prog.images?.[0]`)

**Không thay đổi (verified):**
- `CARD_STEP`, `CARD_WIDTH`, `SPRING_K`, `SPRING_THRESH`, `SNAP_THRESHOLD`, `EDGE_DAMPING` — không có task nào chỉnh
- Spring, drag, touch events, snap — không task nào đụng đến các handler
- `GridWithFaqPrograms` overlay — không task nào đụng đến
- `renderFrame` logic — không task nào đụng đến (chỉ thêm `--card-color` CSS var là data, không phải behavior)

**Placeholders:** Không có TBD hay TODO.

**Type consistency:** `hexToRgb` trả về `string` (định nghĩa Task 1), dùng trong template literal Task 3 — consistent. `CARD_HEIGHT` định nghĩa Task 1, dùng trong Task 1 (stage) và Task 3 (image area height) — consistent.
