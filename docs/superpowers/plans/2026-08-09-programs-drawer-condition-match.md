# Programs Drawer: Condition Match Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hiển thị trong `ProgramDetailDrawer` condition nào của user được phủ (checkmark xanh/vàng) và condition nào không (X xám), thay vì list toàn bộ condition của program.

**Architecture:** Thêm prop `scoredProgram?: ScoredProgram` vào `ProgramDetailDrawer`. `GridWithFaqPrograms` tìm `ScoredProgram` tương ứng qua `suggestedPrograms.find()` và truyền xuống. Drawer dùng `matchedPrimary`/`matchedSecondary` để phân nhóm, tính `unmatchedIds` = `getAllConditionIds(program)` minus matched.

**Tech Stack:** React, TypeScript — một file duy nhất `src/landing/variants/programs/GridWithFaqPrograms.tsx`.

**Spec:** `docs/superpowers/specs/2026-08-09-programs-drawer-condition-match-design.md`

---

## File Map

| File | Thay đổi |
|------|---------|
| `src/landing/variants/programs/GridWithFaqPrograms.tsx` | Thêm import, thêm `ConditionMatchRow`, sửa `ProgramDetailDrawer`, sửa `GridWithFaqPrograms` |

Không có file nào khác cần thay đổi.

---

## Task 1: Thêm import `ScoredProgram`

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx:2`

- [ ] **Step 1: Thêm import**

Tìm dòng:
```ts
import type { ProgramsSlotProps } from '../../slots';
```

Thay bằng:
```ts
import type { ProgramsSlotProps } from '../../slots';
import type { ScoredProgram } from '../../../content/recommend';
```

- [ ] **Step 2: Kiểm tra TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors liên quan đến `ScoredProgram`.

---

## Task 2: Thêm component `ConditionMatchRow`

Component này render một hàng trong section match của drawer: icon tròn (checkmark hoặc X) + tên condition.

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx` — thêm sau `ConditionTagSmall` (hiện ở ~line 52)

- [ ] **Step 1: Thêm `ConditionMatchRow` vào file**

Tìm đoạn kết thúc component `ConditionTagSmall`:
```tsx
function ConditionTagSmall({ conditionId }: { conditionId: string }) {
  const c = getConditionById(conditionId as ConditionId);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
      style={{ background: c ? `${c.color}22` : '#e8e8e8', color: c ? c.color : '#555', filter: 'brightness(0.82)' }}>
      <span className="w-2 h-2 rounded-full" style={{ background: c?.color ?? '#999' }} />
      {c?.label ?? conditionId}
    </span>
  );
}
```

Thêm ngay sau (giữ một dòng trắng ngăn cách):

