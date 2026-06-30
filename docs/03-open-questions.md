# Quyết định còn mở

Các mục dưới đây chưa được chốt ở cấp business/owner. Agent thực thi phải tự đề xuất phương án kèm
lý do trong tài liệu này (bổ sung trực tiếp, không tạo file mới) trước khi khoá scope code, hoặc
dừng lại hỏi nếu mức độ ảnh hưởng đủ lớn để cần xác nhận.

## Tech stack

Chưa chốt. Khi đề xuất, cân nhắc các yếu tố sau theo đúng ràng buộc ở
[00-overview.md](00-overview.md):

- Tốc độ tải trang ban đầu trên mobile/mạng di động phải là tiêu chí ưu tiên cao nhất, cao hơn tiêu
  chí "dev quen tay".
- Cơ chế interactive đã chọn ở MVP (xem [02-interaction-catalog.md](02-interaction-catalog.md))
  không cần engine game nặng — không nên chọn stack chỉ vì hỗ trợ canvas game phức tạp nếu MVP không
  dùng tới.
- Cần khả năng deploy nhanh, không cần backend server riêng ở giai đoạn độc lập hiện tại.

## Tích hợp backend O2Skin

Giai đoạn hiện tại: không tích hợp. Khi tới giai đoạn cần tích hợp, tham khảo contract đã có sẵn ở
repo `o2-backend`:

- Route: `POST /marketing-tracking/website-form-submissions`
- DTO mẫu: `docs/marketing-website-form-submission-contract.md` trong repo `o2-backend`.
- Cơ chế interactive dạng phân loại nhu cầu (mục 4 trong interaction-catalog) có thể map trực tiếp
  vào field `tracking.demandGroupKey` nếu tích hợp xảy ra sau này.

Đây chỉ là ghi chú tham khảo cho tương lai, không phải yêu cầu triển khai ở giai đoạn này.

## Đo lường/analytics

Chưa chốt công cụ đo lường (TikTok Pixel, Google Analytics, hay custom event log). Cần xác nhận
trước khi launch thật, vì các tiêu chí thành công ở
[01-product-ux-spec.md](01-product-ux-spec.md) (thời gian ở lại, tỉ lệ hoàn thành tương tác, tỉ lệ
chuyển đổi) đều phụ thuộc vào việc có tracking event đúng vị trí.

## Nội dung/copy thật

Toàn bộ nội dung trong các file đặc tả này là khung hành vi, chưa có copy thật (câu hook, câu hỏi
quiz, nội dung phần thưởng). Cần input từ business/marketing trước khi điền nội dung cuối cùng vào
sản phẩm.
