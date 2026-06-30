# Landing Page MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP interactive landing page — Astro + React island quiz flow with personalized payoff and conversion form, styled per the approved visual style, no backend integration.

**Architecture:** Astro static site with one React island (`QuizFlow.tsx`) handling the entire interactive core → payoff → conversion sequence via internal state. Static `.astro` components for Hook and Trust sections. Tailwind CSS implements the design tokens from `docs/06-visual-style.md`. Reference specs: `docs/00-overview.md`, `docs/01-product-ux-spec.md`, `docs/05-build-spec.md`, `docs/06-visual-style.md`, `docs/07-architecture.md`.

**Tech Stack:** Astro, React (islands), TypeScript, Tailwind CSS, Vitest (unit tests for quiz logic), npm.

---

## Task 1: Scaffold Astro project with React and Tailwind

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `tailwind.config.mjs`, `src/styles/global.css`, `src/pages/index.astro` (placeholder)

- [ ] **Step 1: Scaffold Astro project**

Run in `D:\project\LandingPage`:

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install --no-git
```

When prompted (if not fully non-interactive), choose: TypeScript strict, no git init (repo root already exists), skip install (we'll install manually next step).

- [ ] **Step 2: Install dependencies**

```bash
npm install
npm install react react-dom
npm install @astrojs/react @astrojs/tailwind tailwindcss --save-dev
```

- [ ] **Step 3: Add React and Tailwind integrations to Astro config**

Edit `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [react(), tailwind()],
});
```

- [ ] **Step 4: Verify dev server boots**

Run: `npm run dev`
Expected: server starts on `http://localhost:4321` with no errors. Stop the server (Ctrl+C) after confirming.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src
git commit -m "chore: scaffold Astro project with React and Tailwind integrations"
```

---

## Task 2: Configure design tokens in Tailwind

**Files:**
- Modify: `tailwind.config.mjs`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Write design tokens into `tailwind.config.mjs`**

Replace contents with:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cta: '#2D2640',
        'pastel-pink': '#FFD3E0',
        'pastel-lavender': '#C7CEEA',
        'pastel-mint': '#A8E6CF',
        'border-pink': '#FFB8CE',
        'border-mint': '#9FE6BD',
        'border-lavender': '#B6BCEE',
        'label-purple': '#9b8fc4',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        soft: '20px',
      },
    },
  },
  plugins: [],
};
```

These values come directly from `docs/06-visual-style.md` (Color palette, Typography, Shape sections) — do not invent new values here; if a needed color/size is missing, add it to `06-visual-style.md` first.

- [ ] **Step 2: Create global stylesheet with Tailwind directives and font import**

Create `src/styles/global.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;800&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Poppins', 'Inter', sans-serif;
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.mjs src/styles/global.css
git commit -m "feat: configure Tailwind design tokens from visual style spec"
```

---

## Task 3: Base layout

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Create the layout**

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
}

const { title } = Astro.props;
---
<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
  </head>
  <body class="overflow-x-hidden">
    <slot />
  </body>
</html>
```

- [ ] **Step 2: Verify it builds**

Run: `npm run build`
Expected: build completes with no errors (index.astro from Task 1 scaffold doesn't use the layout yet — that's fine, this step only checks the file is syntactically valid Astro).

- [ ] **Step 3: Commit**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: add BaseLayout with viewport meta and global styles"
```

---

## Task 4: Quiz content constants

**Files:**
- Create: `src/content/quiz.ts`

- [ ] **Step 1: Write the content file**

