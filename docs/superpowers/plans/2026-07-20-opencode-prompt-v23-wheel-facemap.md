# Prompt bàn giao cho opencode — V23 Wheel + Face-Map Minigame

## Nhiệm vụ

Rewrite toàn bộ file `src/landing/variants/minigame/electric/soft-swipe.tsx`. File này hiện chứa minigame swipe card đơn giản (`ElectricSoftSwipeMinigame`). Nhiệm vụ là thay thế nó bằng một hybrid minigame gồm 2 mechanic: **bánh xe arc xoay** (wheel) + **face-map chọn vùng da**.

Chỉ file này thay đổi. Không chạm vào bất kỳ file nào khác.

---

## Bối cảnh dự án

Dự án Next.js 15 landing page cho phòng khám O2skin (`D:\project\LandingPage`). Hệ thống có kiến trúc slot/recipe/registry:

- **Recipe** (`src/landing/recipes/*.ts`) khai báo `slots` — mỗi slot là một key trỏ tới một variant string
- **Registry** (`src/landing/registry.ts`) map variant string → React component
- **Component** nhận `props` từ slot và render giao diện

Version v23 đã có recipe trỏ tới `'electric-soft-swipe'` → `ElectricSoftSwipeMinigame`. Không cần sửa registry hay recipe.

### CSS custom properties quan trọng

Tất cả màu dùng CSS vars, KHÔNG dùng hardcode hex:

- `var(--lp-primary)` — màu chính (purple/dark)
- `var(--lp-accent)` — màu nhấn (vivid, thường là tím/hồng)
- `var(--lp-bg-hero)` — background tổng thể
- `var(--lp-bg-card)` — background card
- `color-mix(in srgb, var(--lp-accent) 20%, transparent)` — để tạo màu mờ

---

## Contract không thay đổi

Component phải emit đúng `MinigameResult` shape qua `onComplete`:

```typescript
// Từ src/landing/slots.ts
interface MinigameResult {
  condition: SkinCondition;
  conditions: SkinCondition[];
  zoneLabel: string;
  zoneIds: string[];
  triggerNote: string;
}

// Props
interface MinigameSlotProps {
  onComplete: (result: MinigameResult) => void;
}
```

Import paths đúng (giữ nguyên như file hiện tại):

```typescript
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';
```

---

## Implementation plan đầy đủ

Đọc file: `docs/superpowers/plans/2026-07-20-v23-wheel-facemap-minigame.md`

File này chứa 7 task với code đầy đủ cho từng bước. Thực hiện tuần tự từ Task 1 đến Task 7.

---

## Flow của minigame

```
intro → wheel → face-map → scanning → onComplete
```

### Phase intro
Màn hình giới thiệu với button "Bắt đầu →". Giữ gần giống visual hiện tại (đã có code trong plan).

### Phase wheel
Bánh xe arc xoay. 5 card xếp dọc cung tròn. Người chơi kéo trái/phải để xoay bánh xe. Tap vào card ở vị trí trung tâm → chọn card đó (xuất hiện checkmark animation), tự động chuyển sang face-map sau 900ms. Tap vào card flanking → spring về card đó (không chọn).

**Điểm kỹ thuật quan trọng nhất:** Animation wheel PHẢI 60fps, dùng `useRef` + `renderFrame()` imperative (update `el.style.*` trực tiếp), KHÔNG dùng React state để drive animation.

### Phase face-map
SVG khuôn mặt với 4 vùng tappable (Trán, Mũi, Má, Cằm). Các vùng liên quan đến condition vừa chọn được pre-highlight. User toggle zone. Sau ≥1 zone được chọn: button "Tiếp tục →" slide-up xuất hiện.

### Phase scanning
Scan line quét từ trên xuống mặt (800ms). Các zone đã chọn "bùng sáng" khi scan đi qua. Sau đó gọi `onComplete`.

---

## Các hằng số quan trọng

