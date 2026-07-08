# Handoff: v04 Compound Variant — Programs+FAQ / Conversion+Testimonial

## Tổng quan nhiệm vụ

Repo là một Next.js landing page cho phòng khám da liễu o2skin, nhắm traffic GenZ từ TikTok.
Kiến trúc dùng hệ thống **slot / variant / recipe**: mỗi "version" landing là một recipe khai báo
variant nào được dùng cho từng slot (hook, minigame, payoff, programs, conversion, socialProof, done).
`LandingFlow.tsx` là state machine tổng quát đọc recipe và render đúng variant.

**Nhiệm vụ:** Thêm 2 compound variant mới và một recipe `v04-combined`, tạo ra flow 5 bước:

```
hook → minigame → payoff → [programs + FAQ] → [conversion + testimonials] → done
```

Mỗi "màn ghép" là một variant duy nhất của slot hiện có, tự render hai phần nội dung trong một
container `h-[100dvh] overflow-y-auto`. Không sửa `LandingFlow.tsx`, `slots.ts`, hay `validateRecipe.ts`.

---

## Trạng thái repo hiện tại

### Các file ĐÃ TỒN TẠI — chỉ sửa những file được chỉ định, không đụng phần còn lại

```
src/landing/
├─ slots.ts                             ← KHÔNG sửa
├─ registry.ts                          ← SỬA: thêm 2 import + 2 key mới
├─ LandingFlow.tsx                      ← KHÔNG sửa
├─ validateRecipe.ts                    ← KHÔNG sửa
├─ themes.css                           ← KHÔNG sửa (theme 'ocean' đã có)
├─ recipes/
│  ├─ index.ts                          ← SỬA: thêm import + v04Combined vào allRecipes
│  ├─ v01-baseline.ts                   ← KHÔNG sửa
│  ├─ v02-skincare.ts                   ← KHÔNG sửa
│  └─ v03-facemap.ts                    ← KHÔNG sửa
└─ variants/
   ├─ hook/two-column.tsx               ← KHÔNG sửa
   ├─ hook/bold-single.tsx              ← KHÔNG sửa
   ├─ minigame/findgame.tsx             ← KHÔNG sửa
   ├─ minigame/skincare.tsx             ← KHÔNG sửa
   ├─ minigame/face-map.tsx             ← KHÔNG sửa
   ├─ payoff/confetti-card.tsx          ← KHÔNG sửa
   ├─ programs/grid.tsx                 ← KHÔNG sửa
   ├─ programs/carousel.tsx             ← KHÔNG sửa
   ├─ conversion/short-form.tsx         ← KHÔNG sửa
   ├─ socialProof/video-proof.tsx       ← KHÔNG sửa
   └─ done/contact-info.tsx             ← KHÔNG sửa

src/landing/__tests__/
├─ validateRecipe.test.ts               ← SỬA: thêm 1 test case mới
└─ registry.test.ts                     ← SỬA: thêm 2 test case mới
```

### Các file CHƯA TỒN TẠI — phải TẠO MỚI

```
src/landing/variants/programs/grid-with-faq.tsx
src/landing/variants/conversion/short-form-with-testimonials.tsx
src/landing/recipes/v04-combined.ts
```

---

## Các type quan trọng cần biết

`src/landing/slots.ts` định nghĩa hợp đồng props của các slot. Hai slot liên quan:

```ts
// ProgramsSlotProps — dùng cho grid-with-faq.tsx
export type ProgramsSlotProps = {
  suggestedProgramId: ProgramId;
  onContinue: (programId: ProgramId) => void;
};

// ConversionSlotProps — dùng cho short-form-with-testimonials.tsx
// minigameResult ĐÃ có trong hợp đồng (được thêm trong implementation trước)
export type ConversionSlotProps = {
  selectedProgramId: ProgramId | null;
  minigameResult: MinigameResult | null;
  onSubmit: (name: string, phone: string) => void;
};
```

`src/content/catalog.ts` cung cấp:
- `getPrograms()` → `Program[]`
- `getConditionById(cid)` → `SkinCondition | undefined`

`Program` có các trường: `id`, `name`, `description`, `isVip`, `treatsConditions: ConditionId[]`
`SkinCondition` có trường `color: string` (hex)

`src/content/branches.ts` export `branches: Branch[]` với mỗi phần tử có `{ code, name, address }`.

