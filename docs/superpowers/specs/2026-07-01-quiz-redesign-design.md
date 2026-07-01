# Quiz Redesign Design — 6 Questions × 5 Profiles

**Date:** 2026-07-01  
**Branch:** `feat/landing-page-content`  
**Scope:** Expand quiz from 3 → 6 questions, add 5 distinct skin profiles, improve quiz animations and interactivity.

---

## 1. Goal

Tăng engagement của minigame quiz bằng cách:
- Thêm câu hỏi để phân loại da chính xác hơn (6 câu thay vì 3)
- Đưa ra kết quả cá nhân hóa hơn (5 profile thay vì 3 key cứng)
- Cải thiện cảm giác tương tác: smooth transition, selected states, progress bar, program card selection

---

## 2. Quiz Questions (6 câu)

| # | Loại | Câu hỏi | Đáp án | Ghi chú |
|---|------|---------|--------|---------|
| Q1 | YES/NO | Bạn là nam hay nữ? | Nam / Nữ | Ảnh hưởng đáp án Q6 và ngôn ngữ result |
| Q2 | YES/NO | Da bạn có đang bị mụn sưng đỏ, đau không? | Có / Không | — |
| Q3 | YES/NO | Bạn có bị mụn đầu đen hoặc lỗ chân lông to không? | Có / Không | — |
| Q4 | YES/NO | Bạn đã từng dùng sữa rửa mặt hoặc sản phẩm chăm sóc da chưa? | Đã dùng / Chưa bao giờ | Gate cho Q5 |
| Q5 | 3 options | Sau khi rửa mặt, da bạn thường cảm thấy thế nào? | Nhờn bóng / Căng rát / Bình thường | **Conditional:** chỉ hiện nếu Q4 = "Đã dùng" |
| Q6 | 3 options | Mụn hay nổi nhiều hơn vào lúc nào? | (xem bên dưới) | Đáp án thay đổi theo Q1 |

**Q6 đáp án theo giới tính:**

- Nữ: "Trước hoặc trong kỳ kinh" / "Khi stress, thức khuya" / "Tôi cũng không rõ nữa"
- Nam: "Sau khi ăn đồ ngọt, chiên xào" / "Khi stress, thức khuya" / "Tôi cũng không rõ nữa"

**Tổng flow:** Q1 → Q2 → Q3 → Q4 → Q5 (nếu Q4=Đã dùng) → Q6 → Result

---

## 3. Quiz Logic — Priority Waterfall

`computeResult(answers)` kiểm tra điều kiện theo thứ tự ưu tiên. Profile đầu tiên match được chọn.

```
answers = {
  q1: 'nam' | 'nu'
  q2: 'co' | 'khong'
  q3: 'co' | 'khong'
  q4: 'da-dung' | 'chua-bao-gio'
  q5: 'nhon' | 'cang-rat' | 'binh-thuong' | null  // null nếu Q4='chua-bao-gio'
  q6: 'ky-kinh' | 'stress' | 'khong-ro'           // (nữ)
       'do-ngot' | 'stress' | 'khong-ro'           // (nam)
}
```

| Priority | Điều kiện | Profile ID |
|----------|-----------|------------|
| P1 | `q1 === 'nu' && q2 === 'co' && q6 === 'ky-kinh'` | `mun-noi-tiet` |
| P2 | `q2 === 'co' && q4 === 'da-dung' && q5 === 'cang-rat'` | `da-nhay-cam` |
| P3 | `q2 === 'co'` (catch-all) | `da-nhon-mun-viem` |
| P4 | `q2 === 'khong' && q3 === 'co'` | `lo-chan-long` |
| P5 | fallback | `da-moi-bat-dau` |

---

## 4. Skin Profiles (5 profiles)

### `mun-noi-tiet` — Mụn nội tiết

- **Tình trạng:** Mụn nổi theo chu kỳ kinh nguyệt, tập trung vùng cằm và má dưới. Thường sưng đỏ trước và trong kỳ kinh, sau đó tự giảm.
- **Giải pháp:** Liệu trình nhẹ nhàng, kháng viêm, không dùng active ingredients mạnh. Tập trung cân bằng da và giảm viêm thay vì tấn công mụn trực tiếp.
- **Chương trình đề xuất:** Chuyên sâu (8 tuần)

### `da-nhay-cam` — Da nhạy cảm + mụn dai dẳng

- **Tình trạng:** Skin barrier yếu, da dễ căng rát và kích ứng sau khi rửa mặt. Mụn viêm tái đi tái lại dù đã dùng nhiều sản phẩm. Điều trị sai hướng có thể làm da tệ hơn.
- **Giải pháp:** Phục hồi barrier trước (ceramide, niacinamide nhẹ), sau đó mới xử lý mụn. Tránh acid mạnh, retinol, scrub vật lý.
- **Chương trình đề xuất:** Toàn diện (12 tuần)

