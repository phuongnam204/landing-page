# Spec: Glow-Scratch Minigame — Revision Round 2

**File:** `src/landing/variants/minigame/electric/glow-scratch.tsx`  
**Date:** 2026-07-29  
**Status:** Pending implementation (opencode)

---

## 1. Scratch Zone Mechanic (rework hoàn toàn)

### 1.1 Vấn đề hiện tại
- `face-map-minigame.svg` hiển thị trực tiếp làm background → người chơi thấy luôn nội dung trước khi cào → sai concept thẻ cào.
- Game báo thành công ngay sau một đường cào cơ bản trên zone (completion threshold = 1 zone reveal, fired on first hit).

### 1.2 Thiết kế mới — Scratch coat + coverage threshold

**Zone selection — Architecture mới (condition-first):**

Thay vì random zone trực tiếp, logic mới là: **chọn condition trước, sau đó chọn zone dựa trên xác suất của condition đó**. Điều này đảm bảo vùng da xuất hiện đúng với loại tình trạng được tiết lộ (sẹo rỗ chủ yếu ở má, mụn đầu đen chủ yếu ở mũi/cằm...).

```
Bước 1: Random pick 1 conditionId từ danh sách conditions.
Bước 2: Tra cứu CONDITION_ZONE_WEIGHTS[conditionId] → weights per zone group.
Bước 3: Weighted sampling để chọn 1–3 zone groups (cheeks luôn là cặp).
Bước 4: Active zones = các zone groups được chọn. Tất cả map về conditionId đã chọn ở bước 1.
```

**Quy tắc cheeks:** `left-cheek` và `right-cheek` luôn là một cặp — hoặc cả hai được chọn, hoặc không ai. Khi cheeks xuất hiện trong CONDITION_ZONE_WEIGHTS, weight là xác suất cả cặp được chọn cùng lúc.

**Bảng CONDITION_ZONE_WEIGHTS (weights = xác suất zone group xuất hiện):**

| conditionId | forehead | nose | cheeks (cặp) | chin-jaw |
|-------------|----------|------|--------------|----------|
| `da-seo-ro` (sẹo rỗ) | 0.35 | 0.25 | 0.40 | 0.35 |
| `lo-chan-long` (mụn đầu đen) | 0.05 | 0.55 | 0.45 | 0.55 |
| `da-nhon-mun-viem` (da nhờn T-zone) | 0.60 | 0.60 | 0.40 | 0.60 |
| `mun-trung-ca` (mụn trứng cá) | 0.20 | 0.30 | 0.70 | 0.40 |
| `mun-noi-tiet` (mụn nội tiết) | 0.20 | 0.20 | 0.40 | 0.70 |

> Weights không cộng lại thành 1 — mỗi zone group là một lần tung xúc xắc độc lập.
> Sau khi sample, nếu không có zone nào được chọn → fallback: pick zone group có weight cao nhất.
> Nếu tổng zones > 3 → trim về 3 zone groups theo thứ tự weight giảm dần.

**Visual layers:**

```
Layer 1 (dưới cùng): face-map-minigame.svg tại opacity="0.08"
  — Ghost silhouette giúp người chơi định vị "đây là mặt người, cào vào đây"
  — Không lộ vùng nào vì quá mờ, chỉ hiện outline tổng thể
Layer 2: "revealed content" — chỉ render bên trong active zone ellipses:
  - Fill màu condition (`conditionColor`, opacity 0.65)
  - Dashed border ellipse màu condition
  - Zone label text (tên vùng)
  - Acne dots animation (giống face-map.tsx dots)
Layer 3 (trên cùng): "scratch coat" — SVG `<mask>` dạng ellipse bao lấy từng active zone
  - Fill màu scratch coat: theo theme `--lp-accent`, opacity ~0.92
  - Texture: subtle shimmer animation (keyframe scale/opacity pulse) để nhận biết đây là thẻ cào
  - Được xoá dần khi user cào qua (path trong mask)
```

> Layer 1 (ghost face): render bằng `<image href="/face-map-minigame.svg" x="0" y="0" width="176" height="240" opacity="0.08"/>` trong SVG viewBox 176×240. Opacity 0.08 = 8% — đủ thấy silhouette outline, không đủ để đọc nội dung.

**Scratch stroke width:** `strokeWidth="16"` trong `<mask>` path (tăng từ 7 hiện tại lên 16) để mỗi lần quẹt xoá được nhiều diện tích hơn.

**Coverage threshold — zone reveal logic:**

