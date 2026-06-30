# Danh mục cơ chế interactive/minigame

Mỗi cơ chế dưới đây được mô tả theo: cách hoạt động, lý do phù hợp với mục tiêu chuyển đổi, và mức
effort triển khai ước lượng. Agent thực thi chọn 1-2 cơ chế cho bản đầu, không triển khai toàn bộ
danh mục cùng lúc — chọn nhiều cơ chế cùng lúc làm tăng độ phức tạp và kéo dài thời gian tải trang,
đi ngược lại ràng buộc cứng ở [00-overview.md](00-overview.md).

## 1. Swipe-to-reveal / Card stack

Người dùng vuốt qua một chuỗi thẻ (giống TikTok feed hoặc Tinder), mỗi thẻ hé lộ một phần thông tin
sản phẩm hoặc một câu hỏi cá nhân hoá (ví dụ: "Bạn quan tâm điều gì nhất: A/B/C"). Thẻ cuối cùng dẫn
tới payoff section.

- Phù hợp vì: đúng nhịp thao tác Gen Z đã quen (vuốt), không cần đọc nhiều, mỗi thẻ là một micro-
  quyết định.
- Effort: thấp — chủ yếu là animation transition, không cần logic game phức tạp.
- Rủi ro: nếu nội dung từng thẻ vẫn quá nhiều chữ thì friction không giảm, chỉ đổi hình thức.

## 2. Quiz cá nhân hoá ngắn (3-5 câu)

Chuỗi câu hỏi trắc nghiệm cực ngắn, mỗi câu chỉ có 2-3 lựa chọn dạng hình ảnh/icon thay vì text dài.
Kết thúc quiz, hệ thống trả về một kết quả/gợi ý cá nhân hoá làm payoff.

- Phù hợp vì: tạo cảm giác "trang này hiểu mình", payoff cá nhân hoá là động lực mạnh để submit form
  ngay sau đó (xin kết quả chi tiết qua số điện thoại).
- Effort: trung bình — cần logic mapping câu trả lời sang kết quả, nhưng không cần engine game.
- Rủi ro: nếu số câu hỏi quá 5 hoặc lựa chọn là text dài, sẽ biến lại thành form truyền thống.

## 3. Mini-game dạng tap/scratch (cào trúng thưởng, đập hộp quà)

Người dùng chạm/cào để "mở" một phần thưởng ảo (voucher, mã ưu đãi). Cơ chế ăn may (gamified reward)
rất quen thuộc và có tỉ lệ tương tác cao.

- Phù hợp vì: gắn trực tiếp với khuyến mãi, tạo động lực hành động tức thì nhờ yếu tố "thử vận may".
- Effort: trung bình — cần canvas/gesture handling (scratch effect) hoặc đơn giản hoá bằng animation
  giả lập tap-to-reveal nếu không muốn dùng canvas thật.
- Rủi ro: nếu phần thưởng không có giá trị thực hoặc không liên kết rõ với bước submit form tiếp
  theo, người dùng nhận thưởng xong sẽ rời trang.

## 4. Drag-and-drop matching (ghép vấn đề da với giải pháp)

Người dùng kéo-thả các item (ví dụ: loại vấn đề da) vào đúng nhóm giải pháp tương ứng. Phù hợp nếu
sản phẩm/dịch vụ có nhiều nhánh lựa chọn cần phân loại nhu cầu khách hàng (tương tự cách
o2skin.vn phân loại "trị mụn / trị thâm / trị sẹo" mà chúng ta đã thấy ở repo backend).

- Phù hợp vì: vừa là tương tác giải trí, vừa thực hiện chức năng phân loại nhu cầu (demand
  classification) ngay trên UI — dữ liệu này có thể dùng làm `tracking.demandGroupKey` nếu sau này
  landing page được nối với backend.
- Effort: cao hơn — cần xử lý gesture kéo-thả mượt trên mobile, dễ bug ở các thiết bị màn hình nhỏ.
- Rủi ro: kéo-thả trên mobile dễ bị conflict với cử chỉ scroll trang nếu không xử lý cẩn thận.

## 5. Progress/streak mechanic (tích điểm qua từng bước cuộn trang)

Một thanh tiến trình hoặc điểm số tăng dần khi người dùng cuộn qua từng section, tạo cảm giác "gần
hoàn thành" giống achievement trong game, khuyến khích cuộn hết trang thay vì thoát giữa chừng.

- Phù hợp vì: effort thấp, áp dụng được cho toàn bộ trang chứ không giới hạn một section, tận dụng
  tâm lý "không muốn bỏ dở".
- Effort: thấp — chỉ cần theo dõi scroll position và render progress bar.
- Rủi ro: hiệu ứng tâm lý yếu hơn các cơ chế chủ động (1-4), nên dùng như lớp bổ trợ chứ không phải
  cơ chế chính.

## Khuyến nghị chọn cho bản đầu (MVP)

Kết hợp một cơ chế chủ động (khuyến nghị: mục 2, quiz cá nhân hoá — effort vừa phải, payoff rõ ràng,
dẫn thẳng tới conversion) với một cơ chế bổ trợ nhẹ (mục 5, progress mechanic) để giữ nhịp toàn
trang. Không bắt đầu với mục 4 (drag-and-drop) ở MVP vì effort/rủi ro kỹ thuật cao nhất trong khi
giá trị giữ chân không vượt trội so với quiz.
