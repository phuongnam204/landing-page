# Thiết kế: Hệ thống nhiều version landing page (slot + variant + recipe)

Ngày: 2026-07-06

## Bối cảnh và vấn đề

Cách làm cũ trên repo là làm từng tính năng trên một branch, xin leader review, rồi sửa
đi sửa lại cùng một UI để hợp gu thẩm mỹ.  Vì đây là **UI product** (không phải web app có
BE + FE rõ ràng), phần lớn công sức đổ vào việc chỉnh sửa lặp lại một version duy nhất.
Cách này có hai vấn đề kép: (1) lãng phí điểm mạnh của AI — thay vì tạo ra nhiều bản song song ngay từ đầu, ta chỉ dùng AI để chỉnh một bản duy nhất; (2) leader luôn chỉ thấy "cái mới nhất" và phản ứng theo cảm giác, không bao giờ có hai phương án cạnh nhau để so sánh và chọn lựa có căn cứ. 

Giải pháp đề xuất: thay vì một version chỉnh tới lui, dựng **20-30 version cùng tồn tại**
trong một repo để chọn ra bản tốt nhất. Thách thức là làm điều đó mà **không** rơi vào địa
ngục bảo trì (sửa 1 chỗ phải sửa ở 30 nơi).

Cách triển khai: dùng Next.js routing để mỗi route là một version landing độc lập — AI tạo ra 20-30 version từ đầu, leader mở từng URL để so sánh, chốt bản ưng, không sửa qua lại nữa.

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

- Hook/Hero **thực hiện vai trò** Tổng quan + chạm nhẹ Đặt vấn đề.
- Interactive core (Minigame) **thực hiện vai trò** Đặt vấn đề + Giới thiệu giải pháp — nhưng
  bằng trải nghiệm thay vì text: người dùng tự "sờ thấy" vấn đề da mình khi chơi, thay vì đọc
  một section mô tả điểm đau. (Minigame là cơ chế — HOW; Đặt vấn đề + Giải pháp là mục đích
  nội dung — WHAT. Đây là hai phạm trù khác nhau; ánh xạ này nói "slot này gánh vai trò gì",
  không nói "slot này bằng nhịp đó".)
- Payoff **thực hiện vai trò** Mô tả lợi ích, cá nhân hóa theo kết quả minigame.
- Programs **thực hiện vai trò** Giới thiệu giải pháp/dịch vụ cụ thể.
- Conversion **thực hiện vai trò** CTA + form.
- Bằng chứng xã hội — **repo đang thiếu slot này** (Done chỉ có contact, không có review/UGC).

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

## Hợp đồng dữ liệu của từng slot

Đây là phần quan trọng nhất của hệ thống: nó là "hợp đồng" giữ cho các variant trong cùng
slot có thể thay thế nhau. Mọi variant của một slot phải tôn trọng đúng interface của slot đó,
không thêm không bớt props.

Dữ liệu chạy qua bộ xương theo một chiều: Minigame tạo ra `quizResult` và `payoffStats`, rồi
hai giá trị đó được truyền xuống các slot phía sau cần dùng. Slot phía trên không biết slot
phía dưới làm gì với chúng.

```ts
// src/landing/slots.ts

import type { SkinCondition } from '../content/quiz';
import type { ProgramId } from '../content/programs';

// Dữ liệu do Minigame tạo ra, chạy xuyên suốt các slot phía sau
export type MinigameResult = {
  condition: SkinCondition;     // loại da / tình trạng da phát hiện được
  foundCount: number;           // số nốt mụn đã tìm thấy
  zoneLabel: string;            // vùng da hay bị nhất ("vùng T", "má trái"...)
  triggerNote: string;          // ghi chú nguyên nhân ("thường do...")
};

// ─── Props của từng slot ────────────────────────────────────────────────────

export type HookSlotProps = {
  onStart: () => void;          // người dùng bấm CTA → bắt đầu minigame
};

export type MinigameSlotProps = {
  onComplete: (result: MinigameResult) => void;  // chơi xong → trả kết quả
};

export type PayoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;       // người dùng đọc xong kết quả → đi tiếp
};

export type ProgramsSlotProps = {
  suggestedProgramId: ProgramId;           // gợi ý từ quiz result
  onContinue: (programId: ProgramId) => void;
};

export type ConversionSlotProps = {
  selectedProgramId: ProgramId | null;
  onSubmit: (name: string, phone: string) => void;
};

export type SocialProofSlotProps = {
  // không nhận data động — nội dung hard-code hoặc lấy từ content/
  onContinue: () => void;
};

export type DoneSlotProps = {
  selectedProgramId: ProgramId | null;
};
```

Ghi chú quan trọng:

- `SocialProofSlotProps` không nhận `quizResult` vì social proof là nội dung chung (review,
  số liệu), không cá nhân hóa theo kết quả minigame.
- `DoneSlotProps` không có `onContinue` — đây là điểm cuối của luồng.
- Các slot tùy chọn (Programs, SocialProof, Done) vắng mặt trong recipe thì `LandingFlow` tự
  bỏ qua bước đó, nhảy thẳng sang bước bắt buộc tiếp theo.

## Chiến lược migrate code cũ

Repo hiện có hai nhánh code cần được đưa vào cấu trúc mới mà không làm gãy trạng thái đang
hoạt động.

