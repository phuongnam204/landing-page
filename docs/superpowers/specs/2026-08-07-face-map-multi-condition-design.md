# Face-Map Minigame — Multi-Condition + Severity Design

## Goal

Nâng cấp minigame face-map từ "chọn 1 tình trạng da → tap vùng" thành "chọn nhiều tình trạng → với mỗi tình trạng: map vùng + mức độ (ít/nhiều/không bị)". Kết quả đầu ra phản ánh đúng hơn da thực tế của khách hàng và cho phép đề xuất liệu trình tốt hơn.

---

## Bối cảnh (Current State)

File: `src/landing/variants/minigame/face-map.tsx`

**Flow hiện tại (2 bước):**
- Bước 1: Chọn đúng 1 `AcneType` từ 6 card
- Bước 2: Tap các vùng trên face SVG (toggle on/off)
- Output: `mapToConditions(zones, acneType)` → `ConditionId[]` (tối đa 2 conditions)

**Vấn đề:**
- Chỉ chọn 1 loại mụn → bỏ sót trường hợp hỗn hợp (mụn viêm + sẹo rỗ, lỗ chân lông + nhạy cảm...)
- Không phân biệt mức độ → vùng trán bị nhiều mụn hay chỉ lác đác đều được tính như nhau
- Recommend engine (`recommendPrograms`) đã hỗ trợ multi-condition nhưng mapping chưa tận dụng

---

## New Flow

```
[Bước 0 — Multi-select]
Chọn các loại tình trạng đang gặp (multi-select, 1–5 trong 6 option)
    ↓
[Bước 1..N — Face-map wizard, 1 bước per condition đã chọn]
"Mụn viêm đỏ xuất hiện ở đâu? Mức độ như thế nào?"
→ Tap zone trên SVG face → Bubble picker hiện ra tại vị trí zone
→ Chọn: Không bị / Ít mụn / Nhiều mụn
→ Zone đổi màu theo severity
→ Nút "Tiếp theo" (hoặc "Xem kết quả" ở bước cuối)
    ↓
[Scanning animation — giữ nguyên]
    ↓
[Conversion screen]
```

**Tổng số bước:** 1 (multi-select) + N (N = số condition chọn, thường 1–3) + scanning.

Người dùng chọn "Không có tình trạng nào" → bỏ qua tất cả bước wizard → thẳng scanning.

---

## Data Model

### Types mới

```typescript
// Mức độ severity cho mỗi zone
type Severity = 'nhieu' | 'it' | 'khong';

// Zone IDs — giữ nguyên từ hiện tại
type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';

// AcneType — giữ nguyên
type AcneType = 'inflamed' | 'blackhead' | 'sensitive' | 'pore' | 'none' | 'scar';

// Kết quả đánh giá mức độ cho 1 condition
interface ConditionAssessment {
  acneType: AcneType;
  zones: Partial<Record<Zone, Severity>>;
  // Các zone không được tap → mặc định 'khong'
  // totalScore: number (nhiều=2, ít=1, không=0) — tính trong mapToConditionsWeighted
}

// Output của toàn bộ minigame
interface MinigameResultV2 {
  assessments: ConditionAssessment[];
  conditions: ConditionId[];        // ordered by weight desc — dùng cho recommend
  condition: SkinCondition;         // primary condition (index 0) — dùng cho ConversionOrganism label
  zoneLabel: string;                // summary text ngắn cho display
  zoneIds: Zone[];                  // tất cả zones có severity != 'khong'
  triggerNote: string;
}
```

### Severity scoring

```
Severity weight: nhiều = 2, ít = 1, khong = 0
totalScore(assessment) = sum of weights across all 5 zones (max = 10)
```

Một `ConditionAssessment` được xem là **có mặt** khi `totalScore >= 1`. Nếu user không tap bất kỳ zone nào cho condition đó (totalScore = 0), condition đó bị bỏ qua trong output.

### Hàm mapping mới

```typescript
function assessToConditions(assessments: ConditionAssessment[]): ConditionId[]
```