```tsx
function ConditionMatchRow({ conditionId, variant }: {
  conditionId: ConditionId;
  variant: 'primary' | 'secondary' | 'unmatched';
}) {
  const c = getConditionById(conditionId);
  const iconBg    = variant === 'primary'   ? '#D1FAE5'
                  : variant === 'secondary' ? '#FEF3C7'
                  : '#F3F4F6';
  const iconColor = variant === 'primary'   ? '#059669'
                  : variant === 'secondary' ? '#D97706'
                  : '#9CA3AF';
  return (
    <div className="flex items-center gap-2 text-sm">
      <span
        className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
        style={{ background: iconBg }}
      >
        {variant === 'unmatched' ? (
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none"
            stroke={iconColor} strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 2l10 10M12 2L2 12" />
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 14 14" fill="none"
            stroke={iconColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 7l3.5 3.5 6.5-7" />
          </svg>
        )}
      </span>
      <span className={variant === 'unmatched' ? 'text-cta/40' : 'text-cta/75'}>
        {c?.label ?? conditionId}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Kiểm tra TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 3: Sửa `ProgramDetailDrawer` — thêm prop + match section

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx:63-70` (prop signature)
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx:165-170` (section "Phù hợp với")

- [ ] **Step 1: Thêm `scoredProgram` vào prop signature của `ProgramDetailDrawer`**

Tìm:
```tsx
function ProgramDetailDrawer({ program, tint, open, onClose, onBook, ctaVariant = 'golden' }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  open: boolean;
  onClose: () => void;
  onBook: () => void;
  ctaVariant?: 'golden' | 'dark';
}) {
```

Thay bằng:
```tsx
function ProgramDetailDrawer({ program, tint, open, onClose, onBook, ctaVariant = 'golden', scoredProgram }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  open: boolean;
  onClose: () => void;
  onBook: () => void;
  ctaVariant?: 'golden' | 'dark';
  scoredProgram?: ScoredProgram;
}) {
```

- [ ] **Step 2: Thêm tính toán `unmatchedIds` vào body của drawer**

Tìm dòng ngay sau `}) {` (khai báo hàm) và trước `const drawerRef`:
```tsx
  const drawerRef = useRef<HTMLDivElement>(null);
```

Thêm vào trước `const drawerRef`:
```tsx
  const primarySet   = new Set(scoredProgram?.matchedPrimary ?? []);
  const secondarySet = new Set(scoredProgram?.matchedSecondary ?? []);
  const unmatchedIds = scoredProgram
    ? getAllConditionIds(program).filter(id => !primarySet.has(id) && !secondarySet.has(id))
    : [];
```

- [ ] **Step 3: Thay thế section "Phù hợp với" bằng match section**

Tìm đoạn:
```tsx
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cta/40 mb-2">Phù hợp với</p>
                <div className="flex flex-wrap gap-2">
                  {getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
                </div>
              </div>
```

Thay bằng:
```tsx
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tint }}>
                  {scoredProgram ? 'Phù hợp với tình trạng của bạn' : 'Phù hợp với'}
                </p>
                {scoredProgram ? (
                  <div className="flex flex-col gap-2">
                    {scoredProgram.matchedPrimary.map(id => (
                      <ConditionMatchRow key={id} conditionId={id as ConditionId} variant="primary" />
                    ))}
                    {scoredProgram.matchedSecondary.map(id => (
                      <ConditionMatchRow key={id} conditionId={id as ConditionId} variant="secondary" />
                    ))}
                    {unmatchedIds.map(id => (
                      <ConditionMatchRow key={id} conditionId={id as ConditionId} variant="unmatched" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
                  </div>
                )}
              </div>
```

- [ ] **Step 4: Kiểm tra TypeScript compile**

```bash
npx tsc --noEmit
```

Expected: no errors.

---

## Task 4: Truyền `drawerScored` từ `GridWithFaqPrograms` xuống drawer

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx:357-404`

- [ ] **Step 1: Thêm `drawerScored` lookup**

Tìm:
```tsx
  const drawerProgram = openDrawerIdx !== null
    ? (isCombo ? comboPrograms[openDrawerIdx] : program)
    : null;
  const drawerProgramId = drawerProgram?.id as ProgramId | undefined;
```

Thay bằng:
```tsx
  const drawerProgram = openDrawerIdx !== null
    ? (isCombo ? comboPrograms[openDrawerIdx] : program)
    : null;
  const drawerProgramId = drawerProgram?.id as ProgramId | undefined;
  const drawerScored = suggestedPrograms.find(sp => sp.program.id === drawerProgram?.id);
```

- [ ] **Step 2: Truyền `scoredProgram` vào `ProgramDetailDrawer`**

Tìm:
```tsx
      <ProgramDetailDrawer
        program={drawerProgram ?? program}
        tint={OCEAN_TINT}
        open={openDrawerIdx !== null}
        onClose={() => setOpenDrawerIdx(null)}
        onBook={() => onContinue(drawerProgramId ?? topProgramId)}
        ctaVariant={ctaVariant}
      />
```

Thay bằng:
```tsx
      <ProgramDetailDrawer
        program={drawerProgram ?? program}
        tint={OCEAN_TINT}
        open={openDrawerIdx !== null}
        onClose={() => setOpenDrawerIdx(null)}
        onBook={() => onContinue(drawerProgramId ?? topProgramId)}
        ctaVariant={ctaVariant}
        scoredProgram={drawerScored}
      />
```

- [ ] **Step 3: Kiểm tra TypeScript compile lần cuối**

```bash
npx tsc --noEmit
```

Expected: no errors. Nếu có lỗi về `ConditionId` cast, kiểm tra lại import `ConditionId` từ `'../../../content/quiz'` đã có ở line 5.

---

## Task 5: Verify visual + commit

- [ ] **Step 1: Chạy dev server**

```bash
npm run dev
```

- [ ] **Step 2: Kiểm tra drawer hiển thị đúng**

Mở landing page bất kỳ (ví dụ `http://localhost:3000/?v=v01`), hoàn thành minigame chọn ít nhất 2 condition, vào programs screen, bấm "Xem chi tiết liệu trình".

Kỳ vọng:
- Drawer mở ra, section "Phù hợp với tình trạng của bạn" xuất hiện
- Condition được match hiện icon checkmark xanh
- Condition secondary match hiện icon checkmark vàng
- Condition không phủ hiện icon X xám, text mờ (`text-cta/40`)

- [ ] **Step 3: Kiểm tra edge case — combo**

Nếu recipe có `comboWith` và cả 2 program được gợi ý: mở drawer lần lượt cho program 1 và program 2, verify match data đúng cho từng program (không bị lẫn).

- [ ] **Step 4: Commit**

```bash
git add src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "feat(programs): show condition match in program detail drawer"
```
