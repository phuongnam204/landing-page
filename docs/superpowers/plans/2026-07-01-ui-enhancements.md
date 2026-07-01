# Implementation Plan — UI Enhancements
**Date:** 2026-07-01  
**Spec:** docs/08-ui-enhancements.md  
**Thứ tự thực thi:** A → B → C (tuần tự, không song song vì A và C cùng sửa Hook.astro)

---

## Task A — CTA Scroll Button

**Mục tiêu:** Thay subtitle tĩnh bằng button CTA scroll to quiz.

**Files thay đổi:**
- `src/styles/global.css` — thêm `html { scroll-behavior: smooth; }`
- `src/pages/index.astro` — thêm `id="quiz-section"` vào `<section>` quiz
- `src/components/Hook/Hook.astro` — xóa `<p>` subtitle, thêm `<a>` CTA button

**Kết quả `Hook.astro` sau khi xong:**
```astro
<section class="bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint px-5 pt-10 pb-8 md:pt-16 md:pb-12 text-center">
  <div class="max-w-lg mx-auto">
    <h1 class="font-extrabold text-2xl md:text-4xl text-cta leading-snug">
      Da bạn đang nói gì với bạn?
    </h1>
    <a
      href="#quiz-section"
      class="inline-block mt-5 bg-cta text-white font-bold rounded-soft px-8 py-3.5 hover:opacity-90 transition-opacity"
    >
      Khám phá ngay ✨
    </a>
  </div>
</section>
```

**Kết quả `index.astro` sau khi xong:**
```astro
<section id="quiz-section" class="bg-pastel-mint px-5 py-8 md:py-12">
  <div class="max-w-lg mx-auto">
    <QuizFlow client:load />
  </div>
</section>
```

**Kết quả `global.css` sau khi xong:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
body { font-family: 'Poppins', 'Inter', sans-serif; }
html { scroll-behavior: smooth; }
```

**Verify:**
1. `npx astro check` → 0 errors
2. Build thành công: `npm run build`
3. Confirm: bấm button → trang scroll mượt xuống quiz section

**Commit message:** `feat: replace Hook subtitle with CTA scroll button`

---

## Task B — Animations

**Mục tiêu:** Thêm fade-in animation cho Hero section khi tải trang và cho quiz khi chuyển step/câu hỏi.

**Files thay đổi:**
- `src/styles/global.css` — thêm `@keyframes fadeInUp` + `.animate-fade-in-up`
- `src/components/Hook/Hook.astro` — thêm class `animate-fade-in-up` vào inner `div`
- `src/components/InteractiveCore/QuizFlow.tsx` — thêm `key` prop + `animate-fade-in-up` vào outer div của mỗi step

**Thêm vào `global.css`:**
```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out both;
}
```

**Thay đổi trong `Hook.astro`:**
```astro
<div class="max-w-lg mx-auto animate-fade-in-up">
```

**Thay đổi trong `QuizFlow.tsx` — thêm key + class vào outer div của mỗi step:**

Quiz step:
```tsx
<div key={`quiz-${questionIndex}`} className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10">
```

Payoff step (trong `PayoffView`):
```tsx
<div className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center">
```

Conversion step (trong `ConversionForm`):
```tsx
<form ... className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3">
```

Done step:
```tsx
<div className="animate-fade-in-up bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center">
```

Lưu ý quan trọng: `key` prop trên outer div của quiz step là `key={`quiz-${questionIndex}`}` — đặt trực tiếp trên JSX element được return từ `if (step === 'quiz')`. Các step khác (payoff, conversion, done) tự động re-mount khi step thay đổi nên không cần key thêm.

**Verify:**
1. `npx astro check` → 0 errors
2. Tải trang → Hook content fade-in từ dưới lên
3. Bấm đáp án → quiz card mới fade-in thay vì xuất hiện đột ngột
4. Chuyển sang payoff/conversion/done → fade-in mỗi step

**Commit message:** `feat: add fade-in animations to hook and quiz transitions`

---

## Task C — Hero Section với hình ảnh placeholder

**Mục tiêu:** Redesign Hook.astro thành Hero section 2 cột có phone mockup placeholder bên trái (desktop) hoặc trên (mobile).

**Files thay đổi:**
- `src/styles/global.css` — thêm hide scrollbar rules
- `src/components/Hook/Hook.astro` — rewrite thành Hero 2 cột

**Thêm vào `global.css`:**
```css
html { scrollbar-width: none; }
html::-webkit-scrollbar { display: none; }
```

Lưu ý: `html { scroll-behavior: smooth; }` đã có từ Task A — chỉ append thêm, không duplicate.

**Kết quả `Hook.astro` sau khi xong:**
```astro
<section class="bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint px-5 pt-10 pb-8 md:pt-0 md:pb-0 md:min-h-[520px] md:flex md:items-center">
  <div class="max-w-4xl mx-auto w-full md:grid md:grid-cols-2 md:gap-12 md:items-center md:py-16">

    <!-- Phone mockup placeholder -->
    <div class="flex justify-center mb-6 md:mb-0 md:order-first">
      <div class="w-52 h-80 md:w-72 md:h-[440px] bg-white/40 rounded-3xl shadow-lg flex items-center justify-center">
        <span class="text-cta/30 text-sm text-center px-4">[ Ảnh sản phẩm ]</span>
      </div>
    </div>

    <!-- Text + CTA -->
    <div class="text-center md:text-left animate-fade-in-up">
      <h1 class="font-extrabold text-3xl md:text-5xl text-cta leading-tight">
        Da bạn đang<br class="hidden md:block" /> nói gì với bạn?
      </h1>
      <p class="text-sm md:text-base text-cta/70 mt-3">
        Làm quiz 30 giây để tìm ra giải pháp phù hợp với làn da của bạn.
      </p>
      <a
        href="#quiz-section"
        class="inline-block mt-6 bg-cta text-white font-bold rounded-soft px-8 py-3.5 hover:opacity-90 transition-opacity"
      >
        Khám phá ngay ✨
      </a>
    </div>

  </div>
</section>
```

**Verify:**
1. `npx astro check` → 0 errors
2. Desktop (viewport ≥ 768px): 2 cột, placeholder bên trái, text + CTA bên phải
3. Mobile (viewport < 768px): stacked, placeholder trên, text dưới
4. Scrollbar không hiển thị trên cả desktop lẫn mobile
5. Bấm CTA vẫn scroll xuống quiz đúng

**Commit message:** `feat: redesign hook as two-column hero section with image placeholder`