CSS vars theme ocean (từ `themes.css`):
- `--lp-bg-payoff` — màu nền chính
- `--lp-bg-card` — màu nền card/form
- `--lp-bg-hero` — màu nền nhạt hơn
- `--lp-border` — màu viền
- `rounded-soft` — Tailwind class `border-radius: 14px` (theo theme ocean)
- `text-cta` — màu chữ chính `#0c4a6e`

`trackEvent(eventName, payload?)` — hàm có sẵn ở `src/lib/trackEvent.ts`.

API route submit lead: `POST /api/lead` với payload `{ name, phone, branch, skinCondition, programId, recipeId }`.

---

## Thứ tự thực hiện — 4 tasks tuần tự

**Quy tắc:** Làm đúng thứ tự. Sau mỗi task chạy `npx vitest run --reporter=verbose`. Không
nhảy task. Task 4 kiểm tra trên `npm run dev` trước khi commit.

---

### Task 1 — Thêm tests + tạo stub components + registry + recipe

**Bước 1.1 — Thêm test vào `validateRecipe.test.ts`**

Mở `src/landing/__tests__/validateRecipe.test.ts`. Thêm case sau vào **cuối** block `describe('validateRecipe', ...)`:

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

Chạy: `npx vitest run src/landing/__tests__/validateRecipe.test.ts --reporter=verbose`
Kết quả mong đợi: tất cả **PASS** (test này dùng mock registry, không cần component thật).

---

**Bước 1.2 — Thêm tests vào `registry.test.ts`**

Mở `src/landing/__tests__/registry.test.ts`. Thêm vào **cuối** block `describe('registry', ...)`:

```ts
it('programs grid-with-faq là component', () => expect(typeof registry.programs['grid-with-faq']).toBe('function'));
it('conversion short-form-with-testimonials là component', () => expect(typeof registry.conversion['short-form-with-testimonials']).toBe('function'));
```

Chạy: `npx vitest run src/landing/__tests__/registry.test.ts --reporter=verbose`
Kết quả mong đợi: 2 test mới **FAIL** với `expected 'undefined' to be 'function'` — đúng như dự kiến.

---

**Bước 1.3 — Tạo stub `grid-with-faq.tsx`**

```tsx
// src/landing/variants/programs/grid-with-faq.tsx
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

---

**Bước 1.4 — Tạo stub `short-form-with-testimonials.tsx`**

```tsx
// src/landing/variants/conversion/short-form-with-testimonials.tsx
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

---

**Bước 1.5 — Cập nhật `registry.ts`**

Mở `src/landing/registry.ts`. Thêm 2 dòng import **sau** các import hiện có:

```ts
import { GridWithFaqPrograms } from './variants/programs/grid-with-faq';
import { ShortFormWithTestimonialsConversion } from './variants/conversion/short-form-with-testimonials';
```

Cập nhật 2 key (giữ nguyên các key cũ, **chỉ thêm** key mới):

```ts
programs:    { grid: GridPrograms, carousel: CarouselPrograms, 'grid-with-faq': GridWithFaqPrograms } as Record<string, ComponentType<ProgramsSlotProps>>,
conversion:  { 'short-form': ShortFormConversion, 'short-form-with-testimonials': ShortFormWithTestimonialsConversion } as Record<string, ComponentType<ConversionSlotProps>>,
```

---

**Bước 1.6 — Tạo recipe `v04-combined.ts`**

```ts
// src/landing/recipes/v04-combined.ts
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

---

**Bước 1.7 — Cập nhật `recipes/index.ts`**

Ghi lại toàn bộ file `src/landing/recipes/index.ts`:

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

---

**Bước 1.8 — Chạy toàn bộ test, verify PASS**

```bash
npx vitest run --reporter=verbose
```

Kết quả mong đợi: tất cả **PASS** bao gồm 2 registry tests mới.

---

**Bước 1.9 — Commit**

```bash
git add src/landing/__tests__/validateRecipe.test.ts src/landing/__tests__/registry.test.ts src/landing/variants/programs/grid-with-faq.tsx src/landing/variants/conversion/short-form-with-testimonials.tsx src/landing/registry.ts src/landing/recipes/v04-combined.ts src/landing/recipes/index.ts
git commit -m "feat(landing/v04): stub components + registry entries + recipe v04-combined"
```

---

### Task 2 — Implement `grid-with-faq.tsx` (đầy đủ)

Ghi đè toàn bộ `src/landing/variants/programs/grid-with-faq.tsx`:

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

        <p className="text-xs text-cta/40 text-center -mt-2">&#8595; Kéo xuống để đọc</p>

        <FaqAccordion />
        <div className="h-4" />
      </div>
    </div>
  );
}
```

