# Handoff: Multi-Version Landing Page System

## Tổng quan nhiệm vụ

Repo này là một Next.js 14 landing page cho phòng khám da liễu o2skin, nhắm vào Gen Z từ
TikTok. Kiến trúc hiện tại: toàn bộ UI nằm trong `src/components/AppFlow.tsx` — một state
machine duy nhất chạy qua 6 màn hình tuần tự.

**Nhiệm vụ:** Migrate toàn bộ codebase sang hệ thống **slot + variant + recipe + theme** mới,
đặt tại `src/landing/`. Hệ thống mới cho phép 20-30 version landing page tồn tại song song,
mỗi version có URL riêng (`/v/[id]`), dùng chung bộ xương và content.

---

## Trạng thái repo hiện tại

### Các file ĐÃ TỒN TẠI (không xóa, chỉ đọc hoặc sửa nhỏ)

```
src/
├─ app/
│  ├─ globals.css          ← SỬA: thêm @import themes.css
│  ├─ layout.tsx           ← GIỮ NGUYÊN
│  └─ page.tsx             ← SỬA: trỏ vào LandingFlow
├─ components/
│  ├─ AppFlow.tsx          ← XÓA sau khi migrate xong (task cuối)
│  └─ minigame/
│     ├─ DragPhase.tsx     ← GIỮ NGUYÊN
│     ├─ GameScene.tsx     ← GIỮ NGUYÊN
│     ├─ GhostHand.tsx     ← GIỮ NGUYÊN
│     ├─ PressPhase.tsx    ← GIỮ NGUYÊN
│     ├─ SelfReportStep.tsx← GIỮ NGUYÊN
│     ├─ SkinGame.tsx      ← GIỮ NGUYÊN (skincare minigame entry point)
│     ├─ SwipePhase.tsx    ← GIỮ NGUYÊN
│     ├─ gameConstants.ts  ← GIỮ NGUYÊN
│     ├─ gameShell.tsx     ← SỬA: thay blob màu cứng bằng CSS variables
│     └─ useAdvancingHint.ts ← GIỮ NGUYÊN
├─ content/
│  ├─ catalog.ts           ← GIỮ NGUYÊN (dùng chung mọi version)
│  ├─ programs.ts          ← GIỮ NGUYÊN
│  └─ quiz.ts              ← GIỮ NGUYÊN
└─ lib/
   └─ trackEvent.ts        ← GIỮ NGUYÊN
```

### Các file CHƯA TỒN TẠI — phải TẠO MỚI

```
src/landing/               ← THƯ MỤC MỚI HOÀN TOÀN, chưa có
src/app/v/                 ← THƯ MỤC MỚI HOÀN TOÀN, chưa có
src/app/versions/          ← THƯ MỤC MỚI HOÀN TOÀN, chưa có
```

---

## Thứ tự thực hiện — 17 tasks tuần tự

**Quy tắc:** Làm đúng thứ tự. Sau mỗi task chạy `npx tsc --noEmit`, sau đó commit. Không
nhảy task. Ở Task 14-16, kiểm tra trên `npm run dev` trước khi commit.

---

### Task 1 — Tạo `src/landing/slots.ts`

```ts
// src/landing/slots.ts
import type { SkinCondition } from '../content/quiz';
import type { ProgramId } from '../content/programs';

export type MinigameResult = {
  condition: SkinCondition;
  foundCount: number;
  zoneLabel: string;
  triggerNote: string;
};

export type HookSlotProps = { onStart: () => void };

export type MinigameSlotProps = {
  onComplete: (result: MinigameResult) => void;
};

export type PayoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
};

export type ProgramsSlotProps = {
  suggestedProgramId: ProgramId;
  onContinue: (programId: ProgramId) => void;
};

export type ConversionSlotProps = {
  selectedProgramId: ProgramId | null;
  onSubmit: (name: string, phone: string) => void;
};

export type SocialProofSlotProps = { onContinue: () => void };

export type DoneSlotProps = { selectedProgramId: ProgramId | null };
```

Commit: `feat(landing): add slot contracts (slots.ts)`

---

### Task 2 — Tạo `src/landing/validateRecipe.ts` + test

```ts
// src/landing/validateRecipe.ts
export type RecipeSlots = {
  hook: string;
  minigame: string;
  payoff: string;
  programs?: string;
  conversion: string;
  socialProof?: string;
  done?: string;
};

export type Recipe = {
  id: string;
  label: string;
  theme?: string;
  slots: RecipeSlots;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const REQUIRED = ['hook', 'minigame', 'payoff', 'conversion'] as const;
const OPTIONAL = ['programs', 'socialProof', 'done'] as const;

export function validateRecipe(
  recipe: Recipe,
  registry: Record<string, Record<string, unknown>>,
): ValidationResult {
  const errors: string[] = [];
  for (const slot of REQUIRED) {
    const id = recipe.slots[slot];
    if (!id) errors.push(`Missing required slot: "${slot}"`);
    else if (!registry[slot]?.[id]) errors.push(`Unknown variant for slot "${slot}": "${id}"`);
  }
  for (const slot of OPTIONAL) {
    const id = recipe.slots[slot];
    if (id && !registry[slot]?.[id]) errors.push(`Unknown variant for slot "${slot}": "${id}"`);
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
```