```typescript
const ARC_CX = 160;           // center x của container 320px
const ARC_R = 248;            // bán kính arc
const ARC_CY_OFFSET = 60;     // tâm vòng tròn nằm = containerHeight + 60 (dưới màn hình)
const ARC_STEP = 22;          // độ giữa 2 card liền kề
const DRAG_SENS = 4.2;        // px kéo / 1° xoay
const SPRING_STIFFNESS = 0.2;
const SPRING_THRESHOLD = 0.04;
const DAMPING = 0.22;         // độ cản khi kéo quá đầu/cuối

const MIN_ANGLE = 0;
const MAX_ANGLE = 88; // (5 cards - 1) * 22°
```

Vị trí card i khi `wheelAngle` = W:
```
cardAngle = W - i * ARC_STEP
x = ARC_CX + ARC_R * sin(cardAngle)
y = cy - ARC_R * cos(cardAngle)   // cy = containerHeight + ARC_CY_OFFSET
```

Per-card visual dựa trên `t = |cardAngle| / ARC_STEP`:
```
width   = max(70,  round(118 - t * 21))
height  = max(88,  round(148 - t * 27))
opacity = max(0.12, 1 - t * 0.42)
tilt    = -cardAngle * 0.55   // deg
zIndex  = max(1, round(20 - |cardAngle|))
hidden  = t > 2.7
isCenter = t < 0.4
```

---

## Data

```typescript
const CARDS = [
  { id: 'oily',    label: 'Da nhờn, bóng dầu',           description: 'Mặt hay bóng dầu, đặc biệt vùng trán và mũi', conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'] },
  { id: 'acne',    label: 'Mụn viêm, mụn bọc',            description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',   conditionId: 'mun-trung-ca',     zones: ['cheeks'] },
  { id: 'dry-red', label: 'Da khô, đỏ, dễ kích ứng',      description: 'Da căng rát sau rửa mặt, dễ bong tróc',       conditionId: 'da-nhay-cam',      zones: ['cheeks', 'forehead'] },
  { id: 'pores',   label: 'Lỗ chân lông to, ít mụn',      description: 'Lỗ chân lông nhìn thấy rõ, da xuất hiện đầu đen', conditionId: 'lo-chan-long', zones: ['nose', 'forehead'] },
  { id: 'clear',   label: 'Da khỏe, không vấn đề rõ rệt', description: 'Da khá ổn định, không có mụn hay kích ứng thường xuyên', conditionId: 'clean-skin', zones: [] },
];

const FACE_ZONES = [
  { id: 'forehead', label: 'Trán', x: 33, y: 12, w: 34, h: 14 },
  { id: 'nose',     label: 'Mũi',  x: 42, y: 32, w: 16, h: 16 },
  { id: 'cheeks',   label: 'Má',   x: 14, y: 30, w: 72, h: 26 },
  { id: 'chin',     label: 'Cằm',  x: 40, y: 58, w: 20, h: 14 },
];
// FACE_ZONES coordinates dùng SVG viewBox="0 0 100 100"
```

---

## Quy tắc cứng

1. **Chỉ sửa `src/landing/variants/minigame/electric/soft-swipe.tsx`** — không đụng file nào khác
2. **Export name giữ nguyên**: `export function ElectricSoftSwipeMinigame`
3. **Không hardcode màu hex** — dùng `var(--lp-*)` và `color-mix`
4. **Wheel animation = imperative DOM** — `renderFrame()` update `el.style.*`, không setState trong animation loop
5. **`npx tsc --noEmit` phải pass** sau mỗi task
6. Commit sau mỗi task với message format `feat(v23): <mô tả ngắn>`
7. Sau task cuối chạy `npx next build` để xác nhận build clean

---

## Kiểm tra thành công

Sau khi xong tất cả 7 task:

1. `npx tsc --noEmit` → 0 errors
2. `npx next build` → build thành công
3. Chạy dev server, mở version v23, kiểm tra thủ công:
   - Intro screen hiển thị và button "Bắt đầu →" hoạt động
   - Wheel xoay mượt khi kéo, spring-snap khi thả
   - Arrow ← → hoạt động
   - Tap center card → checkmark animation → chuyển sang face-map
   - Face-map hiện đúng zones pre-highlighted theo card vừa chọn
   - Toggle zone hoạt động, "Tiếp tục →" xuất hiện sau khi chọn ≥1 zone
   - Scanning phase chạy rồi gọi onComplete (chuyển sang payoff)
