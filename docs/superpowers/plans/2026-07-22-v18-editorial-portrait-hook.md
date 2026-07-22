# V18 Editorial Portrait Hook — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tạo hook variant `editorial-portrait` — arch photo frame flat-top bám top edge, serif heading với SVG squiggle underline, tagline bar dưới hero — và apply vào v18.

**Architecture:** Component mới `EditorialPortraitHook` tại `src/landing/variants/hook/editorial/portrait.tsx`, tuân theo pattern của `gallery.tsx` (same slot interface, same CSS-var theming). Sau đó đăng ký trong `registry.ts` và cập nhật recipe v18 để dùng component mới.

**Tech Stack:** React 19, Tailwind v4 (`md:` breakpoint), CSS custom properties (`--lp-*`), inline SVG squiggle.

---

## File Structure

| File | Action | Ghi chú |
|---|---|---|
| `src/landing/variants/hook/editorial/portrait.tsx` | **Tạo mới** | Component `EditorialPortraitHook` |
| `src/landing/registry.ts` | **Sửa** | Thêm import + entry `'editorial-portrait'` vào hook registry |
| `src/landing/recipes/v18-bold-stacked.ts` | **Sửa** | Đổi `hook` slot + copy mới |

---

## Task 1: Tạo component `EditorialPortraitHook`

**Files:**
- Create: `src/landing/variants/hook/editorial/portrait.tsx`

### Bối cảnh cần biết

- `HookSlotProps` = `{ onStart: () => void; copy?: Partial<HookCopy> }` — import từ `'../../../slots'`
- `HookCopy` = `{ badge, heading, headingAccent, subtext, cta, hookImage }` — import từ `'../../../copy'`
- CSS vars của theme rose-vivid: `--lp-bg-hero: #FFF0F3`, `--lp-primary: #881337`, `--lp-accent: #E11D48`, `--lp-border: #FDA4AF`
- Không dùng `CtaButton` atom (không expose `borderRadius`) — dùng `<button>` inline

### Layout desktop

Hai cột bên trong `flex flex-1`:
1. **Arch** (trái): `border-radius: 0 0 140px 140px` (flat top, dome bottom), width `clamp(200px, 28vw, 320px)`, chứa `<img>` portrait. `align-self: stretch` để fill chiều cao hero.
2. **Text** (phải): badge → heading → headingAccent + squiggle → subtext → CTA pill button.

### Layout mobile

Stack dọc:
1. **Arch full-width** ở trên: height `clamp(200px, 55vw, 280px)`, `border-radius: 0 0 50% 50% / 0 0 50px 50px` (elliptical dome).
2. **Text + CTA** centered bên dưới.

- [ ] **Step 1: Tạo file với đầy đủ code**

Tạo file `src/landing/variants/hook/editorial/portrait.tsx` với nội dung:

```tsx
'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích da tức thì',
  heading:       'Dùng đủ thứ',
  headingAccent: 'vẫn nổi mụn?',
  subtext:       'Không phải sản phẩm sai — có thể là chưa đúng nguyên nhân. Chúng tôi giúp bạn tìm ra.',
  cta:           'Bắt đầu ngay',
  hookImage:     '/image-hook/Picture7.jpg',
};

function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 8"
      fill="none"
      className={className}
      style={{ height: 8, display: 'block', marginTop: -1 }}
    >
      <path
        d="M2 5C16 2 30 7 45 5C60 3 74 7 89 5C104 3 118 7 133 5C148 3 162 7 177 5C185 3.5 192 5 198 4"
        stroke="var(--lp-accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EditorialPortraitHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  const cta = c.cta || 'Bắt đầu ngay';

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* ── Desktop: arch trái + text phải ── */}
      <div className="hidden md:flex flex-1 items-stretch">

        {/* Arch photo — flat top bám top edge, dome rounded bottom */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: 'clamp(200px, 28vw, 320px)',
            borderRadius: '0 0 140px 140px',
            background: 'var(--lp-border)',
          }}
        >
          <img
            src={c.hookImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Content column */}
        <div className="flex-1 flex flex-col justify-center px-10 xl:px-16 py-10 gap-0">
          {c.badge && (
            <span
              className="block text-xs font-bold tracking-[0.18em] uppercase mb-5"
              style={{ color: 'var(--lp-accent)' }}
            >
              {c.badge}
            </span>
          )}

          <h1
            className="font-serif font-bold leading-[1.06] [text-wrap:balance]"
            style={{ fontSize: 'clamp(2.4rem, 3.8vw, 4rem)', color: 'var(--lp-primary)', margin: 0 }}
          >
            {c.heading}
          </h1>

          <div className="relative inline-block mb-5">
            <h1
              className="font-serif font-bold italic leading-[1.06]"
              style={{ fontSize: 'clamp(2.4rem, 3.8vw, 4rem)', color: 'var(--lp-accent)', margin: 0 }}
            >
              {c.headingAccent}
            </h1>
            <Squiggle className="w-full" />
          </div>

          <p
            className="text-sm leading-relaxed max-w-sm mb-7"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}
          >
            {c.subtext}
          </p>

          <button
            type="button"
            onClick={onStart}
            className="self-start px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--lp-accent)', borderRadius: 99, letterSpacing: '0.02em' }}
          >
            {cta}
          </button>
        </div>
      </div>

      {/* ── Tagline bar (desktop only) ── */}
      <div
        className="hidden md:flex items-center gap-4 px-10 py-3 border-t shrink-0"
        style={{ background: '#fff', borderColor: 'var(--lp-border)' }}
      >
        <p
          className="font-serif italic text-sm"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}
        >
          "Mỗi loại mụn đều có lý do riêng."
        </p>
        <div className="w-px h-5 shrink-0" style={{ background: 'var(--lp-border)' }} />
        <p
          className="text-xs"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}
        >
          Chọn thẳng — chúng tôi trả lời thẳng.
        </p>
      </div>

      {/* ── Mobile: arch top + text below ── */}
      <div className="md:hidden flex flex-col min-h-[100dvh]">

        {/* Arch full-width — elliptical dome drop từ top */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{
            height: 'clamp(200px, 55vw, 280px)',
            borderRadius: '0 0 50% 50% / 0 0 50px 50px',
            background: 'var(--lp-border)',
          }}
        >
          <img
            src={c.hookImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Text + CTA */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 gap-0">
          {c.badge && (
            <span
              className="block text-[10px] font-bold tracking-[0.18em] uppercase mb-4"
              style={{ color: 'var(--lp-accent)' }}
            >
              {c.badge}
            </span>
          )}

          <h1
            className="font-serif font-bold leading-[1.08]"
            style={{ fontSize: 'clamp(2rem, 8vw, 2.4rem)', color: 'var(--lp-primary)', margin: 0 }}
          >
            {c.heading}
          </h1>

          <div className="relative inline-block mb-5">
            <h1
              className="font-serif font-bold italic leading-[1.08]"
              style={{ fontSize: 'clamp(2rem, 8vw, 2.4rem)', color: 'var(--lp-accent)', margin: 0 }}
            >
              {c.headingAccent}
            </h1>
            <svg
              aria-hidden="true"
              viewBox="0 0 160 8"
              fill="none"
              className="w-full"
              style={{ height: 7, display: 'block', marginTop: -1 }}
            >
              <path
                d="M2 5C12 2 22 7 35 5C48 3 58 7 72 5C86 3 96 7 110 5C124 3 134 7 148 5C153 3.5 157 5 159 4"
                stroke="var(--lp-accent)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p
            className="text-sm leading-relaxed max-w-[280px] mb-6"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}
          >
            {c.subtext}
          </p>

          <button
            type="button"
            onClick={onStart}
            className="px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--lp-accent)', borderRadius: 99, letterSpacing: '0.02em' }}
          >
            {cta}
          </button>

          <p
            className="text-xs mt-3"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 38%, transparent)' }}
          >
            Miễn phí · Không cần đăng ký
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compile**

```powershell
cd D:\project\LandingPage
npx tsc --noEmit 2>&1 | Select-String "portrait"
```

Expected: không có dòng nào xuất hiện (không có lỗi liên quan đến file portrait.tsx).

- [ ] **Step 3: Commit**

```powershell
git add src/landing/variants/hook/editorial/portrait.tsx
git commit -m "feat(hook): add editorial-portrait hook — arch flat-top, squiggle underline"
```

---

## Task 2: Đăng ký `editorial-portrait` vào registry

**Files:**
- Modify: `src/landing/registry.ts:28-29` (import block) và `:166` (hook registry object)

### Bối cảnh cần biết

File `registry.ts` có 2 phần cần sửa:
1. **Import block** (khoảng line 28–29): `EditorialGalleryHook` và `EditorialSassaHook` đang được import ở đây.
2. **Hook registry object** (line 166): object dài một dòng chứa tất cả hook IDs.

Pattern nhìn vào import đang có:
```ts
import { EditorialSassaHook } from './variants/hook/editorial/sassa';
import { EditorialGalleryHook } from './variants/hook/editorial/gallery';
```

Pattern nhìn vào registry đang có:
```ts
'editorial-sassa': EditorialSassaHook, 'editorial-gallery': EditorialGalleryHook
```

- [ ] **Step 1: Thêm import**

Trong `src/landing/registry.ts`, tìm dòng:
```ts
import { EditorialGalleryHook } from './variants/hook/editorial/gallery';
```

Thêm dòng mới ngay sau:
```ts
import { EditorialPortraitHook } from './variants/hook/editorial/portrait';
```

- [ ] **Step 2: Thêm vào hook registry object**

Trong `src/landing/registry.ts` line 166, tìm chuỗi:
```
'editorial-gallery': EditorialGalleryHook }
```

Thay bằng:
```
'editorial-gallery': EditorialGalleryHook, 'editorial-portrait': EditorialPortraitHook }
```

- [ ] **Step 3: Verify build**

```powershell
cd D:\project\LandingPage
npx next build 2>&1 | Select-String "error|Error|✓ Compiled|Failed" | Select-Object -Last 5
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Commit**

