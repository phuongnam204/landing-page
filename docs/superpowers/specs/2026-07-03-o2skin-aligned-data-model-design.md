# Thiết kế: Đưa minigame + ProgramsScreen về mô hình dữ liệu o2skin (+ card B + nurse chibi)

- **Ngày:** 2026-07-03
- **Trạng thái:** Design ĐÃ DUYỆT — sẵn sàng viết implementation plan
- **Nguồn khảo sát:** [[o2skin-real-programs-source]] (memory) + `o2-backend/prisma/schema.prisma`

## 1. Bối cảnh & mục tiêu

ProgramsScreen hiện dùng 3 chương trình bịa với dữ liệu thô, và minigame ra "profile" theo vốn từ tự nghĩ. Khảo sát 2 repo o2skin cho thấy dữ liệu thật nằm trong DB production (API nội bộ, không public). Mục tiêu: **tái cấu trúc dữ liệu landing page cho khớp mô hình o2skin, dạng tĩnh sau một seam sạch, để khi có giá trị thật thì chỉ việc đổ vào là chạy**; đồng thời dựng lại ProgramsScreen cho sinh động (card hướng B + 2 nurse chibi + entrance animation).

## 2. Quyết định nền tảng (đã chốt)

- **Dữ liệu tĩnh trong repo, sau một seam truy xuất (helper)** — không fetch API.
- **Một taxonomy "tình trạng da" (SkinCondition) thống nhất** làm mắt xích: minigame ra 1 tình trạng; mỗi chương trình khai nó trị những tình trạng nào (`treatsConditions`). Mỗi tình trạng ghi kèm `o2skinRef` để đối chiếu sau.
- **YAGNI:** KHÔNG đưa chấm điểm trọng số (`weight`/`score`/`AcneLevel`) — landing page không tự tính cấp độ mụn.
- **Số lượng chương trình tùy ý** (không cứng 3): `ProgramId` là chuỗi tự do, danh sách dài tùy ý; lưới card tự xuống dòng.

## 3. Mô hình dữ liệu

### 3.1 SkinCondition (nâng cấp `content/quiz.ts`)

Thay `QuizResult` → `SkinCondition`. Giữ 6 id hiện có làm placeholder.

```ts
type ConditionId =
  | 'mun-noi-tiet' | 'da-nhon-mun-viem' | 'da-nhay-cam'
  | 'lo-chan-long' | 'clean-skin' | 'da-moi-bat-dau';

interface SkinCondition {
  id: ConditionId;
  label: string;                 // MỚI: tên hiển thị, ví dụ "Mụn nội tiết"
  tone: 'positive' | 'concern';
  body: string;                  // nội dung payoff (HTML fragment), giữ như cũ
  color: string;                 // MỚI: màu đại diện — dùng cho chấm badge + tint header card
  o2skinRef?: string;            // MỚI: ứng với AcneType/SkinType/pathology nào của o2skin (seam)
}
```

- **Bỏ** `suggestedProgram` (đảo chiều: chương trình tự khai — 3.2). **Bỏ** `solution` (payoff đã ngưng dùng; plan xác nhận không còn consumer trước khi xóa).
- Đổi export `quizResults` → `skinConditions`. Màu gợi ý: mun-noi-tiet `#FF5C9E`, da-nhon-mun-viem `#FFCD78`, da-nhay-cam `#7DD9C0`, lo-chan-long `#8B6BFF`, clean-skin `#B39DFF`, da-moi-bat-dau `#A0AEC0`.

### 3.2 Program (file mới `content/programs.ts`)

Đưa `PROGRAMS` ra khỏi `AppFlow.tsx`, định hình theo field combo o2skin. **Số lượng gói tùy ý.**

```ts
type ProgramId = string;         // id chuỗi tự do; combo thật thay sau

interface Program {
  id: ProgramId;
  name: string;                  // ← o2skin mobileName
  description: string;           // ← o2skin description
  isVip?: boolean;               // ← o2skin isVip
  treatsConditions: ConditionId[]; // các tình trạng gói này trị; PHẦN TỬ ĐẦU = tình trạng chính (dùng tint header)
  sessions?: number;             // ← combo quantity; GIỮ field cho khớp dữ liệu thật nhưng KHÔNG hiển thị trên card
  o2skinComboRef?: string;       // seam: combo thật tương ứng
}
```

- **KHÔNG** `durationLabel` ("mấy tuần"). **KHÔNG** `priceLabel` (ẩn giá công khai). `sessions` giữ trong type nhưng **card không render** (theo yêu cầu bỏ pill số buổi).

## 4. Seam truy xuất (helper thuần, `content/catalog.ts`)

```ts
getConditionById(id: ConditionId): SkinCondition | undefined
getPrograms(): Program[]
getProgramsTreating(conditionId: ConditionId): Program[]
getSuggestedProgram(conditionId: ConditionId): Program | undefined  // gói đầu tiên trị tình trạng đó; fallback getPrograms()[0]
```

## 5. Vùng minigame = AcneLocation (`MinigameCore/skinScanLogic.ts`)

Giữ 4 ô self-report (`cam-quai-ham`, `chu-t`, `hai-ma`, `khong-bi`), đặt lại về khái niệm AcneLocation.

```ts
ZONE_META: Record<SkinZone, {
  label: string;
  conditionId: ConditionId;      // ĐỔI TÊN từ profileId
  color: string;
  o2skinLocationRef?: string;    // MỚI: ứng với AcneLocation nào của o2skin
}>
```
- Đổi `resolveProfileByZone` → `resolveConditionByZone(zone): SkinCondition` (logic face-mapping giữ nguyên).

