# Quiz Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand quiz from 3 → 6 questions, compute 5 distinct skin profiles via priority waterfall, add smooth answer transitions, progress bar, selected states, and program card selection.

**Architecture:** Quiz data lives in `quiz.ts` (types + questions + result content). Logic lives in `quizLogic.ts` (pure function, priority waterfall). All UI in `AppFlow.tsx` (state + screens). CSS animation added to `global.css`.

**Tech Stack:** React 19, Tailwind CSS v3 (violet-* built-in colors used), Vitest 4, TypeScript 5, Astro 5.

---

## File Map

| File | Change |
|------|--------|
| `src/content/quiz.ts` | Full rewrite — new QuizResult interface, q6Options export, 6 questions, 5 results |
| `src/components/InteractiveCore/quizLogic.ts` | Full rewrite — priority waterfall replacing single-answer lookup |
| `src/components/InteractiveCore/quizLogic.test.ts` | Full rewrite — 9 test cases covering all 5 priorities |
| `src/styles/global.css` | Add `@keyframes quizSlideIn` + `.quiz-slide-in` class |
| `src/components/AppFlow.tsx` | Incremental updates across Tasks 3–7 |

---

### Task 1: Rewrite quiz.ts

**Files:**
- Modify: `src/content/quiz.ts`

- [ ] **Step 1: Replace the entire file:**

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
  skinCondition: string;
  solution: string;
  suggestedProgram: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Bạn là nam hay nữ?',
    options: [
      { id: 'nu', label: 'Nữ' },
      { id: 'nam', label: 'Nam' },
    ],
  },
  {
    id: 'q2',
    question: 'Da bạn có đang bị mụn sưng đỏ, đau không?',
    options: [
      { id: 'co', label: 'Có' },
      { id: 'khong', label: 'Không' },
    ],
  },
  {
    id: 'q3',
    question: 'Bạn có bị mụn đầu đen hoặc lỗ chân lông to không?',
    options: [
      { id: 'co', label: 'Có' },
      { id: 'khong', label: 'Không' },
    ],
  },
  {
    id: 'q4',
    question: 'Bạn đã từng dùng sữa rửa mặt hoặc sản phẩm chăm sóc da chưa?',
    options: [
      { id: 'da-dung', label: 'Đã dùng' },
      { id: 'chua-bao-gio', label: 'Chưa bao giờ' },
    ],
  },
  {
    id: 'q5',
    question: 'Sau khi rửa mặt, da bạn thường cảm thấy thế nào?',
    options: [
      { id: 'nhon', label: '💧 Nhờn bóng trở lại sau 1–2 tiếng' },
      { id: 'cang-rat', label: '🌵 Căng rát, đôi khi hơi đỏ' },
      { id: 'binh-thuong', label: 'Da tôi cảm thấy bình thường' },
    ],
  },
  {
    id: 'q6',
    question: 'Mụn hay nổi nhiều hơn vào lúc nào?',
    options: [], // replaced at render time based on q1 answer
  },
];

export const q6Options: Record<'nu' | 'nam', QuizOption[]> = {
  nu: [
    { id: 'ky-kinh', label: '🌙 Trước hoặc trong kỳ kinh' },
    { id: 'stress', label: '😩 Khi stress, thức khuya' },
    { id: 'khong-ro', label: 'Tôi cũng không rõ nữa' },
  ],
  nam: [
    { id: 'do-ngot', label: '🍕 Sau khi ăn đồ ngọt, chiên xào' },
    { id: 'stress', label: '😩 Khi stress, thức khuya' },
    { id: 'khong-ro', label: 'Tôi cũng không rõ nữa' },
  ],
};

