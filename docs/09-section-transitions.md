# 09 — Full-Screen Section Transitions

Spec cho kiến trúc mới: thay thế scroll-based navigation bằng full-screen section transitions. Mỗi màn hình chiếm đúng 100vh, người dùng chuyển màn hình bằng button thay vì scroll.

---

## Lý do thay đổi kiến trúc

Kiến trúc scroll hiện tại có hai vấn đề:
1. Chiều cao các section không được kiểm soát — hero section trên mobile cao hơn viewport, quiz section bị đẩy ra ngoài tầm nhìn.
2. Scroll thụ động không đủ tạo cảm giác app-like cho tệp GenZ.

Full-screen transitions giải quyết cả hai: mỗi screen cố định `height: 100vh`, không có khả năng overflow, và trải nghiệm gần với TikTok/Stories hơn là webpage truyền thống.

---

## Kiến trúc mới

### Component chính: `AppFlow.tsx`

Toàn bộ trang được quản lý bởi một React island duy nhất. `index.astro` chỉ render `<AppFlow client:load />`.

```
AppFlow.tsx
├── step: 'hero' | 'quiz' | 'payoff' | 'conversion' | 'done'
├── HeroScreen     — hero section (nội dung từ Hook.astro cũ)
├── QuizScreen     — quiz flow (logic từ QuizFlow.tsx)
├── PayoffView     — kết quả (giữ nguyên từ QuizFlow.tsx)
├── ConversionForm — form thu thập (giữ nguyên từ QuizFlow.tsx)
└── DoneScreen     — cảm ơn
```

### Files bị xóa

- `src/components/Hook/Hook.astro` — nội dung chuyển vào HeroScreen trong AppFlow.tsx
- `src/components/Trust/Trust.astro` — nội dung trust ("Hàng nghìn bạn trẻ...") chuyển vào HeroScreen dưới CTA button

### Files được tạo mới

- `src/components/AppFlow.tsx` — component chính thay thế QuizFlow.tsx

### Files bị xóa sau khi có AppFlow

- `src/components/InteractiveCore/QuizFlow.tsx` — logic được port sang AppFlow.tsx

### Files không thay đổi

- `src/content/quiz.ts` — giữ nguyên
- `src/components/InteractiveCore/quizLogic.ts` — giữ nguyên
- `src/lib/trackEvent.ts` — giữ nguyên
- `src/layouts/BaseLayout.astro` — giữ nguyên
- `src/styles/global.css` — thêm disable scroll trên body

---

## Kỹ thuật transition

### Approach: Fade-through-transparent (không cần thư viện)

Sử dụng hai state để điều phối:
- `step` — screen đang hiển thị
- `isTransitioning` — đang trong quá trình chuyển (opacity = 0)

```tsx
function transitionTo(nextStep: Step) {
  setIsTransitioning(true);
  setTimeout(() => {
    setStep(nextStep);
    setIsTransitioning(false);
  }, 300); // khớp với CSS transition duration
}
```

Container div của mỗi screen có class `transition-opacity duration-300` kết hợp với `opacity-0` khi `isTransitioning`, `opacity-100` khi không. Kết quả: màn hình hiện tại mờ dần → nội dung mới xuất hiện → fade in. Không cần render đồng thời hai màn hình.

### Tại sao không dùng Framer Motion

Framer Motion giải quyết exit animation của React tốt hơn (crossfade thực sự), nhưng thêm ~45KB vào bundle. Với fade-through-transparent, trải nghiệm vẫn mượt mà và không cần dependency mới. Có thể nâng cấp lên Framer Motion sau nếu muốn crossfade đồng thời.

---

## Layout mỗi screen

Tất cả screens đều dùng layout wrapper giống nhau:

```tsx
<div className="h-screen w-full flex flex-col items-center justify-center px-5 overflow-hidden">
  {/* nội dung screen */}
</div>
```

### HeroScreen

Giữ nguyên bố cục 2 cột của Hero section hiện tại, nhưng trong `h-screen`. Trust content ("Hàng nghìn bạn trẻ...") được đặt dưới CTA button dưới dạng text nhỏ, không còn là section riêng.

