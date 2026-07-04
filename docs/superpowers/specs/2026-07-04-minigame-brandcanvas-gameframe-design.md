# Thiết kế: BrandCanvas + GameFrame + animation cho minigame (iteration 2)

- **Ngày:** 2026-07-04
- **Trạng thái:** Design — chờ duyệt trước khi viết implementation plan
- **Thay thế:** Kiến trúc full-bleed + HUD-on-image từ [2026-07-03-minigame-fullbleed-hud-design.md](2026-07-03-minigame-fullbleed-hud-design.md) (đã merge vào master).
- **Phạm vi:** `src/components/SkinScanScreen.tsx`, `src/app/globals.css`. KHÔNG đụng `MinigameCore/skinScanLogic.ts` hay bất kỳ logic game nào.

## 1. Bối cảnh & lý do redo

Iteration trước (2026-07-03) chuyển minigame sang layout full-bleed edge-to-edge với HUD overlay đè trực tiếp lên ảnh khuôn mặt. Sau khi merge, ba vấn đề thẩm mỹ lộ ra qua đánh giá thực tế:

1. **Ảnh mặt phủ kín quá dominant.** Ở kích thước 100vw × 100vh, khuôn mặt người lạ lấp đầy màn hình, cảm giác "bị nhìn chằm chằm" thay vì "khung game embed" như reference (Minecraft/CrazyGames đã tham khảo trong brainstorm cũ — thực ra chúng có **khung game rõ ràng**, có brand chrome bao quanh, không hề edge-to-edge).
2. **Ảnh không responsive & pixelated.** URL Unsplash gốc chỉ có `?w=500&h=560` — khi phóng lên full viewport (đặc biệt desktop ≥1200px), ảnh bị scale vượt độ phân giải nguồn, gây mờ và răng cưa.
3. **HUD chữ trên mặt lộn xộn.** Vì không còn "chrome" bên ngoài ảnh để chứa text, headline + progress bar + chip đếm phải đè trực tiếp lên khuôn mặt với scrim gradient tối — dù đọc được vẫn cho cảm giác rối, thiếu breathing room.

Iteration này quay về **có khung game rõ ràng, không edge-to-edge**, đồng thời khôi phục lại nền brand pastel + blob trôi (đã bị xoá cùng `PlayfulBackdrop` trong iteration trước).

**Ngoài phạm vi lần này:** logic game (game hiện tại "khoanh mụn 6 nốt" đang được người dùng brainstorm lại độc lập). Spec này chỉ dựng **UI shell** đủ tổng quát để đón bất kỳ gameplay nào sau này; `FindGame` + `ReportStep` hiện tại được giữ nguyên làm placeholder chạy được trong shell mới, sẽ được thay khi có concept game mới.

## 2. Quyết định thiết kế (đã chốt qua brainstorming trực quan)

| Câu hỏi | Đã chọn |
|---|---|
| Cách "đóng khung" minigame trên desktop | **Portrait emphasis** — ảnh trong khung nhỏ, HUD sống NGOÀI khung trên nền brand. Không phải split panel (A) hay stacked frame (B). |
| Mobile reflow | **Sandwich** — HUD-card có progress ở đầu → ảnh giữa → chip đếm ở đáy. Không phải "text trước ảnh sau" (A) hay "ảnh dominant + HUD gom card dưới" (B). |
| Nền xung quanh khung | **Pastel gradient + blob trôi** (vọng lại spec Playful Pastel gốc). Không phải gradient tĩnh hay đơn sắc. |
| ReportStep dùng khung gì | **Card trắng nhẹ** thay khung navy — báo hiệu "đã qua game, giờ là bước tự khai", nhất quán tone với PayoffView phía sau. Không dùng cùng khung navy như FindGame (A) hay để nội dung nổi trực tiếp trên nền pastel (C). |
| Có animation chuyển tiếp giữa 2 phase | **Có** — sequential fade-up out → 150ms gap → bouncy scale-in. |
| Ảnh khuôn mặt | Cập nhật param URL để tăng resolution (`?w=900&h=1200&fit=crop&crop=faces&q=85`). Tiêu chí chọn ảnh khác được ghi trong spec nhưng thay URL cụ thể là task riêng, sau khi có game mới. |
| Dark mode nền | **Biến thể navy gam đậm với blob tím than / xanh khuếch tán**, không phải đơn sắc navy. |

