# Build Spec — bản tổng hợp thực thi (execution-ready)

File này tổng hợp lại nội dung cốt lõi từ `00` đến `04` thành một bản duy nhất, để agent thực thi
đọc một lần là đủ context bắt tay vào code. Khi cần đào sâu lý do đằng sau một quyết định, tham
chiếu ngược lại file gốc tương ứng — file này không thay thế các file kia, chỉ rút gọn để thực thi
nhanh hơn.

## 1. Bối cảnh (chi tiết: [00-overview.md](00-overview.md))

Landing page độc lập nhắm tới Gen Z đến từ TikTok, mục tiêu giảm friction bằng tương tác thay vì
text dài. Ràng buộc cứng: mobile-first (portrait), tải trang ban đầu phải nhanh, không bắt đọc text
dài trước khi chạm được phần tương tác đầu tiên, **chưa** tích hợp backend O2Skin ở giai đoạn này.

## 2. Cấu trúc trang (chi tiết: [01-product-ux-spec.md](01-product-ux-spec.md))

Dòng chảy một chiều, scroll xuống là đi tới bước tiếp theo, giống nhịp xem TikTok feed:

1. **Hook** — hiện trong dưới 1 giây, câu hook ngắn dưới 10 từ hoặc animation gây tò mò, không có
   nút "Tìm hiểu thêm", chỉ gợi ý vuốt/chạm.
2. **Interactive core** — quiz cá nhân hoá (xem mục 3 bên dưới), đặt ngay sau hook.
3. **Payoff/reveal** — kết quả cá nhân hoá tức thì ngay sau khi hoàn thành quiz.
4. **Conversion** — form ngắn nhất có thể (tên + số điện thoại), đặt ngay sau payoff lúc người dùng
   còn hứng thú. CTA dẫn thẳng tới layer tương tác, **không bao giờ** dẫn thẳng tới form nhiều bước
   (lý do đầy đủ: [04-friction-research-and-examples.md](04-friction-research-and-examples.md)).
5. **Trust/social proof** (tuỳ chọn, cuối trang) — review ngắn/UGC.

Mỗi thao tác trong lúc tương tác phải có phản hồi hình ảnh dưới 100ms cảm nhận được. Không popup
chặn đường (exit-intent) khi người dùng rời trang giữa chừng.

## 3. Cơ chế interactive MVP (chi tiết: [02-interaction-catalog.md](02-interaction-catalog.md))

Đã chốt: **quiz cá nhân hoá ngắn (3-5 câu, lựa chọn dạng hình ảnh/icon)** làm cơ chế chính, kết hợp
**progress mechanic** (thanh tiến trình theo scroll/theo câu hỏi) làm lớp bổ trợ. Không triển khai
swipe-card, scratch minigame, hay drag-and-drop ở bản đầu — effort/rủi ro không tương xứng giá trị
giữ chân so với quiz.

## 4. Đề xuất tech stack (mới — thay thế phần "chưa chốt" ở [03-open-questions.md](03-open-questions.md))

**Đề xuất: NextJs làm framework chính.

## 5. Đo lường (chi tiết: [03-open-questions.md](03-open-questions.md) mục Đo lường)

Chưa chốt công cụ cụ thể (TikTok Pixel/GA/custom log) — đặt sẵn các event hook tại 4 mốc: vào
interactive core, hoàn thành quiz, xem payoff, submit form. Việc chọn công cụ đo lường cụ thể cần
xác nhận trước khi launch thật, không chặn việc code các event hook.

## 6. Nội dung/copy thật

Chưa có — toàn bộ copy (câu hook, câu hỏi quiz, nội dung payoff) hiện là placeholder trong spec.
Cần input từ business/marketing trước khi điền nội dung cuối cùng. Khi code, để các chuỗi text này
ở một chỗ tập trung (constants/content file), không hard-code rải rác trong component, để thay copy
thật sau này không cần sửa logic.

## 7. Checklist thực thi theo thứ tự ưu tiên

1. Khởi tạo project Nextjs.
2. Dựng layout cấu trúc trang theo mục 2 (5 section, scroll dọc), dùng placeholder content.
3. Build component quiz cá nhân hoá (React island) — 3-5 câu, lựa chọn icon/hình ảnh, logic mapping
   câu trả lời sang kết quả payoff.
4. Build progress mechanic (React island hoặc lightweight script) theo dõi scroll/quiz progress.
5. Build payoff section hiển thị kết quả cá nhân hoá tức thì sau quiz.
6. Build conversion form (tên + số điện thoại), validate tối thiểu, chưa nối backend thật (log
   submit ra console/local storage tạm hoặc một endpoint giả ở giai đoạn này).
7. Thêm trust/social proof section (tuỳ chọn, có thể làm sau cùng).
8. Gắn event hook tại 4 mốc đo lường (mục 5), chưa cần chọn công cụ cụ thể — để placeholder function
   `trackEvent(name, payload)` agent có thể nối công cụ thật sau.
9. Kiểm tra hiệu năng tải trên mô phỏng mobile/mạng chậm (Lighthouse mobile, throttled 3G) trước khi
   coi là xong — đây là tiêu chí chấp nhận quan trọng nhất theo ràng buộc cứng ở mục 1.
