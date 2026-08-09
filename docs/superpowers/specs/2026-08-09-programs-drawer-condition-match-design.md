# Programs Drawer: Condition Match Section

**Date:** 2026-08-09
**Status:** Approved

## Problem

`recommendPrograms()` đã rank đúng: nó score từng program theo số condition của khách mà program đó đồng thời giải quyết được (`matchedPrimary × 2 + matchedSecondary × 1`). Tuy nhiên, `ProgramDetailDrawer` trong `GridWithFaqPrograms.tsx` không dùng thông tin này — nó chỉ show toàn bộ condition của program mà không cho user biết condition nào của họ được phủ.

Kết quả: user không hiểu tại sao liệu trình này được gợi ý cho họ.

## Decision

Giữ nguyên thuật toán `recommendPrograms()`. Chỉ thay đổi UI trong `ProgramDetailDrawer`: thêm một section giải thích condition nào của user được phủ, condition nào không.

Phương án đã loại: "combo N program cho N condition" — sai về mặt y học và bỏ qua logic scoring đã có.

## Design

### 1. Prop mới trên `ProgramDetailDrawer`

```ts
scoredProgram?: ScoredProgram
```

Khi `scoredProgram` có mặt → render section match.
Khi vắng mặt → fallback về behavior cũ (hiện tất cả condition tags).

### 2. Section "Phù hợp với tình trạng của bạn"

Section này thay thế phần "Phù hợp với" hiện tại (dùng `getAllConditionIds(program)`).

Ba nhóm hiển thị theo thứ tự:

| Nhóm | Icon | Màu | Nguồn data |
|------|------|-----|------------|
| Primary match | checkmark tròn | xanh lá (`#D1FAE5` / `#059669`) | `scoredProgram.matchedPrimary` |
| Secondary match | checkmark tròn | vàng (`#FEF3C7` / `#D97706`) | `scoredProgram.matchedSecondary` |
| Không phủ | X tròn | xám (`#F3F4F6` / `#9CA3AF`) | `getAllConditionIds(program)` minus matched |

Condition label lấy từ `getConditionById(id)?.label`.

Layout mỗi item:

```
[icon 16×16]  [condition label text-sm]
```

Section header: `"Phù hợp với tình trạng của bạn"` — kiểu `text-xs font-bold uppercase tracking-widest`, màu `tint` (accent của theme).

Không có condition nào trong cả 3 nhóm → ẩn toàn bộ section (không render gì).

### 3. Lookup `ScoredProgram` tại `GridWithFaqPrograms`

```ts
const drawerScored = suggestedPrograms.find(sp => sp.program.id === drawerProgram?.id);
```

Truyền `drawerScored` vào `ProgramDetailDrawer` dưới prop `scoredProgram`. Hoạt động cho cả single program và combo case (drawer mở cho program nào thì lookup đúng program đó).

## Scope & Không thay đổi

**Thay đổi:**
- `ProgramDetailDrawer` — thêm prop, thêm section
- `GridWithFaqPrograms` — lookup `drawerScored` và truyền vào drawer

**Không thay đổi:**
- `recommendPrograms()` — đã đúng
- `ProgramsSlotProps` — `suggestedPrograms: ScoredProgram[]` đã có sẵn
- Tất cả variants delegate về `GridWithFaqPrograms` → tự động được hưởng lợi
- `CarouselPrograms` (browse screen) — show toàn catalog, nhiều program không có match data, giữ nguyên

## Files cần sửa

1. `src/landing/variants/programs/GridWithFaqPrograms.tsx`
   - `ProgramDetailDrawer`: thêm prop `scoredProgram?: ScoredProgram`, thêm section match
   - `GridWithFaqPrograms`: thêm `drawerScored` lookup, truyền vào drawer

## Edge Cases

- **`suggestedPrograms` rỗng** — `drawerScored` = `undefined` → drawer fallback về behavior cũ. Không xảy ra trong thực tế (programs slot luôn được render sau minigame).
- **Program trong combo nhưng không có trong `suggestedPrograms`** — `drawerScored` = `undefined` → fallback. Chấp nhận được: combo program thứ 2 (`comboWith`) hiếm khi nằm trong top-3 scored.
- **`matchedPrimary` và `matchedSecondary` đều rỗng nhưng `score > 0`** — không xảy ra theo logic scoring.
- **Tất cả condition đều match** — unmatched = rỗng → section chỉ hiện checkmarks, không có hàng X. Hoàn toàn hợp lệ.