```ts
// src/landing/__tests__/validateRecipe.test.ts
import { describe, it, expect } from 'vitest';
import { validateRecipe } from '../validateRecipe';

const reg = {
  hook: { 'two-column': {} }, minigame: { skincare: {}, findgame: {} },
  payoff: { 'confetti-card': {} }, conversion: { 'short-form': {} },
  programs: { grid: {} }, socialProof: {}, done: { 'contact-info': {} },
};
const base = { id: 'v', label: 'T', slots: { hook: 'two-column', minigame: 'skincare', payoff: 'confetti-card', conversion: 'short-form' } };

describe('validateRecipe', () => {
  it('passes valid minimal recipe', () => expect(validateRecipe(base, reg).valid).toBe(true));
  it('fails missing required slot', () => {
    const { minigame: _, ...s } = base.slots;
    const r = validateRecipe({ ...base, slots: s as any }, reg);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors[0]).toContain('minigame');
  });
  it('fails unknown variant id', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, hook: 'ghost' } }, reg);
    expect(r.valid).toBe(false);
    if (!r.valid) expect(r.errors[0]).toContain('ghost');
  });
  it('fails unknown optional variant', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, programs: 'nope' } }, reg);
    expect(r.valid).toBe(false);
  });
  it('passes recipe with valid optional slots', () => {
    const r = validateRecipe({ ...base, slots: { ...base.slots, programs: 'grid', done: 'contact-info' } }, reg);
    expect(r.valid).toBe(true);
  });
});
```

Chạy: `npm test src/landing/__tests__/validateRecipe.test.ts` — phải pass 5 tests.

Commit: `feat(landing): add validateRecipe with tests`

---

### Task 3 — Tạo `src/landing/themes.css`, sửa `globals.css` và `tailwind.config.mjs`

```css
/* src/landing/themes.css */
.theme-blossom {
  --lp-bg-hero: #FFEFF4; --lp-bg-minigame: #EDE9FF; --lp-bg-payoff: #A8E6CF;
  --lp-bg-programs: #C7CEEA; --lp-bg-card: #ffffff; --lp-primary: #2D2640;
  --lp-accent: #7C3AED; --lp-border: #B6BCEE;
  --lp-blob-1: #FFB8D4; --lp-blob-2: #B39DFF; --lp-blob-3: #8FE3BC;
  --lp-radius-card: 20px; --lp-radius-btn: 20px;
}
.theme-ocean {
  --lp-bg-hero: #EFF8FF; --lp-bg-minigame: #E0F2FE; --lp-bg-payoff: #BAE6FD;
  --lp-bg-programs: #E0F2FE; --lp-bg-card: #ffffff; --lp-primary: #0c4a6e;
  --lp-accent: #0284c7; --lp-border: #7DD3FC;
  --lp-blob-1: #7DD3FC; --lp-blob-2: #38BDF8; --lp-blob-3: #BAE6FD;
  --lp-radius-card: 14px; --lp-radius-btn: 14px;
}
.theme-sage {
  --lp-bg-hero: #F0FDF4; --lp-bg-minigame: #DCFCE7; --lp-bg-payoff: #BBF7D0;
  --lp-bg-programs: #DCFCE7; --lp-bg-card: #ffffff; --lp-primary: #14532d;
  --lp-accent: #16a34a; --lp-border: #86EFAC;
  --lp-blob-1: #86EFAC; --lp-blob-2: #4ADE80; --lp-blob-3: #BBF7D0;
  --lp-radius-card: 24px; --lp-radius-btn: 24px;
}
.theme-golden {
  --lp-bg-hero: #FFFBEB; --lp-bg-minigame: #FEF3C7; --lp-bg-payoff: #FDE68A;
  --lp-bg-programs: #FEF3C7; --lp-bg-card: #ffffff; --lp-primary: #78350f;
  --lp-accent: #d97706; --lp-border: #FCD34D;
  --lp-blob-1: #FCD34D; --lp-blob-2: #FBBF24; --lp-blob-3: #FDE68A;
  --lp-radius-card: 20px; --lp-radius-btn: 20px;
}
.theme-midnight {
  --lp-bg-hero: #0f0c1a; --lp-bg-minigame: #1a1030; --lp-bg-payoff: #130f23;
  --lp-bg-programs: #1a1030; --lp-bg-card: #1e1a2e; --lp-primary: #e2e8f0;
  --lp-accent: #a78bfa; --lp-border: #4c1d95;
  --lp-blob-1: #4c1d95; --lp-blob-2: #1e40af; --lp-blob-3: #312e81;
  --lp-radius-card: 20px; --lp-radius-btn: 20px;
}
```

Thêm vào `src/app/globals.css` (sau dòng `@tailwind utilities;`):
```css
@import '../landing/themes.css';
```

