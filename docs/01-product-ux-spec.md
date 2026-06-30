# Đặc tả Product/UX

## Nguyên tắc thiết kế giảm friction

Friction ở đây hiểu là bất kỳ thứ gì khiến người dùng phải dừng lại suy nghĩ hoặc đọc trước khi
hành động tiếp. Mỗi section trên trang phải tự trả lời được câu hỏi: người dùng có thể hiểu và
tương tác với section này trong dưới 3 giây nhìn lướt qua hay không. Nếu câu trả lời là không, phải
rút gọn nội dung hoặc chuyển nó thành một tương tác trực quan thay vì đoạn text.

Quy tắc cụ thể:

- Mỗi section không quá một ý chính. Không nhồi nhiều thông điệp vào cùng một màn hình.
- Ưu tiên hình ảnh động, micro-interaction (chạm, vuốt, kéo thả) thay cho đoạn mô tả bằng chữ.
- Call-to-action phải luôn nhìn thấy được hoặc dễ dàng kéo tới mà không cần đọc lại context cũ.
- Tránh menu điều hướng phức tạp; landing page nên có cấu trúc dòng chảy một chiều (scroll xuống là
  đi tới bước tiếp theo), giống nhịp xem TikTok feed.
- CTA chính phải dẫn thẳng tới hành động hoặc tới layer tương tác (quiz/minigame ở interactive
  core), **không bao giờ** dẫn thẳng tới một form nhiều bước. CTA xuất hiện nhiều lần trên trang
  không tự động đồng nghĩa với friction thấp nếu đích đến cuối cùng vẫn là một form nhiều bước —
  xem ví dụ đối chứng và lý do đầy đủ ở [04-friction-research-and-examples.md](04-friction-research-and-examples.md).

## Cấu trúc trang đề xuất (dòng chảy theo chiều dọc)

1. **Hook section** — màn hình đầu tiên, xuất hiện trong dưới 1 giây, không loading nhìn thấy được.
   Một câu hook ngắn (dưới 10 từ) hoặc một animation/visual gây tò mò. Không có nút "Tìm hiểu thêm",
   chỉ có gợi ý vuốt/chạm để khám phá tiếp.
2. **Interactive core** — phần trung tâm, nơi đặt cơ chế interactive/minigame chính (xem
   [02-interaction-catalog.md](02-interaction-catalog.md)). Đây là phần giữ chân người dùng lâu
   nhất, nên đặt ngay sau hook, không chôn sâu phía dưới trang.
3. **Payoff/reveal section** — sau khi người dùng hoàn thành tương tác, trang phải trả lại một kết
   quả cá nhân hoá tức thì (ví dụ: kết quả minigame, một gợi ý dịch vụ phù hợp, một phần thưởng ảo).
   Đây là khoảnh khắc quyết định người dùng có đi tiếp hay rời trang.
4. **Conversion section** — form hoặc CTA thu thập thông tin, đặt ngay sau payoff trong khi người
   dùng còn đang ở trạng thái hứng thú. Form phải ngắn nhất có thể (tên + số điện thoại là đủ ở bản
   đầu); không hỏi thông tin không cần thiết.
5. **Trust/social proof section** (tuỳ chọn, đặt cuối) — review ngắn, số liệu, hoặc UGC từ TikTok
   nhúng trực tiếp. Đặt cuối vì đây là phần củng cố quyết định, không phải phần thuyết phục ban đầu.

## Hành vi kỳ vọng theo từng trạng thái người dùng

- Người dùng mới vào trang: phải thấy nội dung có ý nghĩa ngay lập tức, không có màn hình trắng hay
  splash loading kéo dài.
- Người dùng đang tương tác với minigame: mọi thao tác phải có phản hồi hình ảnh/âm thanh tức thì
  (dưới 100ms cảm nhận được phản hồi), kể cả khi xử lý logic thật phía sau chưa xong.
- Người dùng hoàn thành tương tác: phải nhận được kết quả ngay, không có bước chờ "đang xử lý" lộ
  liễu.
- Người dùng rời trang giữa chừng (trước khi tới conversion section): không có popup chặn đường ép ở
  lại — chặn đường (exit-intent popup kiểu cũ) là một dạng friction cao, không phù hợp với hành vi
  lướt nhanh của Gen Z.

## Tiêu chí thành công

- Thời gian trung bình người dùng ở lại trang trước khi rời hoặc submit.
- Tỉ lệ người dùng chạm vào phần interactive core (không chỉ load trang rồi thoát).
- Tỉ lệ hoàn thành tương tác (bắt đầu minigame → kết thúc minigame).
- Tỉ lệ chuyển đổi từ "hoàn thành tương tác" sang "submit form" — đây là tỉ lệ quan trọng nhất để
  đánh giá liệu cơ chế interactive có thực sự dẫn tới hành động hay chỉ giữ chân mà không chuyển đổi.
