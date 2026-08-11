# Face-Map Two-Layer Bubble + Wipe Card Images — Design Spec

**Date:** 2026-08-08  
**Scope:** `face-map.tsx`, `electric/soft-swipe.tsx`  
**Status:** Ready for implementation plan

---

## Goal

Bốn thay đổi song song:

1. **2-layer bubble trên zone tap** — thay thế cả per-condition wizard vừa implement: face-map chỉ còn 1 màn duy nhất, tap vùng → Layer 1 chọn condition → Layer 2 chọn severity.
2. **Wipe card dùng ảnh thật** — soft-swipe.tsx thay SVG icon bằng ảnh từ `/public/condition/`.
3. **Multi-condition header** — nếu user chọn >1 condition, header face-map đổi thành câu cảm thán.
4. **Tăng font subtext** — dòng "Chạm vào vùng da để chọn mức độ" to hơn.

---

## Bối cảnh — Current State

### Minigame 1: `FaceMapMinigame` (face-map.tsx)

Flow hiện tại (sau commit multi-condition wizard):
```
ConditionSelectStep (multi-select k conditions)
  → ConditionFaceMapStep × k  (1 step per condition — cái này sẽ bị revert)
    → tap zone → BubbleSeverityPicker (3 severity bubbles)
  → ScanningScreen
```

### Minigame 2: `ElectricSoftSwipeMinigame` (soft-swipe.tsx)

Flow hiện tại:
```
Phase 'wheel'  (wipe card arc — chọn conditions)
  → Phase 'wizard' (1 face-map screen)
    → tap zone → BubbleSeverityPicker
  → Phase 'scanning'
```

Cả hai đều dùng `BubbleSeverityPicker` từ face-map.tsx.

---

## Change 1 — 2-Layer Bubble Zone Tap

### Flow mới (áp dụng cho CẢ HAI minigame)

```
Step 0: chọn conditions (giữ nguyên — ConditionSelectStep / wipe card wheel)
  ↓
Step 1: 1 màn face-map duy nhất  ← đây là điểm thay đổi chính
  User tap zone
    → Layer 1: BubbleConditionPicker
        k bubbles (1 per condition từ step 0), arc quanh điểm tap
        Multi-select (j ≥ 1)
        Text hướng dẫn + Confirm CTA
    → (sau confirm) Layer 2: BubbleSeverityPicker (đã cập nhật)
        3 bubbles: Ít mụn / Vừa phải / Nhiều mụn
  Zone đổi màu theo severity
    ↓
ScanningScreen
```

**Edge case:** Nếu k = 1 (chỉ chọn 1 condition ở step 0) → bỏ qua Layer 1, hiện thẳng Layer 2.

### Data Model mới

```typescript
// Per zone: kết quả cả 2 lớp bubble
interface ZoneTapResult {
  conditions: AcneType[];  // output Layer 1
  severity: Severity;       // output Layer 2 — KHÔNG có 'khong' nữa
}

type ZoneMap = Partial<Record<Zone, ZoneTapResult>>;
```

**Converter** — dùng cho assessToConditions (không cần thay):
```typescript
function zoneMapToAssessments(zoneMap: ZoneMap): ConditionAssessment[] {
  // Group zones by condition, build ConditionAssessment per condition
  const byCondition = new Map<AcneType, Partial<Record<Zone, Severity>>>();
  for (const [zone, { conditions, severity }] of Object.entries(zoneMap) as [Zone, ZoneTapResult][]) {
    for (const cond of conditions) {
      if (!byCondition.has(cond)) byCondition.set(cond, {});
      byCondition.get(cond)![zone] = severity;
    }
  }
  return [...byCondition.entries()].map(([acneType, zones]) => ({ acneType, zones }));
}
```

### Severity thay đổi

| Cũ | Mới |
|----|-----|
| Không bị | ~~removed~~ |
| Ít mụn | Ít mụn (giữ) |
| *(không có)* | **Vừa phải** (thêm) |
| Nhiều mụn | Nhiều mụn (giữ) |

**Type `Severity`:** thêm `'vua'`, bỏ `'khong'`:
```typescript
type Severity = 'nhieu' | 'vua' | 'it';
// Bỏ 'khong' — không cần nữa vì zone không tap = không có vấn đề gì
```

Trọng số cho `assessToConditions`:
```typescript
const SEVERITY_WEIGHT: Record<Severity, number> = { nhieu: 3, vua: 2, it: 1 };
```