export const quizResults: Record<string, QuizResult> = {
  'mun-noi-tiet': {
    id: 'mun-noi-tiet',
    title: 'Da bạn đang bị mụn nội tiết',
    skinCondition:
      'Mụn nổi theo chu kỳ kinh nguyệt, tập trung vùng cằm và má dưới — thường sưng đỏ trước kỳ kinh rồi tự giảm.',
    solution:
      'Ưu tiên liệu trình nhẹ nhàng, kháng viêm. Tập trung cân bằng da thay vì tấn công mụn trực tiếp.',
    suggestedProgram: 'chuyen-sau',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    title: 'Da bạn nhạy cảm + mụn dai dẳng',
    skinCondition:
      'Skin barrier yếu, da căng rát sau rửa mặt, dễ kích ứng với sản phẩm mới. Mụn viêm tái đi tái lại dù đã thử nhiều cách.',
    solution:
      'Phục hồi barrier trước (ceramide, niacinamide), sau đó mới điều trị mụn. Tránh acid mạnh và scrub vật lý.',
    suggestedProgram: 'toan-dien',
  },
  'da-nhon-mun-viem': {
    id: 'da-nhon-mun-viem',
    title: 'Da bạn nhờn + mụn viêm',
    skinCondition:
      'Tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm liên tục đặc biệt vùng chữ T.',
    solution:
      'Kiểm soát dầu + kháng khuẩn nhẹ, BHA thông tắc lỗ chân lông, niacinamide giảm bã nhờn.',
    suggestedProgram: 'chuyen-sau',
  },
  'lo-chan-long': {
    id: 'lo-chan-long',
    title: 'Da bạn có lỗ chân lông + mụn đầu đen',
    skinCondition:
      'Không có mụn viêm nhưng lỗ chân lông to rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm.',
    solution:
      'Exfoliating routine nhẹ (BHA 1–2%), clay mask 1–2 lần/tuần. Không cần kháng sinh hay kháng viêm.',
    suggestedProgram: 'khoi-dau',
  },
  'da-moi-bat-dau': {
    id: 'da-moi-bat-dau',
    title: 'Da bạn chưa có routine rõ ràng',
    skinCondition:
      'Chưa có thói quen chăm sóc da hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.',
    solution:
      'Bắt đầu từ basic routine: cleanser nhẹ + moisturizer + SPF. Tư vấn 1:1 để xác định nhu cầu.',
    suggestedProgram: 'khoi-dau',
  },
};
```

- [ ] **Step 2: Do NOT commit yet** — `quizLogic.ts` still uses old keys and will fail TypeScript until Task 2 is done.

---

### Task 2: Rewrite quizLogic.ts (TDD)

**Files:**
- Modify: `src/components/InteractiveCore/quizLogic.ts`
- Modify: `src/components/InteractiveCore/quizLogic.test.ts`

- [ ] **Step 1: Replace quizLogic.test.ts** with the new failing tests:

```ts
import { describe, it, expect } from 'vitest';
import { computeResult } from './quizLogic';

const base = {
  q1: 'nu',
  q2: 'co',
  q3: 'khong',
  q4: 'da-dung',
  q5: 'binh-thuong',
  q6: 'stress',
};

