# Handoff Prompt — Multi-Version Landing Page System

## Bối cảnh dự án

Đây là một Next.js 14 landing page cho phòng khám da liễu o2skin, nhắm vào nhóm người dùng
Gen Z tiếp cận qua TikTok. Trang dùng kiến trúc **interactive-first**: thay vì đọc text dài,
người dùng chơi một minigame soi da rồi nhận kết quả cá nhân hóa → xem gói dịch vụ → để lại
thông tin.

Tech stack: Next.js 14, TypeScript, Tailwind CSS, Vitest. Không có backend — đây là UI
product độc lập.

## Nhiệm vụ

Triển khai toàn bộ implementation plan trong file:

```
docs/superpowers/plans/2026-07-06-multi-version-landing.md
```

Plan gồm **17 tasks** tuần tự, mỗi task có đầy đủ: đường dẫn file cụ thể, code hoàn chỉnh,
lệnh test, lệnh commit. Không cần đoán — làm đúng theo plan.

## Tài liệu tham khảo

Trước khi bắt đầu, đọc các file sau để nắm đầy đủ context:

- `docs/00-overview.md` — bối cảnh sản phẩm, ràng buộc cứng (mobile-first, tải nhanh, không backend)
- `docs/01-product-ux-spec.md` — nguyên tắc thiết kế, cấu trúc luồng 5 bước
- `docs/superpowers/specs/2026-07-06-landing-version-system-design.md` — design spec đầy đủ:
  định nghĩa slot/variant/recipe/theme, hợp đồng dữ liệu từng slot, chiến lược migrate, 5 theme
  với CSS variables

## Cấu trúc repo hiện tại (những gì đã có)

```
src/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx               ← hiện trỏ vào AppFlow, sẽ được migrate
├─ components/
│  ├─ AppFlow.tsx             ← bộ xương cũ, sẽ bị xóa sau khi migrate xong
│  └─ minigame/              ← SkinGame + các phase (skincare minigame)
├─ content/                  ← quiz, programs, catalog — GIỮ NGUYÊN
└─ lib/
   └─ trackEvent.ts
```

Branch `master` chứa minigame Findgame cũ (`SkinScanScreen` + `MinigameCore/skinScanLogic`).
Task 9 trong plan hướng dẫn cách pull code đó từ master sang cấu trúc mới.

## Yêu cầu thực thi

**Quan trọng:** Thực thi plan **task by task**, không nhảy bước. Mỗi task phải:

1. Chạy `npx tsc --noEmit` sau khi tạo/sửa file để xác nhận không có lỗi TypeScript.
2. Chạy test bằng `npm test <file>` ở các task có test (Task 2, Task 11).
3. Commit sau mỗi task bằng đúng message ghi trong plan.
4. Kiểm tra trên dev server (`npm run dev`) ở Task 14, 15, 16 trước khi commit.

**Không được** nhảy từ Task 1 thẳng lên Task 16 — mỗi task phải có bản chạy được trước khi
đi tiếp. Đây là yêu cầu cứng từ migration strategy trong spec.

## Kết quả mong đợi khi hoàn thành

- `http://localhost:3000` — render landing dùng recipe `v02-skincare` (skincare minigame,
  blossom theme), luồng đầy đủ Hook → Minigame → Payoff → Programs → Conversion → Done.
- `http://localhost:3000/v/v01-baseline` — render landing dùng findgame minigame.
- `http://localhost:3000/v/v02-skincare` — render landing dùng skincare minigame.
- `http://localhost:3000/versions` — gallery liệt kê tất cả version, mỗi version có link.
- `src/components/AppFlow.tsx` đã bị xóa.
- `npm run build` thành công không có lỗi.
- Tất cả test pass: `npm test`.

## Lưu ý kỹ thuật quan trọng

1. **MinigameResult type** (định nghĩa ở Task 1, `src/landing/slots.ts`) gộp `SkinCondition`
   và `PayoffStatsData` vào một object duy nhất. Khi wrap `SkinGame` hoặc `SkinScanScreen`,
   phải adapt signature từ `(condition, stats)` sang `MinigameResult`.

2. **gameShell.tsx** hiện dùng `dark:hidden`/`hidden dark:block` để swap blob màu theo OS
   dark mode. Task 10 yêu cầu xóa cơ chế này và thay bằng CSS variables `var(--lp-blob-*)`.
   Không bỏ qua bước này — nếu bỏ qua, `theme-midnight` sẽ không hoạt động đúng.

3. **tailwind.config.mjs** phải được sửa ở Task 3 để `cta: 'var(--lp-primary, #2D2640)'`.
   Đây là điều kiện để tất cả class `text-cta`, `bg-cta`, `border-cta` trong các variant tự
   đổi màu theo theme.

4. **Màu dữ liệu** (màu của condition/program trong `src/content/catalog.ts`) **không được**
   thay bằng CSS variables — chúng là màu nhận diện nội dung, không phải màu theme UI.

5. **Test runner** là Vitest: `npm test <path>` hoặc `npx vitest run <path>`.

6. Khi hoàn thành 17 tasks, để thêm version mới chỉ cần tạo một file recipe mới trong
   `src/landing/recipes/` và (nếu cần bố cục mới) thêm một variant file. Không copy trang,
   không đụng vào `LandingFlow.tsx` hay `content/`.