Background: giữ gradient `from-pastel-pink via-pastel-lavender to-pastel-mint`.

```tsx
// Cấu trúc HeroScreen
<div className="h-screen w-full bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint flex items-center">
  <div className="max-w-4xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center">
    {/* Placeholder image */}
    <div className="flex justify-center mb-6 md:mb-0">
      <div className="w-52 h-72 md:w-72 md:h-[400px] bg-white/40 rounded-3xl shadow-lg flex items-center justify-center">
        <span className="text-cta/30 text-sm text-center px-4">[ Ảnh sản phẩm ]</span>
      </div>
    </div>
    {/* Text + CTA */}
    <div className="text-center md:text-left">
      <h1 className="font-extrabold text-3xl md:text-5xl text-cta leading-tight">
        Da bạn đang nói gì với bạn?
      </h1>
      <p className="text-sm md:text-base text-cta/70 mt-3">
        Làm quiz 30 giây để tìm ra giải pháp phù hợp với làn da của bạn.
      </p>
      <button
        onClick={() => transitionTo('quiz')}
        className="mt-6 bg-cta text-white font-bold rounded-soft px-8 py-3.5 hover:opacity-90 transition-opacity"
      >
        Khám phá ngay ✨
      </button>
      <p className="text-xs text-cta/40 mt-3">Hàng nghìn bạn trẻ đã tìm ra giải pháp phù hợp</p>
    </div>
  </div>
</div>
```

### QuizScreen, PayoffView, ConversionForm, DoneScreen

Giữ nguyên nội dung từ QuizFlow.tsx hiện tại, chỉ bọc trong `h-screen bg-pastel-mint flex items-center justify-center px-5`.

Card quiz/payoff/form dùng `max-w-lg w-full` để giới hạn chiều rộng trên desktop.

---

## Disable scroll

Thêm vào `global.css`:
```css
body { overflow: hidden; }
```

Lưu ý: scroll đã bị ẩn (hidden scrollbar) từ Task C. `overflow: hidden` trên body là bước tiếp theo để hoàn toàn vô hiệu hóa scroll.

---

## index.astro sau khi refactor

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import AppFlow from '../components/AppFlow';
---
<BaseLayout
  title="Tìm giải pháp cho làn da của bạn"
  description="Làm quiz ngắn để tìm ra giải pháp chăm sóc da phù hợp với bạn."
>
  <AppFlow client:load />
</BaseLayout>
```

---

## Không làm

- Không dùng `window.scrollTo` hay scroll-based navigation ở bất kỳ đâu.
- Không cài Framer Motion hay animation library mới.
- Không thay đổi `quizLogic.ts`, `quiz.ts`, `trackEvent.ts`.
- Không thêm routing (React Router, etc.) — AppFlow tự quản lý step state.

---

## Acceptance Criteria

**AC-1: Hero screen là màn hình duy nhất khi tải trang**
- Given: user truy cập landing page
- When: trang load xong
- Then: chỉ thấy HeroScreen (image placeholder + heading + CTA button), không có quiz hay form nào hiển thị, không thể scroll để thấy thêm nội dung

**AC-2: Chuyển sang quiz sau khi bấm CTA**
- Given: user đang ở HeroScreen
- When: user bấm "Khám phá ngay ✨"
- Then: HeroScreen mờ dần, QuizScreen xuất hiện với câu hỏi 1/3 trong vòng 400ms — không reload trang, không thay đổi URL

**AC-3: Kết quả payoff khớp với câu trả lời câu 1**
- Given: user chọn "Mụn" ở câu 1
- When: user hoàn thành câu 2 và câu 3
- Then: PayoffScreen hiển thị kết quả tương ứng với "Mụn" (acne result), không phải kết quả của câu khác

**AC-4: Done screen sau khi submit form hợp lệ**
- Given: user đang ở ConversionForm, điền tên "An" và số điện thoại "0909123456"
- When: user bấm "Gửi thông tin"
- Then: DoneScreen xuất hiện với text "Cảm ơn bạn!", và `trackEvent('form_submit')` được gọi với `{ name: 'An', phone: '0909123456' }`