## 3. Kiến trúc 3 lớp

Thay cho lớp `GameStage` full-bleed đơn của iteration trước, spec này dựng 3 lớp lồng nhau, mỗi lớp có một trách nhiệm rõ ràng:

**BrandCanvas** (ngoài cùng) là "phòng chơi" — nền pastel gradient + 3 blob mờ trôi (light) hoặc gradient navy sâu với blob tím than / xanh khuếch tán (dark). Phủ hết viewport (`h-screen w-full`). KHÔNG re-render khi đổi phase → blob giữ vị trí liên tục qua các phase.

**GameFrame** (giữa) là "khung game" — khối bo góc, có `max-width` và `max-height` rõ ràng, canh giữa cả trục X và Y trong BrandCanvas. Chỉ đóng vai trò khung tranh + đổ bóng, không đặt background riêng (background do PhaseContent bên trong tự phụ trách theo phase).

**PhaseContent** (trong cùng) là nội dung game — thay đổi theo `phase` state (`'find'` hay `'report'`), là chỗ animation transition sống. Đây cũng là lớp sẽ được thay hoàn toàn khi game mới cắm vào — hai lớp ngoài giữ nguyên.

Cách tách này đảm bảo: (a) khi game logic thay đổi trong tương lai, chỉ PhaseContent bị ảnh hưởng; (b) blob trôi không bị "giật" mỗi lần đổi phase vì thuộc BrandCanvas ổn định; (c) shell test được ngay cả khi content bên trong là placeholder.

## 4. Chi tiết BrandCanvas

### Light mode

- Gradient chéo: `background: linear-gradient(135deg, #FDE7F1 0%, #EDE9FF 55%, #E4FBF1 100%)` — hồng-tím-mặt, đúng dải màu Playful Pastel gốc từ [visual-style-decision](../../MEMORY.md).
- Ba blob mờ, mỗi blob là một `<span>` tuyệt đối được style bằng class `.mg-blob` (tái tạo lại từ CSS block đã bị xoá ở commit `dce0f9f`):
  - Hồng `#FFB8D4` — `220×220`, `left: -40px; top: -30px`, delay 0s.
  - Tím `#B39DFF` — `180×180`, `right: -30px; bottom: 10%`, delay 2s.
  - Xanh mint `#8FE3BC` — `140×140`, `left: 12%; bottom: -30px`, delay 4s.
  - Mỗi blob: `border-radius: 9999px; filter: blur(30px); opacity: 0.5; animation: mgBlobFloat 9s ease-in-out infinite`.
- Keyframe `mgBlobFloat`: `translate(0, 0) scale(1) ↔ translate(0, -16px) scale(1.06)`.

### Dark mode

- Gradient: `background: linear-gradient(135deg, #0f0c1a 0%, #1a1030 55%, #0f0c1a 100%)` — cùng hình dạng gradient nhưng gam navy đậm, đồng bộ với các màn khác đang dùng gradient này (`HeroScreen` dark).
- Blob giữ nguyên vị trí và animation, chỉ đổi màu + opacity/blur:
  - Blob 1 (thay hồng): tím than `#4c1d95`, `opacity: 0.35`, `blur(50px)`.
  - Blob 2 (thay tím): xanh khuếch tán `#1e40af`, `opacity: 0.30`, `blur(50px)`.
  - Blob 3 (thay mint): tím xám `#312e81`, `opacity: 0.30`, `blur(50px)`.
- Blur cao hơn và opacity thấp hơn để blob không "chọc mắt" ở chế độ tối.

