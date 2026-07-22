# V18 Editorial Portrait Hook — Design Spec

## Overview

New hook variant `editorial-portrait` cho v18, lấy cảm hứng từ thiết kế personal-brand (arch photo frame + serif heading + SVG squiggle underline). Thay thế hook hiện tại `bold-stacked` của v18.

## Context

- **Version:** v18-bold-stacked (theme: rose-vivid)
- **Vấn đề:** Hook `bold-stacked` cùng kiểu layout với nhiều version khác, không có visual identity riêng.
- **Goal:** Tạo hook có photo frame nổi bật, heading provocative kết nối mạch narrative với minigame và payoff.

## Design Decisions

### Layout — Desktop

Bố cục 2 cột: **arch photo frame trái — content phải**.

- **Arch photo frame:** Flat top bám sát top edge viewport, rounded bottom (`border-radius: 0 0 R R` với R = half-width). Chứa `hookImage` portrait, background blush (`--lp-bg-hero`).
- **Content column:** badge label → heading → headingAccent + squiggle → subtext → CTA. Căn giữa dọc với arch.
- **Tagline bar:** Dải trắng mỏng ngay dưới hero, hiển thị subtext + teaser tone minigame.

Arch width: `clamp(200px, 28vw, 320px)`. Rounded bottom dùng `border-radius: 0 0 50% 50%` — tự adapt theo fluid width, tạo elliptical dome nhìn tự nhiên.

### Layout — Mobile

- Arch full-width ở trên (`border-radius: 0 0 50% 50% / 0 0 clamp(40px,10vw,60px) clamp(40px,10vw,60px)`) — elliptical dome drop từ top.
- Photo centered inside arch, `object-fit: cover`, `object-position: top`.
- Text + CTA block centered bên dưới arch.

### Copy

```
heading:       'Dùng đủ thứ'
headingAccent: 'vẫn nổi mụn?'
subtext:       'Không phải sản phẩm sai — có thể là chưa đúng nguyên nhân. Chúng tôi giúp bạn tìm ra.'
cta:           'Bắt đầu ngay'
badge:         'Phân tích da tức thì'
```

**Narrative thread:**
- Hook đặt câu hỏi pain-point → minigame "Vấn đề da của bạn là gì? / Chọn thẳng — chúng tôi trả lời thẳng" → payoff "Rõ rồi — đây là vấn đề thật của bạn."
- "vẫn nổi mụn?" validate đúng nỗi đau → "Chọn thẳng" ăn khớp tone bold/direct → "Vấn đề thật" chốt loop.

### SVG Squiggle Underline

- Inline SVG path ngay dưới `headingAccent` text.
- Style: handwritten wavy stroke, `stroke="var(--lp-accent)"`, `strokeWidth=2`, `strokeLinecap="round"`.
- Width khớp với text width (dùng `width: 100%` trên SVG, viewBox cố định).
- Không dùng CSS `text-decoration` vì không đủ control về vị trí và shape.

### Theme Tokens (rose-vivid)

| Token | Value | Dùng ở đâu |
|---|---|---|
| `--lp-bg-hero` | `#FFF0F3` | Nền trang, arch background |
| `--lp-primary` | `#881337` | Heading, text chính |
| `--lp-accent` | `#E11D48` | headingAccent, squiggle, CTA bg |
| `--lp-border` | `#FDA4AF` | Tagline bar border, divider |

CTA button: `background: var(--lp-accent)`, `color: #fff`, `border-radius: 99px` (pill).

## File Changes

| File | Action |
|---|---|
| `src/landing/variants/hook/editorial/portrait.tsx` | Tạo mới — component `EditorialPortraitHook` |
| `src/landing/registry.ts` | Thêm import + entry `'editorial-portrait': EditorialPortraitHook` |
| `src/landing/recipes/v18-bold-stacked.ts` | Đổi `hook: 'bold-stacked'` → `hook: 'editorial-portrait'`, update hook copy |

## Component Interface

Component nhận `HookSlotProps` (giống tất cả hook variants):

```ts
interface HookSlotProps {
  onStart: () => void;
  copy?: Partial<HookCopy>;
}
```

`HookCopy` shape: `{ badge, heading, headingAccent, subtext, cta, hookImage }` — tất cả optional, fallback về `DEFAULT_COPY`.

## Constraints

- Không dùng `CtaButton` atom vì không expose `borderRadius` override — dùng inline `<button>` với `border-radius: 99px`.
- Arch photo dùng `object-fit: cover; object-position: top` để giữ khuôn mặt visible.
- Z-index: arch frame không cần z-index đặc biệt (không overlap).
- Desktop min-height: `100dvh`. Mobile: `min-height: 100dvh` với flex column.