### Component: `BubbleConditionPicker` (mới — trong face-map.tsx)

```typescript
interface BubbleConditionPickerProps {
  cx: number;              // viewport coords từ zone tap
  cy: number;
  conditions: AcneType[];  // k conditions từ step 0
  onConfirm: (selected: AcneType[]) => void;
  onClose: () => void;
}
```

**Visual:**
- k bubbles, arc-positioned quanh (cx, cy) — dùng `calcBubblePos()` hiện có, góc chia đều trong 180° trên (angleDeg = 180 + i * (180/(k-1)) với k>1, hoặc 270 với k=1).
- Mỗi bubble: circle 60px, border accent của condition đó, bên trong là `<img>` cover từ `CONDITION_IMAGES[acneType]` (nếu không có ảnh → dùng SVG icon hiện tại từ `CARD_ICONS`).
- **Selected state:** solid border 3px + checkmark overlay ở góc dưới phải.
- **Text hướng dẫn:** fixed, trên backdrop — "Chỗ này bị loại mụn gì?" ban đầu; cập nhật thành tên các condition đã chọn khi user tap (ví dụ: "Mụn viêm, Sẹo rỗ").
- **Confirm CTA:** pill button nhỏ "Xác nhận →", xuất hiện sau khi ≥1 bubble được chọn, positioned dưới nhóm bubbles.
- Animation giống `bubArc` + `bubSelect` hiện có.
- Backdrop giống hiện tại (tap ngoài để đóng).

### Component: `BubbleTwoLayerPicker` (mới orchestrator — trong face-map.tsx)

```typescript
interface BubbleTwoLayerPickerProps {
  cx: number;
  cy: number;
  availableConditions: AcneType[];  // từ step 0
  onSelect: (conditions: AcneType[], severity: Severity) => void;
  onClose: () => void;
}
```

Logic:
```
if availableConditions.length === 1:
  skip Layer 1 → hiện BubbleSeverityPicker ngay
  onSelect([availableConditions[0]], severity_từ_L2)
else:
  hiện BubbleConditionPicker
  → onConfirm(selected) → dismiss L1 → hiện BubbleSeverityPicker
  → onSelect(selected, severity_từ_L2)
```

### Cập nhật `BubbleSeverityPicker`

- Bỏ `severity: 'khong'` / label "Không bị".
- Thêm `severity: 'vua'` / label "Vừa phải", màu amber trung tính (giữa amber và orange).
- Cập nhật `ARC_CONFIG` và type `Severity`.
- API không đổi: `onSelect(s: Severity)`.

### Thay đổi trong `FaceMapMinigame` (face-map.tsx)

- **Bỏ** `ConditionFaceMapStep` và per-condition wizard logic.
- **Thêm** single face-map step dùng `FaceDiagram` + `BubbleTwoLayerPicker`.
- State mới: `zoneMap: ZoneMap` (thay cho `assessments: ConditionAssessment[]`).
- On zone tap: lưu viewport coords, mount `BubbleTwoLayerPicker`.
- On complete: `zoneMapToAssessments(zoneMap)` → `assessToConditions(assessments)` → `onComplete(...)`.

### Thay đổi trong `ElectricSoftSwipeMinigame` (soft-swipe.tsx)

Phase 'wizard':
- Thay `BubbleSeverityPicker` → `BubbleTwoLayerPicker`.
- `availableConditions` = các `conditionId` map sang `AcneType` từ `selectedCardIds`.
- State: `wizardZoneMap: ZoneMap` (thay `cardZones: CardZones`).
- `CardZones` type có thể xóa nếu không dùng ở chỗ khác.

---

## Change 2 — Wipe Card: Thay SVG Icon bằng Ảnh Thật

**File:** `src/landing/variants/minigame/electric/soft-swipe.tsx`

Mỗi `SwipeCard` có field `icon: React.ReactNode`. Thay bằng `image?: string` (path) + giữ `icon` làm fallback.

**Mapping ảnh:**

| Card ID | Label | Image | Ghi chú |
|---------|-------|-------|---------|
| `oily` | Da nhờn, bóng dầu | `/condition/mun-dau-den.png` | Gần nhất: blackhead/pore là biểu hiện điển hình của da nhờn |
| `acne` | Mụn viêm, mụn bọc | `/condition/mun-viem-do.jpg` | Exact match |
| `dry-red` | Da khô, đỏ, dễ kích ứng | `/condition/man-do-kich-ung.jpg` | Exact match |
| `pore` | Lỗ chân lông to | `/condition/lo-chan-long.jpg` | Exact match |
| `clear` | Da khỏe, không vấn đề | *(giữ SVG icon)* | Không có ảnh phù hợp |