Thay toàn bộ nội dung `tailwind.config.mjs`:
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cta: 'var(--lp-primary, #2D2640)',
        'pastel-pink': '#FFD3E0', 'pastel-lavender': '#C7CEEA', 'pastel-mint': '#A8E6CF',
        'border-pink': '#FFB8CE', 'border-mint': '#9FE6BD', 'border-lavender': '#B6BCEE',
        'label-purple': '#9b8fc4',
      },
      fontFamily: { sans: ['var(--font-be-vietnam-pro)', 'Inter', 'sans-serif'] },
      borderRadius: { soft: '20px' },
    },
  },
  plugins: [],
};
```

Commit: `feat(landing): add 5 themes, make cta color use CSS variable`

---

### Task 4 — Tạo `src/landing/variants/hook/two-column.tsx`

```tsx
// src/landing/variants/hook/two-column.tsx
'use client';
import type { HookSlotProps } from '../../slots';

export function TwoColumnHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] relative flex items-center overflow-hidden transition-colors duration-500">
      <div className="absolute inset-0 pointer-events-none bg-cover bg-center hero-texture"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1710580889701-9fa8f2cd5927?w=1920&q=40&fit=crop&fm=jpg)' }} />
      <div className="max-w-6xl mx-auto w-full px-5 md:grid md:grid-cols-2 md:gap-12 md:items-center relative z-10">
        <div className="relative h-72 md:h-[500px] mb-6 md:mb-0">
          <img src="https://images.unsplash.com/photo-1728727217834-b190862837a3?w=400&q=85&fit=crop&crop=face"
            alt="Cô gái chăm sóc da"
            className="absolute left-0 top-0 w-48 h-64 md:w-80 md:h-[460px] rounded-3xl object-cover object-top shadow-xl z-10" />
          <img src="https://blog.farmacianovadamaia.pt/wp-content/uploads/2023/02/134_skin-care-homem.jpg"
            alt="Chàng trai chăm sóc da"
            className="absolute right-0 bottom-0 w-48 h-64 md:w-80 md:h-[460px] rounded-3xl object-cover object-top shadow-2xl z-20 rotate-2" />
        </div>
        <div className="text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-5xl md:text-6xl text-cta leading-tight">
            Da bạn đang{' '}
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">giấu</span>{' '}
            điều gì?
          </h1>
          <p className="text-base md:text-lg text-cta/70 mt-5">
            Có những "bạn nhỏ" đang ẩn náu trên làn da của bạn. Tìm chúng — và khám phá điều da bạn thực sự cần.
          </p>
          <button onClick={onStart}
            className="mt-7 bg-cta text-white font-bold rounded-soft px-12 py-4 text-base md:text-lg hover:opacity-90 transition-colors duration-300">
            Soi da ngay ✨
          </button>
          <p className="text-sm md:text-base text-cta/50 mt-4">Cùng thực hiện một cuộc khám phá làn da nhé!</p>
        </div>
      </div>
    </div>
  );
}
```

Commit: `feat(landing/variants): add hook/two-column`

---

### Task 5 — Tạo `src/landing/variants/payoff/confetti-card.tsx`

```tsx
// src/landing/variants/payoff/confetti-card.tsx
'use client';
import React, { useEffect, useRef } from 'react';
import type { PayoffSlotProps } from '../../slots';

const CONFETTI_COLORS = ['#ff6b9d','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ff4d6d','#48cae4'];

function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
    y: -8 - Math.random() * 50, vx: (Math.random() - 0.5) * 3.5,
    vy: 2.5 + Math.random() * 4, size: 6 + Math.random() * 8,
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 12,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    isCircle: Math.random() > 0.45,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y < canvas.height + 20) {
        alive = true; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isCircle) { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        else { ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2); }
        ctx.restore();
      }
    }
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

