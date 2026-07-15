# UI Polish — 4 Areas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish 4 UI areas: ProgramDetailDrawer 2-column layout + program images/referenceLink, card header contrast, ConversionOrganism responsive 2-col desktop layout with animated dropdown, and DoneScreen GPS hyperlinks.

**Architecture:** Data model additions in `content/` (programs + branches) are picked up automatically by all components referencing them. UI changes are isolated to 4 component files: `GridWithFaqPrograms.tsx`, `ConversionOrganism.tsx`, `short-form-with-testimonials.tsx`, `contact-info-with-video.tsx`. No new routes, APIs, or shared atoms needed.

**Tech Stack:** Next.js 15 App Router, TypeScript strict, Tailwind v4 CSS custom properties, React 19 hooks. Verification: `npx tsc --noEmit --incremental false` + `python3 scripts/check_no_emoji.py`.

---

## File Map

| File | Change |
|------|--------|
| `src/content/programs.ts` | Add `images?: string[]` to `Program` interface; populate `referenceLink` for all 6 programs |
| `src/content/branches.ts` | Add `mapsUrl?: string` to `Branch` type; populate Google Maps URLs for all 5 branches |
| `src/landing/variants/programs/GridWithFaqPrograms.tsx` | (A) ProgramHighlight: solid tint header + white text + bigger labels + chip margin. (B) ProgramDetailDrawer: 2-col grid + images column + referenceLink external link |
| `src/landing/organisms/ConversionOrganism.tsx` | Add `BranchDropdown` component; replace `<select>`; fix spacing; wrap form+testimonials in desktop 2-col grid; remove `center` prop from SectionShell |
| `src/landing/variants/conversion/short-form-with-testimonials.tsx` | TestimonialsBlock: mobile hr-divider + desktop plain heading; remove `max-w-lg mt-6` from wrapper |
| `src/landing/variants/done/contact-info-with-video.tsx` | Convert address `<p>` to `<a href={mapsUrl}>` with map-pin SVG and hover animation |

---

### Task 1: Add `images` field to Program interface + populate referenceLink

**Files:**
- Modify: `src/content/programs.ts`

- [ ] **Step 1: Edit the Program interface**

In `src/content/programs.ts`, add `images?: string[]` after the existing `referenceLink?: string` line (line 16):

```ts
export interface Program {
  id: ProgramId;
  name: string;
  summary?: string[];
  description: string;
  benenif?: string[];
  isVip?: boolean;
  primaryConditionIds: ConditionId[];
  secondaryConditionIds?: ConditionId[];
  sessions?: number;
  o2skinComboRef?: string;
  referenceLink?: string;
  images?: string[];
}
```

- [ ] **Step 2: Populate referenceLink for all 6 programs**

Add `referenceLink` to each program object. `peel-acne` already has no `referenceLink` so add it. All `images` left as `undefined` (no image assets yet, drawer will show placeholder):

For `peel-acne` (after `o2skinComboRef`):
```ts
referenceLink: '/programs/peel-da-tri-mun',
```

For `ipl-oil-control` (after `o2skinComboRef`):
```ts
referenceLink: '/programs/ipl-kiem-soat-nhon-mun',
```

For `laser-scar-treatment` (after `o2skinComboRef`):
```ts
referenceLink: '/programs/laser-tri-seo',
```

For `microneedling-repair` (after `o2skinComboRef`):
```ts
referenceLink: '/programs/lan-kim-phuc-hoi',
```

For `hormonal-acne-plan` (after `o2skinComboRef`):
```ts
referenceLink: '/programs/phac-do-mun-noi-tiet',
```

For `maintenance-skin-health` (after `o2skinComboRef`):
```ts
referenceLink: '/programs/cham-soc-da-trang-sang',
```

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/content/programs.ts
git commit -m "feat(programs): add images field to Program interface; populate referenceLink for all programs"
```

---

### Task 2: Add mapsUrl to Branch type + populate all 5 branches

**Files:**
- Modify: `src/content/branches.ts`

- [ ] **Step 1: Update Branch type and populate mapsUrl**

Replace the entire content of `src/content/branches.ts`:

```ts
export type Branch = { code: string; name: string; address: string; mapsUrl?: string };

