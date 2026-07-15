# Kiến trúc & cấu trúc thư mục

Kiến trúc đã chốt qua brainstorm (xem quá trình quyết định ở cuối file). Đây là nguồn sự thật cho
việc scaffold project — khi bắt đầu code, dựng đúng cấu trúc dưới đây, không tự ý đổi mà không cập
nhật lại file này.

## Công cụ nền

- **Framework:** NextJs (đã chốt ở [05-build-spec.md](05-build-spec.md)).
- **Styling:** Tailwind CSS — design token (màu, font-size, border-radius) lấy từ
  [06-visual-style.md](06-visual-style.md), định nghĩa trong `tailwind.config.mjs`.
- **Package manager:** npm.
- **Deploy:** Vercel hoặc Netlify (đã đề xuất ở [05-build-spec.md](05-build-spec.md)).

## Cấu trúc thư mục

```
LandingPage/
├── docs/                       (đã có)
├── public/
│   └── fonts/                  (nếu self-host Poppins/Inter thay vì Google Fonts CDN)
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro    (head, meta tag, load font, wrap toàn trang)
│   ├── pages/
│   │   └── index.astro         (trang duy nhất, ráp các section theo thứ tự 01-product-ux-spec.md)
│   ├── components/
│   │   ├── Hook/
│   │   │   └── Hook.astro              (tĩnh, không cần React)
│   │   ├── InteractiveCore/
│   │   │   ├── QuizFlow.tsx            (React island — quiz + payoff + conversion)
│   │   │   └── quizLogic.ts            (hàm thuần: map câu trả lời → kết quả, tách khỏi UI)
│   │   ├── Trust/
│   │   │   └── Trust.astro             (tĩnh)
│   │   └── ui/
│   │       └── (button/card dùng chung — chỉ tạo khi thực sự lặp lại ≥2 nơi, không tạo trước)
│   ├── content/
│   │   └── quiz.ts             (toàn bộ copy: câu hỏi, đáp án, mapping kết quả)
│   ├── lib/
│   │   └── trackEvent.ts       (placeholder function đo lường, theo mục 5 của 05-build-spec.md)
│   └── styles/
│       └── global.css          (Tailwind directives + CSS variables nếu cần override ngoài token)
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## Component: tĩnh (.astro) vs interactive (React island)

`Hook` và `Trust` là `.astro` thuần — hai section này tĩnh, không có state hay tương tác, dùng Astro
component giúp chúng không gửi JavaScript xuống client, đúng ràng buộc tải nhanh ở
[00-overview.md](00-overview.md). Chỉ `QuizFlow` là React island vì đó là phần duy nhất thực sự cần
interactivity/state.

## Quyết định: gộp Interactive core + Payoff + Conversion thành một island

`QuizFlow.tsx` quản lý cả 3 section — quiz (interactive core), kết quả cá nhân hoá (payoff), và form
thu thập thông tin (conversion) — trong cùng một component, tự chuyển đổi giữa 3 "bước" hiển thị qua
một biến state nội bộ (`step`), không re-render trang hay điều hướng URL.

**Why:** Ba section này bị ràng buộc state với nhau chặt — payoff phụ thuộc câu trả lời quiz,
conversion cần hiển thị gợi ý dựa trên kết quả đó — nên về bản chất là một luồng tương tác liên tục,
không phải 3 section độc lập. Phương án thay thế (3 island riêng + nanostore chia sẻ state) bị loại
vì thêm độ phức tạp không cần thiết cho MVP hiện tại; chỉ đáng cân nhắc lại nếu sau này có yêu cầu
khiến form cần tồn tại độc lập ngoài luồng quiz.

**Cách giảm rủi ro "file phình to":** logic tính toán thuần (map câu trả lời → kết quả) tách ra
`quizLogic.ts`, không nằm chung file với phần UI/render — `QuizFlow.tsx` chỉ chứa JSX và state
transition, dễ test độc lập phần logic mà không cần tách thêm component.

## Luồng dữ liệu

`index.astro` import và ráp `Hook`, `QuizFlow` (hydrate qua `client:load` hoặc `client:visible`),
`Trust` theo đúng thứ tự trang ở [01-product-ux-spec.md](01-product-ux-spec.md). `QuizFlow` đọc nội
dung câu hỏi từ `content/quiz.ts`, dùng `quizLogic.ts` để tính kết quả khi người dùng trả lời xong,
gọi `trackEvent()` (đặt ở `lib/trackEvent.ts`, hiện là placeholder) tại 4 mốc đo lường đã định nghĩa
ở [05-build-spec.md](05-build-spec.md): vào interactive core, hoàn thành quiz, xem payoff, submit
form.

## Quy ước khi mở rộng

- Component dùng chung (button, card) chỉ tách vào `components/ui/` khi đã lặp lại ở ít nhất 2 nơi —
  không tạo trước để tránh trừu tượng hoá thừa.
- Nội dung/copy luôn đọc từ `content/quiz.ts`, không hard-code chuỗi text trong `QuizFlow.tsx`.
- Design token luôn đọc từ `tailwind.config.mjs`, không hard-code giá trị màu/spacing trực tiếp
  trong class Tailwind (ví dụ tránh `bg-[#2D2640]` rải rác, dùng token đặt tên như `bg-cta`).
