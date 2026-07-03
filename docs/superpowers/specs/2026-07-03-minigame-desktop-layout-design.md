# Thiết kế: Layout desktop cho minigame (FindGame + ReportStep)

- **Ngày:** 2026-07-03
- **Trạng thái:** Design — chờ duyệt trước khi viết implementation plan
- **Phạm vi:** Chỉ trình bày/bố cục & trang trí. KHÔNG đụng cơ chế chơi hay logic.

## 1. Bối cảnh & vấn đề

Minigame "khoanh vùng mụn" (`SkinScanScreen.tsx`) hiện dùng một khung navy cố định rộng `330px` căn giữa cho cả `FindGame` lẫn `ReportStep`. Trên mobile khung này gọn và đẹp (đã được duyệt là ổn). Nhưng trên **desktop**, cùng một khung nhỏ nằm giữa một nền `bg-pastel-mint` rộng mênh mông tạo ra nhiều khoảng trống, đơn điệu, và gần như không tận dụng chiều ngang — tính responsive kém.

Mục tiêu là làm màn desktop **sinh động, năng động theo chất GenZ** (khớp brand Playful Pastel), lấp không gian một cách có chủ đích, trong khi **giữ nguyên trải nghiệm mobile** vốn đã tốt.

## 2. Mục tiêu & phạm vi

**Mục tiêu:**
- Desktop `FindGame`: bố cục **hai cột "cockpit"** — board tìm mụn bên trái, panel vui nhộn bên phải.
- Desktop `ReportStep`: bố cục **hai cột** — hình minh họa khuôn mặt có 4 vùng tô màu bên trái (củng cố face mapping), câu hỏi + 4 nút vùng (lưới 2×2) bên phải.
- **Progressive enhancement:** một component chung, lõi mobile-first; chỉ thêm cột phải + trang trí ở breakpoint `md:`. Mobile giữ đúng board/card gọn hiện tại, chỉ kế thừa nền pastel nhẹ.
- Nền pastel gradient + vài blob mờ dùng chung cho cả hai màn.

**Non-goals (KHÔNG làm):**
- Không đổi cơ chế chơi hay bất kỳ logic nào (spots, `findNearestUnfoundSpot`, gợi ý tăng dần, lưới an toàn, `resolveProfileByZone`, `onComplete`) — thuần layout/trang trí.
- Không thêm streak/timer/scoreboard (phương án "arcade" đã bị loại).
- Không thiết kế lại mobile — mobile chỉ kế thừa nền pastel; cấu trúc board/card giữ nguyên.
- Không đụng `AppFlow`, `PayoffView`, `ProgramsScreen`, `HeroScreen`.

## 3. FindGame — desktop

Bố cục hai cột trong một khung nền chung:

- **Nền:** full-screen, gradient pastel (`#FDE7F1 → #EDE9FF → #E4FBF1`) thay cho `bg-pastel-mint` phẳng; 2–3 blob tròn mờ (`filter: blur`, opacity ~0.5) đặt tuyệt đối ở góc để tạo chiều sâu.
- **Cột trái — board (giữ nguyên bản chất):** khung navy `#2D2640` chứa header (`SOI THỬ LÀN DA` + thanh tiến độ hồng–tím + bộ đếm `N/6`), ảnh mặt thật với các nốt (found = vòng hồng + tick, chưa found = chấm đỏ), và overlay gợi ý (glow/ring) — tất cả **không đổi**, chỉ bọc trong layout mới.
- **Cột phải — panel vui nhộn (`hidden md:flex`):** tiêu đề lớn playful ("Tìm hết các 'bạn nhỏ' đang trốn nhé! 👀"), một dòng hướng dẫn ngắn, hàng **chip đếm** ("N đã soi" + "còn M") dùng chính `foundCount`, và một **mascot SVG vẽ tay** neo ở dưới (thử nghiệm SVG thay cho emoji).

**Responsive:** container dùng grid, mobile 1 cột (chỉ board), desktop `md:` chuyển 2 cột (board + panel). Cột phải `hidden md:flex`. Tiêu đề playful chỉ ở cột phải; trên mobile thông điệp tương đương vẫn nằm ở header board nên không mất gì.

## 4. ReportStep — desktop

Bố cục hai cột đồng bộ với FindGame:

- **Nền:** cùng gradient pastel + blob như mục 3.
- **Cột trái — face map (`hidden md:block`, hoặc thu nhỏ trên mobile):** một SVG khuôn mặt line-art với **4 vùng được tô màu theo `ZONE_META`**: cằm/quai hàm (`#FF5C9E`), vùng chữ T (`#FFCD78`), hai má (`#7DD9C0`), và ghi chú "gần như không bị" (`#B39DFF`). Mục đích là để người dùng thấy trực quan vùng mình sắp chọn nằm ở đâu trên mặt — củng cố độ tin cậy face mapping.
- **Cột phải — card hỏi (navy, giữ style hiện tại):** tiêu đề "SOI XONG RỒI 🎉" + câu "Còn da của **bạn** thì hay 'nổi loạn' nhất ở đâu?" + 4 nút vùng. Trên desktop 4 nút xếp **lưới 2×2** (`md:grid-cols-2`); mobile xếp dọc như hiện tại. Mỗi nút giữ chấm màu `ZONE_META[zone].color` + nhãn `ZONE_LABELS[zone]`, click gọi `onPick(zone)` — **logic không đổi**.

**Responsive:** grid 1 cột trên mobile (ẩn face-map hoặc đưa lên trên dưới dạng thu nhỏ), 2 cột trên `md:`.

## 5. Trang trí dùng chung & accessibility

- Một helper trình bày nền (ví dụ `PlayfulBackdrop`) chứa gradient + các blob, dùng lại ở cả hai màn để DRY.
- **Blob trôi nhẹ (đã chốt):** các blob có animation trôi/scale chậm, biên độ nhỏ; **bắt buộc** có nhánh `@media (prefers-reduced-motion: reduce)` tắt animation — nhất quán với pattern đã có trong `globals.css` (`.payoff-stat-chip`, `.acne-hint-*`).
- Bảng màu: navy `#2D2640` (board/card), hồng `#FF5C9E` (nốt đã soi), vàng ấm `#FFCD78` (gợi ý), gradient hồng–tím (tiến độ), pastel gradient (nền).

## 6. Component & file bị ảnh hưởng

- `src/components/SkinScanScreen.tsx` — viết lại **phần trình bày** của `FindGame` và `ReportStep`: outer container → nền + grid responsive; thêm cột phải cho FindGame; thêm cột face-map cho ReportStep; đổi 4 nút vùng sang lưới 2×2 ở desktop. Thêm helper `PlayfulBackdrop` và `FaceMap` (SVG) trong cùng file. **Giữ nguyên toàn bộ hooks/handlers/logic** (`generateSpots`, timer gợi ý, `commit`, `handlePointer`, `resolveProfileByZone`, `onComplete`, `ZONE_META`, `ZONE_LABELS`).
  - Lưu ý kỹ thuật: layout hiện dùng inline style cố định (`frameStyle` width 330). Chuyển phần **bố cục ngoài** sang Tailwind responsive (arbitrary values như `bg-[#2D2640]` cho màu navy) để có breakpoint; giữ chi tiết bên trong board gần như cũ.
- `src/app/globals.css` — thêm keyframe blob trôi nhẹ + class blob + nhánh `prefers-reduced-motion` tắt animation.
- Không file nào khác.

## 7. Kiểm thử

- **Unit:** không thêm test mới; logic không đổi nên 18 test hiện có của `skinScanLogic` vẫn phải pass.
- **tsc:** `npx tsc --noEmit` sạch.
- **Thủ công qua preview:** kiểm ở cả desktop (`preview_resize` desktop) và mobile (`preview_resize` mobile) rằng — desktop FindGame hiện 2 cột (board + panel), desktop ReportStep hiện 2 cột (face-map + card), mobile cả hai về dạng gọn 1 cột như cũ; nốt/gợi ý/an toàn/tự khai vẫn chạy đúng; kiểm dark mode nếu áp dụng.

## 8. Quyết định đã chốt

1. **Blob chuyển động nhẹ** — có animation trôi/scale chậm biên độ nhỏ, kèm nhánh `prefers-reduced-motion` tắt.
2. **ReportStep trên mobile ẩn hẳn face-map** — giữ đúng trải nghiệm mobile hiện tại cho gọn.
3. **Mascot cột phải FindGame dùng SVG vẽ tay** — thử nghiệm SVG thay cho emoji.
