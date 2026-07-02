# Minigame Redesign Design — "Soi Da Tìm Bạn Nhỏ" (Hidden Object Skin Scan)

**Date:** 2026-07-02
**Scope:** Thay thế hoàn toàn quiz trắc nghiệm 6 câu hiện tại (`InteractiveCore/quizLogic.ts` + `content/quiz.ts`) bằng một minigame tương tác dạng "hidden object" duy nhất. Không port lại UI quiz cũ sang Next.js — migration (xem `2026-07-02-nextjs-migration-design.md`) sẽ implement thẳng thiết kế này.

---

## 1. Bối cảnh & lý do

Leader/nhóm đánh giá quiz "Câu X/6" hiện tại quá thô sơ, tạo cảm giác làm bài kiểm tra, chưa đủ sức thuyết phục/giữ chân Gen Z. Ba hướng thay thế được tham khảo (từ gợi ý Gemini): Swipe card match, Drag & Drop mixing, X-Ray skin scan.

Đối chiếu với research gốc trong `docs/02-interaction-catalog.md`: Swipe card đã được cataloged là effort thấp nhất trong 5 cơ chế; Drag-and-drop từng bị loại khỏi MVP vì effort/rủi ro kỹ thuật cao nhất, đặc biệt xung đột cử chỉ cuộn trên mobile; X-Ray là ý tưởng hoàn toàn mới, ban đầu bị đánh giá là effort cao nhất do cần asset ảnh da/khuôn mặt thật theo từng vùng.

Sau khi tham khảo thêm phong cách nhân vật từ một game blockchain (dribbble.com/shots/24670641-Blockchain-Game), hướng X-Ray được tinh chỉnh lại: dùng nền da cách điệu làm cảnh quan, và các nhân vật mascot hoạt hình đại diện cho từng vấn đề da (mụn, lỗ chân lông, mẩn đỏ...) thay cho ảnh da/khuôn mặt y tế thật. Điều này giải quyết luôn rủi ro chi phí asset đã lo ngại ban đầu, đồng thời hợp với tông Playful Pastel đã chốt trong `docs/06-visual-style.md`.

## 2. Cơ chế chơi

Một màn hình interactive duy nhất thay thế toàn bộ chuỗi 6 câu hỏi, đặt ngay sau Hero, trước PayoffView. Nền là một mặt da cách điệu, bên trên có 8 nhân vật ẩn thuộc 4 loại (xem mục 3).

Người chơi chạm và kéo một kính lúp khắp màn hình để dò tìm. Cơ chế điều khiển kết hợp ba lớp:
- **Kéo liên tục** là thao tác chính — kính lúp di chuyển theo ngón tay, tạo cảm giác "quét" mượt.
- **Nam châm snap** — khi kính lúp vào bán kính bắt rộng hơn kích thước thật của một nhân vật ẩn, hệ thống tự hút nhẹ để đảm bảo dễ trúng trên màn hình nhỏ.
- **Chạm để teleport** — chạm thẳng vào một điểm bất kỳ khiến kính lúp chuyển ngay tới đó, dành cho người dùng ngại thao tác kéo nhiều.

Có thanh tiến trình dạng "x/8 đã tìm thấy". Lượt chơi kết thúc khi tìm đủ 8/8 nhân vật, không giới hạn thời gian — giữ đúng tinh thần friction thấp. Không hiển thị breakdown điểm theo từng loại trong lúc chơi, để giữ yếu tố bất ngờ cho màn payoff phía sau.

## 3. Thiết kế nhân vật (mascot)

Phong cách blob 2 phần theo art direction đã duyệt: đầu dạng khiên tách biệt khỏi thân, hai "tai" cong vểnh lên đỉnh đầu (hình dạng/màu khác nhau theo loại), dấu giọt nước cam nhỏ trên trán và bụng, mắt đen hạt huyền có chấm sáng nhỏ, thân dạng viên nang không tay, hai chân nhỏ, bóng đổ mờ dưới chân, viền dày màu `cta` (`#2D2640`) xuyên suốt. Tham khảo trực tiếp: dribbble.com/shots/24670641-Blockchain-Game (do user cung cấp).

Bản phác thấp-fidelity (CSS mockup, `mascot-style-v3.html` trong phiên brainstorm — không commit vào git, chỉ lưu local) đã được duyệt làm hướng art direction. Artwork thật cần thiết kế viên vẽ lại bằng công cụ chuyên dụng; đây chỉ là spec hướng dẫn phong cách, không phải asset cuối.

