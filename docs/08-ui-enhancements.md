# 08 — UI Enhancements (post-MVP)

Spec bổ sung sau MVP. Ba tính năng được ưu tiên theo thứ tự A → B → C.

---

## A. CTA Scroll Button

### Mục tiêu

Thay thế dòng chữ subtitle tĩnh "Vuốt lên để khám phá ✨" trong Hook section bằng một button CTA có khả năng scroll người dùng xuống quiz khi bấm. Giảm friction: người dùng không cần tự cuộn, chỉ cần bấm một nút rõ ràng.

### Hành vi

Khi người dùng bấm button CTA trong Hook, trang smooth-scroll xuống quiz section. Không có navigation hay reload.

### Yêu cầu kỹ thuật

- Thêm `id="quiz-section"` vào `<section>` bao quanh `<QuizFlow>` trong `index.astro`.
- Thêm `scroll-behavior: smooth` vào selector `html` trong `global.css`.
- Trong `Hook.astro`: xóa thẻ `<p>` subtitle cũ, thay bằng thẻ `<a href="#quiz-section">` có style button.

### Style button CTA

- Background: `bg-cta` (#2D2640)
- Text: `text-white font-bold`
- Shape: `rounded-soft px-8 py-3.5`
- Hover: `hover:opacity-90 transition-opacity`
- Text nội dung: `"Khám phá ngay ✨"`
- Xuất hiện bên dưới `<h1>`, có `mt-5` để tạo khoảng cách

### Không làm

- Không dùng JavaScript `scrollIntoView` — dùng CSS anchor scroll là đủ và không cần JS bundle.
- Không thay đổi bất kỳ logic nào trong `QuizFlow.tsx`.

---

## B. Animations

### Mục tiêu

Làm cho trang cảm giác mượt mà hơn tại hai thời điểm: khi tải trang lần đầu và khi người dùng tương tác với quiz. Không thêm thư viện mới — dùng CSS @keyframes và Tailwind transition.

### Animation 1 — Page load fade-in (Hook section)

Toàn bộ nội dung trong Hook section (heading + CTA button) fade-in từ dưới lên khi trang load.

Kỹ thuật: định nghĩa `@keyframes fadeInUp` trong `global.css`, gán class `animate-fade-in-up` cho inner `div` của Hook. Duration 0.6s, easing `ease-out`.

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.6s ease-out both;
}
```

### Animation 2 — Quiz step transitions

Khi người dùng bấm đáp án và nội dung quiz thay đổi (chuyển câu hỏi hoặc chuyển step), nội dung mới fade-in thay vì xuất hiện đột ngột.

Kỹ thuật: trong `QuizFlow.tsx`, thêm prop `key` vào outer `div` của mỗi step, giá trị là `step` hoặc `${step}-${questionIndex}`. React sẽ unmount/mount lại component khi key thay đổi, kích hoạt lại CSS animation.

```tsx
// ví dụ — quiz step
<div key={`quiz-${questionIndex}`} className="animate-fade-in-up bg-white ...">
```

Áp dụng cho tất cả 4 step: `quiz`, `payoff`, `conversion`, `done`.

### Không làm

- Không cài Framer Motion hay bất kỳ animation library nào.
- Không animate scrollbar hay background gradient — giữ static để tránh distraction.

---

## C. Hero Section với hình ảnh

### Mục tiêu

Thay thế Hook section hiện tại bằng một Hero section có bố cục 2 cột trên desktop (hình ảnh bên trái, text + CTA bên phải), stacked trên mobile (hình ảnh trên, text dưới). Lấy cảm hứng từ bố cục Google Ads landing page nhưng dùng visual GenZ/skincare thay vì visual doanh nghiệp.

### Bố cục desktop

```
[ phone mockup / ảnh ]   [ Headline lớn        ]
[ (placeholder)      ]   [ Subheadline nhỏ     ]
                         [ Button CTA (từ spec A) ]
```

### Bố cục mobile

```
[ phone mockup / ảnh ]
[ Headline lớn       ]
[ Subheadline nhỏ    ]
[ Button CTA         ]
```

### Typography

- Headline: `font-extrabold text-4xl md:text-6xl text-cta leading-tight`
- Subheadline: `text-base md:text-lg text-cta/70 mt-3`
- Tối đa 10 từ cho headline, tối đa 20 từ cho subheadline

### Hình ảnh placeholder

Vì chưa có ảnh thật, dùng một `div` placeholder với:
- Kích thước tương đương phone mockup: `w-64 h-96 md:w-80 md:h-[480px]`
- Background: `bg-pastel-pink/60 rounded-3xl`
- Text giữa: `text-cta/40 text-sm` ghi `[ Ảnh sản phẩm ]`

Khi có ảnh thật, chỉ cần swap `div` placeholder bằng thẻ `<img>`.

### Ẩn scrollbar

Thêm vào `global.css`:

```css
html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
```

### File thay đổi

- `src/components/Hook/Hook.astro` — rewrite thành Hero section 2 cột
- `src/styles/global.css` — thêm hide scrollbar rules (nếu chưa có từ Task B)
- `src/pages/index.astro` — không thay đổi (id="quiz-section" đã có từ Task A)

### Không làm

- Không dùng ảnh bác sĩ, bệnh viện, thuốc, hay imagery y tế.
- Không thêm navigation bar / header.
- Không thêm animation mới — đã được xử lý ở Task B.