Thay thế `mapToConditions`. Logic:
- Lọc assessments có `totalScore >= 1`
- Map từng `AcneType` → `ConditionId[]` theo zone dominance (kế thừa logic hiện tại)
- Sort theo `totalScore` giảm dần → primary condition là index 0
- Dedup bằng `Set`

Giữ nguyên: nếu user chọn `none` (hoặc không có assessment nào pass ngưỡng) → `['clean-skin']`

---

## UI Specification

### Bước 0 — Multi-select screen

**Component:** `ConditionSelectStep` (mới)

- Header: "Da bạn đang gặp tình trạng nào?" / sub: "Chọn tất cả những gì bạn đang có"
- Grid 2×3: 6 card tương tự `AcneCard` hiện tại, nhưng multi-select (không auto-advance)
- Card "Da ổn, ít mụn" (none): nếu chọn card này → deselect tất cả các card khác, proceed thẳng
- CTA: "Tiếp theo →" (disabled nếu chưa chọn gì)
- Desktop: giữ full-width, không split column

### Bước 1..N — Face-map wizard per condition

**Component:** `ConditionFaceMapStep` (refactor từ `Step1` hiện tại)

- Progress indicator: "Tình trạng 2 / 3" (số bước / tổng)
- Header: `"<ACNE_TYPE_LABEL> xuất hiện ở đâu?"` — thay đổi mỗi bước
- `FaceDiagram` SVG — **giữ nguyên hoàn toàn** (SVG, zones, scaling, dots, animations)
- Mỗi zone hiển thị severity color thay vì chỉ on/off:
  - `nhiều` → fill đỏ `#EF444440` + border `#EF4444` + dots đỏ (giữ animation hiện tại)
  - `ít` → fill cam `#F9731640` + border `#F97316` + dots cam (nhỏ hơn một chút)
  - `khong` → không fill (transparent), border dashed mờ (giữ style hiện tại)
- Sub-label phía dưới face: tên zone + mức độ ("vùng trán — nhiều mụn")
- Back button: về bước trước (hoặc về Bước 0 nếu là bước 1)
- CTA: "Tiếp theo →" / "Xem kết quả" ở bước cuối
- Desktop layout: single column (không split panel — vì wizard cần focus từng bước)

### Bubble Severity Picker

**Component:** `BubbleSeverityPicker` (mới)

**Trigger:** tap/click vào bất kỳ zone nào trên `FaceDiagram`

**Behavior:**
1. Zone được tap: class `.zone-active` (border solid blue, pulse ring)
2. Overlay xuất hiện: `rgba(160, 205, 230, 0.18)` — không blur, rất nhẹ
3. 3 bubble nổi lên từ vị trí tâm zone, theo arc:
   - Vị trí neo: `zone.getBoundingClientRect()` → center `(cx, cy)` trong viewport
   - Bubble positions (relative to zone center, R=60px):
     - "Không bị": angle 225° → `(-42px, +42px)` từ center (lower-left)
     - "Ít mụn": angle 315° → `(-42px, -42px)` từ center (upper-left)
     - "Nhiều mụn": angle 30° → `(+30px, -52px)` từ center (upper-right)
   - Stagger animation: delay 0ms / 90ms / 180ms
   - Animation: `scale(0) translateY(16px)` → `scale(1.08) translateY(-4px)` → `scale(1)`
     easing: `cubic-bezier(0.34, 1.56, 0.64, 1)`, duration 320ms
4. Bubble specs:
   - Size: 54×54px, `border-radius: 50%`
   - NO sub-label text bên dưới bubble
   - Text bên trong bubble: "Không bị" / "Ít mụn" / "Nhiều mụn" (font-size 11px, font-weight 800)
   - Colors:
     - "Không bị": `bg rgba(50,60,80,0.90)`, border `#64748b`, text `#cbd5e1`
     - "Ít mụn":   `bg rgba(155,68,5,0.90)`, border `#ea8c2a`, text `#fef3c7`
     - "Nhiều mụn": `bg rgba(180,25,25,0.90)`, border `#f87171`, text `#ffe4e4`
   - Box-shadow: `0 5px 20px rgba(0,0,0,0.30)`
