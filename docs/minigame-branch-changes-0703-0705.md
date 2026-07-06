# Tóm tắt thay đổi — branch `feat/minigame-skincare` (03/07 – 05/07)

> Tài liệu này tóm tắt những thay đổi quan trọng của branch trong giai đoạn review trước khi merge vào main.

---

## 1. ProgramsScreen — xây dựng màn hình liệu trình (03/07)

Toàn bộ màn hình gợi ý liệu trình được xây dựng lại từ đầu theo thiết kế card-B:

- **Data model:** thêm kiểu `Program`, danh sách liệu trình thật, helper liên kết `SkinCondition` → `Program`.
- **UI card-B:** mỗi card có header màu tint riêng theo loại liệu trình, badge điều kiện phù hợp, nút chọn.
- **Mascot + animation:** thêm chibi nurse và entrance animation theo từng card (fade, pop, float).
- **Phân loại da:** `quiz.ts` được reshape thành taxonomy `SkinCondition`, `skinScanLogic` ánh xạ vùng da → condition.

---

## 2. Thay thế hoàn toàn minigame cũ bằng skincare minigame 3 phase (03/07 – 05/07)

### Architecture

Minigame cũ (FindGame / SkinScanScreen) được gỡ bỏ hoàn toàn. Thay vào là hệ thống mới gồm:

- `BrandCanvas` / `GameFrame` — shell full-bleed với blob gradient nền.
- `GameScene` — khung chứa sky/skin zone (tỉ lệ 3:2), progress bar, tiêu đề pha.
- `SkinGame` — orchestrator quản lý state machine của toàn bộ flow: `disclaimer → press → drag → swipe → complete → report`.
- `useAdvancingHint` — hook theo dõi tiến độ, escalate hint và safety-net tự hoàn thành pha nếu user bị kẹt.
- Collision utils (TDD): `withinBox`, `withinRadius` dùng tọa độ phần trăm.

### 3 phase gameplay

| Phase | Mechanic | Đối tượng |
|---|---|---|
| **PressPhase** | Nhấn giữ để nặn | 5 mụn đầu trắng |
| **DragPhase** | Dán sticker → kéo lên trời | 28 mụn đầu đen |
| **SwipePhase** | Kéo máy đốt lông qua da | 40 sợi lông tơ |

DragPhase dùng state machine 3 trạng thái (`idle → placed → pulling`) để đảm bảo mechanic stick-and-pull đúng nghĩa. Bounding box sticker được tính từ kích thước DOM thực tế thay vì giá trị cố định.

### Self-report + profile

Sau 3 phase, người dùng trả lời 3 câu hỏi (vùng da, cảm giác, trigger). Logic `resolveProfile` ánh xạ kết quả sang `SkinCondition` để truyền vào ProgramsScreen.

---

## 3. UX & Visual polish (05/07)

Sau vòng review nội bộ, các điểm sau được cải thiện:

- **Hint system:** thay GhostHand bằng hệ thống hint riêng: gradient ring (HintRing), mũi tên trắng (HintArrow), label text trắng có text-shadow — tương phản cao trên nền sky xanh. Đồng bộ phong cách với PressPhase.
- **Sticker & dot size:** sticker tăng 2×, dot tăng 1.5× so với bản đầu.
- **Hair height:** lông tơ scale 2.5× theo chiều dọc để dễ nhìn.
- **SelfReportStep:** label dẫn dắt mới ("Cùng tìm điều da bạn thực sự cần 🌿"), animation chọn đáp án (gradient highlight + scale).
- **ProgramCardB:** header đổi sang nền `tintColor` 80% opacity, text trắng — tương phản rõ hơn trên nền lavender.
- **GameCompleteScreen:** màn hình chúc mừng 4 giây xuất hiện giữa SwipePhase và SelfReportStep, có confetti animation, checkmark gradient, đếm ngược 3–2–1.

---