function runWorryParticles(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 25 }, () => ({
    x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
    y: canvas.height * 0.55 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 1.2, vy: -1.2 - Math.random() * 1.5,
    size: 3 + Math.random() * 4, alpha: 0.5 + Math.random() * 0.4,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.008;
      if (p.y > -20 && p.alpha > 0) {
        alive = true; ctx.globalAlpha = p.alpha; ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

const HEADERS: Record<'positive'|'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe! 🌸',
  concern: 'Hmm, có điều bạn cần biết về da mình... 😟',
};
const BRIDGE: Record<'positive'|'concern', string> = {
  positive: 'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài. Hãy xem chương trình chúng tôi chuẩn bị cho bạn.',
  concern: 'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng. Tại o2skin, chúng tôi đã thiết kế chương trình phù hợp ngay cho bạn.',
};

export function ConfettiCardPayoff({ result, onContinue }: PayoffSlotProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (result.condition.tone === 'positive') return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [result.condition.tone]);

  const isPositive = result.condition.tone === 'positive';
  return (
    <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden relative">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      <div className={['max-w-lg md:max-w-3xl w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative', isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter'].join(' ')} style={{ zIndex: 10 }}>
        <p className={['font-extrabold text-xl md:text-2xl mb-4', isPositive ? 'text-teal-800' : 'text-amber-900'].join(' ')}>
          {HEADERS[result.condition.tone]}
        </p>
        <div className="mb-4">
          <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {[{ key:'found', color:'#FF5C9E', content:<span>đã soi <b>{result.foundCount}</b> nốt mụn</span> },
              { key:'zone', color:'#B39DFF', content:<span>da bạn hay bị ở <b>{result.zoneLabel}</b></span> }]
              .map((chip, i) => (
                <span key={chip.key} className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm font-semibold text-cta" style={{ animationDelay: `${0.5+i*0.18}s` }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: chip.color }} />
                  {chip.content}
                </span>
            ))}
          </div>
          {result.triggerNote && (
            <p className="payoff-stat-chip text-xs md:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed" style={{ animationDelay: '0.86s' }}>
              {result.triggerNote}
            </p>
          )}
        </div>
        <p className="text-sm md:text-base text-cta/80 leading-relaxed mb-3" dangerouslySetInnerHTML={{ __html: result.condition.body }} />
        <p className="text-sm md:text-base text-cta/70 leading-snug px-3 py-2.5 bg-violet-50 border-l-2 border-violet-500 rounded-r-lg mb-5">
          {BRIDGE[result.condition.tone]}
        </p>
        <button onClick={onContinue} className="bg-cta text-white font-bold text-sm md:text-base py-3.5 px-9 rounded-soft w-full">
          Khám phá chương trình dành cho bạn →
        </button>
      </div>
    </div>
  );
}
```

Commit: `feat(landing/variants): add payoff/confetti-card`

---

### Task 6 — Tạo `src/landing/variants/programs/grid.tsx`

```tsx
// src/landing/variants/programs/grid.tsx
'use client';
import React, { useState } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { Program, ProgramId } from '../../../content/programs';
import { getPrograms, getConditionById } from '../../../content/catalog';

export function GridPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  const [selected, setSelected] = useState<ProgramId>(suggestedProgramId);
  const allPrograms = getPrograms();
  return (
    <div className="ps-fadeDown h-[100dvh] w-full bg-[var(--lp-bg-programs)] overflow-y-auto py-6">
      <div className="min-h-full flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-5xl mb-5">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <img src="/mascots/nurse-cheer.png" alt="" className="ps-popCheer ps-floaty w-16 md:w-24 h-auto object-contain" style={{ zIndex: 20 }} />
            <h2 className="ps-fadeDown text-xl md:text-2xl font-extrabold text-cta text-center [animation-delay:0.1s]">Các gói dịch vụ tại O2Skin</h2>
            <img src="/mascots/nurse-review.png" alt="" className="ps-popCheer ps-floaty hidden sm:block w-16 md:w-24 h-auto object-contain" style={{ animationDelay: '0.2s', zIndex: 20 }} />
          </div>
        </div>
        <div className="w-full max-w-5xl grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {allPrograms.map((program, idx) => (
            <ProgramCard key={program.id} program={program} selected={selected === program.id}
              isSuggested={program.id === suggestedProgramId} onSelect={() => setSelected(program.id)}
              style={{ animationDelay: `${0.15 + idx * 0.08}s` }} />
          ))}
        </div>
        <button onClick={() => onContinue(selected)} className="bg-[var(--lp-accent)] text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:opacity-90 transition-opacity duration-200">
          {`Đăng ký chương trình ${allPrograms.find(p => p.id === selected)?.name ?? ''} →`}
        </button>
      </div>
    </div>
  );
}