**Hiển thị trong card (arc wheel):**

Thay thế `{card.icon}` bằng:
```tsx
{card.image
  ? <img
      src={card.image}
      alt={card.label}
      style={{
        width: '100%', height: '55%',
        objectFit: 'cover',
        borderRadius: '10px 10px 0 0',
        display: 'block',
        flexShrink: 0,
      }}
    />
  : card.icon
}
```

Layout của card khi có ảnh: ảnh chiếm ~55% chiều cao card (trên), label ở dưới. Giữ `overflow: hidden` trên card div (đã có).

**Hiển thị trong shelf (selected state):**

Shelf card icon-only (90×70 / 62×58) không dùng ảnh — giữ nguyên `icon-wrap` với SVG icon 48×48. Ảnh chỉ hiện trong arc wheel.

---

## Change 3 — Multi-Condition Header

**Áp dụng:** phần heading của màn face-map (cả hai minigame).

```typescript
const faceMapHeading = selectedConditions.length > 1
  ? 'Ô da bạn có nhiều tuýp ghé thắm đấy! Cùng tìm kiếm nhé!'
  : `${conditionLabel(selectedConditions[0])} xuất hiện ở đâu?`;
```

Câu cảm thán dùng font weight và size giống heading hiện tại — không cần style riêng.

---

## Change 4 — Tăng Font Subtext

**Tất cả chỗ** có text "Chạm vào vùng da để chọn mức độ": tăng từ `text-sm` (14px) lên `text-base` (16px).

Cụ thể trong `ConditionFaceMapStep` (sẽ được thay) và trong màn face-map mới — implement luôn với size mới.

---

## Files Thay Đổi

| File | Thay đổi |
|------|----------|
| `src/landing/variants/minigame/face-map.tsx` | Thêm `BubbleConditionPicker`, `BubbleTwoLayerPicker`; cập nhật `BubbleSeverityPicker` (severity); xóa `ConditionFaceMapStep`; refactor `FaceMapMinigame` orchestrator; thêm `zoneMapToAssessments`; cập nhật `Severity` type |
| `src/landing/variants/minigame/electric/soft-swipe.tsx` | Thêm `image?` vào `SwipeCard`; update CARDS với ảnh; thay `BubbleSeverityPicker` → `BubbleTwoLayerPicker` trong wizard phase; update state ZoneMap |

---

## Không Thay Đổi

- `FaceDiagram` component (SVG face + zone tap logic) — giữ nguyên.
- `ConditionSelectStep` và các variants (A/B/C) — giữ nguyên.
- `ScanningScreen` — giữ nguyên.
- `assessToConditions` — giữ nguyên (vẫn nhận `ConditionAssessment[]`).
- Tất cả các minigame khác (face-map-v2, v3, wizard, clay, ...) — không đụng tới.
- `/public/condition/` images — không thêm/sửa file.

---

## Animation Spec

Mọi animation dùng CSS keyframes hoặc inline `transition` — không dùng thư viện ngoài. Tuân thủ `prefers-reduced-motion` (giảm về fade nếu user bật reduced motion).

### Layer 1 — Bubble Condition (multiple choice)

**Entrance (arc spawn):**
- Kế thừa `bubArc` keyframe hiện có (`scale(0) → scale(1.08) → scale(1)`, kèm opacity 0→1).
- Stagger: `delay = i * 0.08s` per bubble, spring easing `cubic-bezier(0.34, 1.56, 0.64, 1)`.

**Select (tap chọn):**
```css
@keyframes bubCondSelect {
  0%   { transform: translate(-50%,-50%) scale(1); }
  30%  { transform: translate(-50%,-50%) scale(1.28); }
  55%  { transform: translate(-50%,-50%) scale(0.92); }
  100% { transform: translate(-50%,-50%) scale(1.05); }
  /* dừng ở scale(1.05) — bubble đang-chọn lớn hơn chút so với chưa chọn */
}
```
Kết hợp: border chuyển từ dashed → solid 3px (transition `border 0.15s ease`), background thêm tint accent 20% (transition `background 0.15s ease`).

