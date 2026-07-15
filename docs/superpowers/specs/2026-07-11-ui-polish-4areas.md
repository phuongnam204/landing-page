# Spec: UI Polish — 4 Areas (2026-07-11)

## Context

Branch: `fix/landing-ux-review`. User reviewed rendered Programs, ConversionOrganism, and DoneScreen screens and identified 4 improvement areas. All changes are UI-only — no new routes, no API changes.

---

## Area 1: ProgramDetailDrawer — 2-column layout + images + referenceLink CTA

### Data model changes (`src/content/programs.ts`)

Add `images?: string[]` to `Program` interface. `referenceLink?: string` already exists.

Populate both fields for programs that have real content:
- `peel-acne`: `referenceLink` = `/programs/peel-da-tri-mun`, no images yet
- `ipl-oil-control`: `referenceLink` = `/programs/ipl-kiem-soat-nhon-mun`, no images yet
- `laser-scar-treatment`: `referenceLink` = `/programs/laser-tri-seo`, no images yet
- `microneedling-repair`: `referenceLink` = `/programs/lan-kim-phuc-hoi`, no images yet
- `hormonal-acne-plan`: `referenceLink` = `/programs/phac-do-mun-noi-tiet`, no images yet
- `maintenance-skin-health`: `referenceLink` = `/programs/cham-soc-da-trang-sang`, no images yet

All `images` are `undefined` for now (placeholder will be shown).

### Layout change (`GridWithFaqPrograms.tsx` — `ProgramDetailDrawer`)

The scrollable body area becomes a 2-column grid on `md:` and above; stacked on mobile.

```
Mobile (stacked):
  ┌─────────────────────────────┐
  │ VỀ LIỆU TRÌNH               │
  │ <description>               │
  │                             │
  │ LỢI ÍCH NỔI BẬT             │
  │ • benefit                   │
  │                             │
  │ [image or placeholder]      │
  │                             │
  │ PHÙ HỢP VỚI                 │
  │ [tag] [tag]                 │
  │                             │
  │ Tìm hiểu thêm ↗ (if link)  │
  └─────────────────────────────┘

Desktop (md: 2-col, left ~55% / right ~45%):
  ┌───────────────────┬─────────┐
  │ VỀ LIỆU TRÌNH     │ [img 1] │
  │ <description>     │         │
  │                   │ [img 2] │
  │ LỢI ÍCH NỔI BẬT  │         │
  │ • benefit         │ (or     │
  │ • benefit         │  grad.  │
  │                   │  box)   │
  │ PHÙ HỢP VỚI       │         │
  │ [tag] [tag]       │         │
  │                   │         │
  │ Tìm hiểu thêm ↗  │         │
  └───────────────────┴─────────┘
```

**Image column logic:**
- If `program.images && program.images.length > 0`: render up to 2 `<img>` tags (object-cover, rounded-soft)
- Else: render a gradient placeholder div using tint color (`${tint}20` background), height ~120px on mobile / auto on desktop

**"Tìm hiểu thêm về liệu trình" link:**
- Only render if `program.referenceLink` is defined
- Render as `<a href={program.referenceLink} target="_blank" rel="noopener">` with external link SVG icon (lucide `external-link`, 12×12)
- Style: `text-xs font-semibold underline-offset-2 hover:underline`, color = tint

---

## Area 2: GridWithFaqPrograms — desktop appearance fixes

### `ProgramHighlight` card header

Current gradient `${tint}40` / `${tint}15` is too washed out. Replace with solid tint background + white text for the header section:

```
Before: background: linear-gradient(135deg, ${tint}40, ${tint}15), borderLeftColor: tint
After:  background: tint (solid), no border-l-4, text-white for name and badges
```

Badge colors update accordingly: `bg-white/20 text-white` for "Phù hợp nhất" and sessions badge.

### Section label sizes

- `"Gợi ý liệu trình cho bạn"` label: `text-xs` → `text-sm font-bold text-cta/60`
- `"Câu hỏi thường gặp"` divider span: `text-xs` → `text-sm font-bold`

### Summary bullets → condition chips margin

Add `mt-4` (was `mb-3` which is insufficient) to the condition chips wrapper inside `ProgramHighlight`.

Change:
```tsx
<div className="flex flex-wrap gap-2 mb-3">
```
To:
```tsx
<div className="flex flex-wrap gap-2 mt-4 mb-3">
```

### Grid centering

The outer wrapper `max-w-5xl` already handles horizontal centering via `mx-auto`. No additional change needed — verified the current code has `max-w-5xl mx-auto px-5 py-8`.

---

## Area 3: ConversionOrganism — responsive layout + dropdown + spacing

### Mobile spacing

- Form `gap-3` → `gap-4`
- Form padding `p-5 md:p-8` — keep md:, add explicit `px-5 py-6` for mobile
- `<select>` → replace with a custom `BranchDropdown` component (see below)

### Custom BranchDropdown

A fully controlled dropdown rendered inside `ConversionOrganism`. Uses `useState` for open/selected. Animates with CSS `max-height` transition (0 → auto via JS-set pixel value) for smooth slide-down.

