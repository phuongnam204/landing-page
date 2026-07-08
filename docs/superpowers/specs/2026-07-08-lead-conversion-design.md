# Thiết kế: Nhận lead thật cho form conversion

- Ngày: 2026-07-08
- Trạng thái: đã duyệt (brainstorming), chờ lập kế hoạch triển khai
- Nhánh: `fix/landing-ux-review`
- Áp dụng cho: tất cả phiên bản landing (v01, v02, v03 — đều dùng variant `short-form`)

## 1. Bối cảnh và mục tiêu

Form conversion hiện thu tên + SĐT nhưng không gửi dữ liệu đi đâu — `onSubmit` chỉ gọi
`console.log` rồi chuyển bước. Màn done hứa "liên hệ trong 24 giờ" nhưng không ai nhận được
thông tin để mà gọi lại.

Mục tiêu: làm cho lead thật sự chảy vào tay o2skin, đồng bộ với form production của o2skin
(4 trường: Tên, SĐT, Tình trạng da, Chi nhánh), và bổ sung validate + UX states đúng chuẩn.

## 2. Trường dữ liệu — align với form production o2skin

| Trường | Kiểu | Ghi chú |
|---|---|---|
| `name` | text, required | Họ và tên |
| `phone` | tel, required | 10 số, bắt đầu bằng 0 hoặc +84 |
| `skinCondition` | readonly / display | Pre-fill từ `minigameResult.condition.label`; hiển thị readonly với chú thích nhỏ "dựa trên kết quả kiểm tra của bạn" |
| `branch` | select, required | Dropdown 5 chi nhánh thật (xem phần 5) |

Ngoài ra, các trường metadata được gửi kèm lên server nhưng **không hiển thị trên form**:
`programId` (từ `selectedProgramId`), `recipeId` (từ recipe đang chạy), `timestamp`.

## 3. Kiến trúc end-to-end

```
[short-form.tsx]
  → POST /api/lead   (Next.js route, server-side)
    → LEAD_WEBHOOK_URL (Google Apps Script Web App)
      → Google Sheet (append row)
```

### 3.1 Thay đổi slot contract

`ConversionSlotProps` (trong `src/landing/slots.ts`) thêm một trường:

```ts
export type ConversionSlotProps = {
  selectedProgramId: ProgramId | null;
  minigameResult: MinigameResult | null;   // mới — để pre-fill skinCondition
  onSubmit: (name: string, phone: string) => void;
};
```

`LandingFlow.tsx` cập nhật dòng render `<Conversion>` để truyền
`minigameResult={minigameResult}` (state này đã có sẵn ở dòng 15).

### 3.2 Variant `short-form.tsx` — nâng cấp

Giữ nguyên giao diện tổng thể, bổ sung:

- Trường **Chi nhánh**: `<select>` với 5 option từ danh sách chi nhánh (value = `code`, label = tên).
  Cần có option placeholder "Chọn chi nhánh gần bạn" với value rỗng (disabled).
- Trường **Tình trạng da**: hiển thị dưới dạng `<div>` readonly (không phải input), text lấy từ
  `minigameResult?.condition.label`. Nếu `minigameResult` là null (người dùng skip minigame),
  ẩn trường này hoàn toàn — không bắt buộc.
- **Validate phone**: regex `/(^0[0-9]{9}$)|(^\+84[0-9]{9}$)/` trước khi submit. Hiện thông báo
  lỗi inline dưới ô input nếu sai, không dùng `alert()`.
- **UX states**: ba trạng thái — `idle`, `pending` (nút disabled + text "Đang gửi..."),
  `error` (giữ nguyên form, hiện thông báo lỗi phía dưới nút).
  Không có state `success` riêng — lúc API trả 200 thì gọi `onSubmit(name, phone)` để
  LandingFlow chuyển bước.
- **Chặn double-submit**: nút bị disabled trong lúc `pending`.
- **Dòng consent** phía dưới nút: "Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn."
  Font nhỏ, màu `text-cta/50`.
- Không dùng emoji. Không thêm label HTML `<label>` riêng (giữ pattern placeholder của bản gốc).

