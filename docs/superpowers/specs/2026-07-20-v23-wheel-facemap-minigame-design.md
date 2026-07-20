# V23 Wheel + Face-Map Minigame — Design Spec

**Date:** 2026-07-20  
**File:** `src/landing/variants/minigame/electric/soft-swipe.tsx`  
**Replaces:** Current flat-card swipe implementation in `ElectricSoftSwipeMinigame`

---

## Overview

Hybrid minigame kết hợp hai cơ chế: (1) **wheel arc** để chọn tình trạng da, (2) **face-map** để chọn vùng da bị ảnh hưởng. Kết quả từ cả hai bước được gộp vào một `MinigameResult` duy nhất khi `onComplete` được gọi.

---

## Phase Flow

```
intro → wheel → face-map → scanning → done (onComplete)
```

### Phase 1: intro
Giữ nguyên màn hình intro hiện tại với "Bắt đầu →".

### Phase 2: wheel
Người chơi xoay bánh xe để tìm tình trạng da phù hợp, rồi tap vào card ở vị trí 12h để chọn.

### Phase 3: face-map
Người chơi tap vào các vùng khuôn mặt bị ảnh hưởng. Vùng liên quan đến condition vừa chọn được pre-highlight (gợi ý). Sau khi chọn ≥1 zone → button "Tiếp tục →" xuất hiện.

### Phase 4: scanning
Scan line sweep từ trên xuống khuôn mặt. Zones được chọn bùng sáng theo lượt. Tự động chuyển sang done.

### Phase 5: done
Gọi `onComplete` với dữ liệu tổng hợp từ cả wheel và face-map.

---

## State Model

```typescript
type Phase = 'intro' | 'wheel' | 'face-map' | 'scanning' | 'done';

// State (useState)
const [phase, setPhase] = useState<Phase>('intro');
const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

// Refs (no re-render needed)
const wheelAngle = useRef(0);       // float, degrees
const animFrame = useRef<number | null>(null);
const dragStartX = useRef(0);
const dragStartAngle = useRef(0);
const isDragging = useRef(false);
```

---

## Wheel Phase

### Layout

```
┌──────────────────────────────┐
│ [avatar] O2skin  Thẻ 1/5    │  ← header bar (top)
├──────────────────────────────┤
│                              │
│   Da của bạn dạo này         │  ← question (prominent, centered)
│       thế nào?               │
│  Chọn mô tả phù hợp nhất    │  ← subtitle
│                              │
│    [arc wheel + cards]       │
│                              │
│         ● ○ ○ ○ ○            │  ← dot indicators
│         ←        →           │  ← arrow controls only
└──────────────────────────────┘
```

### Arc Geometry

```
R = 248px          arc radius
CX = 160px         horizontal center of 320px container
CY = container_height + 60px   circle center below screen
STEP = 22°         angle between adjacent cards
DRAG_SENS = 4.2    px of drag per 1 degree of rotation
MIN_ANGLE = 0
MAX_ANGLE = (CARDS.length - 1) * STEP  // 4 * 22 = 88°
```

Card position at any moment:
```
cardAngle = wheelAngle - i * STEP
x = CX + R * sin(cardAngle)
y = CY - R * cos(cardAngle)
```

### Per-Card Visual Interpolation

```
t = |cardAngle| / STEP   // 0 = center, 1 = flanking, 2 = far

width   = max(70,  round(118 - t * 21))
height  = max(88,  round(148 - t * 27))
opacity = max(0.12, 1 - t * 0.42)
tilt    = -cardAngle * 0.55deg
zIndex  = max(1, round(20 - |cardAngle|))
bgAlpha = max(0.06, 1 - t * 0.92)   // white → glass → transparent
hidden  = t > 2.7
```

### Gesture Handling

**onPointerDown:** Cancel any running animation. Record `dragStartX = e.clientX`, `dragStartAngle = wheelAngle.current`. Set `isDragging = true`. Call `setPointerCapture`.

**onPointerMove:** 
```
rawAngle = dragStartAngle - (e.clientX - dragStartX) / DRAG_SENS
wheelAngle = clampWithDamping(rawAngle)
renderFrame()
```
Damping at ends: khi `rawAngle < MIN_ANGLE` hoặc `> MAX_ANGLE`, resistance = 22%.

**onPointerUp / onPointerLeave:**
```
target = clamp(round(wheelAngle / STEP) * STEP, MIN_ANGLE, MAX_ANGLE)
springTo(target)   // STIFFNESS=0.2, stops when delta < 0.04°
isDragging = false
```

### Selection

Tap vào card ở trung tâm (`|cardAngle| < STEP * 0.4`):
1. Disable gesture input (set `isDragging = false`, bỏ qua pointer events)
2. `selectedCardIdx = round(wheelAngle / STEP)`
3. Hiện check overlay trên center card — SVG path draw animation (500ms)
4. Sau 900ms tổng: fade out wheel → `setPhase('face-map')`

