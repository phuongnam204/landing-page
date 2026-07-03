# Thiết kế: Full-bleed + HUD overlay cho minigame "Khoanh vùng mụn"

- **Ngày:** 2026-07-03
- **Trạng thái:** Design — chờ duyệt trước khi viết implementation plan
- **Phạm vi:** `src/components/SkinScanScreen.tsx` (cả 2 phase `FindGame` và `ReportStep`)
- **Không đụng tới:** `src/components/MinigameCore/skinScanLogic.ts` (logic sinh nốt/ánh xạ vùng giữ nguyên 100%), `AppFlow.tsx`, `PayoffView`, `ProgramsScreen`

## 1. Bối cảnh & vấn đề

Minigame "khoanh vùng mụn" (spec trước: `docs/superpowers/specs/2026-07-02-acne-spot-minigame-design.md`) hiện hiển thị trong một khung (`frameStyle`) cố định `width: 330px`, màu navy `#2D2640`, đặt giữa một nền pastel (`PlayfulBackdrop`) có blob trôi nhẹ. Bố cục này được thiết kế mobile-first và áp dụng y hệt cho desktop.

**Vấn đề trên desktop:** khung 330px trông như một modal mobile bị phóng to giữa một màn hình rộng, để lại quá nhiều khoảng trống hai bên — không tạo được cảm giác "đang chơi một con game thật" (tham khảo: giao diện chơi game embed trên CrazyGames/Minecraft mà dev cung cấp làm ví dụ).

**Vấn đề màu sắc:** toàn bộ `SkinScanScreen.tsx` dùng màu cứng qua inline `style`, không có nhánh nào theo `prefers-color-scheme`. Khung navy `#2D2640` vốn được thiết kế làm bản *dark mode* (xem mục 9 của spec trước), nhưng code hiện tại áp nó cố định bất kể site đang sáng hay tối — gây lệch màu rõ rệt so với nền pastel sáng của `PlayfulBackdrop` khi site ở light mode.

**Vấn đề mobile:** khung đã gần full-width nhưng vẫn bo góc, để lộ một viền nền gradient pastel phía sau ở trên/dưới, và có một dòng hint "Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡" chiếm thêm không gian không cần thiết.

## 2. Mục tiêu

- Desktop: minigame chiếm trọn viewport (full-bleed), tạo cảm giác một "cửa sổ chơi game" thật sự thay vì một card nhỏ giữa khoảng trống.
- Màu sắc khung game **đổi theo light/dark mode của trình duyệt**, nhất quán với cách `HeroScreen` đã làm — không còn tình trạng "luôn hiển thị bản tối" bất kể theme.
- Mobile: full-bleed đúng nghĩa (bỏ bo góc, bỏ viền hé lộ nền), và bỏ dòng hint không cần thiết.
- Không đổi bất kỳ logic game nào (sinh nốt, catch radius, gợi ý tăng dần, ánh xạ vùng→profile) — đây thuần là thay đổi trình bày.

## 3. Quyết định thiết kế (đã chốt qua brainstorming trực quan)

| Câu hỏi | Đã chọn |
|---|---|
| Mức độ phóng to khung game trên desktop | **Full-bleed toàn màn hình** (không phải chỉ phóng to tỉ lệ, không giữ dạng 2 cột card+panel) |
| Màu khung theo light/dark | **Đổi theo theme** — light mode nền sáng ấm, dark mode giữ nguyên navy `#2D2640` hiện tại (không phải "luôn tối" như một màn console cố định) |
| Vị trí chữ hướng dẫn/chip đếm khi full-bleed | **HUD overlay nổi trực tiếp trên ảnh**, có scrim mờ để chữ luôn đọc rõ (không phải dải chữ riêng phía trên, không phải sidebar hẹp bên cạnh) |
| `ReportStep` (màn chọn vùng da) có full-bleed nhất quán không | **Có** — dùng chung kiểu full-bleed + theme-aware như `FindGame`, dù đây là màn chọn đáp án chứ không phải gameplay |
| Mobile có full-bleed edge-to-edge không | **Có** — bỏ bo góc, bỏ viền hé lộ nền pastel, khung phủ kín `100vw x 100vh` |

## 4. Kiến trúc component

Loại bỏ `PlayfulBackdrop` (nền pastel + blob trôi) và `PlayfulPanel` (cột chữ riêng bên phải) — không còn nền nào bị hé lộ phía sau khung, và không còn bố cục 2 cột tách biệt.

Thay vào đó, một khung sân khấu full-bleed dùng chung cho cả hai phase:
- `h-screen w-full`, không bo góc, không margin/padding bao quanh.
- Nền của khung là màu theo theme (mục 5), không phải ảnh, để dùng chung cho cả `FindGame` (có ảnh phủ full) lẫn `ReportStep` (không có ảnh, chỉ có nội dung căn giữa).
- Toàn bộ chữ/tiến độ/chip trở thành lớp HUD overlay tuyệt đối (`position: absolute`) nổi trên nội dung chính, dùng scrim gradient tối ở góc trên/dưới để đảm bảo độ tương phản.

