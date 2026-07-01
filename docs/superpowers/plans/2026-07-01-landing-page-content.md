# Implementation Plan — Landing Page Content
**Date:** 2026-07-01
**Branch:** feat/landing-page-content
**Spec:** docs/10-landing-page-content.md

3 task tuần tự. Tất cả thay đổi tập trung vào `src/components/AppFlow.tsx`.

---

## Task A — Chuẩn hóa font trên desktop

**File thay đổi:** `src/components/AppFlow.tsx`

Giảm các `md:text-*` override theo bảng trong spec:

| Vị trí trong file | Thay đổi |
|---|---|
| `HeroScreen` — `h1` | `text-3xl md:text-5xl` → `text-3xl md:text-4xl` |
| `QuizScreen` — câu hỏi | `text-lg md:text-xl` → `text-lg` |
| `QuizScreen` — counter | `text-xs md:text-sm` → `text-xs` |
| `PayoffView` — title | `text-xl md:text-2xl` → `text-xl` |
| `ConversionForm` — title | `text-lg md:text-xl` → `text-lg` |

**Verify:**
- `npx astro check` → 0 errors
- Dev server: desktop h1 trông cân hơn

**Commit:** `fix: normalize desktop font sizes in AppFlow`

---

## Task B — Thay placeholder bằng ảnh thật

**File thay đổi:** `src/components/AppFlow.tsx` — `HeroScreen` function

Thay `div` placeholder bằng `img`:

```tsx
// Xóa:
<div className="w-52 h-72 md:w-72 md:h-[400px] bg-white/40 rounded-3xl shadow-lg flex items-center justify-center">
  <span className="text-cta/30 text-sm text-center px-4">[ Ảnh sản phẩm ]</span>
</div>

// Thay bằng:
<img
  src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=600&q=85&fit=crop&crop=face"
  alt="Cô gái chăm sóc da"
  className="w-52 h-72 md:w-72 md:h-[400px] rounded-3xl object-cover object-top shadow-lg"
/>
```

**Verify:**
- Dev server: ảnh hiển thị trong HeroScreen
- Mobile layout: ảnh không bị biến dạng, mặt hiển thị đúng
- Desktop layout: ảnh giữ trong container 2 cột

**Commit:** `feat: replace hero placeholder with real Unsplash image`

---

## Task C — Thêm ProgramsScreen

**File thay đổi:** `src/components/AppFlow.tsx`

### Bước C1 — Mở rộng Step type

```tsx
// Trước:
type Step = 'hero' | 'quiz' | 'payoff' | 'conversion' | 'done';

// Sau:
type Step = 'hero' | 'quiz' | 'payoff' | 'programs' | 'conversion' | 'done';
```

### Bước C2 — Sửa PayoffView call trong AppFlow

```tsx
// Trước:
{step === 'payoff' && (
  <PayoffView
    result={computeResult(answers)}
    onContinue={() => {
      trackEvent('payoff_view', { resultId: computeResult(answers).id });
      transitionTo('conversion');
    }}
  />
)}

// Sau:
{step === 'payoff' && (
  <PayoffView
    result={computeResult(answers)}
    onContinue={() => {
      trackEvent('payoff_view', { resultId: computeResult(answers).id });
      transitionTo('programs');
    }}
  />
)}
```

### Bước C3 — Thêm render cho step programs

Sau block `step === 'payoff'`, thêm:

```tsx
{step === 'programs' && (
  <ProgramsScreen onContinue={() => transitionTo('conversion')} />
)}
```

### Bước C4 — Đổi label CTA trong PayoffView component

```tsx
// Trước:
Nhận tư vấn miễn phí →

// Sau:
Xem chương trình phù hợp →
```

### Bước C5 — Viết ProgramsScreen component

Thêm cuối file:

```tsx
const PROGRAMS = [
  {
    name: 'Khởi đầu',
    duration: '4 tuần',
    description: 'Phù hợp với mụn nhẹ, lần đầu điều trị. Liệu trình cơ bản giúp làm sạch da và kiểm soát dầu.',
  },
  {
    name: 'Chuyên sâu',
    duration: '8 tuần',
    description: 'Kết hợp nhiều bước điều trị, phù hợp mụn từ trung bình. Tập trung vào nguyên nhân gốc rễ.',
  },
  {
    name: 'Toàn diện',
    duration: '12 tuần',
    description: 'Dành cho mụn nặng và tái phát. Kết hợp chăm sóc da và tư vấn dinh dưỡng, nội tiết.',
  },
];

function ProgramsScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="h-screen w-full bg-pastel-lavender flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-xs font-bold text-label-purple uppercase mb-1">Chương trình của chúng tôi</div>
          <div className="font-extrabold text-xl text-cta">Chương trình trị mụn phù hợp với bạn</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {PROGRAMS.map((program) => (
            <div
              key={program.name}
              className="bg-white rounded-soft p-5 shadow-md shadow-cta/10 flex flex-col gap-2"
            >
              <div className="font-extrabold text-base text-cta">{program.name}</div>
              <div className="text-xs font-bold text-label-purple">{program.duration}</div>
              <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={onContinue}
            className="bg-cta text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:opacity-90 transition-opacity"
          >
            Nhận tư vấn miễn phí →
          </button>
        </div>
      </div>
    </div>
  );
}
```

**Verify:**
1. `npx astro check` → 0 errors
2. Full flow: hero → quiz (3 câu) → payoff → programs (3 cards) → conversion form → done
3. Mobile: 3 cards xếp dọc, vừa màn hình
4. Desktop: 3 cards nằm ngang, grid-cols-3

**Commit:** `feat: add ProgramsScreen between payoff and conversion`