function ProgramCard({ program, selected, isSuggested, onSelect, style }: {
  program: Program; selected: boolean; isSuggested: boolean; onSelect: () => void; style?: React.CSSProperties;
}) {
  const cond = getConditionById(program.treatsConditions[0]);
  const tint = cond?.color ?? '#A0AEC0';
  return (
    <button onClick={onSelect} style={style}
      className={['ps-cardUp text-left rounded-soft shadow-md shadow-cta/10 flex flex-col overflow-hidden border-2 transition-colors duration-[160ms]', selected ? 'border-[var(--lp-accent)]' : 'border-transparent'].join(' ')}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${tint}CC` }}>
        <div className="font-bold text-base text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>{program.name}</div>
        {selected && <span className="font-bold text-sm text-white">✓</span>}
      </div>
      <div className="px-4 py-3 flex flex-col gap-2 flex-1" style={{ background: selected ? `${tint}0A` : 'var(--lp-bg-card)' }}>
        {program.isVip && <span className="self-start inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">VIP</span>}
        <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {program.treatsConditions.map(cid => {
            const c = getConditionById(cid);
            return (
              <span key={cid} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: c ? `${c.color}30` : '#e8e8e8', color: c ? c.color : '#555', filter: c ? 'brightness(0.82)' : 'none' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c?.color ?? '#999' }} />
                {c?.label ?? cid}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
```

Commit: `feat(landing/variants): add programs/grid`

---

### Task 7 — Tạo `src/landing/variants/conversion/short-form.tsx`

```tsx
// src/landing/variants/conversion/short-form.tsx
'use client';
import React, { useState } from 'react';
import type { ConversionSlotProps } from '../../slots';
import { getPrograms } from '../../../content/catalog';

export function ShortFormConversion({ selectedProgramId, onSubmit }: ConversionSlotProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const programName = selectedProgramId ? getPrograms().find(p => p.id === selectedProgramId)?.name : null;

  return (
    <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <form onSubmit={e => { e.preventDefault(); if (name.trim() && phone.trim()) onSubmit(name.trim(), phone.trim()); }}
        className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-3 animate-fade-in-up">
        <div className="font-extrabold text-lg text-cta mb-1">
          {programName ? `Đăng ký chương trình ${programName}` : 'Để lại thông tin để nhận tư vấn'}
        </div>
        {programName && <p className="text-sm text-cta/70 -mt-2 mb-1">Chuyên viên sẽ liên hệ và tư vấn chi tiết về chương trình này.</p>}
        <input type="text" placeholder="Tên của bạn" value={name} onChange={e => setName(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta" />
        <input type="tel" placeholder="Số điện thoại" value={phone} onChange={e => setPhone(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta" />
        <button type="submit" className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-2">Gửi thông tin</button>
      </form>
    </div>
  );
}
```

Commit: `feat(landing/variants): add conversion/short-form`

---

### Task 8 — Tạo `src/landing/variants/done/contact-info.tsx`

```tsx
// src/landing/variants/done/contact-info.tsx
'use client';
import type { DoneSlotProps } from '../../slots';

export function ContactInfoDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-6 md:p-10 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <div className="font-extrabold text-xl md:text-2xl text-cta mb-2">Đã nhận thông tin của bạn!</div>
          <p className="text-sm md:text-base text-cta/70 leading-relaxed">
            Chuyên viên o2skin sẽ liên hệ trong vòng <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>
        <div className="border-t border-cta/10 pt-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest">Trong khi chờ đợi</p>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📍</span>
            <div>
              <p className="text-sm font-bold text-cta">Địa chỉ phòng khám</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">Liên hệ hotline để biết chi nhánh gần nhất.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-xl shrink-0 mt-0.5">📞</span>
            <div>
              <p className="text-sm font-bold text-cta">Hotline</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">Gọi hotline để đặt lịch trực tiếp nếu cần tư vấn gấp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Commit: `feat(landing/variants): add done/contact-info`

---

### Task 9 — Tạo findgame variant (code từ branch master)

Tạo hai file sau. **Toàn bộ code đã được nhúng bên dưới** — không cần đọc từ git hay file nào khác.

**File 1:** `src/landing/variants/minigame/_findgame-core/skinScanLogic.ts`

```ts
// src/landing/variants/minigame/_findgame-core/skinScanLogic.ts
import { skinConditions, type ConditionId, type SkinCondition } from '../../../../content/quiz';

export interface AcneSpot { id: string; x: number; y: number; found: boolean; }
export type SkinZone = 'cam-quai-ham' | 'chu-t' | 'hai-ma' | 'khong-bi';

export const SPOT_POOL: { x: number; y: number }[] = [
  { x: 30, y: 24 }, { x: 55, y: 20 }, { x: 41, y: 30 }, { x: 28, y: 50 },
  { x: 70, y: 52 }, { x: 33, y: 58 }, { x: 66, y: 60 }, { x: 50, y: 78 },
  { x: 38, y: 74 }, { x: 62, y: 74 },
];

export const ZONE_META: Record<SkinZone, { label: string; conditionId: ConditionId; color: string }> = {
  'cam-quai-ham': { label: 'cằm & quai hàm', conditionId: 'mun-noi-tiet', color: '#FF5C9E' },
  'chu-t':        { label: 'vùng chữ T', conditionId: 'da-nhon-mun-viem', color: '#FFCD78' },
  'hai-ma':       { label: 'hai má', conditionId: 'da-nhay-cam', color: '#7DD9C0' },
  'khong-bi':     { label: 'gần như không bị', conditionId: 'clean-skin', color: '#B39DFF' },
};

function shuffle<T>(items: T[]): T[] {
  const r = [...items];
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}

export function generateSpots(count: number): AcneSpot[] {
  return shuffle(SPOT_POOL).slice(0, count).map((p, i) => ({ id: `spot-${i}`, x: p.x, y: p.y, found: false }));
}

export function findNearestUnfoundSpot(spots: AcneSpot[], x: number, y: number, radius: number): AcneSpot | null {
  let nearest: AcneSpot | null = null; let nearestDist = Infinity;
  for (const s of spots) {
    if (s.found) continue;
    const d = Math.hypot(s.x - x, s.y - y);
    if (d <= radius && d < nearestDist) { nearest = s; nearestDist = d; }
  }
  return nearest;
}

export function resolveConditionByZone(zone: SkinZone): SkinCondition {
  const meta = ZONE_META[zone];
  return skinConditions[meta?.conditionId] ?? skinConditions['da-moi-bat-dau'];
}
```

**File 2:** `src/landing/variants/minigame/_findgame-core/SkinScanScreen.tsx`

Nội dung file này dài (~364 dòng). Chạy lệnh sau để lấy từ git:

```bash
git show master:src/components/SkinScanScreen.tsx > src/landing/variants/minigame/_findgame-core/SkinScanScreen.tsx
```

Sau đó sửa các import trong file vừa copy:

- Dòng `} from './MinigameCore/skinScanLogic';` → `} from './skinScanLogic';`
- Dòng `import type { SkinCondition } from '../content/quiz';` → `import type { SkinCondition } from '../../../../content/quiz';`

**File 3:** `src/landing/variants/minigame/findgame.tsx`

```tsx
// src/landing/variants/minigame/findgame.tsx
'use client';
import type { MinigameSlotProps } from '../../slots';
import { SkinScanScreen } from './_findgame-core/SkinScanScreen';

