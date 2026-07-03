# Thiết kế: Đưa minigame + ProgramsScreen về mô hình dữ liệu o2skin

- **Ngày:** 2026-07-03
- **Trạng thái:** Design — chờ duyệt trước khi viết implementation plan
- **Nguồn khảo sát:** [[o2skin-real-programs-source]] (memory) + schema `o2-backend/prisma/schema.prisma`

## 1. Bối cảnh & mục tiêu

ProgramsScreen hiện dùng 3 chương trình bịa (`khoi-dau`/`toan-dien`/`chuyen-sau`) với dữ liệu thô, và minigame ra "profile" theo vốn từ tự nghĩ. Khảo sát 2 repo nội bộ o2skin cho thấy dữ liệu thật tồn tại nhưng nằm trong DB production (API nội bộ, không public), nên không lấy trực tiếp được cho landing page.

Mục tiêu: **tái cấu trúc dữ liệu của landing page cho khớp mô hình o2skin, dạng tĩnh sau một seam sạch, để khi có giá trị thật thì chỉ việc đổ vào là chạy** — không phải sửa component. Gồm ba việc: (a) đặt lại 4 vùng + các "profile" của minigame theo vốn từ AcneLocation/AcneType; (b) card chương trình ghép "chi tiết gói liệu trình" (nguồn combo) với "loại bệnh phù hợp" (nguồn phân loại mụn); (c) đổi cấu trúc `content/quiz.ts` + ProgramsScreen theo mô hình thật.

## 2. Quyết định nền tảng (đã chốt khi brainstorm)

- **Dữ liệu tĩnh trong repo, sau một seam truy xuất sạch** — không fetch API (API o2skin nội bộ, chưa public).
- **Một taxonomy "tình trạng da" (SkinCondition) thống nhất** làm mắt xích: minigame ra 1 tình trạng; mỗi chương trình khai nó trị những tình trạng nào. Không sao chép cách o2skin tách 2 namespace (lead acne-type vs product pathology) — quá phức tạp cho trang tĩnh; thay vào đó mỗi tình trạng ghi kèm `o2skinRef` để đối chiếu sau.
- **YAGNI:** KHÔNG đưa cơ chế chấm điểm trọng số (`weight`/`score`/`AcneLevel`) vào — landing page không tự tính cấp độ mụn (giữ tinh thần không chẩn đoán bừa).

## 3. Mô hình dữ liệu

### 3.1 SkinCondition (nâng cấp `content/quiz.ts`)

Thay `QuizResult` bằng `SkinCondition`. Giữ 6 id hiện có làm placeholder (đánh dấu chờ đối chiếu tên loại mụn thật của o2skin).

```ts
type ConditionId =
  | 'mun-noi-tiet' | 'da-nhon-mun-viem' | 'da-nhay-cam'
  | 'lo-chan-long' | 'clean-skin' | 'da-moi-bat-dau';

interface SkinCondition {
  id: ConditionId;
  label: string;                 // MỚI: tên hiển thị, ví dụ "Mụn nội tiết"
  tone: 'positive' | 'concern';
  body: string;                  // nội dung payoff (HTML fragment), giữ như cũ
  o2skinRef?: string;            // MỚI: ghi chú tình trạng này ứng với AcneType/SkinType/pathology nào của o2skin (seam đối chiếu)
}
```

- **Bỏ** `suggestedProgram` (đảo chiều: chương trình tự khai — mục 3.2).
- **Bỏ** `solution` (payoff đã ngưng dùng; plan xác nhận không còn consumer trước khi xóa).
- Đổi tên export `quizResults` → `skinConditions`.

### 3.2 Program (file mới `content/programs.ts`)

Đưa `PROGRAMS` ra khỏi `AppFlow.tsx` thành file dữ liệu riêng, định hình theo field combo thật của o2skin.

```ts
type ProgramId = 'khoi-dau' | 'toan-dien' | 'chuyen-sau'; // id placeholder; combo thật thay sau

interface Program {
  id: ProgramId;
  name: string;                  // ← o2skin mobileName (tên hiển thị cho khách)
  description: string;           // ← o2skin description
  sessions?: number;             // ← combo quantity (số buổi); optional, chỉ hiện khi có
  isVip?: boolean;               // ← o2skin isVip
  treatsConditions: ConditionId[]; // các tình trạng gói này trị (mắt xích loại bệnh)
  o2skinComboRef?: string;       // seam: combo thật tương ứng
}
```

- **KHÔNG có** `durationLabel` ("mấy tuần") — bỏ theo yêu cầu; đó là copy marketing, không phải field DB.
- **KHÔNG có** `priceLabel` — ẩn giá công khai theo yêu cầu (giá tồn tại bên o2skin nhưng không surface trên trang công khai).