## 5. Xử lý theme (light/dark)

- **Dark mode:** giữ nguyên y hệt hiện tại — nền navy `#2D2640`, chữ trắng. Đây là bản gốc đã được duyệt trong spec trước (mục 9), không đổi.
- **Light mode:** nền sáng ấm (tông kem/trắng ngà, ví dụ gần `#FFF8F3`), chữ dùng màu `cta` (`#2D2640`) đậm — nhất quán với cách các màn hình khác (`HeroScreen`, `PayoffView`) đang xử lý light mode.
- Chuyển từ inline `style` hex cứng sang cặp class Tailwind `dark:` (theo `darkMode: 'media'` đã cấu hình), thay vì viết thêm media query CSS tay.
- **Scrim HUD** (gradient đen mờ dần phủ trên ảnh để chữ trắng luôn nổi rõ) **giữ nguyên tối ở cả hai theme** — vì lớp này phủ trên ảnh khuôn mặt (luôn cần tương phản với ảnh), không phải phủ trên nền trang, nên không cần đổi theo theme.

## 6. Bố cục theo phase

### FindGame (đang tìm & khoanh mụn)

- Ảnh khuôn mặt (`FACE_IMAGE_URL`) phủ kín `100vw x 100vh` bằng `object-cover` (cùng kiểu crop mà `HeroImageColumn` đang dùng cho ảnh chân dung).
- HUD dải trên: nhãn "SOI THỬ LÀN DA" + headline + thanh tiến độ gradient hồng-tím + bộ đếm "N/6 nốt" — một bản responsive duy nhất dùng chung cho cả desktop và mobile (thay vì tách bản `frameStyle` header và bản `PlayfulPanel` headline như hiện tại).
- HUD dải dưới: 2 chip "đã soi / còn lại" + mascot nhỏ ở góc — **chỉ hiện ở desktop** (mascot vốn đã ẩn ở mobile qua `hidden md:flex`, giữ nguyên quy tắc đó, chỉ chuyển từ "cột riêng" sang "overlay góc dưới").
- Các nốt mụn (`spots.map`) và 2 lớp gợi ý (`acne-hint-glow`, `acne-hint-ring`) giữ nguyên cơ chế toạ độ phần trăm (`%`) tính theo `boardRef`, chỉ đổi từ khung cố định 360px sang full viewport — không đổi logic `handlePointer`/`CATCH_RADIUS`.

### ReportStep (chọn vùng da hay nổi mụn)

- Không có ảnh nền → nền chính là màu theo theme (mục 5).
- Nội dung (headline hỏi, `FaceMap`, 4 nút chọn vùng) canh giữa màn hình full-bleed thay vì nằm trong card `w-[330px] md:w-[440px]` như hiện tại.
- `FaceMap` (SVG bản đồ khuôn mặt) giữ nguyên quy tắc `hidden md:flex` — chỉ hiện ở desktop, nhường chỗ cho 4 nút chọn ở mobile.

### Mobile (cả 2 phase)

- Bỏ hết bo góc (`rounded-*`), bỏ `PlayfulBackdrop`, khung phủ kín `100vw x 100vh`, không còn khoảng hé lộ nền pastel nào.
- **Xoá hẳn** dòng hint "Đừng lo — nếu bí, tụi mình sẽ hé lộ giúp bạn 💡" (ở cả desktop lẫn mobile) — không còn chỗ hợp lý trong bố cục HUD mới, và ý nghĩa trấn an của nó đã được cơ chế gợi ý tăng dần (glow → ring → safety net) xử lý sẵn.

## 7. Ngoài phạm vi (non-goals)

- Không đổi `skinScanLogic.ts` (sinh nốt, catch radius, ánh xạ vùng→profile) — 18 unit test hiện có giữ nguyên, không cần sửa.
- Không đổi `AppFlow.tsx`, `PayoffView`, `ProgramsScreen`, `ConversionForm`.
- Không thay ảnh khuôn mặt/ảnh chân dung (vẫn dùng ảnh tạm hiện có, license vẫn là việc còn treo trước go-live — đã ghi trong nhật ký dự án).

## 8. Kiểm thử & xác nhận

- Đây thuần là thay đổi giao diện/bố cục, không đụng logic game — không cần thêm/sửa unit test.
- Chạy `tsc --noEmit` sạch.
- Verify qua preview thật, kiểm tra đủ tổ hợp: (FindGame / ReportStep) × (desktop / mobile) × (light / dark mode) — đảm bảo HUD đọc rõ trên ảnh, gợi ý tăng dần đúng vị trí, nút chọn vùng bấm được, không lỗi console.

## 9. Quyết định còn mở

Không có — toàn bộ quyết định thiết kế đã chốt qua brainstorming trực quan (mục 3).
