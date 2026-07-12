# Spec: v01 Upgrade — Remove v02, Mobile Hook Fix, Face-map + v04 Workflow

**Date:** 2026-07-12  
**Branch:** fix/landing-ux-review  
**Scope:** Recipe cleanup, hook mobile polish, minigame swap, payoff-onwards workflow upgrade

---

## 1. Tác vụ: Remove v02-skincare

### Mục tiêu
Loại bỏ `v02-skincare` khỏi danh sách version để dọn sạch experiment đã lỗi thời.

### Thay đổi

**`src/landing/recipes/index.ts`**
- Xóa `import { v02Skincare } from './v02-skincare'`
- Xóa `v02Skincare` khỏi mảng `allRecipes`

**`src/app/page.tsx`**
- Xóa `import { v02Skincare } from '../landing/recipes/v02-skincare'`
- Đổi fallback mặc định: `?? v02Skincare` → `?? v01Baseline` (import `v01Baseline` thay thế)

**Không xóa file `src/landing/recipes/v02-skincare.ts`** trong bước này — để TypeScript tự phát hiện nếu còn reference nào sót. Có thể xóa sau khi build sạch.

---

## 2. Tác vụ: Hook mobile optimization

### Mục tiêu
Trên mobile, hook hiện tại có thể overflow viewport (đặc biệt iPhone SE 375×667). Cần đảm bảo toàn bộ content hiển thị không scroll, CTA được căn giữa đẹp theo chiều ngang.

### File
`src/landing/variants/hook/two-column.tsx`

### Thay đổi

| Element | Trước | Sau |
|---|---|---|
| Container height | `h-screen` | `h-[100dvh]` |
| Image height | `h-72 md:h-[500px]` | `h-48 md:h-[500px]` |
| Heading size | `text-5xl md:text-6xl` | `text-4xl md:text-6xl` |
| Image margin | `mb-6 md:mb-0` | `mb-4 md:mb-0` |
| CTA wrapper | inline trong text div | `<div className="flex justify-center md:justify-start mt-7">` |

### Nguyên tắc
- Giữ `overflow-hidden` — không cho phép scroll
- `h-[100dvh]` xử lý đúng address bar trên mobile Chrome/Safari
- CTA vẫn `size="lg"`, không `fullWidth` — centered inline trên mobile (Option B đã chọn), left-aligned tự nhiên trên desktop

---

## 3. Tác vụ: v01 Recipe upgrade

### Mục tiêu
Thay minigame `findgame` bằng `face-map` (design của v04), và thay toàn bộ workflow từ payoff trở đi bằng v04 variants. Giữ nguyên theme `blossom` và hook `two-column`.

### File
`src/landing/recipes/v01-baseline.ts`

### Recipe sau khi thay đổi

```ts
export const v01Baseline: Recipe = {
  id: 'v01-baseline',
  label: 'Baseline — Facemap + blossom',
  theme: 'blossom',
  slots: {
    hook:       'two-column',
    minigame:   'face-map',
    payoff:     'confetti-card-why',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
};
```

### Tại sao không cần sửa component

Tất cả v04 variants (`face-map`, `confetti-card-why`, `grid-with-faq`, `short-form-with-testimonials`, `contact-info-with-video`) đều dùng CSS custom properties `var(--lp-*)`. Khi recipe dùng `theme: 'blossom'`, `LandingFlow` bọc class `theme-blossom`, và toàn bộ `--lp-*` vars tự động resolve sang blossom palette — không cần sửa dòng component nào.

**Face-map minigame:**
- Zone highlights dùng `var(--lp-accent)` — tự adapt blossom
- Step 2 quiz (acne type options) dùng màu hardcoded per-option (đỏ/tím/hồng/xanh/emerald) — giữ nguyên theo yêu cầu ("tông màu giữ nguyên vì phù hợp với ads TikTok")
- Scan animation, SVG keyframes — giữ nguyên

**Không có nurse image** trong bất kỳ v04 variant nào — không cần xử lý bố trí ảnh.

---

## Thứ tự thực hiện

1. Remove v02-skincare (recipe index + app/page.tsx)
2. Hook mobile fix (two-column.tsx)
3. v01 recipe update (v01-baseline.ts)

Không có dependency giữa 3 tác vụ — có thể thực hiện song song hoặc tuần tự.

---

## Verification

Sau khi implement, kiểm tra:
- `/versions` gallery không còn thẻ v02-skincare
- `/` (root) trỏ đến v01-baseline với theme blossom
- Mobile hook: tất cả content visible, không scroll, CTA centered đẹp
- Face-map minigame chạy với màu blossom accent (tím nhạt/hồng)
- PayOff → Programs (FAQ) → Conversion (testimonials) → Done (video) — workflow chạy đúng thứ tự với blossom theme
