# Implementation Plan — Full-Screen Section Transitions
**Date:** 2026-07-01
**Branch:** feat/full-screen-transitions
**Spec:** docs/09-section-transitions.md

Kế hoạch gồm 2 task tuần tự. Task 1 xây dựng AppFlow.tsx mới. Task 2 dọn dẹp các file cũ và cập nhật index.astro.

---

## Task 1 — Xây dựng AppFlow.tsx

**Mục tiêu:** Tạo component mới quản lý toàn bộ flow từ hero → done, với fade-through-transparent transition giữa các step.

**File tạo mới:** `src/components/AppFlow.tsx`

**Nội dung đầy đủ:**

```tsx
import React, { useState } from 'react';
import { quizQuestions } from '../content/quiz';
import { computeResult } from './InteractiveCore/quizLogic';
import { trackEvent } from '../lib/trackEvent';

type Step = 'hero' | 'quiz' | 'payoff' | 'conversion' | 'done';

export default function AppFlow() {
  const [step, setStep] = useState<Step>('hero');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  function transitionTo(nextStep: Step) {
    setIsTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setIsTransitioning(false);
    }, 300);
  }

  function handleAnswer(optionId: string) {
    const currentQuestion = quizQuestions[questionIndex];
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(nextAnswers);

    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      trackEvent('quiz_complete', { answers: nextAnswers });
      transitionTo('payoff');
    }
  }

  const containerClass = `transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`;

  return (
    <div className={containerClass}>
      {step === 'hero' && (
        <HeroScreen onStart={() => transitionTo('quiz')} />
      )}

      {step === 'quiz' && (
        <QuizScreen
          questionIndex={questionIndex}
          question={quizQuestions[questionIndex]}
          onAnswer={handleAnswer}
        />
      )}

      {step === 'payoff' && (
        <PayoffView
          result={computeResult(answers)}
          onContinue={() => {
            trackEvent('payoff_view', { resultId: computeResult(answers).id });
            transitionTo('conversion');
          }}
        />
      )}

      {step === 'conversion' && (
        <ConversionForm
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { name, phone });
            transitionTo('done');
          }}
        />
      )}

      {step === 'done' && <DoneScreen />}
    </div>
  );
}

// ─── Screens ────────────────────────────────────────────────────────────────

function HeroScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint flex items-center overflow-hidden">
      <div className="max-w-4xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center">
        {/* Placeholder image */}
        <div className="flex justify-center mb-6 md:mb-0">
          <div className="w-52 h-72 md:w-72 md:h-[400px] bg-white/40 rounded-3xl shadow-lg flex items-center justify-center">
            <span className="text-cta/30 text-sm text-center px-4">[ Ảnh sản phẩm ]</span>
          </div>
        </div>
        {/* Text + CTA */}
        <div className="text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-3xl md:text-5xl text-cta leading-tight">
            Da bạn đang nói gì với bạn?
          </h1>
          <p className="text-sm md:text-base text-cta/70 mt-3">
            Làm quiz 30 giây để tìm ra giải pháp phù hợp với làn da của bạn.
          </p>
          <button
            onClick={onStart}
            className="mt-6 bg-cta text-white font-bold rounded-soft px-8 py-3.5 hover:opacity-90 transition-opacity"
          >
            Khám phá ngay ✨
          </button>
          <p className="text-xs text-cta/40 mt-3">Hàng nghìn bạn trẻ đã tìm ra giải pháp phù hợp</p>
        </div>
      </div>
    </div>
  );
}

function QuizScreen({
  questionIndex,
  question,
  onAnswer,
}: {
  questionIndex: number;
  question: { id: string; question: string; options: { id: string; label: string }[] };
  onAnswer: (optionId: string) => void;
}) {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-xs md:text-sm font-bold text-label-purple uppercase mb-2">
          Câu {questionIndex + 1}/{quizQuestions.length}
        </div>
        <div className="font-bold text-lg md:text-xl text-cta mb-4">{question.question}</div>
        <div className="flex gap-2.5">
          {question.options.map((option) => (
            <button
              key={option.id}
              onClick={() => onAnswer(option.id)}
              className="flex-1 bg-white border-2 border-border-pink rounded-2xl py-4 md:py-5 px-2 text-center font-bold text-sm md:text-base text-cta"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PayoffView({
  result,
  onContinue,
}: {
  result: ReturnType<typeof computeResult>;
  onContinue: () => void;
}) {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center animate-fade-in-up">
        <div className="text-xs md:text-sm font-bold text-label-purple uppercase mb-2">Kết quả của bạn</div>
        <div className="font-extrabold text-xl md:text-2xl text-cta mb-2">{result.title}</div>
        <p className="text-sm md:text-base text-cta/80 mb-5">{result.description}</p>
        <button
          onClick={onContinue}
          className="inline-block bg-cta text-white font-bold text-sm md:text-base py-3.5 px-9 rounded-soft"
        >
          Nhận tư vấn miễn phí →
        </button>
      </div>
    </div>
  );
}

function ConversionForm({ onSubmit }: { onSubmit: (name: string, phone: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    onSubmit(name.trim(), phone.trim());
  }

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3 animate-fade-in-up"
      >
        <div className="font-extrabold text-lg md:text-xl text-cta mb-1">Để lại thông tin để nhận tư vấn</div>
        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm md:text-base text-cta"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm md:text-base text-cta"
        />
        <button
          type="submit"
          className="bg-cta text-white font-bold text-sm md:text-base py-3.5 rounded-soft mt-2"
        >
          Gửi thông tin
        </button>
      </form>
    </div>
  );
}

function DoneScreen() {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center animate-fade-in-up">
        <div className="font-extrabold text-lg md:text-xl text-cta mb-2">Cảm ơn bạn!</div>
        <p className="text-sm md:text-base text-cta/80">Đội ngũ tư vấn sẽ liên hệ với bạn sớm nhất.</p>
      </div>
    </div>
  );
}
```

**Verify Task 1:**
- `npx astro check` → 0 errors
- Không cần build vì Task 2 chưa cập nhật index.astro

**Commit:** `feat: add AppFlow component with full-screen transitions`

---

## Task 2 — Cập nhật index.astro, global.css, xóa file cũ

**Mục tiêu:** Kết nối AppFlow vào trang, vô hiệu hóa scroll trên body, xóa các component không còn dùng.

**Thay đổi `src/pages/index.astro`** — rewrite toàn bộ:
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

**Thay đổi `src/styles/global.css`** — thêm `overflow: hidden` vào rule `body`:
```css
body {
  font-family: 'Poppins', 'Inter', sans-serif;
  overflow: hidden;
}
```

**Xóa các file không còn dùng:**
- `src/components/Hook/Hook.astro`
- `src/components/Trust/Trust.astro`
- `src/components/InteractiveCore/QuizFlow.tsx`

Giữ lại:
- `src/components/InteractiveCore/quizLogic.ts` (vẫn được dùng)
- `src/components/InteractiveCore/quizLogic.test.ts` (tests vẫn còn giá trị)

**Verify Task 2:**
1. `npx astro check` → 0 errors
2. `npm run build` → thành công
3. `npm test` → 4 tests vẫn pass (quizLogic.test.ts không bị ảnh hưởng)
4. Dev server: trang load với hero screen full-height, bấm CTA → fade → quiz screen, không có scroll

**Commit:** `feat: wire AppFlow into page, disable scroll, remove legacy components`
