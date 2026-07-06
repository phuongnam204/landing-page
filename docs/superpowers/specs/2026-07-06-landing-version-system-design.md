# Thiết kế: Hệ thống nhiều version landing page (slot + variant + recipe)

Ngày: 2026-07-06

## Bối cảnh và vấn đề

Cách làm cũ trên repo là làm từng tính năng trên một branch, xin leader review, rồi sửa
đi sửa lại cùng một UI để hợp gu thẩm mỹ. Vì đây là **UI product** (không phải web app có
BE + FE rõ ràng), phần lớn công sức đổ vào việc chỉnh sửa lặp lại một version duy nhất.

Nỗi đau gốc không phải kỹ thuật mà là **thiếu đơn vị so sánh song song**: khi chỉ có một
version và ta ghi đè liên tục, leader không bao giờ thấy hai phương án cạnh nhau để chọn —
họ chỉ phản ứng với "cái mới nhất".

Giải pháp đề xuất: thay vì một version chỉnh tới lui, dựng **20-30 version cùng tồn tại**
trong một repo để chọn ra bản tốt nhất. Thách thức là làm điều đó mà **không** rơi vào địa
ngục bảo trì (sửa 1 chỗ phải sửa ở 30 nơi).

## Bằng chứng từ repo: hai branch = hai version

So `master` với `feat/minigame-skincare`, gần như toàn bộ khác biệt nằm ở **một chỗ: cơ chế
minigame**. `master` dùng `SkinScanScreen` (Findgame); `feat/minigame-skincare` thay bằng
cụm `minigame/*` nhiều pha. Ngoài ra:

- `AppFlow.tsx` gần như y hệt — chỉ đổi `import`/`<Component/>` của minigame.
- `src/content` (quiz, programs, catalog) giống hệt.
- Hero, Payoff, Programs, Conversion, Done không đổi.
- Cả hai minigame cắm vào AppFlow qua **đúng một hợp đồng**:
  `onComplete(result: SkinCondition, stats: PayoffStatsData) => void`.

Kết luận: repo tự nó đã tách sẵn thành các lớp có vòng đời khác nhau. "Version" bản chất là
một **tổ hợp các mảnh cắm vào cùng một bộ xương**, không phải một bản sao độc lập.

## Cơ sở: một landing page cần những nhịp gì

Không định nghĩa slot chỉ bằng cách diff hai branch (đó là mô tả "cái repo tình cờ có", không
phải "cái landing cần có"). Tham chiếu cấu trúc landing kinh điển
(amis.misa.vn/35769/cau-truc-landing-page), một landing gồm các **nhịp thuyết phục**: Tổng
quan → Đặt vấn đề (điểm đau) → Giới thiệu giải pháp → Mô tả lợi ích → CTA → Bằng chứng xã hội.

Bộ xương giảm-friction trong `docs/01-product-ux-spec.md` (Hook → Interactive core → Payoff →
Conversion → Trust) chính là các nhịp đó được "gói" lại cho hành vi Gen Z/TikTok: thay text
dài bằng tương tác. Ánh xạ:

- Hook/Hero = Tổng quan + chạm nhẹ Đặt vấn đề.
- Interactive core (Minigame) = Đặt vấn đề + Giới thiệu giải pháp dạng trải nghiệm.
- Payoff = Mô tả lợi ích, cá nhân hóa.
- Programs = Giới thiệu giải pháp/dịch vụ cụ thể.
- Conversion = CTA + form.
- Bằng chứng xã hội = **repo đang thiếu** (Done chỉ có contact, không có review/UGC).

## Định nghĩa một variant

Một variant được xác định bởi **ba thứ** (không phải "khác branch kia chỗ nào"):

1. **Vai trò** — nó lấp nhịp thuyết phục nào (đến từ danh sách kinh điển).
2. **Hợp đồng dữ liệu** — nhận gì vào, trả gì ra (rút từ `AppFlow.tsx` hiện tại).
3. **Cách thể hiện** — text/ảnh/tương tác; hai cột/full-bleed; lưới/carousel.

Luật thay thế: **hai variant chỉ thay được cho nhau khi cùng vai trò và cùng hợp đồng, chỉ
khác cách thể hiện.** Findgame và Skincare minigame thay được nhau vì cùng nhịp Minigame,
cùng trả `(result, stats)`.

## Bộ slot chuẩn

| # | Slot | Bắt buộc? | Vai trò |
|---|------|-----------|---------|
| 1 | Hook (Hero) | ✅ | Mở màn, gây tò mò / nêu điểm đau |
| 2 | Minigame (Interactive core) | ✅ | Tương tác lõi, thay text dài |
| 3 | Payoff | ✅ | Trả kết quả cá nhân hóa = lợi ích |
| 4 | Solution / Programs | ⭕ | Giới thiệu dịch vụ cụ thể |
| 5 | Conversion | ✅ | CTA + form |
| 6 | Social proof / Trust | ⭕ | Tăng tin cậy (repo đang thiếu) |
| 7 | Close / Done | ⭕ | Xác nhận + bước tiếp theo |

- **Bắt buộc** (Hook, Minigame, Payoff, Conversion): mọi recipe phải có; thiếu là gãy luồng
  chuyển đổi hoặc vi phạm ràng buộc cứng của `docs/00-overview.md`. Minigame bắt buộc vì
  doc 00 coi interactive core là lý do tồn tại của cả trang.
