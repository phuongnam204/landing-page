# Skin Scan Chat — Minigame Design Spec

**Date:** 2026-07-18  
**Status:** Awaiting review

---

## Tổng quan

Minigame mới cho v24 (`electric-light-pop`). Thay thế `FaceMapMinigame` hiện tại bằng một trải nghiệm conversational chat: bot hỏi 3 câu, user trả lời bằng chip, sau đó `onComplete()` fire với `MinigameResult` → chuyển sang payoff.

**Kết nối hook:** Hook v24 có CTA "Soi da ngay" → chat mở ra ngay với bot, tạo cảm giác được "phân tích" trực tiếp mà không có màn hình loading trung gian.

**File output:** `src/landing/variants/minigame/skin-scan-chat.tsx`  
Export: `SkinScanChatMinigame` (implement `MinigameSlotProps`)

---

## Flow

```
[Hook: "Soi da ngay"] → SkinScanChatMinigame
  Screen 1 — Opener:   Bot message + chip "Bắt đầu →"
  Screen 2 — Q1:       Bot hỏi buổi sáng da thế nào → 4 chips
  Screen 3 — Q2:       Bot hỏi mụn xuất hiện ở đâu → 4 chips
  Screen 4 — Q3:       Bot hỏi da có biểu hiện nào → 4 chips
  After Q3:            Typing indicator "Đang phân tích..." (~1s)
                       → onComplete(result) → Payoff
```

Không có màn hình kết quả trong chat — payoff xử lý toàn bộ phần đó.

---

## Câu hỏi & Signals

### Q1 — Buổi sáng thức dậy, da bạn thường như thế nào?

| Chip label | Signal |
|---|---|
| Khô căng, thỉnh thoảng bong tróc | `dry` |
| Bình thường, không có gì đặc biệt | `normal` |
| Bóng dầu nhẹ ở vùng T-zone | `oily-mild` |
| Rất bóng, đặc biệt trán và mũi | `oily-heavy` |

### Q2 — Mụn hay xuất hiện ở đâu nhất?

| Chip label | Signal |
|---|---|
| Cằm và quanh miệng (nhất là gần kỳ kinh) | `chin-hormonal` |
| Trán, mũi, chữ T | `tzone` |
| Hai má hoặc khắp mặt | `cheeks` |
| Hầu như không bị mụn | `no-acne` |

### Q3 — Da bạn có biểu hiện nào không?

| Chip label | Signal |
|---|---|
| Không, da khá ổn định | `stable` |
| Đôi khi đỏ ngứa khi dùng sản phẩm mới | `sensitive-mild` |
| Hay kích ứng, rát, đỏ rõ | `sensitive-strong` |
| Đang có sẹo rỗ hoặc thâm mụn | `scar-dark` |

---

## Decision Tree → ConditionId

Đọc top-down, rule đầu tiên match thắng:

```
1. Q3 = scar-dark                          → da-seo-ro
2. Q2 = chin-hormonal                      → mun-noi-tiet
3. Q3 = sensitive-strong                   → da-nhay-cam
4. Q1 = oily-heavy  AND  Q2 = tzone        → da-nhon-mun-viem
5. Q2 = tzone                              → lo-chan-long
6. Q1 = dry                                → da-nhay-cam
7. Q3 = sensitive-mild                     → da-nhay-cam
8. Q2 = no-acne  AND  Q1 = normal          → clean-skin
9. Q2 = cheeks                             → mun-trung-ca
10. fallback                               → da-moi-bat-dau
```

Coverage: tất cả 8 ConditionId đều reachable. `clean-skin` và `da-moi-bat-dau` có `tone: 'positive'`, 6 còn lại có `tone: 'concern'`.

---

## MinigameResult Construction

```ts
type S1 = 'dry' | 'normal' | 'oily-mild' | 'oily-heavy';
type S2 = 'chin-hormonal' | 'tzone' | 'cheeks' | 'no-acne';
type S3 = 'stable' | 'sensitive-mild' | 'sensitive-strong' | 'scar-dark';

function resolveConditionId(s1: S1, s2: S2, s3: S3): ConditionId { ... }

// zoneIds từ Q2
const ZONE_IDS: Record<S2, string[]> = {
  'chin-hormonal': ['chin'],
  'tzone':         ['forehead', 'nose'],
  'cheeks':        ['left-cheek', 'right-cheek'],
  'no-acne':       [],
};

// zoneLabel từ Q2
const ZONE_LABEL: Record<S2, string> = {
  'chin-hormonal': 'Cằm & quanh miệng',
  'tzone':         'Vùng chữ T',
  'cheeks':        'Hai má',
  'no-acne':       'Không có vùng cụ thể',
};

// triggerNote từ Q3
const TRIGGER_NOTE: Record<S3, string> = {
  'stable':          'da ổn định',
  'sensitive-mild':  'nhạy cảm nhẹ',
  'sensitive-strong':'kích ứng rõ',
  'scar-dark':       'sẹo rỗ / thâm mụn',
};
```

---

## Component Structure

```
SkinScanChatMinigame                   h-[100dvh] flex flex-col overflow-hidden
  ├── ChatHeader                       sticky top, brand name + progress counter "N / 3"
  ├── ChatMessages                     flex-1, overflow-y-auto, auto-scroll-to-bottom
  │   ├── BotMessage                   avatar (22px circle) + bubble, left-aligned
  │   ├── UserMessage                  bubble right-aligned (chipped answer, disabled)
  │   └── TypingIndicator              3 dot pulse animation, shown between messages
  └── ChipRow                          padding bottom, flex-wrap, pill buttons
```

---

## UX Behaviors

**Chip selection:**
- Khi user chọn chip: chip đó highlight (border đậm + bg nhạt), các chip còn lại dim nhưng vẫn hiển thị như history read-only.
- ChipRow ẩn đi, TypingIndicator xuất hiện trong ChatMessages (~400ms).
- Bot message mới fade-in, ChipRow mới xuất hiện với câu tiếp.

**Sau Q3:**
- TypingIndicator chạy ~1000ms với text nhỏ "Đang phân tích..." bên cạnh.
- Không hiện kết quả trong chat.
- Gọi `onComplete(result)` → LandingFlow chuyển sang payoff.

**History visibility:**
- `overflow-y-auto` cho phép scroll lên xem history.
- Nhưng mỗi lần bot message mới xuất hiện thì auto-scroll xuống bottom.
- Các chip đã chọn hiển thị dưới dạng UserMessage bubble (không phải ChipRow).

**Progress counter:**
- Header hiện "1 / 3", "2 / 3", "3 / 3" khi các câu lần lượt xuất hiện.
- Opener không tính vào counter.

---

## Tích hợp vào v24

`src/landing/variants/minigame/electric/light-pop.tsx` cập nhật:

```tsx
import { SkinScanChatMinigame } from '../skin-scan-chat';

export function ElectricLightPopMinigame(props: MinigameSlotProps) {
  return <SkinScanChatMinigame {...props} />;
}
```

Không cần thay đổi recipe hay registry.

---

## Out of scope

- Không thêm voice/audio
- Không lưu lịch sử chat giữa các lần chơi
- Không cho phép quay lại thay đổi câu trả lời đã chọn