Luồng submit trong component:
1. Validate local (phone regex, branch không rỗng).
2. Nếu pass → set `pending`, gọi `fetch('/api/lead', { method: 'POST', body: JSON.stringify(payload) })`.
3. Nếu response ok → gọi `onSubmit(name, phone)`.
4. Nếu response lỗi hoặc network fail → set `error`, hiện thông báo.

### 3.3 API route `src/app/api/lead/route.ts`

Next.js Route Handler (App Router), method POST:

```
Nhận: { name, phone, branch, skinCondition?, programId?, recipeId? }
Validate server-side:
  - name: trim, độ dài 1–100
  - phone: regex VN
  - branch: nằm trong danh sách code hợp lệ
Nếu invalid → 400 { error: "..." }
Nếu LEAD_WEBHOOK_URL chưa set → 503 { error: "webhook not configured" }
Forward sang LEAD_WEBHOOK_URL bằng fetch POST JSON
Nếu webhook lỗi → 502 { error: "upstream error" }
Nếu thành công → 200 { ok: true }
```

Không log `name`, `phone` ra console (tránh PII trong log).
`trackEvent('form_submit', { program: selectedProgramId })` chỉ log `programId`, không log PII —
cập nhật call này trong `LandingFlow.tsx`.

### 3.4 Biến môi trường

File `.env.local` (tạo mới, không commit):
```
LEAD_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
```

File `.env.local.example` (commit vào repo):
```
LEAD_WEBHOOK_URL=
```

`.gitignore` đã có entry cho `.env*.local` trong Next.js mặc định — không cần thêm.

### 3.5 Google Apps Script (triển khai ngoài repo)

Web App nhận POST JSON, `appendRow` vào Sheet với các cột theo thứ tự:

```
Thời gian | Tên | SĐT | Tình trạng da | Chi nhánh | Chương trình (programId) | Version (recipeId)
```

Script cần đặt quyền "Anyone" để không cần xác thực từ server landing.
CORS: Apps Script tự xử lý POST từ fetch server-side (không có CORS issue vì gọi từ Next.js
server, không phải browser).

## 4. Danh sách chi nhánh (từ DB o2skin, `2_seed_category.ts`)

Lưu trong `src/content/branches.ts`:

```ts
export type Branch = { code: string; name: string; address: string };

export const branches: Branch[] = [
  { code: 'o2skin.quan3',     name: 'Chi nhánh Quận 3',     address: '292/15 Đường CMT8, P.10, Q.3, TP.HCM' },
  { code: 'o2skin.thuduc',    name: 'Chi nhánh Thủ Đức',    address: '13A-13B Thống Nhất, P.Bình Thọ, Tp.Thủ Đức' },
  { code: 'o2skin.cantho',    name: 'Chi nhánh Cần Thơ',    address: 'MG1-12 Vincom Shophouse Xuân Khánh, Q.Ninh Kiều' },
  { code: 'o2skin.binhthanh', name: 'Chi nhánh Bình Thạnh', address: '02 Võ Oanh, P.25, Q.Bình Thạnh, TP.HCM' },
  { code: 'o2skin.govap',     name: 'Chi nhánh Gò Vấp',     address: '36 đường số 8, Cityland Park Hills, P.10, Q.Gò Vấp' },
];
```

Chi nhánh "Online" trong DB bị loại trừ — không phù hợp với context đặt lịch phòng khám.

## 5. Kiểm thử và xác minh

- Submit form với tên + SĐT hợp lệ + chi nhánh → row xuất hiện trong Sheet.
- Submit với SĐT sai định dạng → thông báo lỗi inline, form không gửi đi.
- Submit khi `LEAD_WEBHOOK_URL` chưa set → hiện lỗi "không thể gửi thông tin, thử lại".
- Submit hai lần nhanh → chỉ một row trong Sheet (double-submit bị chặn).
- Trường tình trạng da không hiển thị khi `minigameResult` là null.

## 6. Ngoài phạm vi (YAGNI)

- Không tích hợp thẳng vào lead-service nội bộ o2skin (dành cho giai đoạn sau khi đã validate lead quality qua Sheet).
- Không thêm rate-limiting server-side (chấp nhận trong giai đoạn thử nghiệm).
- Không thêm reCAPTCHA hay CSRF token.
- Không thay đổi bất kỳ slot hay variant nào ngoài conversion + slot contract.
- Không đụng các bước hook/minigame/payoff/programs.