export const branches: Branch[] = [
  {
    code: 'o2skin.quan3',
    name: 'Chi nhánh Quận 3',
    address: '292/15 Cách Mạng Tháng 8, P.10, Q.3, TP. HCM',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=292%2F15+C%C3%A1ch+M%E1%BA%A1ng+Th%C3%A1ng+8+P.10+Q.3+TP.HCM',
  },
  {
    code: 'o2skin.binhthanh',
    name: 'Chi nhánh Bình Thạnh',
    address: '31/3 Điện Biên Phủ, P.15, Q. Bình Thạnh, TP. HCM',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=31%2F3+%C4%90i%E1%BB%87n+Bi%C3%AAn+Ph%E1%BB%A7+P.15+Q.+B%C3%ACnh+Th%E1%BA%A1nh+TP.HCM',
  },
  {
    code: 'o2skin.thuduc',
    name: 'Chi nhánh Thủ Đức',
    address: '13A – 13B Thống Nhất, P. Bình Thọ, TP. Thủ Đức',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=13A+13B+Th%E1%BB%91ng+Nh%E1%BA%A5t+P.+B%C3%ACnh+Th%E1%BB%8D+TP.+Th%E1%BB%A7+%C4%90%E1%BB%A9c',
  },
  {
    code: 'o2skin.govap',
    name: 'Chi nhánh Gò Vấp',
    address: '36 đường số 8, Cityland Park Hills, Q. Gò Vấp, TP. HCM',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=36+%C4%91%C6%B0%E1%BB%9Dng+s%E1%BB%91+8+Cityland+Park+Hills+Q.+G%C3%B2+V%E1%BA%A5p+TP.HCM',
  },
  {
    code: 'o2skin.cantho',
    name: 'Chi nhánh Cần Thơ',
    address: 'MG1-12 Vincom Shophouse, Xuân Khánh, Q. Ninh Kiều, Cần Thơ',
    mapsUrl: 'https://www.google.com/maps/search/?api=1&query=MG1-12+Vincom+Shophouse+Xu%C3%A2n+Kh%C3%A1nh+Q.+Ninh+Ki%E1%BB%81u+C%E1%BA%A7n+Th%C6%A1',
  },
];

export const BRANCH_CODES = branches.map(b => b.code);
```

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/branches.ts
git commit -m "feat(branches): add mapsUrl field; populate Google Maps URLs for all 5 branches"
```

---

### Task 3: ProgramHighlight — solid header + bigger labels + chip margin

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx`

- [ ] **Step 1: Update ProgramHighlight card header (solid tint + white text)**

In `GridWithFaqPrograms.tsx`, find the `ProgramHighlight` function. Replace the header `<div>` (currently has `border-l-4` and gradient) with a solid background version:

```tsx
// Replace this block inside ProgramHighlight:
<div
  className="px-5 py-4 lg:px-8 lg:py-6 border-l-4"
  style={{ background: `linear-gradient(135deg, ${tint}40, ${tint}15)`, borderLeftColor: tint }}
>
  <div className="flex items-center gap-2 mb-2 lg:mb-3">
    <span className="text-xs font-bold bg-white/40 text-cta/90 px-2.5 py-0.5 rounded-full">
      Phù hợp nhất
    </span>
    {program.sessions && (
      <span className="text-xs text-cta/60 font-semibold">{program.sessions} buổi</span>
    )}
  </div>
  <h2 className="text-lg lg:text-xl font-extrabold text-cta">{program.name}</h2>
</div>

// With this:
<div
  className="px-5 py-4 lg:px-8 lg:py-6"
  style={{ background: tint }}