Tap vào card flanking: `springTo(cardIdx * STEP)` — chỉ xoay wheel về card đó, không select.

### Controls

Chỉ hai mũi tên: `←` và `→`. Không có check button.
- `←` → `snapBy(-1)`: spring đến card trước
- `→` → `snapBy(1)`: spring đến card sau

---

## Face-Map Phase

### Layout

```
┌──────────────────────────────┐
│ [avatar] O2skin  Bước 2/2   │
├──────────────────────────────┤
│                              │
│   Vùng da nào bị ảnh hưởng? │  ← question
│                              │
│        [face SVG]            │
│   ┌──────────────────┐       │
│   │    [forehead]    │       │
│   │  [nose] [cheeks] │       │
│   │      [chin]      │       │
│   └──────────────────┘       │
│                              │
│     [Tiếp tục →]             │  ← hiện sau khi chọn ≥1 zone
└──────────────────────────────┘
```

### Zones

Tọa độ theo `viewBox="0 0 100 100"` (đơn vị %, relative to face SVG bounds):

```typescript
const FACE_ZONES = [
  { id: 'forehead', label: 'Trán',  x: 33, y: 12, w: 34, h: 14 },
  { id: 'nose',     label: 'Mũi',   x: 42, y: 32, w: 16, h: 16 },
  { id: 'cheeks',   label: 'Má',    x: 14, y: 30, w: 72, h: 26 },
  { id: 'chin',     label: 'Cằm',   x: 40, y: 58, w: 20, h: 14 },
];
```

### Pre-highlight Logic

Mỗi card trong CARDS có `zones: string[]` — đây là các zone được pre-select khi card đó được chọn ở wheel:

```typescript
// Khi chuyển sang face-map:
setSelectedZones(new Set(CARDS[selectedCardIdx].zones));
```

User có thể tap để toggle thêm/bỏ zone bất kỳ.

### Interaction

- Tap zone: toggle in/out `selectedZones`
- Zone selected: fill đổi màu sang `var(--lp-accent)`, label hiện rõ
- Zone unselected: fill nhạt, semi-transparent
- Sau khi `selectedZones.size >= 1`: button "Tiếp tục →" slide-up xuất hiện

---

## Scanning Phase

Duration: ~1.8s. Không có interaction.

Animation:
1. Scan line (horizontal gradient) sweep từ top xuống bottom của face SVG (800ms, `ease-in-out`)
2. Mỗi zone được chọn "bùng sáng" khi scan line đi qua (fill → accent + glow)
3. Tất cả zones sáng xong: brief pause (300ms)
4. Fade out toàn màn hình → `onComplete`

---

## onComplete Data

```typescript
const condition = skinConditions[CARDS[selectedCardIdx!].conditionId]!;
onComplete({
  condition,
  conditions: [condition],
  zoneIds: Array.from(selectedZones),
  zoneLabel: Array.from(selectedZones).join(', ') || 'Không có vùng cụ thể',
  triggerNote: CARDS[selectedCardIdx!].label,
});
```

---

## Cards Data (giữ nguyên từ code hiện tại)

```typescript
const CARDS: SwipeCard[] = [
  { id: 'oily',    label: 'Da nhờn, bóng dầu',           description: 'Mặt hay bóng dầu, đặc biệt vùng trán và mũi', conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'] },
  { id: 'acne',    label: 'Mụn viêm, mụn bọc',            description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',   conditionId: 'mun-trung-ca',     zones: ['cheeks'] },
  { id: 'dry-red', label: 'Da khô, đỏ, dễ kích ứng',      description: 'Da căng rát sau rửa mặt, dễ bong tróc',       conditionId: 'da-nhay-cam',      zones: ['cheeks', 'forehead'] },
  { id: 'pores',   label: 'Lỗ chân lông to, ít mụn',      description: 'Lỗ chân lông nhìn thấy rõ, da xuất hiện đầu đen', conditionId: 'lo-chan-long', zones: ['nose', 'forehead'] },
  { id: 'clear',   label: 'Da khỏe, không vấn đề rõ rệt', description: 'Da khá ổn định, không có mụn hay kích ứng thường xuyên', conditionId: 'clean-skin', zones: [] },
];
```

---

## What Changes vs Current Code

| Bỏ | Thêm |
|---|---|
| `currentIdx` state | `wheelAngle` ref |
| `direction`, `animating` state | `animFrame`, `isDragging`, `dragStartX`, `dragStartAngle` refs |
| `offsetX`, `startX` refs | `selectedCardIdx`, `selectedZones` state |
| Swipe left/right card-exit logic | Arc interpolation `renderFrame()` |
| "Không phải" / "Đúng của tôi" buttons | Face-map SVG + zone toggle |
| Check button | Scanning phase with SVG scan line |
| Phase `'swiping'` | Phases `'wheel'`, `'face-map'`, `'scanning'` |