```ts
export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Bạn lo nhất điều gì trên da? 💗',
    options: [
      { id: 'acne', label: 'Mụn' },
      { id: 'dark-spot', label: 'Thâm' },
      { id: 'scar', label: 'Sẹo' },
    ],
  },
  {
    id: 'q2',
    question: 'Da bạn thường trong trạng thái nào nhất?',
    options: [
      { id: 'oily', label: 'Đổ dầu' },
      { id: 'dry', label: 'Khô căng' },
      { id: 'combo', label: 'Hỗn hợp' },
    ],
  },
  {
    id: 'q3',
    question: 'Bạn đã thử bao nhiêu sản phẩm cho vấn đề này?',
    options: [
      { id: 'few', label: 'Vài loại' },
      { id: 'many', label: 'Rất nhiều' },
      { id: 'none', label: 'Chưa thử gì' },
    ],
  },
];

export const quizResults: Record<string, QuizResult> = {
  acne: {
    id: 'acne',
    title: 'Bạn cần giải pháp kiểm soát mụn',
    description: 'Da bạn đang cần một liệu trình tập trung làm sạch và kiểm soát dầu thừa.',
  },
  'dark-spot': {
    id: 'dark-spot',
    title: 'Bạn cần giải pháp mờ thâm',
    description: 'Da bạn đang cần một liệu trình tập trung phục hồi và làm đều màu da.',
  },
  scar: {
    id: 'scar',
    title: 'Bạn cần giải pháp làm mờ sẹo',
    description: 'Da bạn đang cần một liệu trình tập trung tái tạo và làm đầy mô da.',
  },
};
```

Note: this copy is placeholder content per `docs/03-open-questions.md` ("Nội dung/copy thật" — chưa có input từ business). It is real, working text, not a TBD — replace with final marketing copy later by editing only this file.

- [ ] **Step 2: Commit**

```bash
git add src/content/quiz.ts
git commit -m "feat: add quiz content constants (placeholder copy)"
```

---

## Task 5: Quiz logic (pure function) — TDD

**Files:**
- Create: `src/components/InteractiveCore/quizLogic.ts`
- Test: `src/components/InteractiveCore/quizLogic.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write the failing test**

Create `src/components/InteractiveCore/quizLogic.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { computeResult } from './quizLogic';