>
  <div className="flex items-center gap-2 mb-2 lg:mb-3">
    <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
      Phù hợp nhất
    </span>
    {program.sessions && (
      <span className="text-xs text-white/70 font-semibold">{program.sessions} buổi</span>
    )}
  </div>
  <h2 className="text-lg lg:text-xl font-extrabold text-white">{program.name}</h2>
</div>
```

- [ ] **Step 2: Update "Gợi ý liệu trình cho bạn" label size**

In `ProgramHighlight`, find the section label `<p>`:

```tsx
// Replace:
<p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center md:text-left">
  Gợi ý liệu trình cho bạn
</p>

// With:
<p className="text-sm font-bold text-cta/60 uppercase tracking-widest text-center md:text-left">
  Gợi ý liệu trình cho bạn
</p>
```

- [ ] **Step 3: Update "Câu hỏi thường gặp" label size in FaqSection**

In `FaqSection`, find the span inside the divider:

```tsx
// Replace:
<span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Câu hỏi thường gặp</span>

// With:
<span className="text-sm font-bold text-cta/60 whitespace-nowrap">Câu hỏi thường gặp</span>
```

- [ ] **Step 4: Add mt-4 to condition chips wrapper in ProgramHighlight**

In `ProgramHighlight`, find the `<div className="px-5 pb-5 lg:px-8">` block and its inner chips div:

```tsx
// Replace:
<div className="flex flex-wrap gap-2 mb-3">

// With:
<div className="flex flex-wrap gap-2 mt-4 mb-3">
```

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "feat(GridWithFaqPrograms): solid tint card header, larger section labels, chip margin"
```

---

### Task 4: ProgramDetailDrawer — 2-column layout + images column + referenceLink CTA

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx`

- [ ] **Step 1: Replace the scrollable body of ProgramDetailDrawer**

In `ProgramDetailDrawer`, replace the entire `<div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">` block (lines 102–129 in current file) with a 2-column grid layout:

```tsx
<div className="overflow-y-auto flex-1 px-5 py-5">
  <div className="flex flex-col gap-5 md:grid md:grid-cols-[55%_1fr] md:gap-6 md:items-start">
    {/* Left column */}
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tint }}>Về liệu trình</p>
        <p className="text-sm text-cta/75 leading-relaxed">{program.description}</p>
      </div>
      {program.benenif && program.benenif.length > 0 && (
        <div className="rounded-soft p-4 border border-[var(--lp-border)]" style={{ background: `${tint}14` }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tint }}>Lợi ích nổi bật</p>
          <ul className="flex flex-col gap-2">
            {program.benenif.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cta/75">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="7.5" fill="currentColor" style={{ color: `${tint}33` }} />
                  <path d="M5 8.5l2.5 2.5 4-5" stroke={tint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-cta/40 mb-2">Phù hợp với</p>
        <div className="flex flex-wrap gap-2">
          {getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
        </div>
      </div>
      {program.referenceLink && (
        <a
          href={program.referenceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: tint }}
        >
          Tìm hiểu thêm về liệu trình
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      )}
    </div>
    {/* Right column: images or tint placeholder */}
    <div className="flex flex-col gap-3">
      {program.images && program.images.length > 0 ? (
        program.images.slice(0, 2).map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-full rounded-soft object-cover"
            style={{ aspectRatio: '4/3' }}
          />
        ))
      ) : (
        <div
          className="w-full rounded-soft"
          style={{ background: `${tint}20`, minHeight: 120 }}
        />
      )}
    </div>
  </div>
  <div className="h-2" />
</div>
```

Note: `program` type in `ProgramDetailDrawer` is `ReturnType<typeof getPrograms>[number]` which is `Program` from `programs.ts`. The `images` and `referenceLink` fields are now on that type after Task 1.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Step 3: Check no emoji**

```bash
python3 scripts/check_no_emoji.py
```