Dùng point-grid sampling:
1. Chia mỗi active zone ellipse thành grid `6×6px` cells (trong viewBox 176×240).
2. Track `coveredCells: Set<string>` — mỗi pointer move thêm tất cả cells mà stroke path đi qua (dùng ellipse intersection test với mỗi cell center).
3. Tổng cells trong zone ellipse = `totalCells` (tính 1 lần khi mount).
4. Khi `coveredCells.size / totalCells >= 0.65` → zone coi là revealed.

> Lý do chọn 65%: tránh yêu cầu cào toàn bộ (tedious) nhưng phải cào có chủ ý (không phải 1 nét).

**Per-zone reward animation (khi reveal):**
- Scratch coat của zone đó fade-out (opacity 0 trong 300ms).
- Overlay check-mark tạm thời hiện lên tại center zone: SVG `<circle>` fill condition color + `<path>` checkmark trắng, scale-in 0→1 trong 200ms, giữ 600ms, fade-out.
- Zone label "bounce-in" animation.

**Game completion:**
- Khi **tất cả** active zones đã revealed → sau 500ms delay → `setPhase('confirm')`.
- Không fire ngay khi reveal zone đầu tiên (trừ trường hợp chỉ có 1 active zone).

**Desktop sizing (bonus):**
- SVG container scratch: `w-full max-w-[260px] md:max-w-[520px]` (2x trên md+).
- Stroke width `strokeWidth="16"` ổn cho cả 2 kích thước.

**Manual mode:**
- Giữ nguyên, chỉ cần `completeManual()` chuyển thẳng sang `confirm` (không cần coverage logic vì đây là fallback accessibility).

---

## 2. Screen 1 (Confirm) — Desktop Layout

### 2.1 Vấn đề hiện tại
- Left panel 42% tinted có màu tổng thể sắc/tối, trông nặng nề.
- `ConfirmFaceMini` SVG width chỉ 140px — quá nhỏ.
- Tỷ lệ 42/58 không tận dụng được diện tích cho SVG.

### 2.2 Layout mới

Đổi tỷ lệ sang **60% SVG / 40% info**:

```
[  60% — SVG panel  ] | [  40% — info panel  ]
  background: plain     background: white/card
  padding: 40px         padding: 32px
  display: flex col     display: flex col
  align: center         justify: center
```

**SVG panel (60%):**
- `ConfirmFaceMini` width: `min(100%, 320px)` — responsive nhưng tối đa 320px.
- Background: `color-mix(in srgb, conditionColor 8%, var(--lp-bg-hero))` — nhẹ hơn, tông pastel.
- Bỏ condition badge ở panel này — chuyển sang info panel.
- Chỉ hiện: SVG face + zone highlight.

**Info panel (40%):**
- Condition badge (color dot + label) — dùng `conditionColor` fill light.
- Zone label nhỏ (12px, muted).
- `0.5px` divider màu `conditionColor` opacity 20%.
- Question text (14px/500).
- 3 buttons stacked (giữ nguyên styling hiện tại).

**Mobile:** không đổi (giữ layout centered hiện tại).

---

## 3. Screen 2a (Relocate) — Desktop Layout

### 3.1 Hiện trạng
- Tông màu option buttons (color dot + condition name) được đánh giá là OK.
- Layout desktop split (face left / info right) hoạt động tốt.

### 3.2 Thay đổi cần làm
- Giữ nguyên option color styling.
- Tăng `FaceDiagram` container width trên desktop: `md:max-w-[400px]` (từ mặc định 320px).
- Áp dụng cùng background tint nhẹ như Screen 1 mới (8% condition color) cho left panel.

---

## 4. Screen 2b (Alternative) — Layout đơn giản hoá

### 4.1 Vấn đề
Two-column layout (left: scratched condition context / right: condition list) không cần thiết, thêm phức tạp mà không thêm giá trị.

### 4.2 Layout mới — Single column (cả mobile lẫn desktop)

```
Centered max-w-[480px], padding 24px, flex col gap-3

Header:
  "Chọn tình trạng gần nhất với da bạn:"  (14px/600, centered)

Condition list (giữ nguyên styling button từ mobile hiện tại):
  [color dot] [condition label]
  — full width buttons, tông màu per-condition

Không có left panel / không có scratched condition context
```

Desktop chỉ cần tăng `max-w-[480px]` lên `md:max-w-[560px]` là đủ.

---

## 5. Không thay đổi