export function FindgameMinigame({ onComplete }: MinigameSlotProps) {
  return (
    <SkinScanScreen
      onComplete={(condition, stats) => onComplete({
        condition,
        foundCount: stats.foundCount,
        zoneLabel: stats.zoneLabel,
        triggerNote: '',
      })}
    />
  );
}
```

Commit: `feat(landing/variants): add minigame/findgame (from master branch)`

---

### Task 10 — Tạo `src/landing/variants/minigame/skincare.tsx` + sửa `gameShell.tsx`

**Sửa `src/components/minigame/gameShell.tsx`:**

Tìm đoạn khai báo blobs + gradient (khoảng dòng 8-21), thay toàn bộ phần đó:

```tsx
// XÓA đoạn cũ này (cả light blobs, dark blobs, dark gradient overlay div):
style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
>
  <span className="mg-blob dark:hidden" style={{ ... '#FFB8D4' ... }} />
  <span className="mg-blob dark:hidden" style={{ ... '#B39DFF' ... }} />
  <span className="mg-blob dark:hidden" style={{ ... '#8FE3BC' ... }} />
  <span className="mg-blob hidden dark:block" style={{ ... '#4c1d95' ... }} />
  <span className="mg-blob hidden dark:block" style={{ ... '#1e40af' ... }} />
  <span className="mg-blob hidden dark:block" style={{ ... '#312e81' ... }} />
  ...dark overlay div...

// THAY BẰNG:
style={{ background: 'linear-gradient(135deg, var(--lp-bg-hero) 0%, var(--lp-bg-minigame) 55%, var(--lp-bg-payoff) 100%)' }}
>
  <span className="mg-blob" style={{ width: 220, height: 220, background: 'var(--lp-blob-1)', left: -40, top: -30 }} />
  <span className="mg-blob" style={{ width: 180, height: 180, background: 'var(--lp-blob-2)', right: -30, bottom: '10%', animationDelay: '2s' }} />
  <span className="mg-blob" style={{ width: 140, height: 140, background: 'var(--lp-blob-3)', left: '12%', bottom: -30, animationDelay: '4s' }} />
```

Lưu ý: Xóa hẳn `<div>` dark gradient overlay (dòng có `background: 'linear-gradient(135deg,#0f0c1a...'`). Theme-midnight sẽ tự xử lý qua CSS class.

**Tạo `src/landing/variants/minigame/skincare.tsx`:**

```tsx
// src/landing/variants/minigame/skincare.tsx
'use client';
import type { MinigameSlotProps } from '../../slots';
import { SkinGame } from '../../../components/minigame/SkinGame';

export function SkincareMinigame({ onComplete }: MinigameSlotProps) {
  return (
    <SkinGame
      onComplete={(condition, stats) => onComplete({
        condition,
        foundCount: stats.foundCount,
        zoneLabel: stats.zoneLabel,
        triggerNote: stats.triggerNote ?? '',
      })}
    />
  );
}
```

Commit: `feat(landing/variants): add minigame/skincare, fix gameShell blob to use CSS vars`

---

### Task 11 — Tạo `src/landing/registry.ts` + test

```ts
// src/landing/registry.ts
import type { ComponentType } from 'react';
import type { HookSlotProps, MinigameSlotProps, PayoffSlotProps, ProgramsSlotProps, ConversionSlotProps, SocialProofSlotProps, DoneSlotProps } from './slots';
import { TwoColumnHook } from './variants/hook/two-column';
import { FindgameMinigame } from './variants/minigame/findgame';
import { SkincareMinigame } from './variants/minigame/skincare';
import { ConfettiCardPayoff } from './variants/payoff/confetti-card';
import { GridPrograms } from './variants/programs/grid';
import { ShortFormConversion } from './variants/conversion/short-form';
import { ContactInfoDone } from './variants/done/contact-info';

export const registry = {
  hook:        { 'two-column': TwoColumnHook } as Record<string, ComponentType<HookSlotProps>>,
  minigame:    { findgame: FindgameMinigame, skincare: SkincareMinigame } as Record<string, ComponentType<MinigameSlotProps>>,
  payoff:      { 'confetti-card': ConfettiCardPayoff } as Record<string, ComponentType<PayoffSlotProps>>,
  programs:    { grid: GridPrograms } as Record<string, ComponentType<ProgramsSlotProps>>,
  conversion:  { 'short-form': ShortFormConversion } as Record<string, ComponentType<ConversionSlotProps>>,
  socialProof: {} as Record<string, ComponentType<SocialProofSlotProps>>,
  done:        { 'contact-info': ContactInfoDone } as Record<string, ComponentType<DoneSlotProps>>,
};
```

```ts
// src/landing/__tests__/registry.test.ts
import { describe, it, expect } from 'vitest';
import { registry } from '../registry';