5. Chọn bubble:
   - Bubble selected: `scale(1.35)` → `scale(0.88)` → `scale(1)` (22ms total)
   - Zone cập nhật severity color ngay lập tức
   - Overlay + bubbles fade out sau 280ms
6. Đóng: tap overlay background → `closeAll()`

**Viewport clamping:** `bx = clamp(bx, 37, window.innerWidth - 37)`, tương tự Y.

**Label dưới FaceDiagram:** update ngay sau khi chọn bubble: `"vùng trán — nhiều mụn"`

---

## Components — Inventory

| Component | Status | Ghi chú |
|-----------|--------|---------|
| `ConditionSelectStep` | Mới | Multi-select screen (Bước 0) |
| `BubbleSeverityPicker` | Mới | Overlay + 3 arc bubbles, triggered by zone tap |
| `ConditionFaceMapStep` | Refactor | Kế thừa `Step1`, thêm severity state per zone, header động |
| `FaceDiagram` | Mở rộng nhẹ | Thêm prop `zoneSeverity: Partial<Record<Zone, Severity>>` thay `selectedZones: Zone[]` |
| `StepProgress` | Cập nhật | Từ `1|2` thành `current: number, total: number` |
| `FaceMapMinigame` | Refactor | Orchestrator: thay state `acneType/selectedZones` → `assessments[]`, `wizardStep` |
| `mapToConditions` | Thay thế | → `assessToConditions(assessments[])` |
| `ScanningScreen` | Giữ nguyên | Không đổi |
| `IntroScreen` | Giữ nguyên | Không đổi |
| `AcneCard` | Giữ nguyên | Dùng lại ở Bước 0, chỉ thay onSelect logic |

---

## FaceDiagram Props — Thay đổi API

**Hiện tại:**
```typescript
{ selectedZones: Zone[], onToggle: (z: Zone) => void, isScanning: boolean }
```

**Mới:**
```typescript
{
  zoneSeverity: Partial<Record<Zone, Severity>>, // replaces selectedZones
  onZoneTap: (z: Zone, zoneCenterX: number, zoneCenterY: number) => void,
  // zoneCenterX/Y = zone <ellipse>.getBoundingClientRect() center trong viewport,
  // không phải vị trí chuột — dùng để neo bubble picker tại đúng vị trí zone
  isScanning: boolean,
}
```

`onZoneTap` truyền `screenX, screenY` (từ `getBoundingClientRect()` của zone element) lên orchestrator để `BubbleSeverityPicker` định vị bubble.

Zone fill color logic:
- `severity === 'nhieu'` → fill đỏ (giống `active` hiện tại với `#EF4444`)
- `severity === 'it'` → fill cam `#F97316` với opacity 0.22
- `severity === 'khong'` hoặc undefined → transparent (giữ dashed border hint)

---

## Recommendation Integration

`recommendPrograms` đã nhận `ConditionId[]` và sort theo score. Không cần thay đổi API.

`assessToConditions` trả về `ConditionId[]` sorted by severity weight → conditions nặng hơn đứng trước → recommend engine tự ưu tiên.

**Payload cho `onComplete`** (backward compat với `ConversionOrganism`):
```typescript
onComplete({
  conditions: resolvedConditions,       // SkinCondition[]
  condition: resolvedConditions[0],     // primary — dùng cho label
  zoneLabel: buildZoneLabel(assessments), // "vùng trán (nhiều), má trái (ít)"
  zoneIds: allAffectedZones,
  triggerNote: buildTriggerNote(assessments), // "Mụn viêm: trán, má; Sẹo rỗ: má trái"
})
```

`ConversionOrganism` hiển thị `minigameResult.condition.label` → vẫn hoạt động với primary condition.

---

## Out of Scope

- Thay đổi SVG face illustration (`/face-map-minigame.svg`)
- Thay đổi recommend engine (`recommend.ts`)
- Desktop split-panel layout cho wizard (wizard runs full-width trên desktop)
- Saving/restoring wizard state (page refresh = restart)
- Variants của minigame ngoài `face-map.tsx` (nếu có)