### 3.3 Vùng minigame = AcneLocation (`MinigameCore/skinScanLogic.ts`)

Giữ 4 ô self-report (`cam-quai-ham`, `chu-t`, `hai-ma`, `khong-bi`), đặt lại về mặt khái niệm là vị trí mụn (AcneLocation) theo vốn từ o2skin.

```ts
type SkinZone = 'cam-quai-ham' | 'chu-t' | 'hai-ma' | 'khong-bi';

ZONE_META: Record<SkinZone, {
  label: string;
  conditionId: ConditionId;      // ĐỔI TÊN từ profileId
  color: string;
  o2skinLocationRef?: string;    // MỚI: ứng với AcneLocation nào của o2skin
}>
```

- Đổi tên hàm `resolveProfileByZone` → `resolveConditionByZone(zone): SkinCondition` (logic face-mapping giữ nguyên).

## 4. Seam truy xuất (các helper thuần)

Đặt trong `content/` (ví dụ `content/catalog.ts`), là điểm duy nhất component chạm dữ liệu. Sau này đổi sang API chỉ sửa các hàm này.

```ts
getConditionById(id: ConditionId): SkinCondition | undefined
getPrograms(): Program[]
getProgramsTreating(conditionId: ConditionId): Program[]      // các gói có conditionId trong treatsConditions
getSuggestedProgram(conditionId: ConditionId): Program | undefined // gói đầu tiên trị tình trạng đó; fallback getPrograms()[0]
```

## 5. Card chương trình — ghép hai nguồn

Mỗi card trên ProgramsScreen hiển thị:
- **Nguồn combo:** `name`, `description`, và `{sessions} buổi` (chỉ khi `sessions` có), badge VIP (khi `isVip`).
- **Nguồn phân loại:** một hàng **badge "loại bệnh"** liệt kê `treatsConditions` (map sang `label` của từng tình trạng) — đây là "loại bệnh phù hợp với gói đó".

Gói gợi ý (khớp kết quả minigame) vẫn được **chọn sẵn + tô đậm** bằng cơ chế selection hiện có (viền tím + dấu ✓). **KHÔNG** thêm dòng chữ "Phù hợp với bạn" (bỏ theo yêu cầu) — tín hiệu "gói dành cho bạn" đến từ việc nó được chọn sẵn.

## 6. Luồng & thay đổi component

- **SkinScanScreen.tsx:** `onComplete` trả `SkinCondition` (đổi tên type); dùng `resolveConditionByZone`. `onComplete(condition, { foundCount, zoneLabel })` — chữ ký stats giữ nguyên.
- **AppFlow.tsx:** bỏ `PROGRAMS` inline (import từ `content/programs.ts`); khi minigame xong: `selectedProgram = getSuggestedProgram(condition.id)?.id`; `ProgramsScreen` render badge loại bệnh (không có "Phù hợp với bạn"); `PayoffView` nhận `SkinCondition` (đổi tên từ `QuizResult`, các field dùng ở payoff — `tone`, `body` — không đổi). `PayoffStats` giữ nguyên (dùng `foundCount` + `zoneLabel`).
- **content/quiz.ts:** giữ đường dẫn file (giảm churn import), đổi nội dung sang `SkinCondition`/`skinConditions`.

## 7. Kiểm thử

- **Unit (mở rộng `skinScanLogic.test.ts` + test mới cho helper):**
  - `resolveConditionByZone` map đúng 4 vùng → condition; fallback vùng lạ → `da-moi-bat-dau`.
  - `getProgramsTreating(id)` trả đúng các gói có id trong `treatsConditions`.
  - `getSuggestedProgram(id)` trả gói đầu tiên trị tình trạng; fallback gói đầu khi không gói nào trị.
  - `getConditionById` trả đúng/undefined.
- **tsc:** `npx tsc --noEmit` sạch.
- **Preview:** minigame → payoff đúng tình trạng → ProgramsScreen chọn sẵn đúng gói gợi ý, card hiện badge loại bệnh, không có chữ "Phù hợp với bạn", không hiện giá/số tuần.

## 8. Quyết định đã chốt

1. Dữ liệu tĩnh + seam helper (không API).
2. Một taxonomy `SkinCondition` thống nhất (không tách 2 namespace o2skin).
3. Bỏ `durationLabel`, ẩn giá (`priceLabel`), bỏ chữ "Phù hợp với bạn".
4. Không đưa cơ chế chấm điểm trọng số/AcneLevel.
5. Giá trị hiện tại là placeholder có `o2skinRef`/`o2skinComboRef`/`o2skinLocationRef` để đối chiếu dữ liệu thật sau.
