# v04 Compound Variants Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm 2 compound variant và recipe v04, gộp programs+Q&A và conversion+testimonials thành 2 màn scrollable, giảm số bước cảm nhận từ 7 xuống 5.

**Architecture:** Compound variant — mỗi "màn ghép" là một variant duy nhất của slot hiện có, tự render hai phần content trong một `h-[100dvh] overflow-y-auto` container. `LandingFlow`, `slots.ts`, `validateRecipe` không đổi. `socialProof` bị bỏ qua trong v04 nhờ logic nhánh động `nextAfterConversion` kiểm tra `recipe.slots.socialProof` hiện có trong `LandingFlow.tsx:29`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind 3, Vitest, CSS vars (`--lp-*`), font Be Vietnam Pro.

---

### Task 1: Tests + stub components + recipe infrastructure

**Files:**
- Modify: `src/landing/__tests__/validateRecipe.test.ts`
- Modify: `src/landing/__tests__/registry.test.ts`
- Create: `src/landing/variants/programs/grid-with-faq.tsx` (stub)
- Create: `src/landing/variants/conversion/short-form-with-testimonials.tsx` (stub)
- Create: `src/landing/recipes/v04-combined.ts`
- Modify: `src/landing/registry.ts`
- Modify: `src/landing/recipes/index.ts`

- [ ] **Step 1: Thêm test validateRecipe cho v04**

Mở `src/landing/__tests__/validateRecipe.test.ts`. Thêm vào cuối block `describe('validateRecipe', ...)`:

```ts
it('passes v04 recipe using compound variant ids', () => {
  const reg4 = {
    ...reg,
    hook:       { ...reg.hook,       'bold-single': {} },
    minigame:   { ...reg.minigame,   'face-map': {} },
    programs:   { ...reg.programs,   'grid-with-faq': {} },
    conversion: { ...reg.conversion, 'short-form-with-testimonials': {} },
    done:       { 'contact-info': {} },
  };
  const v04 = {
    id: 'v04-combined', label: 'v04', slots: {
      hook: 'bold-single', minigame: 'face-map', payoff: 'confetti-card',
      programs: 'grid-with-faq', conversion: 'short-form-with-testimonials',
      done: 'contact-info',
    },
  };
  expect(validateRecipe(v04 as any, reg4).valid).toBe(true);
});
```

- [ ] **Step 2: Chạy validateRecipe test — verify PASS**

```bash
npx vitest run src/landing/__tests__/validateRecipe.test.ts --reporter=verbose
```

Kết quả mong đợi: tất cả PASS (test mới dùng mock reg, không cần component thật).

- [ ] **Step 3: Thêm registry tests cho 2 variant mới**

Mở `src/landing/__tests__/registry.test.ts`. Thêm vào cuối block `describe('registry', ...)`:

```ts
it('programs grid-with-faq là component', () => expect(typeof registry.programs['grid-with-faq']).toBe('function'));
it('conversion short-form-with-testimonials là component', () => expect(typeof registry.conversion['short-form-with-testimonials']).toBe('function'));
```

- [ ] **Step 4: Chạy registry test — verify FAIL**

```bash
npx vitest run src/landing/__tests__/registry.test.ts --reporter=verbose
```

Kết quả mong đợi: 2 test mới FAIL với `expected 'undefined' to be 'function'`.

- [ ] **Step 5: Tạo stub `grid-with-faq.tsx`**

Tạo file `src/landing/variants/programs/grid-with-faq.tsx`:

```tsx
'use client';
import type { ProgramsSlotProps } from '../../slots';

export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center">
      <button onClick={() => onContinue(suggestedProgramId)} className="bg-cta text-white px-6 py-3 rounded-soft font-bold">
        [stub] Đặt lịch
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Tạo stub `short-form-with-testimonials.tsx`**

Tạo file `src/landing/variants/conversion/short-form-with-testimonials.tsx`:

```tsx
'use client';
import type { ConversionSlotProps } from '../../slots';