| Loại nhân vật | Màu chủ đạo | Đặc điểm nhận diện | Ánh xạ profile kết quả |
|---|---|---|---|
| Mụn Viêm | Đỏ hồng `#FF8177` | Tai hình ngọn lửa | `da-nhon-mun-viem` (gộp chung `mun-noi-tiet` cũ — không còn phân biệt được bằng quan sát trực quan) |
| Đầu Đen / Lỗ Chân Lông | Nâu xám `#B0A99F` | Tai nhỏ thẳng, đốm đen rải rác trên thân | `lo-chan-long` |
| Mẩn Đỏ / Kích Ứng | Hồng nhạt `#FFD3E0` | Tai cánh tròn, mảng ửng hồng phẳng trên thân | `da-nhay-cam` (định nghĩa lại: từ tiêu chí hành vi "dùng sản phẩm → căng rát" sang dấu hiệu quan sát được trực tiếp) |
| Da Sáng Khoẻ (hiếm) | Mint `#A8E6CF` | Tai lấp lánh, hiệu ứng phát sáng nhẹ | `clean-skin` |
| — (hoà / không rõ) | — | — | `da-moi-bat-dau` (fallback, giữ nguyên từ thiết kế gốc) |

## 4. Logic tạo bàn chơi & tính kết quả

Đã xác nhận với user: kết quả không cần phản ánh input thật của người chơi (không còn dữ liệu hành vi/nhân khẩu học để dựa vào sau khi bỏ hẳn quiz Q&A) — số lượng từng loại nhân vật trên bàn chơi được random có kiểm soát ngay khi bắt đầu ván, tương tự rút thăm được sắp đặt trước.

Phân bố 8 nhân vật mỗi ván: chọn ngẫu nhiên 1 loại "chiếm ưu thế" (3 nhân vật), hai loại còn lại nhận 2 nhân vật/loại, loại cuối cùng nhận 1 nhân vật. Trọng số chọn loại chiếm ưu thế: Da Sáng Khoẻ khoảng 15-20%, ba loại vấn đề da còn lại chia đều phần trọng số còn lại (~27% mỗi loại) — giữ đúng cảm giác "hiếm, đặc biệt" đã thiết lập từ khâu thiết kế nhân vật. Khoảng 10% lượt chơi dùng phân bố đều 2-2-2-2 giữa 4 loại (hoà), khi đó trả về kết quả fallback `da-moi-bat-dau`.

Vị trí đặt nhân vật trên bàn chơi ngẫu nhiên thuần túy, không mang ý nghĩa theo vùng mặt/vùng da — khác với ý tưởng X-Ray gốc, không cần logic phân vùng.

## 5. Thay đổi code

`src/components/InteractiveCore/quizLogic.ts` và `src/content/quiz.ts` được thay bằng module mới, đề xuất đặt tại `src/components/MinigameCore/skinScanLogic.ts`, gồm hai hàm chính: `generateBoard()` tạo phân bố 8 nhân vật theo trọng số ở mục 4 và trả về vị trí ngẫu nhiên trên canvas; `computeResultFromBoard(foundCounts)` nhận số đếm mỗi loại đã tìm được và trả về profile ID, tái sử dụng đúng 5 profile ID đã có sẵn trong `quizResults` (không đổi nội dung/văn phong PayoffView).

`AppFlow.tsx` thay phần render quiz 6 câu bằng một component minigame mới (ví dụ `SkinScanScreen`), giữ nguyên toàn bộ phần phía sau: PayoffView, ProgramsScreen, ConversionForm, DoneScreen. Bộ test Vitest cho `computeResult` cũ được thay bằng bộ test tương ứng cho `computeResultFromBoard`.

## 6. Ngoài phạm vi

- Artwork nhân vật hoàn chỉnh — cần thiết kế viên thực hiện bằng công cụ vẽ chuyên dụng, bản phác trong spec này chỉ là art direction.
- Animation chi tiết lúc kính lúp lộ nhân vật (easing, hiệu ứng particle khi tìm thấy...) — quyết định ở bước viết plan/code cụ thể.
- Bất kỳ thay đổi nào với PayoffView, ProgramsScreen, ConversionForm — giữ nguyên như hiện tại.
