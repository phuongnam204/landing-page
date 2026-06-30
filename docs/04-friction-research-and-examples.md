# Research: friction trong landing page — ví dụ thực tế và kết luận áp dụng

Tài liệu này ghi lại lý do đằng sau các nguyên tắc giảm friction ở
[01-product-ux-spec.md](01-product-ux-spec.md). Mục đích là để bất kỳ ai đọc sau này (người hoặc
agent) hiểu được *tại sao* nguyên tắc được chọn, không chỉ đọc nguyên tắc suông.

## Định nghĩa friction dùng trong dự án này

Friction là bất kỳ thứ gì khiến người dùng phải dừng lại suy nghĩ, đọc, hoặc nhập liệu trước khi đi
tới hành động chuyển đổi tiếp theo. Friction không phải lúc nào cũng xấu — nó cần được đánh giá theo
đúng đối tượng mục tiêu và động cơ ra quyết định của họ, không phải một con số tuyệt đối.

## Các ví dụ đã khảo sát và kết luận cho từng cái

### Landing page B2B dev-tool (GitKraken, Aikido.dev)

- **GitKraken**: friction thấp đến trung bình. Không có form, CTA "Start Your Free Trial" lặp lại
  nhiều lần và xuất hiện sớm. Nội dung chủ yếu bullet/logo/testimonial ngắn thay vì khối text dài.
- **Aikido.dev**: friction trung bình đến cao nếu tính toàn trang (8-9 section, ~3000-4000 từ ở
  phần thân, cộng thêm blog feed dài). Lớp hero ngoài cùng vẫn cho phép bấm CTA ngay, nhưng để hiểu
  sâu sản phẩm cần khoảng 5-10 phút duyệt qua từng section.
- **Kết luận rút ra**: friction cao ở đây không phải lỗi thiết kế. Đối tượng là lập trình
  viên/đội bảo mật doanh nghiệp — nhóm có hành vi đọc kỹ trước khi quyết định dùng công cụ kỹ thuật,
  vì độ tin cậy kỹ thuật quan trọng hơn cảm xúc tức thời. Không thể bê nguyên cấu trúc này sang
  landing page GenZ.

### Landing page quảng cáo nền tảng (Google Ads, TikTok Ads getstarted)

- **Google Ads (trang giới thiệu sản phẩm quảng cáo, vi)**: friction thấp. Không có form, CTA "Bắt
  đầu ngay" lặp lại 3 lần, trang thiết kế rõ ràng để người dùng "hành động nhanh sau khi thấy tiêu
  đề". Case study trình bày dạng carousel tương tác thay vì khối text tĩnh.
- **TikTok Ads getstarted (đăng ký tài khoản quảng cáo, vi)**: friction trung bình đến cao, dù
  bản thân là trang của TikTok. Có khoảng 15-20 đoạn text dài, và mọi CTA — dù lặp lại 5 lần — đều
  dẫn về cùng một form đăng ký 2 bước (`#formAnchor`). Đây là friction giả trang dưới vỏ bọc "CTA
  xuất hiện nhiều nơi": CTA dễ thấy không đồng nghĩa với hành động dễ hoàn thành.
- **Điểm bất ngờ đáng ghi lại**: trang TikTok Ads getstarted có friction cao hơn trang Google Ads,
  dù TikTok là nền tảng đại diện cho hành vi lướt nhanh. Lý do là đối tượng của trang này là nhà
  quảng cáo B2B cần đăng ký tài khoản xác thực, không phải người dùng cuối lướt giải trí — một lần
  nữa xác nhận friction phụ thuộc vào đối tượng/động cơ, không phải nền tảng nguồn traffic.

## Quy tắc rút ra cho dự án landing page GenZ này

1. Mức độ friction "đúng" phụ thuộc vào đối tượng và động cơ hành động, không phải một chuẩn chung
   cho mọi landing page. Vì đối tượng của dự án này là người dùng cuối Gen Z lướt TikTok với mục
   đích giải trí/tò mò — không phải nhà quảng cáo B2B đăng ký dịch vụ — landing page phải định hướng
   gần với mô hình Google Ads (CTA dẫn thẳng tới hành động hoặc tới layer tương tác) hơn là mô hình
   TikTok Ads getstarted (CTA dẫn vào form nhiều bước).
2. **CTA dễ thấy không đồng nghĩa với friction thấp.** Một CTA lặp lại nhiều lần nhưng luôn dẫn tới
   form nhiều bước vẫn là friction cao — đây là bài học trực tiếp từ trang TikTok Ads getstarted.
3. Nếu cần thu thập thông tin người dùng, nên giấu bước nhập liệu sau một lớp tương tác hấp dẫn
   (quiz cá nhân hoá, minigame — xem [02-interaction-catalog.md](02-interaction-catalog.md)) thay vì
   để lộ ngay một form đăng ký truyền thống ngay từ CTA đầu tiên.

## Quyết định áp dụng vào spec

Nguyên tắc số 2 và 3 ở trên đã được đưa thành quy tắc tường minh trong
[01-product-ux-spec.md](01-product-ux-spec.md), mục "Nguyên tắc thiết kế giảm friction": CTA chính
phải dẫn thẳng tới hành động hoặc tới layer tương tác, không bao giờ dẫn thẳng tới một form nhiều
bước.