Expected: 0 violations.

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "feat(GridWithFaqPrograms): ProgramDetailDrawer 2-col layout, images column, referenceLink CTA"
```

---

### Task 5: ConversionOrganism — BranchDropdown + spacing + desktop 2-col layout

**Files:**
- Modify: `src/landing/organisms/ConversionOrganism.tsx`

- [ ] **Step 1: Add BranchDropdown component**

Add `useRef` to the React import at the top of `ConversionOrganism.tsx`:

```tsx
import React, { useState, useRef, useEffect } from 'react';
```

Then add the `BranchDropdown` component after the `PendingSpinner` function (before `ConversionOrganismProps` interface):

```tsx
function BranchDropdown({ value, onChange, options }: {
  value: string;
  onChange: (v: string) => void;
  options: { code: string; name: string }[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [listHeight, setListHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedLabel = options.find(o => o.code === value)?.name;

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listRef.current) setListHeight(listRef.current.scrollHeight);
    else setListHeight(0);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="w-full border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm flex items-center justify-between bg-white"
      >
        <span className={value ? 'text-cta' : 'text-cta/40'}>
          {selectedLabel ?? 'Chọn chi nhánh gần bạn'}
        </span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className="absolute top-full left-0 right-0 z-20 overflow-hidden transition-all duration-200"
        style={{ maxHeight: `${listHeight}px`, opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
      >
        <ul
          ref={listRef}
          role="listbox"
          className="mt-1 bg-[var(--lp-bg-card)] border border-[var(--lp-border)] rounded-2xl shadow-lg shadow-cta/10 overflow-hidden"
        >
          {options.map(opt => (
            <li
              key={opt.code}
              role="option"
              aria-selected={value === opt.code}
              className={`px-4 py-3 text-sm text-cta cursor-pointer transition-colors ${
                value === opt.code ? 'bg-[var(--lp-bg-hero)] font-semibold' : 'hover:bg-[var(--lp-bg-hero)]'
              }`}
              onMouseDown={() => { onChange(opt.code); setIsOpen(false); }}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace the return statement with desktop 2-col layout**

Replace the entire `return (...)` block of `ConversionOrganism`:

```tsx
return (
  <SectionShell bgVar="--lp-bg-payoff" overflow="hidden">
    <div className="w-full max-w-5xl mx-auto px-5 py-8 md:py-12 flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-start animate-fade-in-up">
      <form
        onSubmit={handleSubmit}
        className="w-full bg-[var(--lp-bg-card)] rounded-soft px-5 py-6 md:px-8 md:py-8 shadow-lg shadow-cta/10 flex flex-col gap-4"
      >
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && (
          <p className="text-sm text-cta/70 -mt-2 mb-1">
            Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.
          </p>
        )}

        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta"
        />

        <div>
          <input
            type="tel"
            placeholder="Số điện thoại"
            value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
            onBlur={e => validatePhone(e.target.value)}
            required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
          />
          {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
        </div>

        <BranchDropdown
          value={branch}
          onChange={setBranch}
          options={branches}
        />

        {minigameResult && (
          <div className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta/60 bg-[var(--lp-bg-hero)]">
            <div className="font-semibold text-cta">{minigameResult.condition.label}</div>
            <div className="text-[11px] mt-0.5">Dựa trên kết quả kiểm tra của bạn</div>
          </div>
        )}

        <CtaButton type="submit" fullWidth disabled={uxState === 'pending'} className="mt-2">
          {uxState === 'pending' ? <><PendingSpinner />Đang gửi...</> : 'Gửi thông tin'}
        </CtaButton>

        {uxState === 'error' && errorMessage && (
          <p className="text-xs text-red-500 text-center mt-1">{errorMessage}</p>
        )}
        <p className="text-xs text-cta/50 text-center mt-1">
          Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn.
        </p>
      </form>

      {showTestimonials && testimonialsSlot}
    </div>
  </SectionShell>
);
```

Key changes vs original:
- `SectionShell`: removed `center` prop (grid handles centering), kept `overflow="hidden"`
- Outer `<form>` replaced by wrapping `<div>` with `md:grid md:grid-cols-2`
- Form: `p-5 md:p-8` → `px-5 py-6 md:px-8 md:py-8`; `gap-3` → `gap-4`; removed `max-w-lg`
- `<select>` → `<BranchDropdown>`
- `{showTestimonials && testimonialsSlot}` moves inside the grid wrapper (becomes right column on desktop)

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/landing/organisms/ConversionOrganism.tsx
git commit -m "feat(ConversionOrganism): animated BranchDropdown, wider field spacing, desktop 2-col layout"
```

---

### Task 6: Fix TestimonialsBlock heading for desktop 2-col context

**Files:**
- Modify: `src/landing/variants/conversion/short-form-with-testimonials.tsx`

- [ ] **Step 1: Replace TestimonialsBlock function**

Replace the `TestimonialsBlock` function entirely:

```tsx
function TestimonialsBlock() {
  return (
    <div className="w-full flex flex-col gap-3 md:mt-0 animate-fade-in-up">
      <div className="hidden md:block mb-2">
        <p className="text-sm font-bold text-cta/60 uppercase tracking-widest">Khách hàng nói gì</p>
      </div>
      <div className="flex items-center gap-3 md:hidden">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-sm font-bold text-cta/60 whitespace-nowrap">Khách hàng nói gì</span>
        <hr className="flex-1 border-[var(--lp-border)]" />
      </div>
      <div className="flex flex-col gap-3">
        {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
}
```

Changes vs original:
- Removed `max-w-lg` and `mt-6` from wrapper (grid parent handles spacing)
- Added `md:mt-0` guard
- Added desktop heading (`hidden md:block`) — plain `<p>` label above testimonial cards
- Mobile divider (`md:hidden`) — kept but upgraded to `text-sm font-bold text-cta/60`

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/conversion/short-form-with-testimonials.tsx
git commit -m "feat(short-form-with-testimonials): desktop heading variant for 2-col layout; larger divider text"
```

---

### Task 7: DoneScreen — GPS hyperlinks for branch addresses

**Files:**
- Modify: `src/landing/variants/done/contact-info-with-video.tsx`

- [ ] **Step 1: Replace address `<p>` with conditional GPS link**

In `contact-info-with-video.tsx`, inside the `branches.map` block, find:

```tsx
<p className="text-xs text-cta/55 mt-0.5 leading-relaxed">{b.address}</p>
```

Replace with:

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
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  </a>
) : (
  <p className="text-xs text-cta/55 mt-0.5 leading-relaxed">{b.address}</p>
)}
```

The SVG is the lucide `map-pin` icon at 10×10, `currentColor` stroke — not an emoji.

- [ ] **Step 2: Verify TypeScript**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors. `b.mapsUrl` is `string | undefined` — the conditional `b.mapsUrl ?` handles both cases.

- [ ] **Step 3: Check no emoji across all changed files**

```bash
python3 scripts/check_no_emoji.py
```

Expected: 0 violations.

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/done/contact-info-with-video.tsx
git commit -m "feat(DoneScreen): branch addresses as GPS hyperlinks with map-pin icon and hover animation"
```

---

## Final Verification

- [ ] **Full TypeScript check**

```bash
npx tsc --noEmit --incremental false
```

Expected: 0 errors.

- [ ] **Emoji gate**

```bash
python3 scripts/check_no_emoji.py
```

Expected: 0 violations.

- [ ] **Visual check** — start dev server, navigate to `/v/v04-combined` and step through Programs → Conversion → Done:
  - Programs card: solid colored header, legible white text, bigger "Gợi ý liệu trình cho bạn" label
  - "Xem chi tiết" → drawer opens; desktop shows 2 columns with tint placeholder on right; referenceLink renders as external link
  - "Câu hỏi thường gặp" divider text is larger
  - Conversion form: clicking branch dropdown animates slide-down list; desktop shows form + testimonials side by side; testimonials column has plain heading on desktop, hr-divider on mobile
  - Done screen: all 5 branch addresses are clickable links with map-pin icon