export function ShortFormWithTestimonialsConversion({ onSubmit }: ConversionSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center">
      <button onClick={() => onSubmit('stub', '0900000000')} className="bg-cta text-white px-6 py-3 rounded-soft font-bold">
        [stub] Gửi
      </button>
    </div>
  );
}
```

- [ ] **Step 7: Đăng ký 2 variant vào `registry.ts`**

Mở `src/landing/registry.ts`. Thêm 2 dòng import sau các import hiện có:

```ts
import { GridWithFaqPrograms } from './variants/programs/grid-with-faq';
import { ShortFormWithTestimonialsConversion } from './variants/conversion/short-form-with-testimonials';
```

Cập nhật 2 key trong object `registry` (giữ nguyên các key cũ, thêm key mới):

```ts
programs:    { grid: GridPrograms, carousel: CarouselPrograms, 'grid-with-faq': GridWithFaqPrograms } as Record<string, ComponentType<ProgramsSlotProps>>,
conversion:  { 'short-form': ShortFormConversion, 'short-form-with-testimonials': ShortFormWithTestimonialsConversion } as Record<string, ComponentType<ConversionSlotProps>>,
```

- [ ] **Step 8: Tạo recipe `v04-combined.ts`**

Tạo file `src/landing/recipes/v04-combined.ts`:

```ts
import type { Recipe } from '../validateRecipe';

export const v04Combined: Recipe = {
  id: 'v04-combined',
  label: 'v04 — Programs+FAQ / Conversion+Testimonial',
  theme: 'ocean',
  slots: {
    hook:       'bold-single',
    minigame:   'face-map',
    payoff:     'confetti-card',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info',
  },
};
```

- [ ] **Step 9: Export recipe trong `recipes/index.ts`**

Mở `src/landing/recipes/index.ts`. Thêm import và thêm vào `allRecipes`:

```ts
import { v01Baseline } from './v01-baseline';
import { v02Skincare } from './v02-skincare';
import { v03Facemap } from './v03-facemap';
import { v04Combined } from './v04-combined';
import type { Recipe } from '../validateRecipe';

export const allRecipes: Recipe[] = [v01Baseline, v02Skincare, v03Facemap, v04Combined];
export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}
```

- [ ] **Step 10: Chạy toàn bộ test — verify PASS**

```bash
npx vitest run --reporter=verbose
```

Kết quả mong đợi: tất cả PASS, bao gồm 2 registry tests mới.

- [ ] **Step 11: Commit**

```bash
git add src/landing/__tests__/validateRecipe.test.ts src/landing/__tests__/registry.test.ts src/landing/variants/programs/grid-with-faq.tsx src/landing/variants/conversion/short-form-with-testimonials.tsx src/landing/registry.ts src/landing/recipes/v04-combined.ts src/landing/recipes/index.ts
git commit -m "feat(landing/v04): stub components + registry entries + recipe v04-combined"
```

---

### Task 2: Implement `grid-with-faq.tsx` (full component)

**Files:**
- Modify: `src/landing/variants/programs/grid-with-faq.tsx`

- [ ] **Step 1: Ghi đè stub bằng implementation đầy đủ**

Ghi lại toàn bộ `src/landing/variants/programs/grid-with-faq.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import { getPrograms, getConditionById } from '../../../content/catalog';
import { trackEvent } from '../../../lib/trackEvent';