describe('computeResult — priority waterfall', () => {
  it('P1: returns mun-noi-tiet for nu + mun do + ky-kinh', () => {
    expect(computeResult({ ...base, q1: 'nu', q2: 'co', q6: 'ky-kinh' }).id).toBe('mun-noi-tiet');
  });

  it('P1: does not trigger for nam even with ky-kinh', () => {
    const result = computeResult({ ...base, q1: 'nam', q2: 'co', q6: 'ky-kinh' });
    expect(result.id).not.toBe('mun-noi-tiet');
  });

  it('P2: returns da-nhay-cam for mun do + da-dung + cang-rat', () => {
    expect(computeResult({ ...base, q2: 'co', q4: 'da-dung', q5: 'cang-rat', q6: 'stress' }).id).toBe('da-nhay-cam');
  });

  it('P2: does not trigger when q5 is missing (q4=chua-bao-gio)', () => {
    const result = computeResult({ ...base, q2: 'co', q4: 'chua-bao-gio', q5: undefined as any, q6: 'stress' });
    expect(result.id).not.toBe('da-nhay-cam');
  });

  it('P3: returns da-nhon-mun-viem for mun do + q5 nhon', () => {
    expect(computeResult({ ...base, q2: 'co', q5: 'nhon' }).id).toBe('da-nhon-mun-viem');
  });

  it('P3: returns da-nhon-mun-viem for mun do + chua-bao-gio (q5 skipped)', () => {
    expect(computeResult({ ...base, q2: 'co', q4: 'chua-bao-gio', q5: undefined as any }).id).toBe('da-nhon-mun-viem');
  });

  it('P4: returns lo-chan-long for khong mun do + co mun dau den', () => {
    expect(computeResult({ ...base, q2: 'khong', q3: 'co' }).id).toBe('lo-chan-long');
  });

  it('P5: returns da-moi-bat-dau as fallback', () => {
    expect(computeResult({ ...base, q2: 'khong', q3: 'khong' }).id).toBe('da-moi-bat-dau');
  });

  it('result always has all required fields', () => {
    const result = computeResult(base);
    expect(result.id).toBeTruthy();
    expect(result.title).toBeTruthy();
    expect(result.skinCondition).toBeTruthy();
    expect(result.solution).toBeTruthy();
    expect(result.suggestedProgram).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```
npm test
```

Expected: errors like `No quiz result mapped for q1 answer: "nu"` or similar. This confirms the old logic is still in place.

- [ ] **Step 3: Replace quizLogic.ts** with the priority waterfall:

```ts
import { quizResults, type QuizResult } from '../../content/quiz';

export function computeResult(answers: Record<string, string>): QuizResult {
  if (answers.q1 === 'nu' && answers.q2 === 'co' && answers.q6 === 'ky-kinh') {
    return quizResults['mun-noi-tiet'];
  }
  if (answers.q2 === 'co' && answers.q4 === 'da-dung' && answers.q5 === 'cang-rat') {
    return quizResults['da-nhay-cam'];
  }
  if (answers.q2 === 'co') {
    return quizResults['da-nhon-mun-viem'];
  }
  if (answers.q2 === 'khong' && answers.q3 === 'co') {
    return quizResults['lo-chan-long'];
  }
  return quizResults['da-moi-bat-dau'];
}
```

- [ ] **Step 4: Run tests — expect pass**

```
npm test
```

Expected: 9 tests pass, 0 failures.

- [ ] **Step 5: Commit Tasks 1 and 2 together**

```bash
git add src/content/quiz.ts src/components/InteractiveCore/quizLogic.ts src/components/InteractiveCore/quizLogic.test.ts
git commit -m "feat: rewrite quiz data — 6 questions, 5 skin profiles, priority waterfall"
```

---

### Task 3: AppFlow.tsx — quizResult state + PayoffView

**Files:**
- Modify: `src/components/AppFlow.tsx`

- [ ] **Step 1: Update the import line at the top** (replace the existing quiz import):

```ts
import { quizQuestions } from '../content/quiz';
import type { QuizResult } from '../content/quiz';
import { computeResult } from './InteractiveCore/quizLogic';
import { trackEvent } from '../lib/trackEvent';
```

- [ ] **Step 2: Add `quizResult` state** inside AppFlow, after the `answers` state declaration:

```tsx
const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
```

- [ ] **Step 3: Replace the `else` branch of `handleAnswer`** (the quiz-complete path) with:

```tsx
} else {
  const result = computeResult(nextAnswers);
  setQuizResult(result);
  trackEvent('quiz_complete', { answers: nextAnswers });
  transitionTo('payoff');
}
```

- [ ] **Step 4: Replace the `{step === 'payoff' && ...}` block** in AppFlow's return:

```tsx
{step === 'payoff' && quizResult && (
  <PayoffView
    result={quizResult}
    onContinue={() => {
      trackEvent('payoff_view', { resultId: quizResult.id });
      transitionTo('programs');
    }}
  />
)}
```

- [ ] **Step 5: Replace the PayoffView function** (currently lines 146–168):

```tsx
function PayoffView({
  result,
  onContinue,
}: {
  result: QuizResult;
  onContinue: () => void;
}) {
  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 text-center animate-fade-in-up">
        <div className="text-xs font-bold text-label-purple uppercase mb-2">Kết quả của bạn</div>
        <div className="font-extrabold text-xl text-cta mb-3">{result.title}</div>
        <p className="text-sm text-cta/80 mb-2 text-left">{result.skinCondition}</p>
        <p className="text-sm font-semibold text-cta/90 mb-5 text-left">💡 {result.solution}</p>
        <button
          onClick={onContinue}
          className="inline-block bg-cta text-white font-bold text-sm py-3.5 px-9 rounded-soft"
        >
          Xem chương trình phù hợp →
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Check for TypeScript errors**

```bash
npx astro check
```

Expected: no new errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "feat: wire quizResult state, update PayoffView — skinCondition + solution"
```

---

### Task 4: global.css — slide animation

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Append to the end of `src/styles/global.css`:**

```css
@keyframes quizSlideIn {
  from { transform: translateX(60px); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
.quiz-slide-in {
  animation: quizSlideIn 220ms ease forwards;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add quiz-slide-in animation (220ms, slide from right)"
```

---

### Task 5: AppFlow.tsx — QuizScreen (progress bar + animation + selected state + Q5 skip + gender Q6)

**Files:**
- Modify: `src/components/AppFlow.tsx`

- [ ] **Step 1: Add `q6Options` to the quiz import** (update existing import line):

```ts
import { quizQuestions, q6Options } from '../content/quiz';
import type { QuizResult } from '../content/quiz';
```

- [ ] **Step 2: Add `pendingAnswer` state** in AppFlow, after `quizResult`:

```tsx
const [pendingAnswer, setPendingAnswer] = useState<string | null>(null);
```

- [ ] **Step 3: Add `getNextQuestionIndex` helper** before `handleAnswer`:

```tsx
function getNextQuestionIndex(currentIndex: number, currentAnswers: Record<string, string>): number {
  if (currentIndex === 3 && currentAnswers['q4'] === 'chua-bao-gio') {
    return 5; // skip Q5 (index 4), jump directly to Q6 (index 5)
  }
  return currentIndex + 1;
}
```

- [ ] **Step 4: Replace `handleAnswer` entirely:**

```tsx
function handleAnswer(optionId: string) {
  if (pendingAnswer) return; // prevent double-tap during animation delay
  setPendingAnswer(optionId);

  const currentQuestion = quizQuestions[questionIndex];
  const nextAnswers = { ...answers, [currentQuestion.id]: optionId };

  setTimeout(() => {
    setAnswers(nextAnswers);
    setPendingAnswer(null);

    if (questionIndex === quizQuestions.length - 1) {
      const result = computeResult(nextAnswers);
      setQuizResult(result);
      trackEvent('quiz_complete', { answers: nextAnswers });
      transitionTo('payoff');
    } else {
      setQuestionIndex(getNextQuestionIndex(questionIndex, nextAnswers));
    }
  }, 150);
}
```

- [ ] **Step 5: Replace the `{step === 'quiz' && ...}` block** in AppFlow's return:

```tsx
{step === 'quiz' && (
  <QuizScreen
    questionIndex={questionIndex}
    question={
      questionIndex === 5
        ? { ...quizQuestions[5], options: q6Options[(answers['q1'] as 'nu' | 'nam') ?? 'nu'] }
        : quizQuestions[questionIndex]
    }
    pendingAnswer={pendingAnswer}
    onAnswer={handleAnswer}
  />
)}
```

- [ ] **Step 6: Replace the QuizScreen function:**

```tsx
function QuizScreen({
  questionIndex,
  question,
  pendingAnswer,
  onAnswer,
}: {
  questionIndex: number;
  question: { id: string; question: string; options: { id: string; label: string }[] };
  pendingAnswer: string | null;
  onAnswer: (optionId: string) => void;
}) {
  const isVertical = question.options.length > 2;
  const progress = ((questionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="h-screen w-full bg-pastel-mint flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-white rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-xs font-bold text-label-purple uppercase mb-1">
          Câu {questionIndex + 1} / {quizQuestions.length}
        </div>
        <div className="h-[5px] bg-violet-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full"
            style={{ width: `${progress}%`, transition: 'width 400ms ease' }}
          />
        </div>
        <div key={questionIndex} className="quiz-slide-in">
          <div className="font-bold text-lg text-cta mb-4">{question.question}</div>
          <div className={isVertical ? 'flex flex-col gap-2.5' : 'flex gap-2.5'}>
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => onAnswer(option.id)}
                disabled={!!pendingAnswer}
                className={[
                  isVertical ? 'w-full text-left px-4' : 'flex-1 text-center px-2',
                  'relative border-2 rounded-2xl py-4 font-bold text-sm text-cta',
                  'transition-colors duration-[160ms]',
                  pendingAnswer === option.id
                    ? 'border-violet-600 bg-violet-100'
                    : 'border-border-pink hover:border-violet-400 hover:bg-violet-50',
                ].join(' ')}
              >
                {option.label}
                {pendingAnswer === option.id && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-violet-600 font-bold text-base">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "feat: QuizScreen — progress bar, slide animation, selected state, Q5 skip, gender Q6"
```

---

### Task 6: AppFlow.tsx — ProgramsScreen card selection

**Files:**
- Modify: `src/components/AppFlow.tsx`

- [ ] **Step 1: Add `selectedProgram` state** in AppFlow, after `quizResult`:

```tsx
const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
```

- [ ] **Step 2: In `handleAnswer`, replace the quiz-complete branch** (the `if (questionIndex === quizQuestions.length - 1)` block) with:

```tsx
if (questionIndex === quizQuestions.length - 1) {
  const result = computeResult(nextAnswers);
  setQuizResult(result);
  setSelectedProgram(result.suggestedProgram);
  trackEvent('quiz_complete', { answers: nextAnswers });
  transitionTo('payoff');
} else {
  setQuestionIndex(getNextQuestionIndex(questionIndex, nextAnswers));
}
```

- [ ] **Step 3: Replace the PROGRAMS constant** (add `id` field to each entry):

```tsx
const PROGRAMS = [
  {
    id: 'khoi-dau',
    name: 'Khởi đầu',
    duration: '4 tuần',
    description: 'Phù hợp với mụn nhẹ, lần đầu điều trị. Liệu trình cơ bản giúp làm sạch da và kiểm soát dầu.',
  },
  {
    id: 'chuyen-sau',
    name: 'Chuyên sâu',
    duration: '8 tuần',
    description: 'Kết hợp nhiều bước điều trị, phù hợp mụn từ trung bình. Tập trung vào nguyên nhân gốc rễ.',
  },
  {
    id: 'toan-dien',
    name: 'Toàn diện',
    duration: '12 tuần',
    description: 'Dành cho mụn nặng và tái phát. Kết hợp chăm sóc da và tư vấn dinh dưỡng, nội tiết.',
  },
];
```

- [ ] **Step 4: Replace the `{step === 'programs' && ...}` block:**

```tsx
{step === 'programs' && (
  <ProgramsScreen
    initialSelected={selectedProgram ?? 'khoi-dau'}
    onContinue={(programId) => {
      setSelectedProgram(programId);
      transitionTo('conversion');
    }}
  />
)}
```

- [ ] **Step 5: Replace the ProgramsScreen function:**

```tsx
function ProgramsScreen({
  initialSelected,
  onContinue,
}: {
  initialSelected: string;
  onContinue: (programId: string) => void;
}) {
  const [selected, setSelected] = useState(initialSelected);

  return (
    <div className="h-screen w-full bg-pastel-lavender flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-2xl w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-xs font-bold text-label-purple uppercase mb-1">Chương trình của chúng tôi</div>
          <div className="font-extrabold text-xl text-cta">Chương trình trị mụn phù hợp với bạn</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {PROGRAMS.map((program) => (
            <button
              key={program.id}
              onClick={() => setSelected(program.id)}
              className={[
                'text-left rounded-soft p-5 shadow-md shadow-cta/10 flex flex-col gap-2',
                'border-2 transition-colors duration-[160ms]',
                selected === program.id
                  ? 'bg-violet-50 border-violet-600'
                  : 'bg-white border-transparent hover:border-violet-400',
              ].join(' ')}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-base text-cta">{program.name}</div>
                {selected === program.id && (
                  <span className="text-violet-600 font-bold text-sm">✓</span>
                )}
              </div>
              <div className="text-xs font-bold text-label-purple">{program.duration}</div>
              <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={() => onContinue(selected)}
            className={[
              'font-bold text-sm py-3.5 px-9 rounded-soft transition-colors duration-200',
              selected ? 'bg-violet-600 text-white hover:bg-violet-700' : 'bg-cta text-white hover:opacity-90',
            ].join(' ')}
          >
            {`Đăng ký chương trình ${PROGRAMS.find((p) => p.id === selected)?.name} →`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "feat: ProgramsScreen — card selection, pre-select from quiz result, dynamic CTA"
```

---

### Task 7: AppFlow.tsx — ConversionForm shows selected program

**Files:**
- Modify: `src/components/AppFlow.tsx`

- [ ] **Step 1: Replace the `{step === 'conversion' && ...}` block:**

```tsx
{step === 'conversion' && (
  <ConversionForm
    selectedProgram={selectedProgram}
    onSubmit={(name, phone) => {
      trackEvent('form_submit', { name, phone, program: selectedProgram });
      transitionTo('done');
    }}
  />
)}
```

- [ ] **Step 2: Replace the ConversionForm function:**

```tsx
function ConversionForm({
  selectedProgram,
  onSubmit,
}: {
  selectedProgram: string | null;
  onSubmit: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const programName = selectedProgram
    ? PROGRAMS.find((p) => p.id === selectedProgram)?.name
    : null;

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
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && (
          <p className="text-sm text-cta/70 -mt-2 mb-1">
            Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.
          </p>
        )}
        <input
          type="text"
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 border-border-lavender rounded-2xl py-3 px-4 text-sm text-cta"
        />
        <input
          type="tel"
          placeholder="Số điện thoại"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
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
    </div>
  );
}
```

- [ ] **Step 3: Run full check**

```bash
npx astro check && npm test
```

Expected: no TypeScript errors, 9 tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppFlow.tsx
git commit -m "feat: ConversionForm — show selected program name, contextual heading"
```