- **Tùy chọn** (Programs, Social proof, Done): recipe có thể bật/tắt để làm thí nghiệm A/B
  (ví dụ tắt Programs, đi thẳng Payoff → form).

## Kiến trúc

### Ba khái niệm

- **Slot**: một mắt xích trong bộ xương, định nghĩa bằng một interface props cố định.
- **Variant**: một bản hiện thực của một slot, tôn trọng interface của slot đó.
- **Recipe (= một version)**: một object chọn một variant cho mỗi slot.

Ẩn dụ: bộ xương là "khai vị → món chính → tráng miệng"; recipe là tờ thực đơn ghi "khai vị A,
món chính C, tráng miệng B". Không nấu lại cả bếp cho mỗi thực đơn.

### Cấu trúc thư mục

```
src/
├─ landing/
│  ├─ slots.ts              # Hợp đồng (interface props) của 7 slot — nguồn chân lý
│  ├─ registry.ts           # Bảng tra: slot + variantId → component
│  ├─ LandingFlow.tsx       # Bộ xương chung: nhận 1 recipe, tự lắp & chạy state machine
│  ├─ validateRecipe.ts     # Luật: recipe đủ 4 slot bắt buộc, id variant có thật
│  ├─ variants/
│  │  ├─ hook/{two-column,full-bleed}.tsx
│  │  ├─ minigame/{findgame,skincare}.tsx
│  │  ├─ payoff/confetti-card.tsx
│  │  ├─ programs/{grid,carousel}.tsx
│  │  ├─ conversion/short-form.tsx
│  │  ├─ social-proof/tiktok-ugc.tsx      # slot mới
│  │  └─ done/contact-info.tsx
│  └─ recipes/
│     ├─ index.ts                          # gom & export toàn bộ recipe thành 1 mảng
│     ├─ v01-baseline.ts                    # tái hiện master (Findgame)
│     └─ v02-skincare.ts                    # tái hiện feat/minigame-skincare
├─ content/                                # GIỮ NGUYÊN, dùng chung mọi version
└─ app/
   ├─ page.tsx                             # trỏ tới recipe "đang chọn để publish"
   ├─ versions/page.tsx                    # phòng trưng bày — liệt kê mọi version
   └─ v/[version]/page.tsx                 # route động — mở 1 version theo id
```

`content/` và `LandingFlow.tsx` **chỉ có một bản duy nhất**. Thêm version = thêm một file
recipe nhỏ (và file variant chỉ khi cần bố cục chưa từng có).

### Lắp ráp một version

```ts
// recipes/v03-fullbleed-carousel.ts
export const v03 = {
  id: 'v03-fullbleed-carousel',
  label: 'Full-bleed hero + Skincare + Programs carousel',
  slots: {
    hook: 'full-bleed',
    minigame: 'skincare',
    payoff: 'confetti-card',
    programs: 'carousel',     // bỏ dòng này để TẮT slot tùy chọn
    conversion: 'short-form',
    socialProof: 'tiktok-ugc',
    done: 'contact-info',
  },
};
```

`LandingFlow.tsx` là `AppFlow.tsx` được tổng quát hóa: thay `import` cứng bằng tra `registry`
theo recipe, rồi chạy state machine y như cũ. Logic chuyển bước, `trackEvent`, giữ
`quizResult/payoffStats` — không đổi. Thêm version chỉ-tổ-hợp = không viết dòng component nào.

### Route và so sánh song song

- `app/v/[version]/page.tsx`: đọc `version` từ URL → tra recipe → render `LandingFlow`. Mỗi
  version có URL riêng, tồn tại đồng thời (`/v/v01-baseline`, `/v/v02-skincare`, ...).
- `app/versions/page.tsx`: phòng trưng bày — đọc mảng recipe, hiển thị lưới thẻ kèm `label`
  và link. Leader vào một trang, thấy toàn bộ version, mở từng cái để so sánh.
- `app/page.tsx`: sau khi chốt, trỏ tới id recipe được chọn để publish.

### Kiểm tra hợp lệ

`validateRecipe.ts` chặn recipe hỏng ngay khi khai báo: phải đủ 4 slot bắt buộc (Hook,
Minigame, Payoff, Conversion) và mọi variantId phải tồn tại trong registry. Quên minigame =
báo lỗi ngay, không render ra landing hỏng.

## Vì sao thắng cách "nhiều page trong src/app"

Nếu mỗi version là một `page.tsx` copy toàn bộ, sửa một typo/`trackEvent` phải sửa 30 nơi và
content bị copy 30 bản dễ lệch. Với recipe, bộ xương và content là **một nguồn chân lý duy
nhất**; version chỉ là cách phối lại các mảnh đã kiểm thử. Rủi ro "30 version thành 30
codebase con" bị chặn từ kiến trúc.

## Ràng buộc kế thừa (không được vi phạm)

Từ `docs/00-overview.md` và `docs/01-product-ux-spec.md`: mobile-portrait ưu tiên; tải nhanh;
không bắt đọc text dài trước tương tác đầu tiên; luồng một chiều; không backend ở giai đoạn
này; minigame là interactive core bắt buộc.

## Ngoài phạm vi (giai đoạn này)

- Chưa xây công cụ A/B testing đo lường tự động (chỉ dựng hạ tầng version để chọn thủ công).
- Chưa làm lớp theme (màu/font/animation) tách rời — để dành cho đợt sau nếu cần.
- Chưa tích hợp backend/CRM để gửi lead.