### `da-nhon-mun-viem` — Da nhờn + mụn viêm

- **Tình trạng:** Tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm xuất hiện liên tục đặc biệt vùng chữ T. Thường bùng phát khi thức khuya hoặc ăn uống thất thường.
- **Giải pháp:** Kiểm soát dầu + kháng khuẩn nhẹ, BHA để thông tắc lỗ chân lông, niacinamide giảm bã nhờn. Không cần sản phẩm quá mạnh.
- **Chương trình đề xuất:** Chuyên sâu (8 tuần)

### `lo-chan-long` — Lỗ chân lông + mụn đầu đen

- **Tình trạng:** Không có mụn viêm nhưng lỗ chân lông to rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm. Da thường dầu hoặc hỗn hợp.
- **Giải pháp:** Exfoliating routine nhẹ (BHA 1–2%), clay mask 1–2 lần/tuần, retinol nhẹ sau khi da quen. Không cần kháng sinh hay sản phẩm kháng viêm.
- **Chương trình đề xuất:** Khởi đầu (4 tuần)

### `da-moi-bat-dau` — Da mới bắt đầu / ít vấn đề rõ ràng

- **Tình trạng:** Chưa có thói quen chăm sóc da hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.
- **Giải pháp:** Xây dựng basic routine trước: cleanser nhẹ + moisturizer + SPF. Tư vấn 1:1 để xác định nhu cầu và bắt đầu đúng hướng.
- **Chương trình đề xuất:** Khởi đầu (4 tuần)

---

## 5. Animation Design

### Chuyển câu hỏi (answer → next question)

- **Trigger:** User chọn đáp án
- **Feedback tức thì (0ms):** Button chuyển sang selected state (border tím + nền tím nhạt + ✓)
- **Delay trước transition (150ms):** Đủ để user thấy selected state trước khi slide
- **Slide out (220ms):** Câu hiện tại slide trái + fade out (`translateX(-60px), opacity: 0`)
- **Slide in (220ms, bắt đầu từ phải):** Câu mới xuất hiện từ `translateX(60px)` → `translateX(0)`, opacity 0 → 1
- **Easing:** `ease` cho cả hai chiều

### Progress bar

- CSS `width` transition `400ms ease`
- Cập nhật mỗi lần chuyển câu

### Không dùng full-screen fade-through cho quiz

Full-screen fade (300ms, dùng ở step transitions) quá nặng cho micro-interaction giữa các câu. Chỉ dùng slide cục bộ bên trong QuizScreen.

---

## 6. UI Improvements

### Answer buttons

| State | Border | Background | Text |
|-------|--------|------------|------|
| Default | `#e0e0e0` 2px | `#fff` | `#2D2640` |
| Hover | `#a78bfa` 2px | `#faf5ff` | `#2D2640` |
| Selected | `#7c3aed` 2px | `#f3e8ff` | `#2D2640` + ✓ ở cuối |

Transition: `border-color 160ms ease, background 160ms ease`

### Progress bar

- Track: `bg-purple-100` (`#f3e8ff`), height 5px, border-radius full
- Fill: `bg-purple-700` (`#7c3aed`), CSS width transition 400ms
- Vị trí: ngay dưới question counter (`Câu X / 6`), trên question text

### Program card selection (ProgramsScreen)

- **Default:** border `#e5e7eb`, bg `#fff`
- **Hover:** border `#a78bfa`, box-shadow nhẹ
- **Selected:** border `#7c3aed`, bg `#faf5ff`, checkmark icon xuất hiện góc trên phải card
- **CTA button:** khi chưa chọn card — "Đăng ký tư vấn →" (navy); khi đã chọn card — "Đăng ký chương trình [tên] →" (tím `#7c3aed`)
- Khi user đến ProgramsScreen, card có `id` khớp với `result.suggestedProgram` được pre-selected mặc định
- `selectedProgram` state truyền vào ConversionForm dưới dạng read-only prop để hiển thị tên chương trình — không thay đổi logic bên trong ConversionForm

---

## 7. Files cần sửa

| File | Thay đổi |
|------|---------|
| `src/content/quiz.ts` | Rewrite toàn bộ: 6 câu hỏi, 5 result object với `skinCondition` + `solution` + `suggestedProgram` |
| `src/components/InteractiveCore/quizLogic.ts` | Rewrite `computeResult`: multi-answer priority waterfall, gender branching |
| `src/components/AppFlow.tsx` | Progress bar, slide animation, selected button state, conditional Q5 skip, gender-adaptive Q6, program card selection state, CTA text động |

---

## 8. Out of Scope

- Thay đổi ConversionForm (chỉ nhận thêm `selectedProgram` prop để pre-fill)
- Thêm ảnh minh hoạ cho từng profile
- Backend/analytics tracking