describe('registry', () => {
  it('có đủ 4 slot bắt buộc', () => {
    expect(registry.hook).toBeDefined(); expect(registry.minigame).toBeDefined();
    expect(registry.payoff).toBeDefined(); expect(registry.conversion).toBeDefined();
  });
  it('hook two-column là component', () => expect(typeof registry.hook['two-column']).toBe('function'));
  it('minigame có findgame và skincare', () => {
    expect(typeof registry.minigame['findgame']).toBe('function');
    expect(typeof registry.minigame['skincare']).toBe('function');
  });
  it('programs grid là component', () => expect(typeof registry.programs['grid']).toBe('function'));
  it('done contact-info là component', () => expect(typeof registry.done['contact-info']).toBe('function'));
});
```

Chạy: `npm test src/landing/__tests__/registry.test.ts` — phải pass 5 tests.

Commit: `feat(landing): add registry with tests`

---

### Task 12 — Tạo `src/landing/LandingFlow.tsx`

```tsx
// src/landing/LandingFlow.tsx
'use client';
import React, { useState } from 'react';
import type { ProgramId } from '../content/programs';
import { getSuggestedProgram } from '../content/catalog';
import { trackEvent } from '../lib/trackEvent';
import { registry } from './registry';
import type { MinigameResult } from './slots';
import type { Recipe } from './validateRecipe';
import './themes.css';

type Step = 'hook' | 'minigame' | 'payoff' | 'programs' | 'conversion' | 'socialProof' | 'done';

export default function LandingFlow({ recipe }: { recipe: Recipe }) {
  const [step, setStep] = useState<Step>('hook');
  const [transitioning, setTransitioning] = useState(false);
  const [minigameResult, setMinigameResult] = useState<MinigameResult | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);

  function transitionTo(next: Step) {
    setTransitioning(true);
    setTimeout(() => { setStep(next); setTransitioning(false); }, 300);
  }

  function nextAfterPayoff() {
    if (recipe.slots.programs) return transitionTo('programs');
    return transitionTo('conversion');
  }

  function nextAfterConversion() {
    if (recipe.slots.socialProof) return transitionTo('socialProof');
    if (recipe.slots.done) return transitionTo('done');
  }

  const themeClass = `theme-${recipe.theme ?? 'blossom'}`;
  const containerClass = `transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`;

  const Hook       = registry.hook[recipe.slots.hook];
  const Minigame   = registry.minigame[recipe.slots.minigame];
  const Payoff     = registry.payoff[recipe.slots.payoff];
  const Programs   = recipe.slots.programs   ? registry.programs[recipe.slots.programs]     : null;
  const Conversion = registry.conversion[recipe.slots.conversion];
  const SocialProof= recipe.slots.socialProof? registry.socialProof[recipe.slots.socialProof]: null;
  const Done       = recipe.slots.done       ? registry.done[recipe.slots.done]              : null;

  return (
    <div className={`${themeClass} ${containerClass}`}>
      {step === 'hook' && Hook && <Hook onStart={() => transitionTo('minigame')} />}

      {step === 'minigame' && Minigame && (
        <Minigame onComplete={(result) => {
          setMinigameResult(result);
          setSelectedProgram(getSuggestedProgram(result.condition.id)?.id ?? null);
          trackEvent('minigame_complete', { resultId: result.condition.id });
          transitionTo('payoff');
        }} />
      )}

      {step === 'payoff' && Payoff && minigameResult && (
        <Payoff result={minigameResult} onContinue={() => {
          trackEvent('payoff_view', { resultId: minigameResult.condition.id });
          nextAfterPayoff();
        }} />
      )}

      {step === 'programs' && Programs && (
        <Programs suggestedProgramId={selectedProgram ?? 'khoi-dau'}
          onContinue={(programId) => { setSelectedProgram(programId); transitionTo('conversion'); }} />
      )}

      {step === 'conversion' && Conversion && (
        <Conversion selectedProgramId={selectedProgram}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { name, phone, program: selectedProgram });
            nextAfterConversion();
          }} />
      )}

      {step === 'socialProof' && SocialProof && (
        <SocialProof onContinue={() => { if (recipe.slots.done) transitionTo('done'); }} />
      )}

      {step === 'done' && Done && <Done selectedProgramId={selectedProgram} />}
    </div>
  );
}
```

Commit: `feat(landing): add LandingFlow — generalized state machine`

---

### Task 13 — Tạo recipes

```ts
// src/landing/recipes/v01-baseline.ts
import type { Recipe } from '../validateRecipe';
export const v01Baseline: Recipe = {
  id: 'v01-baseline', label: 'Baseline — Findgame + blossom', theme: 'blossom',
  slots: { hook: 'two-column', minigame: 'findgame', payoff: 'confetti-card', programs: 'grid', conversion: 'short-form', done: 'contact-info' },
};
```

```ts
// src/landing/recipes/v02-skincare.ts
import type { Recipe } from '../validateRecipe';
export const v02Skincare: Recipe = {
  id: 'v02-skincare', label: 'Skincare minigame + blossom', theme: 'blossom',
  slots: { hook: 'two-column', minigame: 'skincare', payoff: 'confetti-card', programs: 'grid', conversion: 'short-form', done: 'contact-info' },
};
```

```ts
// src/landing/recipes/index.ts
import { v01Baseline } from './v01-baseline';
import { v02Skincare } from './v02-skincare';
import type { Recipe } from '../validateRecipe';

