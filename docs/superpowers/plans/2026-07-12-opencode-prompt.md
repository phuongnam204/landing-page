# Task: Multi-Archetype Landing Page Version System

Working directory: `D:\project\LandingPage`
Branch: `fix/landing-ux-review`
Stack: Next.js 16, React 19, TypeScript, Tailwind 3, Vitest

---

## Đọc trước khi làm

### Spec đầy đủ
`docs/superpowers/specs/2026-07-12-multi-archetype-versions-design.md`

### Implementation plan (file chính — làm theo task-by-task)
`docs/superpowers/plans/2026-07-12-multi-archetype-versions.md`

---

## Background — đủ để hiểu, không cần đọc thêm

Dự án dùng kiến trúc **slot/variant/recipe**:
- **Slot** = một nhịp trong flow (hook → minigame → payoff → programs → conversion → done)
- **Variant** = một implementation cụ thể của một slot. Mọi variant dùng CSS custom properties `var(--lp-*)` cho màu sắc — không hardcode hex
- **Registry** (`src/landing/registry.ts`) = bảng tra `registry[slot][variantId] → Component`
- **Recipe** (`src/landing/recipes/*.ts`) = data object khai báo variant nào dùng cho mỗi slot + theme
- **Theme** = class CSS scope (`.theme-blossom`, `.theme-ocean`...) trong `src/landing/themes.css` gán các biến `--lp-*`. Đổi theme = đổi 1 chữ trong recipe

**Content rule (bắt buộc):** Mọi variant component CHỈ được import content từ `src/content/`. Không hardcode bất kỳ string nội dung nào trong TSX. Các content sources chính:
- Programs: `getPrograms()` từ `src/content/catalog`
- Chi nhánh: `branches` từ `src/content/branches`
- Quiz/conditions: từ `src/content/quiz` và `src/content/catalog`
- Testimonials: có thể hardcode trong component vì đây là "presentation copy" không phải structured content

**Slot contracts** (từ `src/landing/slots.ts`):
```ts
HookSlotProps       = { onStart: () => void }
MinigameSlotProps   = { onComplete: (result: MinigameResult) => void }
PayoffSlotProps     = { result: MinigameResult; onContinue: () => void }
ProgramsSlotProps   = { suggestedPrograms: ScoredProgram[]; onContinue: (programId: ProgramId) => void }
ConversionSlotProps = { selectedProgramId: ProgramId | null; minigameResult: MinigameResult | null; onSubmit: (name: string, phone: string) => void }
DoneSlotProps       = { selectedProgramId: ProgramId | null }
```

**Existing components có thể wrap:**
- `FaceMapMinigame` từ `src/landing/variants/minigame/face-map` — dùng cho mọi archetype's minigame
- `ConfettiCardWhyPayoff` từ `src/landing/variants/payoff/ConfettiCardWhyPayoff` — dùng cho payoff
- `ConversionOrganism` từ `src/landing/organisms/ConversionOrganism` — dùng cho conversion form
- `CtaButton` từ `src/components/atoms/CtaButton`

---

## Mục tiêu

Xây dựng **20 landing page version** từ **5 archetype × 4 variation**, mỗi version có 6 slot variant riêng. Cùng workflow, cùng content, chỉ khác visual presentation.

| Archetype | Theme | Variations |
|---|---|---|
| Playful Blossom | blossom | classic, minimal, immersive, dark-accent |
| Clinical Ocean | ocean | classic, compact, dashboard, editorial |
| Electric Magenta | magenta (NEW) | classic, glow-heavy, soft-dark, light-pop |
| Natural Sage | sage | classic, spa, editorial, minimal |
| Bold Golden | golden (extended) | classic, stacked, diagonal, typographic |

---

## File structure cho variant mới

```
src/landing/variants/
  hook/<archetype>/<variation>.tsx     (ví dụ: hook/playful/classic.tsx)
  minigame/<archetype>/<variation>.tsx
  payoff/<archetype>/<variation>.tsx
  programs/<archetype>/<variation>.tsx
  conversion/<archetype>/<variation>.tsx
  done/<archetype>/<variation>.tsx
```

**Registry ID:** `<archetype>-<variation>` (ví dụ: `playful-classic`, `electric-glow-heavy`)
**Export name:** `<Archetype><Variation><Slot>` (ví dụ: `PlayfulClassicHook`, `ElectricGlowHeavyMinigame`)
**Recipe ID:** `v05-playful-classic` … `v24-bold-typographic`
**Recipe files:** `src/landing/recipes/v05-playful-classic.ts` … `v24-bold-typographic.ts`

---

## Component shell template

```tsx
'use client';
import type { <Slot>SlotProps } from '../../../slots';
// Content imports từ src/content/ — không hardcode string nội dung
// import { branches } from '../../../../content/branches';  ← done slot

export function <Archetype><Variation><Slot>(props: <Slot>SlotProps) {
  return (
    <div style={{ background: 'var(--lp-bg-hero)' }}>
      {/* Tất cả màu dùng var(--lp-*) — không dùng hex */}
    </div>
  );
}
```

---

## Thực hiện

**Làm theo từng task trong plan theo thứ tự.** Mỗi task có:
- Danh sách file cần tạo/sửa
- Code đầy đủ cho từng file
- Lệnh verify (vitest run)
- Lệnh git commit

**Thứ tự build:** Task 1 (infrastructure) → Task 2–5 (Playful Blossom) → Task 6 (Clinical Ocean) → Task 7 (Natural Sage) → Task 8 (Bold Golden) → Task 9 (Electric Magenta) → Task 10 (cleanup)

**Sau mỗi archetype hoàn thành:** chạy `npx vitest run` và verify flow tại `http://localhost:3000/?recipe=<recipe-id>`.

**Dev server:** `npm run dev` (port 3000 hoặc check `.env.local`)

---

## Verify nhanh sau khi xong

1. `npx vitest run` — tất cả PASS
2. `npx tsc --noEmit` — không có TypeScript error
3. `http://localhost:3000/versions` — hiển thị đủ 23 recipe cards (v01, v03–v24, không có v02)
4. Click thử `v05-playful-classic`, `v13-electric-classic`, `v17-bold-classic` — đi qua full flow không lỗi
