# Landing Page — Interactive Quiz (GenZ / TikTok traffic)

Landing page độc lập, tối ưu mobile, dùng quiz cá nhân hoá thay cho nội dung text dài để giảm
friction. Xem đặc tả đầy đủ ở [docs/](docs/README.md).

## Tech stack

Astro + React island (chỉ phần quiz tương tác) + Tailwind CSS. Lý do chọn: xem
[docs/05-build-spec.md](docs/05-build-spec.md) mục 4.

## Commands

| Command           | Action                                       |
| :----------------- | :-------------------------------------------- |
| `npm install`       | Cài dependencies                              |
| `npm run dev`       | Chạy dev server tại `localhost:4321`          |
| `npm run build`     | Build production vào `./dist/`                |
| `npm run preview`   | Preview bản build trước khi deploy            |
| `npm test`          | Chạy test (`quizLogic.ts`)                    |
| `npx astro check`   | Type-check                                    |

## Cấu trúc

Xem [docs/07-architecture.md](docs/07-architecture.md) cho chi tiết cấu trúc thư mục và lý do
kiến trúc (gộp quiz + payoff + conversion thành một React island).

## Trạng thái

MVP đã hoàn thành theo [docs/superpowers/plans/2026-06-30-landing-page-mvp.md](docs/superpowers/plans/2026-06-30-landing-page-mvp.md).
Nội dung/copy hiện là placeholder — chưa nối backend O2Skin (xem
[docs/03-open-questions.md](docs/03-open-questions.md)).