const FAQ_ITEMS = [
  {
    q: 'IPL có thực sự hiệu quả với mụn viêm và thâm không?',
    a: 'Có. IPL phát ra ánh sáng cường độ cao nhắm vào vi khuẩn P.acnes dưới da, giảm viêm mà không cần kháng sinh. Thâm mụn mờ dần nhờ kích thích tái tạo collagen. Hiệu quả thấy rõ sau 2–3 buổi.',
  },
  {
    q: 'IPL có đau không?',
    a: 'Cảm giác như chun bắn nhẹ vào da, thoáng qua. Hầu hết khách hàng chịu được hoàn toàn mà không cần gây tê. Da hơi ửng đỏ sau 1–2 tiếng rồi trở lại bình thường.',
  },
  {
    q: 'Cần bao nhiêu buổi để thấy rõ kết quả?',
    a: 'Thường 3–5 buổi, cách nhau 3–4 tuần. Mụn viêm cải thiện từ buổi thứ 2, thâm mờ rõ từ buổi thứ 3. Bác sĩ sẽ điều chỉnh số buổi sau khi khám tình trạng da thực tế.',
  },
  {
    q: 'IPL có phù hợp với da nhạy cảm không?',
    a: 'Phần lớn da nhạy cảm vẫn dùng được IPL với thông số phù hợp. Bác sĩ sẽ test vùng nhỏ trước buổi đầu tiên để đảm bảo an toàn.',
  },
  {
    q: 'Sau buổi trị có cần nghỉ dưỡng không?',
    a: 'Không cần nghỉ dưỡng — bạn có thể đi làm ngay sau buổi trị. Chỉ cần tránh nắng trực tiếp và dùng kem chống nắng SPF30+ trong 3–5 ngày.',
  },
];

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-soft border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-bg-card)]">
      {FAQ_ITEMS.map((item, i) => (
        <div key={i} className={i < FAQ_ITEMS.length - 1 ? 'border-b border-[var(--lp-border)]' : ''}>
          <button
            type="button"
            onClick={() => {
              const next = openIdx === i ? null : i;
              setOpenIdx(next);
              if (next !== null) trackEvent('faq_item_open', { index: next });
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-cta hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span>{item.q}</span>
            <ChevronIcon open={openIdx === i} />
          </button>
          <div
            className="overflow-hidden transition-all duration-200"
            style={{ maxHeight: openIdx === i ? '200px' : '0px' }}
          >
            <p className="px-4 pb-4 text-sm text-cta/70 leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);

  const program = getPrograms().find(p => p.id === suggestedProgramId);
  const cond = program ? getConditionById(program.treatsConditions[0]) : null;
  const tint = cond?.color ?? '#A0AEC0';

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-5">
        <p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center">
          Gợi ý liệu trình cho bạn
        </p>

        {program && (
          <div className="bg-[var(--lp-bg-card)] rounded-soft shadow-lg shadow-cta/10 overflow-hidden">
            <div className="px-5 py-4" style={{ background: `${tint}CC` }}>
              <span className="inline-block text-xs font-bold bg-white/30 text-white px-2.5 py-0.5 rounded-full mb-2">
                Phù hợp nhất
              </span>
              <h2 className="text-lg font-extrabold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>
                {program.name}
              </h2>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {program.treatsConditions.map(cid => {
                  const c = getConditionById(cid);
                  return (
                    <span key={cid}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ background: c ? `${c.color}22` : '#e8e8e8', color: c ? c.color : '#555', filter: 'brightness(0.82)' }}>
                      <span className="w-2 h-2 rounded-full" style={{ background: c?.color ?? '#999' }} />
                      {c?.label ?? cid}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => onContinue(suggestedProgramId)}
          className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft w-full hover:opacity-90 transition-opacity"
        >
          Đặt lịch với liệu trình này
        </button>

        <div className="flex items-center gap-3 my-1">
          <hr className="flex-1 border-[var(--lp-border)]" />
          <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Câu hỏi thường gặp</span>
          <hr className="flex-1 border-[var(--lp-border)]" />
        </div>

        <p className="text-xs text-cta/40 text-center -mt-2">↓ Kéo xuống để đọc</p>

        <FaqAccordion />
        <div className="h-4" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Chạy test — verify PASS**

```bash
npx vitest run --reporter=verbose
```

Kết quả mong đợi: tất cả PASS.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/programs/grid-with-faq.tsx
git commit -m "feat(landing/v04): implement grid-with-faq compound variant"
```

---

### Task 3: Implement `short-form-with-testimonials.tsx` (full component)

**Files:**
- Modify: `src/landing/variants/conversion/short-form-with-testimonials.tsx`

- [ ] **Step 1: Ghi đè stub bằng implementation đầy đủ**

Ghi lại toàn bộ `src/landing/variants/conversion/short-form-with-testimonials.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import type { ConversionSlotProps } from '../../slots';
import { getPrograms } from '../../../content/catalog';
import { branches } from '../../../content/branches';
import { trackEvent } from '../../../lib/trackEvent';

const PHONE_RE = /(^0[0-9]{9}$)|(^\+84[0-9]{9}$)/;
type UXState = 'idle' | 'pending' | 'error';

const TESTIMONIALS = [
  {
    quote: 'Sau 3 buổi IPL mụn viêm giảm rõ, thâm mụn cũng mờ dần. Bác sĩ giải thích kỹ từng bước.',
    name: 'Thanh Hà', age: 22, branch: 'Chi nhánh Quận 3',
    letter: 'T', bg: '#fde68a', fg: '#92400e',
  },
  {
    quote: 'Không ép uống thuốc, không bán thêm. Thấy da tốt lên thật sự sau liệu trình.',
    name: 'Minh Châu', age: 25, branch: 'Chi nhánh Bình Thạnh',
    letter: 'M', bg: '#ddd6fe', fg: '#5b21b6',
  },
  {
    quote: 'Da nhạy cảm nhưng IPL không bị kích ứng. Được dặn dò kỹ trước và sau buổi trị.',
    name: 'Phương Linh', age: 20, branch: 'Chi nhánh Thủ Đức',
    letter: 'P', bg: '#d1fae5', fg: '#065f46',
  },
] as const;

function PendingSpinner() {
  return (
    <svg className="inline-block animate-spin -ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8A6 6 0 0 1 2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TestimonialCard({ quote, name, age, branch, letter, bg, fg }: typeof TESTIMONIALS[number]) {
  return (
    <div className="bg-[var(--lp-bg-card)] rounded-soft border border-[var(--lp-border)] p-4 shadow-sm">
      <p className="text-amber-400 text-sm mb-2" aria-label="5 sao">★★★★★</p>
      <p className="text-sm text-cta/80 italic leading-relaxed mb-3">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="flex-shrink-0">
          <circle cx="16" cy="16" r="16" fill={bg} />
          <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill={fg}>{letter}</text>
        </svg>
        <div>
          <p className="text-xs font-semibold text-cta">{name}, {age} tuổi</p>
          <p className="text-xs text-cta/50">{branch}</p>
        </div>
      </div>
    </div>
  );
}

export function ShortFormWithTestimonialsConversion({ selectedProgramId, minigameResult, onSubmit }: ConversionSlotProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uxState, setUxState] = useState<UXState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { trackEvent('conversion_social_view'); }, []);

  const programName = selectedProgramId
    ? getPrograms().find(p => p.id === selectedProgramId)?.name
    : null;

  function validatePhone(val: string): boolean {
    if (!val.trim()) { setPhoneError(''); return false; }
    if (!PHONE_RE.test(val.trim())) {
      setPhoneError('Số điện thoại không hợp lệ (10 số, bắt đầu 0 hoặc +84)');
      return false;
    }
    setPhoneError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uxState === 'pending') return;
    if (!name.trim()) return;
    if (!validatePhone(phone)) return;
    if (!branch) return;

    setUxState('pending');
    setErrorMessage('');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(), branch,
          skinCondition: minigameResult?.condition.label ?? '',
          programId: selectedProgramId ?? '',
          recipeId: 'v04-combined',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể gửi thông tin, thử lại sau.');
      onSubmit(name.trim(), phone.trim());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể gửi thông tin, thử lại sau.');
      setUxState('error');
    }
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center">
          Đặt lịch tư vấn miễn phí
        </p>
        {programName && (
          <p className="text-sm text-cta/70 text-center -mt-2">
            Chuyên viên sẽ liên hệ tư vấn chương trình{' '}
            <span className="font-semibold text-cta">{programName}</span>.
          </p>
        )}

        <form onSubmit={handleSubmit} className="bg-[var(--lp-bg-card)] rounded-soft p-5 shadow-lg shadow-cta/10 flex flex-col gap-3">
          <input
            type="text" placeholder="Tên của bạn" value={name}
            onChange={e => setName(e.target.value)} required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
          />

          <div>
            <input
              type="tel" placeholder="Số điện thoại" value={phone}
              onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
              onBlur={e => validatePhone(e.target.value)}
              required
              className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
            />
            {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
          </div>

          <select
            value={branch} onChange={e => setBranch(e.target.value)} required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta bg-white w-full"
          >
            <option value="" disabled>Chọn chi nhánh gần bạn</option>
            {branches.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>

          {minigameResult && (
            <div className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta/60 bg-[var(--lp-bg-hero)]">
              <div className="font-semibold text-cta">{minigameResult.condition.label}</div>
              <div className="text-[11px] mt-0.5">Dựa trên kết quả kiểm tra của bạn</div>
            </div>
          )}

          <button
            type="submit" disabled={uxState === 'pending'}
            className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-1 disabled:opacity-60 hover:enabled:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {uxState === 'pending' ? <><PendingSpinner />Đang gửi...</> : 'Gửi thông tin'}
          </button>

          {uxState === 'error' && errorMessage && (
            <p className="text-xs text-red-500 text-center">{errorMessage}</p>
          )}

          <p className="text-xs text-cta/50 text-center">
            Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn.
          </p>
        </form>

        <div className="flex items-center gap-3 mt-2">
          <hr className="flex-1 border-[var(--lp-border)]" />
          <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Khách hàng nói gì</span>
          <hr className="flex-1 border-[var(--lp-border)]" />
        </div>

        <p className="text-xs text-cta/40 text-center -mt-2">↓ Kéo xuống để xem review</p>

        <div className="flex flex-col gap-3">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} />)}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Chạy test — verify PASS**

```bash
npx vitest run --reporter=verbose
```

Kết quả mong đợi: tất cả PASS.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/conversion/short-form-with-testimonials.tsx
git commit -m "feat(landing/v04): implement short-form-with-testimonials compound variant"
```

---

### Task 4: Xác minh trực quan trên trình duyệt

**Files:** Không thay đổi code.

- [ ] **Step 1: Khởi động dev server**

```bash
npm run dev
```

- [ ] **Step 2: Mở `/v/v04-combined` và đi hết flow**

Kiểm tra thứ tự bước: hook → minigame (face-map) → payoff → màn programs+FAQ → màn conversion+testimonial → done. Màn `socialProof` KHÔNG xuất hiện.

- [ ] **Step 3: Kiểm tra màn programs+FAQ**

- Program card hiển thị đúng tên + mô tả + tags theo `suggestedProgramId` từ minigame
- Cuộn xuống: phần FAQ xuất hiện dưới fold trên mobile (viewport 390px)
- FAQ accordion: click Q1 → mở; click Q1 lại → đóng; click Q2 khi Q1 đang mở → Q1 đóng, Q2 mở
- Nút "Đặt lịch với liệu trình này" chuyển sang màn conversion
- Không có emoji trong toàn màn

- [ ] **Step 4: Kiểm tra màn conversion+testimonial**

- 4 field form hiển thị đủ; trường tình trạng da xuất hiện nếu face-map có kết quả
- SĐT sai định dạng → lỗi inline, không submit
- Chi nhánh chưa chọn → không submit
- Điền đủ → nút "Đang gửi..." → khi API trả 200 chuyển sang done (không đi qua socialProof)
- Cuộn xuống: 3 testimonial card, avatar vòng tròn chữ cái, sao `★` màu vàng
- Không có emoji

- [ ] **Step 5: Xác nhận v01/v02/v03 không bị hỏng**

Mở lần lượt `/v/v01-baseline`, `/v/v02-skincare`, `/v/v03-facemap` — tất cả chạy bình thường.

- [ ] **Step 6: Chạy toàn bộ test lần cuối**

```bash
npx vitest run --reporter=verbose
```

Kết quả mong đợi: tất cả PASS.