Chạy: `npx vitest run --reporter=verbose` — kết quả mong đợi: tất cả **PASS**.

```bash
git add src/landing/variants/programs/grid-with-faq.tsx
git commit -m "feat(landing/v04): implement grid-with-faq compound variant"
```

---

### Task 3 — Implement `short-form-with-testimonials.tsx` (đầy đủ)

Ghi đè toàn bộ `src/landing/variants/conversion/short-form-with-testimonials.tsx`:

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
      <p className="text-amber-400 text-sm mb-2" aria-label="5 sao">&#9733;&#9733;&#9733;&#9733;&#9733;</p>
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

        <p className="text-xs text-cta/40 text-center -mt-2">&#8595; Kéo xuống để xem review</p>

        <div className="flex flex-col gap-3">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} />)}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
```

Chạy: `npx vitest run --reporter=verbose` — kết quả mong đợi: tất cả **PASS**.

```bash
git add src/landing/variants/conversion/short-form-with-testimonials.tsx
git commit -m "feat(landing/v04): implement short-form-with-testimonials compound variant"
```

---

### Task 4 — Xác minh trực quan trên trình duyệt

```bash
npm run dev
```

**Mở `http://localhost:3000/v/v04-combined` và đi hết flow:**

1. hook (bold-single) → minigame (face-map) → payoff → **màn programs+FAQ** → **màn conversion+testimonial** → done
2. Màn `socialProof` KHÔNG xuất hiện — v04 không khai báo slot này

**Kiểm tra màn programs+FAQ:**
- Program card hiển thị tên + mô tả + tags đúng loại mụn từ kết quả face-map
- Cuộn xuống: FAQ xuất hiện dưới fold trên mobile (viewport 390px)
- Click Q1 → mở; click Q1 lại → đóng; click Q2 khi Q1 đang mở → Q1 tự đóng, Q2 mở
- Không có emoji trong toàn màn (chevron là SVG)

**Kiểm tra màn conversion+testimonial:**
- Trường tình trạng da hiển thị (pre-fill từ face-map) và màu nền nhạt (`--lp-bg-hero`)
- SĐT sai định dạng (vd `12345`) → lỗi inline bên dưới ô, form không submit
- Chi nhánh chưa chọn → form không submit
- Điền đủ + submit → nút chuyển "Đang gửi..." → khi thành công chuyển sang màn done (không đi qua socialProof)
- Cuộn xuống: 3 testimonial cards; avatar là vòng tròn SVG với chữ cái; sao là ★ màu vàng
- Không có emoji

**Kiểm tra v01/v02/v03 không bị hỏng:**
Mở `/v/v01-baseline`, `/v/v02-skincare`, `/v/v03-facemap` — tất cả chạy bình thường.

**Chạy lần cuối:**
```bash
npx vitest run --reporter=verbose
```
Kết quả mong đợi: tất cả **PASS**.

---

## Kết quả mong đợi sau khi hoàn tất

- `http://localhost:3000/v/v04-combined` — full flow 5 bước, theme ocean, 2 màn ghép hoạt động
- `/v/v01-baseline`, `/v/v02-skincare`, `/v/v03-facemap` — không bị ảnh hưởng
- `http://localhost:3000/versions` — hiển thị 4 thẻ, v04 xuất hiện với đúng label và slots
- `npx vitest run` — tất cả pass

## Lưu ý quan trọng

1. `minigameResult` đã là field trong `ConversionSlotProps` — **không** cần thêm vào `slots.ts`
2. Màu avatar trong `TESTIMONIALS` (`bg`, `fg`) là màu cố định của dữ liệu mock, **không** thay bằng CSS var
3. Ký tự sao trong `TestimonialCard` dùng HTML entity `&#9733;` (hoặc ký tự `★`), **không** dùng emoji `⭐`
4. Mũi tên scroll-hint dùng HTML entity `&#8595;` (hoặc `↓`), **không** dùng emoji
5. `trackEvent` không cần await — fire-and-forget
6. Nội dung FAQ và testimonial là **placeholder** — o2skin sẽ cung cấp nội dung thật sau
7. Test runner: `npx vitest run` (không phải `npm test` — kiểm tra `package.json` nếu khác)