Cả hai variant tôn trọng `prefers-reduced-motion: reduce` — blob đứng yên tại vị trí ban đầu, không animate.

## 5. Chi tiết GameFrame

- Kích thước: `w-[92vw] max-w-[880px]`, `max-h-[90vh]`. Không đặt height cứng — chiều cao co giãn theo content, tối đa 90vh.
- Canh giữa: BrandCanvas dùng `flex items-center justify-center` để GameFrame nằm chính giữa cả trục X và Y.
- Bo góc: `rounded-[28px]` — nhất quán với các card khác (`ProgramCard`, `PayoffView`).
- Đổ bóng: `shadow-2xl` (Tailwind default) — đủ mạnh để "nổi" trên nền pastel mà không quá dramatic.
- Overflow: `overflow-hidden` — cần thiết để animation scale-in không tràn ra khỏi khung.
- KHÔNG đặt background riêng: PhaseContent bên trong sẽ tự set background (navy cho FindGame, trắng cho ReportStep).

## 6. Chi tiết PhaseContent & animation

### FindGame content (bên trong GameFrame)

Cần refactor từ layout full-bleed hiện tại về **portrait emphasis với sandwich mobile**:

**Desktop (`md:` trở lên):**
- Layout ngang trong GameFrame: cột trái là ảnh khuôn mặt trong "khung tranh" navy nhỏ (aspect 3:4, `w-[280px]` cố định); cột phải là HUD panel (headline + progress bar + chip đếm + mascot) đặt trên nền trắng ấm (light) / navy nhạt hơn khung (dark), padding thoáng.
- Nội dung KHÔNG đè lên ảnh — HUD nằm bên cạnh, breathing room rõ ràng.
- Background của GameFrame content: `bg-white dark:bg-[#2D2640]` (light: trắng sạch, dark: navy nhất quán với gam brand).

**Mobile (`<md`):**
- Sandwich dọc: HUD-card trên (chứa label "SOI THỬ LÀN DA" + headline + progress bar + counter "N/6 nốt") → ảnh khuôn mặt ở giữa (chiếm phần lớn chiều cao còn lại) → chip đếm dưới ("N đã soi / còn K").
- Toàn bộ vẫn nằm gọn trong GameFrame, không edge-to-edge.
- Ảnh có `object-cover` để crop mặt cân đối, `aspect-[3/4]` để giữ tỉ lệ chuẩn.

### ReportStep content (bên trong GameFrame)

- Background của GameFrame content khi ở phase `report`: `bg-white dark:bg-[#f5f0ff]` — card trắng sáng bất kể theme (spec chốt "card trắng nhẹ" bất kể dark/light, để báo hiệu chuyển tone). Ở dark mode dùng trắng ngà `#f5f0ff` thay vì trắng thuần để không "chói" khi từ dark canvas nhìn vào.
- Nội dung: giữ nguyên layout hiện tại (FaceMap trái + question card phải trên desktop, stacked mobile), chỉ đổi color palette từ navy sang light warm (text `text-cta`, buttons `bg-cta/5 hover:bg-cta/10`).

### Animation transition find → report

Sequential (không cross-fade song song):

1. Content phase `find` chạy **exit animation** `phaseFadeUp`: `opacity: 1 → 0`, `transform: translateY(0) → translateY(-15px)`, duration `200ms`, easing `ease-in`.
2. Chờ `150ms` gap (dead time để mắt "reset").
3. Content phase `report` mount và chạy **enter animation** `phaseBouncyIn`: `opacity: 0 → 1`, `transform: scale(0.92) → scale(1)`, duration `400ms`, easing `cubic-bezier(0.34, 1.56, 0.64, 1)` (cùng đường cong đã dùng ở `psPopCheer`).

Tổng thời gian transition: `200 + 150 + 400 = 750ms`.

Về code, dùng một hook nhỏ `useDelayedPhase(phase)` bên trong `SkinScanScreen`:

```
- state `phaseActual` = giá trị `phase` mới nhất
- state `phaseRendered` = phase đang thực sự render, lệch 200+150ms sau `phaseActual`
- state `phaseIsExiting` = true trong 200ms đầu khi `phaseActual` đổi
```

Cả 2 keyframe (`phaseFadeUp`, `phaseBouncyIn`) đăng ký trong `globals.css`. `prefers-reduced-motion: reduce` fallback: cả hai animation rút gọn thành fade thuần 200ms không transform.

## 7. Ảnh khuôn mặt

- **Cập nhật ngay trong iteration này:** đổi `FACE_IMAGE_URL` từ `photo-1544005313-94ddf0286df2?w=500&h=560&fit=crop&crop=faces` sang `photo-1544005313-94ddf0286df2?w=900&h=1200&fit=crop&crop=faces&q=85`. Giữ nguyên photo ID, chỉ tăng res + đổi aspect 3:4 dọc + thêm `q=85` để giảm compression artifact.
- **Ngoài phạm vi iteration này (TODO ghi vào code):** thay `FACE_IMAGE_URL` sang ảnh Unsplash mới có commercial license, tone da sáng, background dịu, không có object đè lên 6 vị trí spot đã có sẵn trong `SPOT_POOL`. Việc chọn URL cụ thể phụ thuộc vào game mới (nếu game không dùng ảnh khuôn mặt thì hủy bỏ TODO).
- Vì aspect ratio đổi từ 500×560 (~1:1.12) sang 900×1200 (1:1.33 = 3:4), 6 spot coordinates trong `SPOT_POOL` cần được kiểm tra bằng mắt trong preview — không cần đổi giá trị (vì lưu bằng %), nhưng cần xác nhận vị trí spot vẫn nằm đúng trên khuôn mặt sau khi ảnh crop khác đi.

## 8. Ngoài phạm vi (non-goals)

- **Logic game.** `MinigameCore/skinScanLogic.ts` giữ nguyên 100% (18 unit test phải tiếp tục pass). Không đổi thuật toán `generateSpots`, `findNearestUnfoundSpot`, `resolveConditionByZone`, hay bất kỳ constant như `SPOT_COUNT`/`CATCH_RADIUS`.
- **Concept game mới.** Người dùng đang brainstorm độc lập (Skin Puzzle hoặc hướng khác). Khi có concept sẽ mở iteration riêng — spec này chỉ cần đảm bảo `PhaseContent` là slot đủ generic để đón nội dung khác sau này (không giả định game tương lai vẫn có "ảnh mặt + tap spot").
- Không đụng `AppFlow.tsx`, `PayoffView`, `ProgramsScreen`, `ConversionForm`, `HeroScreen`.

## 9. Kiểm thử & xác nhận

- `npx tsc --noEmit` sạch.
- `npx vitest run` 19/19 test cũ vẫn pass (không đụng logic file).
- Preview thật, cover đủ tổ hợp: (FindGame / ReportStep) × (light / dark) × (desktop / mobile). Cần xác nhận:
  - Khung game không edge-to-edge — luôn thấy blob trôi ở nền xung quanh.
  - Blob animate mượt (light) và không "chói" (dark).
  - Ảnh khuôn mặt không pixelated ở kích thước hiển thị mới.
  - Transition find → report chạy đúng: fade-up exit → gap → bouncy scale-in enter.
  - 6 spot vẫn nằm đúng trên khuôn mặt sau khi đổi aspect ratio ảnh.
  - Không lỗi console.
- `prefers-reduced-motion: reduce`: blob đứng yên, transition fallback về fade thuần.

## 10. Quyết định còn mở

Không có — toàn bộ quyết định thiết kế đã chốt qua brainstorming trực quan (mục 2). Việc thay ảnh khuôn mặt sang URL Unsplash mới được ghi làm TODO trong code, không phải câu hỏi thiết kế mở.