## 6. ProgramsScreen dựng lại — card hướng B + nhân vật + animation

### 6.1 Card (hướng B đã duyệt)
Lưới **tự xuống dòng** `grid-template-columns: repeat(auto-fill, minmax(210px,1fr))` (chạy tốt với số gói bất kỳ). Mỗi card:
- Dải **header tint màu theo tình trạng chính** (`treatsConditions[0]` → màu nhạt của `SkinCondition.color`), chứa `name` + (dấu ✓ nếu là gói gợi ý).
- Thân: `description`; badge VIP (khi `isVip`); hàng **badge loại bệnh** = `treatsConditions` map sang `{ chấm màu = condition.color, chữ = condition.label }`.
- **KHÔNG** hiện số buổi/tuần, **KHÔNG** giá, **KHÔNG** chữ "Phù hợp với bạn".
- Gói gợi ý (từ `getSuggestedProgram`) được **chọn sẵn + viền tím `#7C3AED`** (cơ chế selection hiện có).

### 6.2 Nurse chibi (2 nhân vật)
- Asset đã có: `public/mascots/nurse-cheer.png` (reo vui, chào đón) và `public/mascots/nurse-review.png` (cầm bảng, "xem kết quả") — PNG nền trong suốt, user cung cấp. **Cần xác nhận license thương mại trước go-live** ([[project-diary]] — cùng nhóm rủi ro với ảnh hero/minigame).
- Đặt ở **dải header hai bên tiêu đề**: cheer bên trái, review bên phải; `z-index` cao hơn lưới card → **không bị card che**. Render bằng `<img src="/mascots/....png">` (Next serve từ `public/`).
- **Mobile:** thu nhỏ (~64px) vẫn giữ cả hai hai bên tiêu đề; nếu quá chật thì ẩn bản review, giữ bản cheer (mobile là tệp chính, nên giữ ít nhất 1 nhân vật).

### 6.3 Entrance animation (hợp GenZ)
- Tiêu đề: `fadeDown` (trồi xuống mờ→rõ). Nhân vật: `popIn`/`popCheer` (bật scale có overshoot) rồi `floaty` (trôi lên-xuống nhẹ vô hạn). Card: `cardUp` trồi lên + mờ→rõ, **stagger** theo `animation-delay` tăng dần (~0.1s mỗi card).
- **Bắt buộc** `@media (prefers-reduced-motion: reduce)` tắt toàn bộ animation.
- CSS keyframes để trong `src/app/globals.css`.

## 7. Luồng & file bị đổi

- `content/quiz.ts` — giữ đường dẫn, đổi sang `SkinCondition`/`skinConditions` (+ `label`, `color`, `o2skinRef`; bỏ `suggestedProgram`, `solution`).
- `content/programs.ts` (MỚI) — `Program` type + `programs` (đủ ≥5 mẫu placeholder có `o2skinComboRef`) + helper mục 4.
- `content/catalog.ts` (MỚI, hoặc gộp vào programs.ts) — các helper seam.
- `MinigameCore/skinScanLogic.ts` — `ZONE_META.conditionId`, `resolveConditionByZone`, `o2skinLocationRef`.
- `components/SkinScanScreen.tsx` — `onComplete` trả `SkinCondition`; dùng `resolveConditionByZone`.
- `components/AppFlow.tsx` — bỏ `PROGRAMS` inline; `selectedProgram = getSuggestedProgram(condition.id)?.id`; ProgramsScreen dựng lại (card B + lưới auto-fill + 2 nurse chibi header + animation); `PayoffView` nhận `SkinCondition` (field payoff `tone`/`body` không đổi); `PayoffStats` giữ nguyên.
- `src/app/globals.css` — keyframes `fadeDown`/`popIn`/`popCheer`/`floaty`/`cardUp` (đặt tên tránh trùng, ví dụ prefix `ps-`) + reduced-motion.
- `public/mascots/nurse-cheer.png`, `public/mascots/nurse-review.png` — đã có.

## 8. Kiểm thử

- **Unit** (`skinScanLogic.test.ts` mở rộng + test helper): `resolveConditionByZone` map đúng 4 vùng + fallback `da-moi-bat-dau`; `getProgramsTreating` trả đúng gói theo `treatsConditions`; `getSuggestedProgram` trả gói đầu trị tình trạng, fallback gói đầu; `getConditionById` đúng/undefined. 18 test cũ vẫn pass.
- **tsc** sạch.
- **Preview desktop + mobile:** minigame → payoff đúng tình trạng → ProgramsScreen chọn sẵn đúng gói, card B hiện badge loại bệnh (không giá/số buổi/"Phù hợp với bạn"), 2 nhân vật hiện ở header không bị card che, animation chạy khi vào màn, mobile giữ ≥1 nhân vật; kiểm reduced-motion.

## 9. Quyết định đã chốt

1. Dữ liệu tĩnh + seam helper (không API). 2. Một taxonomy `SkinCondition` thống nhất (`color` mới). 3. `ProgramId` chuỗi, số gói tùy ý, lưới auto-fill. 4. Card hướng B (tint header theo tình trạng chính); bỏ số buổi/giá/"Phù hợp với bạn". 5. 2 nurse chibi PNG trong suốt ở header (không bị che), entrance animation + reduced-motion. 6. Không chấm điểm/AcneLevel. 7. Placeholder có `o2skinRef`/`o2skinComboRef`/`o2skinLocationRef` để đổ dữ liệu thật sau.