export const allRecipes: Recipe[] = [v01Baseline, v02Skincare];
export function getRecipeById(id: string): Recipe | undefined {
  return allRecipes.find(r => r.id === id);
}
```

Commit: `feat(landing/recipes): add v01-baseline and v02-skincare`

---

### Task 14 — Tạo `src/app/v/[version]/page.tsx`

```tsx
// src/app/v/[version]/page.tsx
import { notFound } from 'next/navigation';
import LandingFlow from '../../../landing/LandingFlow';
import { getRecipeById, allRecipes } from '../../../landing/recipes';

type Props = { params: { version: string } };

export default function VersionPage({ params }: Props) {
  const recipe = getRecipeById(params.version);
  if (!recipe) notFound();
  return <LandingFlow recipe={recipe} />;
}

export function generateStaticParams() {
  return allRecipes.map(r => ({ version: r.id }));
}
```

Chạy `npm run dev`, kiểm tra:
- `http://localhost:3000/v/v02-skincare` — skincare minigame, luồng đầy đủ
- `http://localhost:3000/v/v01-baseline` — findgame minigame
- `http://localhost:3000/v/khong-co` — trang 404

Commit: `feat(app): add dynamic version route /v/[version]`

---

### Task 15 — Tạo `src/app/versions/page.tsx`

```tsx
// src/app/versions/page.tsx
import Link from 'next/link';
import { allRecipes } from '../../landing/recipes';

const THEME_CHIPS: Record<string, { label: string; bg: string; text: string }> = {
  blossom:  { label: 'Blossom',  bg: '#FFD3E0', text: '#2D2640' },
  ocean:    { label: 'Ocean',    bg: '#BAE6FD', text: '#0c4a6e' },
  sage:     { label: 'Sage',     bg: '#BBF7D0', text: '#14532d' },
  golden:   { label: 'Golden',   bg: '#FDE68A', text: '#78350f' },
  midnight: { label: 'Midnight', bg: '#1e1a2e', text: '#a78bfa' },
};

export default function VersionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Landing page versions</h1>
        <p className="text-sm text-gray-500 mb-8">{allRecipes.length} version — bấm để xem</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allRecipes.map(recipe => {
            const chip = THEME_CHIPS[recipe.theme ?? 'blossom'];
            return (
              <Link key={recipe.id} href={`/v/${recipe.id}`}
                className="block rounded-2xl border-2 border-gray-200 bg-white p-5 hover:border-gray-400 hover:shadow-md transition-all duration-150">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs text-gray-400">{recipe.id}</span>
                  {chip && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: chip.bg, color: chip.text }}>{chip.label}</span>}
                </div>
                <p className="font-semibold text-gray-800 leading-snug mb-3">{recipe.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(recipe.slots).filter(([,v]) => v).map(([slot, variant]) => (
                    <span key={slot} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{slot}: {variant}</span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
```

Kiểm tra `http://localhost:3000/versions` — phải thấy lưới thẻ, bấm vào từng thẻ navigate đúng version.

Commit: `feat(app): add /versions gallery page`

---

### Task 16 — Sửa `src/app/page.tsx`

```tsx
// src/app/page.tsx
import LandingFlow from '../landing/LandingFlow';
import { v02Skincare } from '../landing/recipes/v02-skincare';

export default function Home() {
  return <LandingFlow recipe={v02Skincare} />;
}
```

Kiểm tra `http://localhost:3000` — phải render y hệt `http://localhost:3000/v/v02-skincare`.
Chạy toàn bộ luồng: Hook → Minigame → Payoff → Programs → Conversion → Done.

Commit: `feat(app): wire page.tsx to LandingFlow with v02-skincare recipe`

---

### Task 17 — Xóa `src/components/AppFlow.tsx`

Chỉ thực hiện sau khi Task 16 chạy ổn.

```bash
# Kiểm tra không còn import nào trỏ vào AppFlow
grep -r "AppFlow" src/
# Nếu không có kết quả, tiến hành xóa
rm src/components/AppFlow.tsx
npx tsc --noEmit
npm run build
```

Commit: `refactor(landing): remove AppFlow.tsx, migration complete`

---

## Kết quả mong đợi

- `http://localhost:3000` — landing v02-skincare, full flow hoạt động
- `http://localhost:3000/v/v01-baseline` — landing v01-findgame, full flow hoạt động
- `http://localhost:3000/versions` — gallery 2 thẻ, link đúng
- `npm run build` — thành công
- `npm test` — tất cả pass

## Lưu ý quan trọng

1. `src/landing/` chưa tồn tại — phải tạo mới từ đầu
2. Màu `cond.color` trong programs/grid.tsx (màu của từng loại da) **không** thay bằng CSS variable — đó là màu dữ liệu, không phải màu theme
3. `SkinGame` (skincare minigame) nhận `onComplete(condition, stats)` với `stats.triggerNote` — khác với `SkinScanScreen` (findgame) không có `triggerNote`
4. Test runner: `npm test` (Vitest)