describe('computeResult', () => {
  it('returns the acne result when q1 answer is acne', () => {
    const result = computeResult({ q1: 'acne' });
    expect(result.id).toBe('acne');
  });

  it('returns the dark-spot result when q1 answer is dark-spot', () => {
    const result = computeResult({ q1: 'dark-spot' });
    expect(result.id).toBe('dark-spot');
  });

  it('returns the scar result when q1 answer is scar', () => {
    const result = computeResult({ q1: 'scar' });
    expect(result.id).toBe('scar');
  });

  it('throws when q1 has not been answered', () => {
    expect(() => computeResult({})).toThrow();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run src/components/InteractiveCore/quizLogic.test.ts`
Expected: FAIL — `Cannot find module './quizLogic'` (file doesn't exist yet).

- [ ] **Step 4: Write minimal implementation**

Create `src/components/InteractiveCore/quizLogic.ts`:

```ts
import { quizResults, type QuizResult } from '../../content/quiz';

export function computeResult(answers: Record<string, string>): QuizResult {
  const primaryAnswerId = answers['q1'];
  const result = quizResults[primaryAnswerId];
  if (!result) {
    throw new Error(`No quiz result mapped for q1 answer: "${primaryAnswerId}"`);
  }
  return result;
}
```

This implements the MVP mapping rule decided in `docs/02-interaction-catalog.md`: result is derived from the first question (primary concern), which is the strongest signal for personalization at MVP scope.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run src/components/InteractiveCore/quizLogic.test.ts`
Expected: PASS — 4 tests passed.

- [ ] **Step 6: Commit**

```bash
git add package.json src/components/InteractiveCore/quizLogic.ts src/components/InteractiveCore/quizLogic.test.ts
git commit -m "feat: add quiz result computation with tests"
```

---

## Task 6: Track event placeholder

**Files:**
- Create: `src/lib/trackEvent.ts`

- [ ] **Step 1: Write the file**

```ts
export type TrackEventName =
  | 'interactive_core_view'
  | 'quiz_complete'
  | 'payoff_view'
  | 'form_submit';

export function trackEvent(name: TrackEventName, payload: Record<string, unknown> = {}): void {
  console.log(`[track] ${name}`, payload);
}
```

This is the placeholder described in `docs/05-build-spec.md` section 5 ("Đo lường") — analytics tool (TikTok Pixel/GA/custom) is not chosen yet; this function is the single integration point to swap in a real implementation later without touching call sites.

- [ ] **Step 2: Commit**

```bash
git add src/lib/trackEvent.ts
git commit -m "feat: add trackEvent placeholder for future analytics integration"
```

---

## Task 7: QuizFlow island — quiz step

**Files:**
- Create: `src/components/InteractiveCore/QuizFlow.tsx`

- [ ] **Step 1: Write the component with the quiz step only**

```tsx
import { useState } from 'react';
import { quizQuestions } from '../../content/quiz';
import { computeResult } from './quizLogic';
import { trackEvent } from '../../lib/trackEvent';

type Step = 'quiz' | 'payoff' | 'conversion' | 'done';

export default function QuizFlow() {
  const [step, setStep] = useState<Step>('quiz');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentQuestion = quizQuestions[questionIndex];

  function handleAnswer(optionId: string) {
    const nextAnswers = { ...answers, [currentQuestion.id]: optionId };
    setAnswers(nextAnswers);

    if (questionIndex < quizQuestions.length - 1) {
      setQuestionIndex(questionIndex + 1);
    } else {
      trackEvent('quiz_complete', { answers: nextAnswers });
      setStep('payoff');
    }
  }

  if (step === 'quiz') {
    return (
      <div className="bg-white rounded-soft p-5 shadow-lg shadow-cta/10">
        <div className="text-xs font-bold text-label-purple uppercase mb-2">
          Câu {questionIndex + 1}/{quizQuestions.length}
        </div>
        <div className="font-bold text-lg text-cta mb-4">{currentQuestion.question}</div>
        <div className="flex gap-2.5">
          {currentQuestion.options.map((option) => (
            <button
              key={option.id}
              onClick={() => handleAnswer(option.id)}
              className="flex-1 bg-white border-2 border-border-pink rounded-2xl py-4 px-2 text-center font-bold text-sm text-cta"
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
```

Note: this step intentionally only handles `step === 'quiz'` — payoff and conversion are added in Tasks 8 and 9. The `null` fallback is temporary and replaced by Task 8/9, not a permanent placeholder.

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/InteractiveCore/QuizFlow.tsx
git commit -m "feat: add QuizFlow island with quiz step"
```

---

## Task 8: QuizFlow island — payoff step

**Files:**
- Modify: `src/components/InteractiveCore/QuizFlow.tsx`

- [ ] **Step 1: Add payoff rendering**

Replace the final `return null;` block with:

```tsx
  if (step === 'payoff') {
    const result = computeResult(answers);

    return (
      <PayoffView
        result={result}
        onContinue={() => {
          trackEvent('payoff_view', { resultId: result.id });
          setStep('conversion');
        }}
      />
    );
  }

  return null;
}

function PayoffView({
  result,
  onContinue,
}: {
  result: ReturnType<typeof computeResult>;
  onContinue: () => void;
}) {
  return (
    <div className="bg-white rounded-soft p-5 shadow-lg shadow-cta/10 text-center">
      <div className="text-xs font-bold text-label-purple uppercase mb-2">Kết quả của bạn</div>
      <div className="font-extrabold text-xl text-cta mb-2">{result.title}</div>
      <p className="text-sm text-cta/80 mb-5">{result.description}</p>
      <button
        onClick={onContinue}
        className="inline-block bg-cta text-white font-bold text-sm py-3.5 px-9 rounded-soft"
      >
        Nhận tư vấn miễn phí →
      </button>
    </div>
  );
}
```

Note: `trackEvent('payoff_view', ...)` fires when the user views the payoff and clicks to continue — this matches the "xem payoff" measurement moment from `docs/05-build-spec.md` section 5, since the result is rendered immediately on entering this branch (no separate "viewed" vs "clicked" distinction needed at MVP scope).

- [ ] **Step 2: Verify it compiles**

Run: `npx astro check`
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/InteractiveCore/QuizFlow.tsx
git commit -m "feat: add payoff step to QuizFlow"
```

---

## Task 9: QuizFlow island — conversion form step

**Files:**
- Modify: `src/components/InteractiveCore/QuizFlow.tsx`

- [ ] **Step 1: Add conversion form rendering**

Replace the final `return null;` block (now after the `payoff` branch) with:

```tsx
  if (step === 'conversion') {
    return (
      <ConversionForm
        onSubmit={(name, phone) => {
          trackEvent('form_submit', { name, phone });
          setStep('done');
        }}
      />
    );
  }

  if (step === 'done') {
    return (
      <div className="bg-white rounded-soft p-5 shadow-lg shadow-cta/10 text-center">
        <div className="font-extrabold text-lg text-cta mb-2">Cảm ơn bạn!</div>
        <p className="text-sm text-cta/80">Đội ngũ tư vấn sẽ liên hệ với bạn sớm nhất.</p>
      </div>
    );
  }

  return null;
}

function ConversionForm({ onSubmit }: { onSubmit: (name: string, phone: string) => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      return;
    }
    onSubmit(name.trim(), phone.trim());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-soft p-5 shadow-lg shadow-cta/10 flex flex-col gap-3"
    >
      <div className="font-extrabold text-lg text-cta mb-1">Để lại thông tin để nhận tư vấn</div>
      <input
        type="text"
        placeholder="Tên của bạn"
        value={name}
        onChange={(event) => setName(event.target.value)}
        required
        className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm text-cta"
      />
      <input
        type="tel"
        placeholder="Số điện thoại"
        value={phone}
        onChange={(event) => setPhone(event.target.value)}
        required
        className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm text-cta"
      />
      <button
        type="submit"
        className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-2"
      >
        Gửi thông tin
      </button>
    </form>
  );
}
```

This is the minimal form per `docs/01-product-ux-spec.md` ("Conversion section ... ngắn nhất có thể: tên + số điện thoại là đủ"). No backend call — `onSubmit` only fires `trackEvent` and advances state, matching the "chưa nối backend thật" instruction in `docs/05-build-spec.md` checklist step 6.

- [ ] **Step 2: Add the `import React` needed for `React.FormEvent`**

At the top of the file, change:

```tsx
import { useState } from 'react';
```

to:

```tsx
import React, { useState } from 'react';
```

- [ ] **Step 3: Verify it compiles**

Run: `npx astro check`
Expected: no TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/InteractiveCore/QuizFlow.tsx
git commit -m "feat: add conversion form step to QuizFlow, completing the interactive flow"
```

---

## Task 10: Hook section (static)

**Files:**
- Create: `src/components/Hook/Hook.astro`

- [ ] **Step 1: Write the component**

```astro
<section class="bg-gradient-to-br from-pastel-pink via-pastel-lavender to-pastel-mint px-5 pt-10 pb-6 text-center">
  <h1 class="font-extrabold text-2xl text-cta leading-snug">Da bạn đang nói gì với bạn?</h1>
  <p class="text-sm text-cta/70 mt-1.5">Vuốt lên để khám phá ✨</p>
</section>
```

Copy here is placeholder per the same note as Task 4 — under 10 words per `docs/01-product-ux-spec.md` Hook section requirement ("câu hook ngắn dưới 10 từ").

- [ ] **Step 2: Commit**

```bash
git add src/components/Hook/Hook.astro
git commit -m "feat: add static Hook section"
```

---

## Task 11: Trust section (static)

**Files:**
- Create: `src/components/Trust/Trust.astro`

- [ ] **Step 1: Write the component**

```astro
<section class="bg-white px-5 py-8 text-center">
  <p class="text-xs text-label-purple uppercase font-bold mb-3">Được tin dùng bởi</p>
  <p class="text-sm text-cta/70">Hàng nghìn bạn trẻ đã tìm ra giải pháp phù hợp với làn da của mình.</p>
</section>
```

Placeholder per `docs/01-product-ux-spec.md` ("review ngắn, số liệu, hoặc UGC từ TikTok" — optional, no business numbers/UGC available yet).

- [ ] **Step 2: Commit**

```bash
git add src/components/Trust/Trust.astro
git commit -m "feat: add static Trust section"
```

---

## Task 12: Assemble the page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace the scaffold placeholder with the real page**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hook from '../components/Hook/Hook.astro';
import Trust from '../components/Trust/Trust.astro';
import QuizFlow from '../components/InteractiveCore/QuizFlow';
---
<BaseLayout title="Tìm giải pháp cho làn da của bạn">
  <Hook />
  <section class="bg-gradient-to-br from-pastel-lavender to-pastel-mint px-5 py-8">
    <QuizFlow client:load />
  </section>
  <Trust />
</BaseLayout>
```

`client:load` hydrates the island immediately since the interactive core is positioned right after the hook (per `docs/01-product-ux-spec.md`: "không chôn sâu phía dưới trang") — the user reaches it within the first scroll, so deferring hydration with `client:visible` would not save meaningful load time here.

- [ ] **Step 2: Run the dev server and manually verify the full flow**

Run: `npm run dev`, open `http://localhost:4321`.
Expected: Hook renders, quiz shows question 1/3, answering all 3 questions shows the payoff, clicking continue shows the conversion form, submitting shows the thank-you message, Trust section renders below.

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: all quizLogic tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: assemble landing page from Hook, QuizFlow, and Trust sections"
```

---

## Task 13: Production build and mobile performance check

**Files:** none (verification task)

- [ ] **Step 1: Build for production**

Run: `npm run build`
Expected: build succeeds, output written to `dist/`.

- [ ] **Step 2: Preview the production build**

Run: `npm run preview`
Expected: server starts serving the built `dist/` output.

- [ ] **Step 3: Run a mobile Lighthouse audit**

In Chrome DevTools on the preview URL: open Lighthouse panel, select "Mobile" device, run an audit with throttled network (DevTools default mobile throttling).
Expected: Performance score reasonably high (no hard numeric gate defined yet in specs — if score reveals an obvious regression, such as unoptimized font loading or render-blocking resources, fix it before proceeding; do not block indefinitely on a specific score since no target number is set in `docs/00-overview.md`).

This is the acceptance check named in `docs/05-build-spec.md` checklist step 9 ("Kiểm tra hiệu năng tải trên mô phỏng mobile/mạng chậm ... trước khi coi là xong").

- [ ] **Step 4: Stop the preview server**

Press Ctrl+C in the terminal running `npm run preview`.

---

## Self-Review Notes (completed during plan writing)

- **Spec coverage:** Task 1-3 cover `05-build-spec.md` checklist steps 1-2; Task 4 covers content placeholder note (`03-open-questions.md`); Tasks 5, 7-9 cover checklist steps 3 (quiz) and the MVP mapping from `02-interaction-catalog.md`; Task 8 covers checklist step 5 (payoff); Task 9 covers checklist step 6 (conversion form, no backend); Task 6 covers checklist step 8 (event hooks); Task 10-11 cover Hook/Trust sections from `01-product-ux-spec.md`; Task 12 assembles the full flow per the page structure; Task 13 covers checklist step 9 (mobile performance). Progress mechanic (a separate progress bar element) was scoped out of this plan — see note below.
- **Scope note on progress mechanic:** `02-interaction-catalog.md` recommends combining quiz with a progress mechanic. This plan's `QuizFlow` already shows "Câu N/3" as a lightweight progress indicator inline with the question (Task 7), which satisfies the MVP intent (signal progress, encourage completion) without a separate scroll-tracking component — scroll-based progress tracking across the whole page was not specified with enough detail in `01-product-ux-spec.md` to plan concretely and would need its own brainstorm if wanted beyond this inline indicator.
- **Type consistency check:** `QuizResult` (Task 4) is used identically in `quizLogic.ts` (Task 5) and `QuizFlow.tsx` (Task 8). `Record<string, string>` for answers is consistent across Task 5 test, Task 7 state, Task 8 usage. `TrackEventName` values used in Tasks 7-9 (`quiz_complete`, `payoff_view`, `form_submit`) match the literal union defined in Task 6 — `interactive_core_view` is defined but not called anywhere in this plan, which is a minor gap (see below).
- **Gap found and accepted:** `interactive_core_view` event (entering the interactive core) is never fired in this plan — Task 7's quiz step would be the natural place, but since QuizFlow hydrates with `client:load` immediately on page load (Task 12), there's no distinct "user reached this section" moment to detect without scroll-observer logic, which is out of scope for MVP. Documented here rather than silently left unfired.
