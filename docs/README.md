# Tài liệu đặc tả — Interactive Landing Page (GenZ / TikTok traffic)

Thư mục này là nguồn đặc tả cho agent thực thi việc xây dựng repo landing page.
Đọc theo thứ tự sau trước khi bắt đầu code.

1. [00-overview.md](00-overview.md) — bối cảnh, mục tiêu, đối tượng người dùng, ràng buộc cứng.
2. [01-product-ux-spec.md](01-product-ux-spec.md) — đặc tả sản phẩm/UX: cấu trúc trang, nguyên tắc
   giảm friction, hành vi từng section.
3. [02-interaction-catalog.md](02-interaction-catalog.md) — danh mục cơ chế interactive/minigame có
   thể chọn, kèm mức độ effort và lý do phù hợp/không phù hợp.
4. [03-open-questions.md](03-open-questions.md) — các quyết định còn mở (tích hợp backend, đo lường)
   mà agent phải tự đề xuất hoặc hỏi lại trước khi khoá scope.
5. [04-friction-research-and-examples.md](04-friction-research-and-examples.md) — research thực tế
   từ các landing page đối chứng, lý do đằng sau các nguyên tắc giảm friction.
6. [05-build-spec.md](05-build-spec.md) — bản tổng hợp execution-ready: tech stack đã đề xuất
   (Astro + React islands), checklist build theo thứ tự ưu tiên.
7. [06-visual-style.md](06-visual-style.md) — visual style guide đã chốt: Playful Pastel, CTA navy
   đậm, Soft Rounded, Modern Geometric Sans (Poppins/Inter).
8. [07-architecture.md](07-architecture.md) — kiến trúc & cấu trúc thư mục đã chốt: Tailwind CSS,
   component tĩnh (.astro) vs island (React), QuizFlow gộp interactive core + payoff + conversion.

## Trạng thái dự án

Giai đoạn hiện tại: landing page độc lập, **chưa** kết nối backend O2Skin. Tech stack **đã đề xuất**
ở [05-build-spec.md](05-build-spec.md) (Astro + React islands, deploy Vercel/Netlify). Visual style
**đã chốt** — xem [06-visual-style.md](06-visual-style.md). Kiến trúc/cấu trúc thư mục **đã chốt** —
xem [07-architecture.md](07-architecture.md).