```tsx
// BranchDropdown: local component inside ConversionOrganism.tsx
// Props: value, onChange, options: {code, name}[]
// State: isOpen (boolean)
// Behavior:
//   - Click trigger → toggle isOpen
//   - Click option → set value, close
//   - Click outside → close (via onBlur on wrapping div with tabIndex)
// Animation: max-height 0 → measured scroll height, opacity 0 → 1, 200ms ease-out
// No emoji anywhere; chevron = inline SVG
```

Trigger styling: same border/rounded as other inputs, flex justify-between, chevron rotates 180deg when open.
Option list: `bg-[var(--lp-bg-card)]`, `border border-[var(--lp-border)]`, option row has hover state.

### Desktop 2-column layout (md:)

The `SectionShell` renders with `overflow="auto"` (not `center`) on desktop so the inner grid can be full-width. The form and testimonials sit side-by-side.

Layout change in `ConversionOrganism`:
```tsx
// Wrap form + testimonialsSlot together:
<div className="w-full max-w-5xl mx-auto px-5 py-8 md:grid md:grid-cols-2 md:gap-10 md:items-start">
  <form ...>  {/* left column */}
  {showTestimonials && testimonialsSlot}  {/* right column */}
</div>
```

The `form` loses the outer `max-w-lg` centering on desktop (already full col width). Keep `max-w-lg` only on mobile via `md:max-w-none`.

### "Khách hàng nói gì" divider (`short-form-with-testimonials.tsx`)

`text-xs text-cta/40 font-semibold` → `text-sm font-bold text-cta/60`

On desktop, since testimonials are in their own column (not below the form), the divider hr lines look odd. Add `md:hidden` to the `<div>` with the `flex items-center gap-3` divider row, and instead add a plain heading above on desktop:

```tsx
<div className="hidden md:block mb-4">
  <p className="text-sm font-bold text-cta/60 uppercase tracking-widest">Khách hàng nói gì</p>
</div>
<div className="flex items-center gap-3 md:hidden">
  <hr ...>
  <span>Khách hàng nói gì</span>
  <hr ...>
</div>
```

The `TestimonialsBlock` wrapper: remove `max-w-lg` and `mt-6` (those were for mobile stacked context; the grid parent handles spacing now). Add `md:mt-0` override just in case.

---

## Area 4: DoneScreen — GPS hyperlinks

### Data model (`src/content/branches.ts`)

Add `mapsUrl?: string` to `Branch` type. Populate:

| Branch | mapsUrl |
|--------|---------|
| Quận 3 | `https://www.google.com/maps/search/?api=1&query=292%2F15+C%C3%A1ch+M%E1%BA%A1ng+Th%C3%A1ng+8+P.10+Q.3+TP.HCM` |
| Bình Thạnh | `https://www.google.com/maps/search/?api=1&query=31%2F3+%C4%90i%E1%BB%87n+Bi%C3%AAn+Ph%E1%BB%A7+P.15+Q.+B%C3%ACnh+Th%E1%BA%A1nh+TP.HCM` |
| Thủ Đức | `https://www.google.com/maps/search/?api=1&query=13A+13B+Th%E1%BB%91ng+Nh%E1%BA%A5t+P.+B%C3%ACnh+Th%E1%BB%8D+TP.+Th%E1%BB%A7+%C4%90%E1%BB%A9c` |
| Gò Vấp | `https://www.google.com/maps/search/?api=1&query=36+%C4%91%C6%B0%E1%BB%9Dng+s%E1%BB%91+8+Cityland+Park+Hills+Q.+G%C3%B2+V%E1%BA%A5p+TP.HCM` |
| Cần Thơ | `https://www.google.com/maps/search/?api=1&query=MG1-12+Vincom+Shophouse+Xu%C3%A2n+Kh%C3%A1nh+Q.+Ninh+Ki%E1%BB%81u+C%E1%BA%A7n+Th%C6%A1` |

### Component change (`contact-info-with-video.tsx`)

Replace:
```tsx
<p className="text-xs text-cta/55 mt-0.5 leading-relaxed">{b.address}</p>
```

With:
```tsx
{b.mapsUrl ? (
  <a
    href={b.mapsUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="text-xs text-cta/55 mt-0.5 leading-relaxed inline-flex items-center gap-1 hover:text-[var(--lp-accent,#2D2640)] transition-colors hover:underline underline-offset-2"
  >
    {b.address}
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </a>
) : (
  <p className="text-xs text-cta/55 mt-0.5 leading-relaxed">{b.address}</p>
)}
```

The map-pin SVG is the lucide `map-pin` icon rendered inline at 10×10px. No emoji.

---

## Files to change (ordered by dependency)

1. `src/content/programs.ts` — add `images?: string[]`, populate `referenceLink` for all programs
2. `src/content/branches.ts` — add `mapsUrl?: string`, populate for all 5 branches
3. `src/landing/variants/programs/GridWithFaqPrograms.tsx` — drawer 2-col + card header + label sizes + chip margin
4. `src/landing/organisms/ConversionOrganism.tsx` — spacing + BranchDropdown + desktop 2-col wrapper
5. `src/landing/variants/conversion/short-form-with-testimonials.tsx` — "Khách hàng nói gì" heading + desktop heading variant
6. `src/landing/variants/done/contact-info-with-video.tsx` — GPS hyperlinks

## Verification

After all changes:
- `npx tsc --noEmit --incremental false` — zero errors
- `python3 scripts/check_no_emoji.py` — zero emoji
- Visual check at `/v/v04-combined` (Programs → Conversion → Done flow)