### Nguyên tắc: không xóa, chỉ di chuyển và bọc lại

Code cũ không bị xóa trong bước đầu — nó được "bọc" thành variant tương ứng trong cấu trúc
mới. Khi hệ thống mới đã chạy ổn và hai version baseline đều hoạt động, mới xóa file cũ.

### Ánh xạ code cũ → vị trí mới

| File cũ | Vai trò hiện tại | Trở thành |
|---------|-----------------|-----------|
| `src/components/AppFlow.tsx` | Bộ xương + tất cả screens | Được tách ra: bộ xương → `LandingFlow.tsx`, từng screen → variant tương ứng |
| `src/components/MinigameCore/` + `SkinScanScreen.tsx` | Minigame Findgame (từ master) | `src/landing/variants/minigame/findgame.tsx` |
| `src/components/minigame/` (cụm nhiều pha) | Minigame Skincare (từ feat branch) | `src/landing/variants/minigame/skincare.tsx` |
| `HeroScreen` trong AppFlow | Hook hiện tại | `src/landing/variants/hook/two-column.tsx` |
| `PayoffView` trong AppFlow | Payoff hiện tại | `src/landing/variants/payoff/confetti-card.tsx` |
| `ProgramsScreen` trong AppFlow | Programs hiện tại | `src/landing/variants/programs/grid.tsx` |
| `ConversionForm` trong AppFlow | Conversion hiện tại | `src/landing/variants/conversion/short-form.tsx` |
| `DoneScreen` trong AppFlow | Done hiện tại | `src/landing/variants/done/contact-info.tsx` |
| `src/content/` | Dữ liệu quiz/programs | **Giữ nguyên** — dùng chung mọi version |

### Thứ tự thực hiện (để luôn có bản chạy được)

1. Tạo `src/landing/slots.ts` với toàn bộ interface — không đụng code chạy.
2. Tạo `src/landing/registry.ts` và `src/landing/LandingFlow.tsx` skeleton.
3. Di chuyển từng screen ra variant tương ứng, **một screen một lần**, test sau mỗi bước.
4. Tạo hai recipe baseline (`v01-baseline`, `v02-skincare`) và route `v/[version]`.
5. Khi hai recipe chạy đúng: xóa `AppFlow.tsx` cũ, trỏ `app/page.tsx` vào hệ thống mới.
6. Tạo trang `versions/page.tsx`.

Không được nhảy từ bước 1 thẳng lên bước 5 — mỗi bước phải có bản chạy được trên
`localhost` để kiểm tra trước khi đi tiếp.

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

## Theme layer (lightweight)

Leader xem các version như "đi mua áo" — họ compare theo tổng thể cảm giác thị giác, không
phân tích bố cục kỹ thuật. Vì vậy cùng một tổ hợp slot nhưng khác màu sắc/tone vẫn là một
"version" khác biệt có giá trị so sánh. Không có theme layer, mỗi biến thể màu phải là một
variant riêng với màu cứng bên trong — đó là địa ngục bảo trì.

### Cơ chế: CSS class ở root + CSS variables

Không cần một "theme system" phức tạp. Theme chỉ là một CSS class đặt ở root của
`LandingFlow`, nơi định nghĩa một bộ CSS variables. Các variant không biết theme là gì —
chúng chỉ dùng variables đó. Việc chuyển một variant từ màu cứng sang variable chỉ là thay
`bg-[#FFEFF4]` thành `bg-[var(--lp-bg)]`.

```css
/* src/landing/themes.css */
.theme-pastel {
  --lp-bg: #FFEFF4;
  --lp-primary: #1e1b4b;     /* cta navy */
  --lp-accent: #7C3AED;
  --lp-radius: 1.25rem;
}

.theme-ocean {
  --lp-bg: #EFF6FF;
  --lp-primary: #0c4a6e;
  --lp-accent: #0284c7;
  --lp-radius: 0.75rem;
}

.theme-sage {
  --lp-bg: #F0FDF4;
  --lp-primary: #14532d;
  --lp-accent: #16a34a;
  --lp-radius: 1.5rem;
}
```

Recipe khai báo theme bằng một field:

```ts
export const v04 = {
  id: 'v04-ocean-skincare',
  label: 'Skincare minigame — tone xanh ocean',
  theme: 'ocean',   // LandingFlow đặt class "theme-ocean" lên root div
  slots: { ... },
};
```

Cùng một tổ hợp slot, khác theme = một "chiếc áo" hoàn toàn khác với leader.

### Những gì cần làm trong đợt migrate

- Định nghĩa bộ CSS variables (`--lp-bg`, `--lp-primary`, `--lp-accent`, `--lp-radius`, ...).
- Khi di chuyển từng screen ra variant (bước 3 trong migrate), đồng thời thay màu cứng bằng
  variables — không tốn thêm nhiều vì tay đang đụng vào file đó rồi.
- Dựng ít nhất 3 theme ban đầu: `pastel` (giữ visual hiện tại), `ocean`, `sage`.
- `theme` field trong recipe là tùy chọn — nếu không khai báo, dùng `pastel` làm mặc định.

## Ngoài phạm vi (giai đoạn này)

- Chưa xây công cụ A/B testing đo lường tự động (chỉ dựng hạ tầng version để chọn thủ công).
- Chưa tích hợp backend/CRM để gửi lead.