**Checkmark overlay:** xuất hiện cùng lúc select — `scale(0) → scale(1.2) → scale(1)` với duration 220ms, spring easing. Vị trí: góc dưới-phải bubble.

**Deselect (tap lần 2):**
```css
@keyframes bubCondDeselect {
  0%   { transform: translate(-50%,-50%) scale(1.05); }
  40%  { transform: translate(-50%,-50%) scale(0.85); }
  100% { transform: translate(-50%,-50%) scale(1); }
}
```
Border về lại dashed, background về transparent, checkmark `scale(1) → scale(0)` fade-out 150ms.

**Confirm button entrance (xuất hiện sau lần select đầu tiên):**
- Bắt đầu: `opacity: 0; transform: translateY(8px) scale(0.92)`.
- Animate vào: `opacity: 1; transform: translateY(0) scale(1)`, duration 250ms, easing `ease-out`.
- Nếu deselect hết về 0 items: button fade-out ngược lại 150ms.

**Text hướng dẫn update** ("Chỗ này bị loại mụn gì?" → tên conditions):
- Crossfade: text cũ `opacity 1→0` 120ms, text mới `opacity 0→1` 120ms sau đó.
- Dùng `key` trick trong React để trigger re-animation khi nội dung thay đổi.

**Layer 1 → Layer 2 transition (sau khi confirm):**
- Layer 1 bubbles: `scale(1) → scale(0)` + `opacity → 0`, stagger ngược (reverse order), duration 180ms mỗi bubble.
- Confirm button: fade out 120ms.
- Layer 2 bubbles mount và dùng `bubArc` như thường, nhưng delay bắt đầu sau khi Layer 1 dismiss xong (~300ms tổng).

### Layer 2 — Bubble Severity (single choice)

Giữ nguyên `bubArc` entrance và `bubSelect` tap animation hiện có. Chỉ thêm "Vừa phải" bubble với animation y chang hai bubble còn lại.

### Zone — Khi Có Kết Quả (sau Layer 2 confirm)

Hiện tại zone đổi màu + `acne-pulse` dots khi severity set. Giữ nguyên. Thêm: zone fill animate từ opacity 0 → target opacity với `transition: opacity 0.25s ease`.

### Re-tap Zone Đã Có Kết Quả

Layer 1 mount lại với previous selections đã được pre-selected (không entrance animation cho các bubbles đã chọn — chúng xuất hiện ngay ở trạng thái selected, chỉ bubbles chưa chọn mới dùng `bubArc`).

---

## Các Quyết Định Cụ Thể

**Re-tap zone đã có kết quả:** Nếu user tap lại vùng đã chọn (muốn đổi) → hiện lại Layer 1 với selections từ lần trước được pre-selected, cho phép chỉnh sửa.

**Arc angle cho Layer 1 bubbles:** Phân bổ đều trong cung 180° hướng lên trên, căn giữa tại 270° (12 giờ). Với k bubbles: `angleDeg_i = 270 - 90 + i * 180/(k-1)` (k>1) hoặc `270` (k=1). Clamp với `calcBubblePos` hiện có đủ xử lý out-of-bounds.

**`Severity` type:** Giữ `'khong'` trong type union để tránh break các variant khác không nằm trong scope. Chỉ loại bỏ nó ra khỏi `BubbleSeverityPicker` options và `ZoneTapResult`. Mọi code đang filter `s !== 'khong'` vẫn hoạt động đúng.

**Màu "Vừa phải":** `bg: 'rgba(180, 90, 10, 0.90)'`, `border: '#d97706'`, `color: '#fef3c7'` — nằm giữa Ít mụn (amber) và Nhiều mụn (đỏ).

---

## Rủi Ro & Lưu Ý

- `Severity = 'khong'` hiện tại được dùng trong `SEVERITY_WEIGHT`, `assessToConditions`, và nhiều chỗ khác. Cần đổi tất cả sang type mới `'vua' | 'it' | 'nhieu'` và kiểm tra TypeScript.
- `calcBubblePos` dùng `window.innerWidth/innerHeight` — cần test edge case khi bubble bị clip ngoài màn hình với k=3 bubbles (góc chia 180°/2 = 90°).
- Ảnh trong `/condition/` chưa được optimize (mun-dau-den.png là 1.7MB, seo-ro.jpg là 876KB) — nên thêm `loading="lazy"` và có thể dùng `sizes` attribute. Không trong scope của task này nhưng cần note.
