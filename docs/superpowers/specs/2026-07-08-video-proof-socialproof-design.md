# Thiết kế: Chèn video quy trình o2skin vào slot `socialProof`

- Ngày: 2026-07-08
- Trạng thái: đã duyệt (brainstorming), chờ lập kế hoạch triển khai
- Nhánh: `fix/landing-ux-review`

## 1. Bối cảnh và mục tiêu

Landing page o2skin là một luồng bảy bước theo kiến trúc slot/variant/recipe (`src/landing`):
`hook → minigame → payoff → programs → conversion → socialProof → done`. Mỗi bước là một
slot, được lấp bằng một variant chọn theo recipe của từng version.

Slot `socialProof` hiện **rỗng hoàn toàn** — `registry.socialProof = {}` và chưa recipe nào
dùng. Đây là chỗ được chừa sẵn cho nội dung tạo niềm tin. Mục tiêu của thay đổi này là lấp
slot đó bằng một video quy trình trị mụn chuẩn y khoa của o2skin, hiển thị ngay sau khi người
dùng gửi form (conversion) và trước màn done, nhằm củng cố niềm tin vào quyết định vừa đặt lịch.

Video nguồn đã được kiểm chứng qua `/watch` (YouTube `LJ392Jgplv4`, 17 giây, 720p): một
motion graphic kể chuyện tuyến tính gồm năm nhịp — thẻ tiêu đề "Miễn phí khám mụn cùng bác sĩ
O2 SKIN", ba bước quy trình (xác định nguyên nhân → phác đồ cá nhân hóa → chỉ khám & tư vấn,
quyết định ở bạn), và ảnh đội ngũ kèm tagline "Chọn O2 SKIN, chọn trị mụn chuẩn y khoa". Nội
dung khớp chặt với concept diễn giải nghiệp vụ trị mụn của landing và với hướng CTA ít friction.
Video gần như không có lời thoại (chữ trên hình + nhạc nền), nên phát muted không mất thông điệp.

## 2. Quyết định đã chốt

- **Vị trí:** lấp slot `socialProof` (sau conversion, trước done).
- **Nguồn nhúng:** file mp4 tự host trong `public`, dùng thẻ `<video>` (không nhúng iframe YouTube).
- **Kiểu phát:** `autoplay muted loop playsinline`. Chấp nhận cú cắt nhẹ ở điểm nối loop vì
  clip chỉ 17 giây.
- **Bật ở version:** recipe `v03-facemap`. Giữ nguyên v01, v02 (không có socialProof).

## 3. Kiến trúc thay đổi

Không sửa khung `LandingFlow` (bước socialProof đã được nối sẵn: gọi `onContinue` để chuyển
sang done). Thay đổi gói gọn trong việc thêm một variant, đăng ký nó, bật nó ở recipe, thêm
một event đo lường, và đặt hai file asset.

### 3.1 Tài sản video (`public/videos/`)

- `public/videos/o2skin-quy-trinh.mp4` — tải bằng `yt-dlp` từ nguồn gốc (~1.3MB, 720p, 17s).
- `public/videos/o2skin-quy-trinh-poster.jpg` — trích bằng `ffmpeg` một frame ở ~giây 1
  (khung thẻ tiêu đề "Miễn phí khám mụn"), dùng làm ảnh `poster` để tránh khung đen lúc video
  chưa tải.

### 3.2 Variant `video-proof`

File mới: `src/landing/variants/socialProof/video-proof.tsx`, export `VideoProofSocial`
nhận props `SocialProofSlotProps = { onContinue: () => void }` (đã định nghĩa ở `slots.ts`).

Cấu trúc component:

- Một sub-component cục bộ có tên ngữ nghĩa `VideoStage` lo phần khung `<video>`, để JSX
  chính gọn và biểu đạt ý đồ (theo quy ước đặt tên component của dự án, tham chiếu
  `SkinScanScreen.tsx`).
- Thẻ `<video>`: `autoPlay muted loop playsInline preload="metadata"` với `poster` như trên,
  `src` trỏ tới file mp4. Khung bo góc `rounded-soft`, tỉ lệ 16:9.
- Tiêu đề ngắn phía trên video củng cố niềm tin, ví dụ "Trị mụn chuẩn y khoa cùng bác sĩ da liễu".
- Nút "Hoàn tất" phía dưới gọi `onContinue` để đi tiếp sang màn done.
- Màu nền, card, bo góc, chữ dùng biến CSS theme (`--lp-bg-*`, `rounded-soft`, `text-cta`)
  cho đồng bộ với các variant khác.
- **Không dùng emoji** (luật dự án); nếu cần icon thì vẽ SVG inline.
- Tôn trọng `prefers-reduced-motion`: khi bật, không autoplay mà hiển thị poster kèm nút play
  để người dùng chủ động phát.

### 3.3 Đăng ký variant

Trong `src/landing/registry.ts`: import `VideoProofSocial` và đổi
`socialProof: {}` thành `socialProof: { 'video-proof': VideoProofSocial }`.

### 3.4 Bật ở recipe v03

Trong `src/landing/recipes/v03-facemap.ts`: thêm `socialProof: 'video-proof'` vào `slots`.
v01, v02 giữ nguyên để so sánh A/B giữa có và không có màn video.

### 3.5 Đo lường

Trong `LandingFlow.tsx`, tại bước socialProof, thêm `trackEvent('socialproof_view')` khi bước
này hiển thị (nhất quán với cách các bước khác bắn event như `minigame_complete`, `payoff_view`).

## 4. Kiểm thử và xác minh

- Chạy dev server, đi hết luồng v03 tới bước socialProof: xác nhận video autoplay muted loop,
  poster hiển thị trước khi tải, nút "Hoàn tất" chuyển sang done.
- Kiểm tra `validateRecipe` vẫn pass với v03 sau khi thêm slot (test hiện có ở
  `__tests__/registry.test.ts`, `__tests__/validateRecipe.test.ts`).
- Kiểm tra responsive mobile (khung 16:9 không tràn ngang) và chế độ `prefers-reduced-motion`.
- Xác nhận không có emoji trong variant.

## 5. Ngoài phạm vi (YAGNI)

- Không làm variant video cấu hình được `src` qua recipe — pattern hiện tại là variant tự
  chứa nội dung; nếu sau này cần video khác thì tạo variant mới hoặc mở rộng sau.
- Không thêm điều khiển playback đầy đủ (thanh seek, âm lượng) — phát muted loop là đủ.
- Không đụng iframe/nhúng bên thứ ba.
- Không tạo version v04 (đã chốt gắn vào v03).