```powershell
git add src/landing/registry.ts
git commit -m "feat(registry): register editorial-portrait hook"
```

---

## Task 3: Cập nhật recipe v18

**Files:**
- Modify: `src/landing/recipes/v18-bold-stacked.ts`

### Bối cảnh cần biết

File hiện tại:
```ts
slots: {
  hook: 'bold-stacked',
  ...
},
copy: {
  hook: {
    badge:         'Phân tích da tức thì',
    heading:       'Da bạn.',
    headingAccent: 'Vấn đề thật. Giải pháp thật.',
    subtext:       'Không quảng cáo thêm. Chỉ cần xác định đúng — và xử lý đúng.',
    cta:           'Bắt đầu ngay',
  },
```

Cần đổi `slots.hook` và toàn bộ `copy.hook`. Không đổi `id` (là URL identifier) và các slot khác.

- [ ] **Step 1: Sửa slots.hook**

Trong `src/landing/recipes/v18-bold-stacked.ts`, thay:
```ts
hook:       'bold-stacked',
```
thành:
```ts
hook:       'editorial-portrait',
```

- [ ] **Step 2: Sửa copy.hook**

Trong cùng file, thay toàn bộ block `hook:` trong `copy`:
```ts
hook: {
  badge:         'Phân tích da tức thì',
  heading:       'Da bạn.',
  headingAccent: 'Vấn đề thật. Giải pháp thật.',
  subtext:       'Không quảng cáo thêm. Chỉ cần xác định đúng — và xử lý đúng.',
  cta:           'Bắt đầu ngay',
},
```
thành:
```ts
hook: {
  badge:         'Phân tích da tức thì',
  heading:       'Dùng đủ thứ',
  headingAccent: 'vẫn nổi mụn?',
  subtext:       'Không phải sản phẩm sai — có thể là chưa đúng nguyên nhân. Chúng tôi giúp bạn tìm ra.',
  cta:           'Bắt đầu ngay',
},
```

- [ ] **Step 3: Build verify**

```powershell
cd D:\project\LandingPage
npx next build 2>&1 | Select-String "error|Error|✓ Compiled|Failed" | Select-Object -Last 5
```

Expected: `✓ Compiled successfully`

- [ ] **Step 4: Browser verify — desktop**

Mở `http://localhost:4123/v/v18-bold-stacked` (dev server phải đang chạy).

Checklist:
- [ ] Arch photo frame bám top edge, dome rounded ở bottom
- [ ] Heading "Dùng đủ thứ" màu `#881337`
- [ ] headingAccent "vẫn nổi mụn?" màu `#E11D48`, italic
- [ ] SVG squiggle underline dưới headingAccent
- [ ] Tagline bar trắng ở dưới cùng hero
- [ ] CTA pill button màu rose

- [ ] **Step 5: Browser verify — mobile**

Resize viewport xuống 375px (hoặc mở DevTools → mobile view).

Checklist:
- [ ] Arch full-width chiếm phần đầu, dome drop xuống
- [ ] Text + CTA centered bên dưới arch
- [ ] Không bị overflow ngang

- [ ] **Step 6: Commit**

```powershell
git add src/landing/recipes/v18-bold-stacked.ts
git commit -m "feat(v18): switch hook to editorial-portrait, update heading copy"
```
