# 10 — Landing Page Content (Post-Refactor Review)

Spec cho 3 hạng mục review sau khi hoàn thiện kiến trúc AppFlow. Ba thay đổi nhắm vào nội dung và cảm nhận tổng thể của trang: font đồng đều hơn, hình ảnh thật thay cho placeholder, và một section giới thiệu chương trình điều trị mụn.

---

## A. Chuẩn hóa font trên desktop

### Vấn đề

Trên desktop, một số class `md:text-*` trong `AppFlow.tsx` làm font nhảy quá lớn so với mobile. Ví dụ: `h1` của HeroScreen dùng `md:text-5xl` (48px) trong khi phiên bản mobile `text-3xl` (30px) trông tự nhiên hơn. Người dùng cảm nhận trang bị "vỡ font" giữa hai thiết bị.

### Giải pháp

Giảm các `md:` text scale xuống một bước, giữ nguyên size trên mobile. Mục tiêu: desktop trông nhất quán với mobile, không to hơn đáng kể.

| Element | Hiện tại | Sau khi sửa |
|---|---|---|
| HeroScreen `h1` | `text-3xl md:text-5xl` | `text-3xl md:text-4xl` |
| QuizScreen question | `text-lg md:text-xl` | `text-lg` (bỏ override) |
| PayoffView title | `text-xl md:text-2xl` | `text-xl` (bỏ override) |
| ConversionForm title | `text-lg md:text-xl` | `text-lg` (bỏ override) |
| QuizScreen counter | `text-xs md:text-sm` | `text-xs` (bỏ override) |

### Không làm

- Không thay đổi font family (Poppins/Inter giữ nguyên).
- Không thay đổi font size trên mobile.
- Không ảnh hưởng đến `p`, subtitle, hoặc button text.

### Acceptance Criteria

**AC-A1: Desktop h1 không vượt quá text-4xl**
- Given: user truy cập trên màn hình ≥768px
- When: HeroScreen render
- Then: h1 "Da bạn đang nói gì với bạn?" có font-size ≤36px (text-4xl), không phải 48px (text-5xl)

**AC-A2: Quiz và form giữ size thống nhất giữa mobile và desktop**
- Given: user đang ở QuizScreen hoặc ConversionForm
- When: render trên desktop (≥768px)
- Then: font size của câu hỏi và form title trông tương đương với mobile — không tăng thêm 1 bậc

---

## B. Hình ảnh thật cho Hero section

### Mục tiêu

Thay thế `div` placeholder `[ Ảnh sản phẩm ]` trong `HeroScreen` bằng ảnh lifestyle thật từ Unsplash. Ảnh phải phù hợp với thương hiệu skincare GenZ: người thật, ánh sáng tự nhiên, cảm giác tươi sáng, không y tế.

### Ảnh đã chọn

**Look Studio** — `photo-1728727217834-b190862837a3`

URL đầy đủ:
```
https://images.unsplash.com/photo-1728727217834-b190862837a3?w=600&q=85&fit=crop&crop=face
```

Phong cách: người phụ nữ đang chạm mặt, cười tươi, ánh sáng studio sạch. Phù hợp với context skincare.

### Kỹ thuật

Thay `div` placeholder bằng thẻ `<img>`. Dùng các class sau:
- Kích thước giữ nguyên: `w-52 h-72 md:w-72 md:h-[400px]`
- Shape: `rounded-3xl`
- `object-fit: cover` + `object-position: center top` để giữ mặt trong frame

```tsx
<img
  src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=600&q=85&fit=crop&crop=face"
  alt="Cô gái chăm sóc da"
  className="w-52 h-72 md:w-72 md:h-[400px] rounded-3xl object-cover object-top shadow-lg"
/>
```

### Không làm

- Không tải ảnh về local — dùng CDN Unsplash.
- Không thêm overlay hay filter trên ảnh — giữ ảnh sạch để tương phản với background gradient.
- Không thay đổi kích thước container hay layout xung quanh.

### Acceptance Criteria

**AC-B1: Ảnh thật hiển thị trong HeroScreen**
- Given: user truy cập landing page
- When: HeroScreen render
- Then: thấy ảnh lifestyle (người phụ nữ), không thấy text placeholder "[ Ảnh sản phẩm ]"

**AC-B2: Ảnh không bị biến dạng**
- Given: user truy cập trên mobile và desktop
- When: HeroScreen render ở cả hai breakpoint
- Then: ảnh luôn crop đúng (mặt hiển thị, không bị kéo méo, không có viền trắng thừa)

---

## C. Section "Chương trình trị mụn"

### Mục tiêu

Thêm một bước `programs` vào flow giữa `payoff` và `conversion`. Sau khi xem kết quả quiz, thay vì đi thẳng vào form, người dùng được giới thiệu 3 chương trình điều trị để họ có context trước khi để lại thông tin.

### Flow mới

```
hero → quiz → payoff → programs → conversion → done
```

Thay đổi ở `PayoffView`: CTA button đổi từ "Nhận tư vấn miễn phí →" thành "Xem chương trình phù hợp →" và dẫn đến `programs` thay vì `conversion`.

### Nội dung ProgramsScreen

3 card chương trình, layout `grid-cols-1 md:grid-cols-3`:

| Tên | Thời gian | Mô tả tóm tắt |
|---|---|---|
| Khởi đầu | 4 tuần | Phù hợp mụn nhẹ, lần đầu điều trị |
| Chuyên sâu | 8 tuần | Liệu trình kết hợp nhiều bước, mụn từ trung bình |
| Toàn diện | 12 tuần | Trị mụn nặng, kết hợp điều trị da và nội tiết |

Mỗi card có: badge tên chương trình, thời gian, mô tả ngắn.

CTA cuối trang (dưới 3 card): button "Nhận tư vấn miễn phí →" dẫn đến `conversion`.

### Kỹ thuật

- Thêm `'programs'` vào type `Step`
- Thêm `ProgramsScreen` component vào `AppFlow.tsx`
- Sửa `PayoffView`: nhận prop `onContinue` như cũ, caller thay đổi từ `transitionTo('conversion')` thành `transitionTo('programs')`
- `ProgramsScreen` nhận prop `onContinue: () => void`

### Không làm

- Không thêm giá tiền — đây là placeholder content, giá sẽ được thêm sau.
- Không thêm navigation back — flow là one-way như các step khác.
- Không thay đổi `ConversionForm` hay `DoneScreen`.

### Acceptance Criteria

**AC-C1: Programs screen xuất hiện sau payoff**
- Given: user đã xem PayoffView
- When: user bấm "Xem chương trình phù hợp →"
- Then: chuyển sang ProgramsScreen hiển thị 3 card chương trình — không đi thẳng vào ConversionForm

**AC-C2: Ba card chương trình đủ nội dung**
- Given: user đang ở ProgramsScreen
- When: screen render
- Then: thấy đúng 3 card với tên "Khởi đầu", "Chuyên sâu", "Toàn diện", mỗi card có thời gian điều trị

**AC-C3: CTA dẫn đến ConversionForm**
- Given: user đang ở ProgramsScreen
- When: user bấm "Nhận tư vấn miễn phí →"
- Then: chuyển sang ConversionForm, fade transition đúng như các step khác
