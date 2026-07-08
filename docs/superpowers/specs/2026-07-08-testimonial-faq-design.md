# Thiết kế: Testimonial + Q&A — Compound Variant cho v04

- Ngày: 2026-07-08
- Trạng thái: đã duyệt (brainstorming), chờ lập kế hoạch triển khai
- Nhánh: `fix/landing-ux-review`

## 1. Bối cảnh và mục tiêu

Landing page hiện có 7 bước tuần tự: `hook → minigame → payoff → programs → conversion → socialProof → done`. Hai nhịp bị thiếu theo chuẩn lead-gen là **social proof trước CTA** (testimonial thật của khách hàng) và **Q&A giải nghi** (FAQ về liệu trình). Cả hai đặt đúng vị trí — trước thời điểm người dùng submit form — mới phát huy tác dụng thuyết phục tối đa.

Đồng thời, leader muốn **giảm số bước cảm nhận** từ 7 xuống 5 để rút ngắn thời gian page visiting, đặc biệt với traffic GenZ/TikTok có attention span ngắn.

Giải pháp: version v04 dùng **compound variant** — hai màn ghép đôi, mỗi màn scrollable — thay vì thêm bước riêng vào luồng.

## 2. Flow v04

```
hook → minigame → payoff → [programs + Q&A] → [conversion + testimonial] → done
```

Số bước cảm nhận: 5 (so với 7 ở v01/v02, 6 ở v03 khi socialProof bật).

## 3. Quyết định kiến trúc

**Compound variant** — mỗi "màn ghép" là một variant duy nhất của slot hiện có, tự render hai phần content trong một `h-screen overflow-y-auto` container. Không mở slot mới, không sửa `LandingFlow`, không sửa `slots.ts`, không sửa `validateRecipe`.

Lý do chọn hướng này so với hai hướng thay thế:
- *Slot `trust` mới*: đắt 4 điểm chạm và không giải được yêu cầu "cùng màn" vì socialProof trong LandingFlow vẫn nằm sau conversion.
- *LandingFlow compound step*: sửa shared infrastructure, rủi ro ảnh hưởng v01/v02/v03.

## 4. Thay đổi cần thực hiện

| File | Loại |
|------|------|
| `src/landing/variants/programs/grid-with-faq.tsx` | Mới |
| `src/landing/variants/conversion/short-form-with-testimonials.tsx` | Mới |
| `src/landing/registry.ts` | Thêm 2 import + 2 key |
| `src/landing/recipes/v04-combined.ts` | Mới |
| `src/landing/recipes/index.ts` | Thêm 1 dòng |

v01, v02, v03 không bị ảnh hưởng. `socialProof` không khai báo trong v04 — LandingFlow bỏ qua theo logic nhánh động hiện có (`nextAfterConversion` kiểm tra `recipe.slots.socialProof`).

## 5. Recipe v04

```ts
export const v04Combined: Recipe = {
  id: 'v04-combined',
  label: 'v04 — Programs+FAQ / Conversion+Testimonial',
  theme: 'ocean',
  slots: {
    hook:       'bold-single',
    minigame:   'face-map',
    payoff:     'confetti-card',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info',
  },
};
```

Minigame dùng `face-map` vì `condition.label` của face-map rõ ràng hơn để pre-fill trường tình trạng da trong form conversion.

## 6. Variant 1: `programs/grid-with-faq.tsx`

### 6.1 Props

`ProgramsSlotProps` nguyên xi: `{ suggestedProgramId: ProgramId; onContinue: (programId: ProgramId) => void }`. Hợp đồng slot không đổi.

### 6.2 Layout

Màn scrollable (`h-screen overflow-y-auto`):

1. **Phần programs** (trên fold):
   - Label section nhỏ: "Gợi ý liệu trình cho bạn"
   - Sub-component `ProgramCard`: badge "Phù hợp nhất", tên liệu trình, mô tả ngắn, tags loại mụn — lấy data từ `src/content/programs` theo `suggestedProgramId`
   - Variant này chỉ hiển thị **duy nhất liệu trình được gợi ý** (không liệt kê tất cả programs như `grid.tsx` hay `carousel.tsx`) — giữ màn tập trung, đúng nguyên tắc "1 thông điệp/màn"
   - Nút CTA "Đặt lịch với liệu trình này" → gọi `onContinue(suggestedProgramId)`

2. **Divider** giữa hai phần: `─── Câu hỏi thường gặp ───` + hint "↓ Kéo xuống để đọc"

3. **Phần Q&A** (dưới fold, optional scroll):
   - Sub-component `FaqAccordion`: quản lý `openIndex: number | null`, render danh sách `FaqItem`
   - Mỗi item: câu hỏi + chevron SVG inline (không emoji); click mở/đóng — chỉ 1 item mở cùng lúc
   - Transition: CSS `max-height` từ 0 đến giá trị đủ — không dùng animation lib

### 6.3 Nội dung Q&A (placeholder)

Thay bằng nội dung thật từ o2skin trước khi bật production:

| # | Câu hỏi |
|---|---------|
| 1 | IPL có thực sự hiệu quả với mụn viêm và thâm không? |
| 2 | IPL có đau không? |
| 3 | Cần bao nhiêu buổi để thấy rõ kết quả? |
| 4 | IPL có phù hợp với da nhạy cảm không? |
| 5 | Sau buổi trị có cần nghỉ dưỡng không? |

### 6.4 Đo lường

- `trackEvent('programs_faq_view')` khi component mount
- `trackEvent('faq_item_open', { index })` khi người dùng mở từng câu

### 6.5 Visual

Theo `src/landing/themes.css` — theme `ocean`. Dùng CSS vars (`--lp-bg-*`, `rounded-soft`, `text-cta`). Không dùng emoji. Không hardcode màu.

## 7. Variant 2: `conversion/short-form-with-testimonials.tsx`

### 7.1 Props

`ConversionSlotProps` nguyên xi: `{ selectedProgramId: ProgramId | null; minigameResult: MinigameResult | null; onSubmit: (name: string, phone: string) => void }`. (Trường `minigameResult` đã có từ spec lead-conversion trước.)

### 7.2 Layout

Màn scrollable (`h-screen overflow-y-auto`):

1. **Phần conversion** (trên fold):
   - Label section nhỏ: "Đặt lịch tư vấn miễn phí"
   - Form: tên, SĐT, chi nhánh (select 5 chi nhánh từ `src/content/branches`), tình trạng da readonly (pre-fill từ `minigameResult?.condition.label`, ẩn nếu null)
   - Validate + UX states giữ nguyên pattern `short-form.tsx`: `idle / pending / error`, double-submit bị chặn, lỗi inline
   - Nút CTA "Gửi thông tin" → gọi `fetch('/api/lead', ...)` → khi thành công gọi `onSubmit(name, phone)`
   - Dòng consent phía dưới nút: font nhỏ, màu `text-cta/50`

2. **Divider**: `─── Khách hàng nói gì ───` + hint "↓ Kéo xuống để xem review"

3. **Phần testimonial** (dưới fold, optional scroll):
   - Sub-component `TestimonialCard` nhận `{ quote, name, age, branch, avatarLetter, avatarColor }`
   - Avatar: vòng tròn SVG inline với chữ cái đầu — không emoji, không ảnh thật (tránh vấn đề bản quyền + dữ liệu y tế)
   - Stars: 5 ký tự `★` (U+2605) với `text-yellow-400` — không emoji
   - 3 card xếp dọc

### 7.3 Nội dung testimonial (placeholder)

Thay bằng review thật từ khách hàng o2skin trước khi bật production:

| avatarLetter | avatarColor | Quote | Tên | Chi nhánh |
|---|---|---|---|---|
| T | amber | "Sau 3 buổi IPL mụn viêm giảm rõ, thâm mụn cũng mờ dần. Bác sĩ giải thích kỹ từng bước." | Thanh Hà, 22 tuổi | Quận 3 |
| M | violet | "Không ép uống thuốc, không bán thêm. Thấy da tốt lên thật sự sau liệu trình." | Minh Châu, 25 tuổi | Bình Thạnh |
| P | emerald | "Da nhạy cảm nhưng IPL không bị kích ứng. Được dặn dò kỹ trước và sau buổi trị." | Phương Linh, 20 tuổi | Thủ Đức |

### 7.4 Đo lường

`trackEvent('conversion_social_view')` khi mount.

### 7.5 Visual

Cùng pattern `short-form.tsx` hiện có — theme `ocean`, CSS vars, không emoji, không hardcode màu.

## 8. Kiểm thử và xác minh

Đi hết luồng v04 qua `/v/v04-combined`:

- **Màn programs+FAQ**: card liệu trình hiển thị đúng với `suggestedProgramId` từ minigame; FAQ accordion mở/đóng đúng (chỉ 1 item mở cùng lúc); nút CTA chuyển sang conversion
- **Màn conversion+testimonial**: tình trạng da pre-fill từ face-map; validate SĐT sai → lỗi inline, không submit; submit thành công → chuyển sang done (không đi qua socialProof); testimonial cards hiển thị đủ 3
- Cả hai màn scrollable trên mobile portrait mà không tràn ngang
- Không có emoji trong cả 2 variant
- `validateRecipe` tests vẫn xanh với v04
- v01, v02, v03 không bị hỏi sau khi thêm v04

## 9. Ngoài phạm vi (YAGNI)

- Không dùng animation lib cho FAQ — CSS `max-height` là đủ
- Không lazy-load testimonial — 3 card tĩnh, không ảnh thật
- Không làm FAQ/testimonial cấu hình được qua recipe — nội dung nằm trong variant; cần nội dung khác thì tạo variant mới
- Không xóa `video-proof` (v03 vẫn dùng)
- Không thêm version v05 trong scope này
- Nội dung Q&A và testimonial là placeholder cho đến khi o2skin cung cấp dữ liệu thật