## 4. Dark mode — cơ chế và triển khai toàn trang

### Cơ chế kích hoạt

Dark mode được cấu hình theo kiểu **media-query-driven** trong `tailwind.config.mjs`:

```js
darkMode: 'media'
```

Điều này có nghĩa là giao diện tự động theo `prefers-color-scheme` của hệ điều hành — không có toggle thủ công, không cần JavaScript để detect hay lưu trạng thái. Khi người dùng đổi OS sang dark mode, trang đổi theo ngay lập tức mà không cần reload.

Không có `<html class="dark">` hay localStorage. Mọi thứ do CSS media query điều khiển.

### Hero section

Nền trang là gradient 3 điểm, đảo hoàn toàn giữa hai mode:

| | Light | Dark |
|---|---|---|
| Nền | `#FFEFF4 → #EEF0FA → #E7F8F1` (pastel hồng–tím–mint) | `#0f0c1a → #1a1030 → #0f0c1a` (deep navy-purple) |
| Chuyển cảnh | `transition-colors duration-500` — mượt khi OS đổi mode |

Nút CTA đảo màu hoàn toàn: light là `bg-cta text-white` (navy nền, chữ trắng), dark là `bg-white text-cta` (trắng nền, chữ navy). Hai ảnh hero giảm độ sáng và thêm ring mờ (`dark:brightness-90 dark:ring-2 dark:ring-white/10`) để không bị chói trên nền tối.

Skin texture overlay đổi blend mode: `mix-blend-mode: multiply` (light) → `mix-blend-mode: screen` (dark), giúp texture vẫn hiện ra đúng trên nền tối thay vì bị che mất.

### Minigame shell

`BrandCanvas` (wrapper bao quanh toàn bộ minigame) dùng hai bộ blob gradient riêng biệt:

- **Light:** pastel hồng, tím nhạt, xanh lá — tạo cảm giác vui, nhẹ nhàng.
- **Dark:** tím đậm `#4c1d95`, navy `#1e40af`, indigo `#312e81` — giữ màu sắc nhưng giảm độ tươi, tạo depth. Blob trong dark mode blur mạnh hơn (30px → 50px) và ít đục hơn (opacity 0.5 → 0.32).

Thêm một overlay gradient chỉ hiện trong dark mode, phủ lên toàn shell để tạo chiều sâu.

### Các màn hình trong game

Mọi màn hình game dùng cùng một convention nhất quán:

- **Nền trắng → navy-purple:** `bg-white dark:bg-[#2D2640]` — áp dụng cho GameScene header, Disclaimer, GameCompleteScreen. Màu `#2D2640` chính là `cta` color của branding, tạo liên kết thị giác nhất quán giữa tối và sáng.
- **SelfReportStep** giữ nền lavender nhạt (`#f5f0ff`) ở cả hai mode — đây là chủ ý, tạo cảm giác "bước ra ngoài game" nhẹ nhàng trước khi trả lời câu hỏi.
- **Text heading:** `text-cta dark:text-white`.
- **Text muted:** `text-cta/60 dark:text-white/60`.
- **Progress bar track:** `bg-cta/10 dark:bg-white/15`.

### Lỗi được phát hiện và fix

Sau vòng review đầu tiên (commit `461470e`), phát hiện một số text trong màn hình game mất tương phản ở dark mode — do dùng màu `text-cta` mà không có `dark:text-white` tương ứng. Đã fix toàn bộ các điểm này.

---

## Trạng thái branch

Branch `feat/minigame-skincare` **chưa merge vào main**, đang chờ kiểm duyệt của leader.

Các thay đổi trên chủ yếu nằm trong:
- `src/components/minigame/` — toàn bộ minigame mới
- `src/components/MinigameCore/` — collision utils, profile logic
- `src/components/AppFlow.tsx` — ProgramCardB color, AppFlow swap
- `src/app/globals.css` — keyframes cho hint + game animations