- Flow routing (Screen 1 → 2a / 2b, Screen 2b → 2a / payoff trực tiếp) — giữ nguyên.
- Screen 2a mobile layout — giữ nguyên.
- Screen 2b mobile layout — giữ nguyên (chỉ bỏ desktop two-column).
- `ALTERNATIVE_CONDITIONS` list và `DIRECT_PAYOFF` set — giữ nguyên.
- Manual mode — giữ nguyên logic.
- Security constraint: không render body text của `da-seo-ro`.

---

## 6. Files cần sửa

| File | Thay đổi |
|------|---------|
| `src/landing/variants/minigame/electric/glow-scratch.tsx` | Scratch mechanic, Screen 1 desktop, Screen 2b layout |

Không cần sửa `face-map.tsx`, `quiz.ts`, hay các file khác.

---

## 7. Các hằng số và data structure kỹ thuật cho opencode

```ts
SCRATCH_STROKE_WIDTH = 16          // SVG mask path strokeWidth
COVERAGE_THRESHOLD   = 0.65        // 65% area revealed = zone done
GRID_CELL_SIZE       = 6           // px trong viewBox để chia grid
MAX_ACTIVE_ZONES     = 3           // tối đa 3 zone groups
MIN_ACTIVE_ZONES     = 1           // tối thiểu 1 zone group
COMPLETION_DELAY_MS  = 500         // delay sau khi all zones revealed
REVEAL_ANIM_HOLD_MS  = 600         // checkmark giữ bao lâu trước khi fade
SVG_MAX_W_DESKTOP    = "520px"     // md:max-w-[520px] cho scratch SVG
GHOST_FACE_OPACITY   = 0.08        // opacity của face-map-minigame.svg ghost
```

**Zone groups (cheeks = cặp):**
```ts
type ZoneGroup = 'forehead' | 'nose' | 'cheeks' | 'chin-jaw';

// Khi cheeks được chọn → thêm cả left-cheek VÀ right-cheek vào activeZones
const ZONE_GROUP_TO_REVEAL_IDS: Record<ZoneGroup, RevealZoneId[]> = {
  'forehead': ['forehead'],
  'nose':     ['nose'],
  'cheeks':   ['left-cheek', 'right-cheek'],  // luôn là cặp
  'chin-jaw': ['chin-jaw'],
};
```

**CONDITION_ZONE_WEIGHTS:**
```ts
// weight = xác suất zone group xuất hiện (độc lập, không cộng thành 1)
const CONDITION_ZONE_WEIGHTS: Record<string, Record<ZoneGroup, number>> = {
  'da-seo-ro':       { forehead: 0.35, nose: 0.25, cheeks: 0.40, 'chin-jaw': 0.35 },
  'lo-chan-long':    { forehead: 0.05, nose: 0.55, cheeks: 0.45, 'chin-jaw': 0.55 },
  'da-nhon-mun-viem':{ forehead: 0.60, nose: 0.60, cheeks: 0.40, 'chin-jaw': 0.60 },
  'mun-trung-ca':    { forehead: 0.20, nose: 0.30, cheeks: 0.70, 'chin-jaw': 0.40 },
  'mun-noi-tiet':    { forehead: 0.20, nose: 0.20, cheeks: 0.40, 'chin-jaw': 0.70 },
};
```

**Sampling algorithm (pseudo-code):**
```ts
function pickActiveZones(conditionId: string): RevealZoneId[] {
  const weights = CONDITION_ZONE_WEIGHTS[conditionId];
  
  // Mỗi zone group: tung xúc xắc độc lập
  const selected: ZoneGroup[] = Object.entries(weights)
    .filter(([_, w]) => Math.random() < w)
    .map(([group]) => group as ZoneGroup);

  // Fallback: không có zone nào → pick zone có weight cao nhất
  const active = selected.length > 0
    ? selected
    : [maxWeightGroup(weights)];

  // Trim về tối đa MAX_ACTIVE_ZONES (ưu tiên zone có weight cao hơn)
  const trimmed = active
    .sort((a, b) => weights[b] - weights[a])
    .slice(0, MAX_ACTIVE_ZONES);

  return trimmed.flatMap(g => ZONE_GROUP_TO_REVEAL_IDS[g]);
}
```

---

## 8. Quyết định đã chốt (từ review session 2026-07-29)

| Câu hỏi | Quyết định |
|---------|-----------|
| Số lượng active zone | 1–3 zone groups, random theo weighted distribution của condition |
| Scratch coat color | Theo theme `--lp-accent`, giống thiết kế ban đầu |
| Face outline | Render ghost silhouette: face-map-minigame.svg tại opacity 8% |
