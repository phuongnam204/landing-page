# Next.js Migration Design — Bỏ Astro, chuyển sang Next.js (App Router)

**Date:** 2026-07-02
**Scope:** Đổi nền tảng chạy từ Astro + React island sang Next.js thuần. Không viết lại tính năng, không đổi UI/logic hiện có — trừ phần minigame quiz, đang được redesign song song (xem `2026-07-02-minigame-redesign-design.md`, sẽ tạo sau) và sẽ implement thẳng bằng bản mới trong Next.js thay vì port bản quiz cũ rồi bỏ đi.

---

## 1. Bối cảnh & lý do

Leader review tech stack và nhận xét dùng cả Astro lẫn React là thừa, vì trang tương tác chính (`AppFlow.tsx`, mount qua `<AppFlow client:load />` trong `index.astro`) đã chiếm 100% nội dung trang và hydrate ngay lập tức — nghĩa là lợi ích cốt lõi của Astro islands (chỉ hydrate phần cần, giữ phần còn lại tĩnh không JS) không được khai thác cho route này.

Qua thảo luận, đã xác nhận:
- Trang quiz/landing chính không cần SEO organic (100% traffic từ paid ads TikTok/Google).
- Có kế hoạch thêm vài trang tĩnh trong tương lai (blog, giới thiệu...) — nên vẫn cần khả năng static-render cho các trang đó.
- Pain point build pipeline hiện tại mới là cảm nhận chung, chưa đo lường cụ thể.

Ba hướng đã cân nhắc: (A) giữ Astro, chấp nhận quiz page là 1 island toàn trang; (B) tách Astro (trang tĩnh) và Vite+React SPA (quiz) thành 2 pipeline riêng; (C) bỏ Astro, dùng full React qua Next.js. **Đã chọn hướng C** — vì team có sẵn kinh nghiệm Next.js, và Next.js App Router (server components mặc định) vẫn giữ được phần lớn lợi ích static-render cho các trang tĩnh tương lai mà không cần vận hành 2 pipeline như hướng B.

---

## 2. Kiến trúc & cấu trúc thư mục

Next.js App Router thay thế hoàn toàn Astro:

| Astro (cũ) | Next.js (mới) | Ghi chú |
|---|---|---|
| `src/layouts/BaseLayout.astro` | `app/layout.tsx` | `<html>`, meta, font — dùng Next Metadata API |
| `src/pages/index.astro` | `app/page.tsx` | Server component, chỉ render `<AppFlow />` |
| `src/components/AppFlow.tsx` | giữ nguyên path, thêm `'use client'` ở đầu file | Bắt buộc vì dùng state/tương tác trình duyệt |
| `src/components/InteractiveCore/quizLogic.ts` | giữ nguyên | Logic thuần, không phụ thuộc framework |
| `src/content/quiz.ts` | giữ nguyên hoặc thay bằng nội dung minigame mới | Tuỳ kết quả spec minigame redesign |
| `src/lib/trackEvent.ts` | giữ nguyên | — |
| `src/styles/global.css` | `app/globals.css` | Import trong `layout.tsx` |

## 3. Font, Tailwind, global CSS

Font Be Vietnam Pro hiện load qua `<link>` Google Fonts thủ công trong `BaseLayout.astro` — chuyển sang `next/font/google`, giữ nguyên 3 weight 400/700/800, để Next tự tối ưu preload thay cho cách làm thủ công.

`tailwind.config.mjs` giữ nguyên toàn bộ token màu (`cta`, pastel pink/lavender/mint, `border-*`), `borderRadius.soft`, chỉ đổi `content` path từ `./src/**/*.{astro,html,js,jsx,ts,tsx}` sang bao gồm `./app/**/*.{js,jsx,ts,tsx}` và `./src/**/*.{js,jsx,ts,tsx}`.

## 4. Build, deploy, testing

- `package.json`: bỏ `astro`, `@astrojs/react`, `@astrojs/tailwind`, `@astrojs/check`; thêm `next`. Script `dev`/`build`/`start` đổi sang `next dev`/`next build`/`next start`.
- Không dùng `output: export` (static export) — giữ Next.js build mặc định để Next tự static-render trang không có dữ liệu động, đồng thời giữ khả năng dùng API routes cho tích hợp backend sau này.
- Deploy Vercel không đổi, đơn giản hơn vì Next.js là framework gốc của Vercel.
- Vitest cho `quizLogic.test.ts` giữ nguyên 100%, không phụ thuộc Astro hay Next.

## 5. Ngoài phạm vi

- Không build trang blog/giới thiệu ngay (chỉ đảm bảo `app/` sẵn sàng mở rộng).
- Không tích hợp backend thật.
- **Không port UI quiz cũ (dạng trắc nghiệm "Câu X/6") sang Next.js** — phần minigame đang được thiết kế lại (xem spec riêng), migration sẽ implement thẳng bản minigame mới trong kiến trúc Next.js này để tránh làm hai lần.
