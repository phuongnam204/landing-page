# Workflow Diversity — 8 Version Workflows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add structural workflow diversity to 8 landing page versions (v14, v15, v17, v18, v20, v21, v22, v23) — each version gets a different step sequence, not just a different visual skin.

**Architecture:** 4 categories of change, escalating complexity: (A) new minigame variant only, (B) new programs variant only, (C) new optional slot + 4-file infrastructure touch, (D) new optional slot + LandingFlow branching state. Infrastructure tasks 1–4 must complete before components; components are independent of each other; registry and recipes come last.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS 3, Vitest; CSS variables for theming (`var(--lp-bg-minigame)`, `var(--lp-bg-card)`, `var(--lp-accent)`, etc.); `text-cta` = primary text color from `var(--lp-primary)`; `rounded-soft` = `var(--lp-radius-card)`.

---

## File Map

### Modified files
- `src/landing/slots.ts` — add 3 new slot prop types
- `src/landing/validateRecipe.ts` — add 3 new optional slots to RecipeSlots + OPTIONAL array
- `src/landing/__tests__/validateRecipe.test.ts` — add tests for new optional slots
- `src/landing/LandingFlow.tsx` — add step types, `isFastTrack` state, `nextAfterHook()`, `nextAfterPayoff()`, 3 new render blocks
- `src/landing/registry.ts` — add 3 new registry branches + 7 new component imports + entries
- `src/landing/recipes/v14-natural-spa.ts` — add `expertHandoff` slot
- `src/landing/recipes/v15-natural-editorial.ts` — change programs variant
- `src/landing/recipes/v17-bold-classic.ts` — add `teaserPayoff` slot
- `src/landing/recipes/v18-bold-stacked.ts` — add `pathChooser` slot
- `src/landing/recipes/v20-bold-typographic.ts` — change programs variant
- `src/landing/recipes/v21-electric-classic.ts` — change minigame variant
- `src/landing/recipes/v22-electric-glow-heavy.ts` — change minigame variant, drop programs
- `src/landing/recipes/v23-electric-soft-dark.ts` — change minigame variant, drop programs

### New files
- `src/landing/variants/minigame/electric/classic-chained.tsx` (v21)
- `src/landing/variants/minigame/electric/glow-scratch.tsx` (v22)
- `src/landing/variants/minigame/electric/soft-swipe.tsx` (v23)
- `src/landing/variants/programs/natural/editorial-journey.tsx` (v15)
- `src/landing/variants/programs/bold/typographic-commitment.tsx` (v20)
- `src/landing/variants/expertHandoff/natural/spa.tsx` (v14) — new directory
- `src/landing/variants/teaserPayoff/bold/classic.tsx` (v17) — new directory
- `src/landing/variants/pathChooser/bold/stacked.tsx` (v18) — new directory

---

## Task 1: Add 3 new slot prop types to slots.ts

**Files:**
- Modify: `src/landing/slots.ts`

- [ ] **Step 1: Append the 3 new types to the end of the file**

Open `src/landing/slots.ts`. After the last export (`DoneSlotProps`), append:

```ts
export type ExpertHandoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
};

export type TeaserPayoffSlotProps = {
  onContinue: () => void;
};

export type PathChooserSlotProps = {
  onFastTrack: () => void;
  onFullFlow:  () => void;
};
```

- [ ] **Step 2: Verify TypeScript compiles (no new errors)**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: 0 new errors (pre-existing errors, if any, are unchanged).

- [ ] **Step 3: Commit**

```bash
git add src/landing/slots.ts
git commit -m "feat(slots): add ExpertHandoffSlotProps, TeaserPayoffSlotProps, PathChooserSlotProps"
```

---

## Task 2: Update validateRecipe.ts — 3 new optional slots

**Files:**
- Modify: `src/landing/validateRecipe.ts`

- [ ] **Step 1: Update RecipeSlots and OPTIONAL**

Replace the entire file content:

```ts
export type RecipeSlots = {
  hook:           string;
  minigame:       string;
  payoff:         string;
  teaserPayoff?:  string;
  pathChooser?:   string;
  expertHandoff?: string;
  programs?:      string;
  conversion:     string;
  socialProof?:   string;
  done?:          string;
};

export type Recipe = {
  id: string;
  label: string;
  theme?: string;
  chipColor?: { bg: string; text: string; label: string };
  slots: RecipeSlots;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const REQUIRED = ['hook', 'minigame', 'payoff', 'conversion'] as const;
const OPTIONAL = ['teaserPayoff', 'pathChooser', 'expertHandoff', 'programs', 'socialProof', 'done'] as const;

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

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit 2>&1 | head -20`

Expected: 0 new errors.

---

## Task 3: Update validateRecipe tests — new optional slots

**Files:**
- Modify: `src/landing/__tests__/validateRecipe.test.ts`

- [ ] **Step 1: Add 3 new test cases**

The file currently has 6 tests. Append these 3 new `it` blocks inside the existing `describe('validateRecipe', ...)` block, before the closing `});`:

```ts
  it('passes recipe with teaserPayoff slot when registered', () => {
    const reg2 = { ...reg, teaserPayoff: { 'bold-classic': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, teaserPayoff: 'bold-classic' } }, reg2);
    expect(r.valid).toBe(true);
  });
  it('fails recipe with unknown teaserPayoff variant', () => {
    const reg2 = { ...reg, teaserPayoff: { 'bold-classic': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, teaserPayoff: 'ghost' } }, reg2);
    expect(r.valid).toBe(false);
  });
  it('passes recipe with expertHandoff slot when registered', () => {
    const reg2 = { ...reg, expertHandoff: { 'natural-spa': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, expertHandoff: 'natural-spa' } }, reg2);
    expect(r.valid).toBe(true);
  });
  it('passes recipe with pathChooser slot when registered', () => {
    const reg2 = { ...reg, pathChooser: { 'bold-stacked': {} } };
    const r = validateRecipe({ ...base, slots: { ...base.slots, pathChooser: 'bold-stacked' } }, reg2);
    expect(r.valid).toBe(true);
  });
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/landing/__tests__/validateRecipe.test.ts`

Expected: 10/10 passing.

- [ ] **Step 3: Commit**

```bash
git add src/landing/validateRecipe.ts src/landing/__tests__/validateRecipe.test.ts
git commit -m "feat(validateRecipe): add teaserPayoff, pathChooser, expertHandoff optional slots + tests"
```

---

## Task 4: Update LandingFlow.tsx — new steps + branching

**Files:**
- Modify: `src/landing/LandingFlow.tsx`

- [ ] **Step 1: Replace the file with the updated state machine**

```tsx
'use client';
import React, { useState } from 'react';
import type { ProgramId } from '../content/programs';
import { recommendPrograms, type ScoredProgram } from '../content/recommend';
import { trackEvent } from '../lib/trackEvent';
import { registry } from './registry';
import type { MinigameResult } from './slots';
import type { Recipe } from './validateRecipe';

type Step =
  | 'hook'
  | 'teaserPayoff'
  | 'pathChooser'
  | 'minigame'
  | 'payoff'
  | 'expertHandoff'
  | 'programs'
  | 'conversion'
  | 'socialProof'
  | 'done';

export default function LandingFlow({ recipe }: { recipe: Recipe }) {
  const [step, setStep]               = useState<Step>('hook');
  const [transitioning, setTransitioning] = useState(false);
  const [minigameResult, setMinigameResult] = useState<MinigameResult | null>(null);
  const [suggestedPrograms, setSuggestedPrograms] = useState<ScoredProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);
  const [isFastTrack, setIsFastTrack] = useState(false);

  function transitionTo(next: Step) {
    setTransitioning(true);
    setTimeout(() => { setStep(next); setTransitioning(false); }, 300);
  }

  function nextAfterHook() {
    if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
    if (recipe.slots.pathChooser)  return transitionTo('pathChooser');
    return transitionTo('minigame');
  }

  function nextAfterPayoff() {
    if (recipe.slots.expertHandoff) return transitionTo('expertHandoff');
    if (recipe.slots.programs)      return transitionTo('programs');
    return transitionTo('conversion');
  }

  function nextAfterConversion() {
    if (recipe.slots.socialProof) return transitionTo('socialProof');
    transitionTo('done');
  }

  const themeClass = `theme-${recipe.theme ?? 'blossom'}`;
  const containerClass = `transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`;

  const Hook         = registry.hook[recipe.slots.hook];
  const Minigame     = registry.minigame[recipe.slots.minigame];
  const Payoff       = registry.payoff[recipe.slots.payoff];
  const Programs     = recipe.slots.programs      ? registry.programs[recipe.slots.programs]           : null;
  const Conversion   = registry.conversion[recipe.slots.conversion];
  const SocialProof  = recipe.slots.socialProof   ? registry.socialProof[recipe.slots.socialProof]     : null;
  const Done         = recipe.slots.done          ? registry.done[recipe.slots.done]                   : null;
  const TeaserPayoff = recipe.slots.teaserPayoff  ? registry.teaserPayoff?.[recipe.slots.teaserPayoff] : null;
  const PathChooser  = recipe.slots.pathChooser   ? registry.pathChooser?.[recipe.slots.pathChooser]   : null;
  const ExpertHandoff= recipe.slots.expertHandoff ? registry.expertHandoff?.[recipe.slots.expertHandoff]: null;

  return (
    <div className={`overflow-hidden ${themeClass} ${containerClass}`}>
      {step === 'hook' && Hook && <Hook onStart={nextAfterHook} />}

      {step === 'teaserPayoff' && TeaserPayoff && (
        <TeaserPayoff onContinue={() => transitionTo('minigame')} />
      )}

      {step === 'pathChooser' && PathChooser && (
        <PathChooser
          onFastTrack={() => {
            setIsFastTrack(true);
            trackEvent('path_chooser', { path: 'fast_track' });
            transitionTo('conversion');
          }}
          onFullFlow={() => {
            setIsFastTrack(false);
            trackEvent('path_chooser', { path: 'full_flow' });
            transitionTo('minigame');
          }}
        />
      )}

      {step === 'minigame' && Minigame && (
        <Minigame onComplete={(result) => {
          setMinigameResult(result);
          const conditionIds = result.conditions.map(c => c.id);
          const ranked = recommendPrograms(conditionIds);
          setSuggestedPrograms(ranked);
          setSelectedProgram(ranked[0]?.program.id ?? null);
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

      {step === 'expertHandoff' && ExpertHandoff && minigameResult && (
        <ExpertHandoff result={minigameResult} onContinue={() => {
          if (recipe.slots.programs) transitionTo('programs');
          else transitionTo('conversion');
        }} />
      )}

      {step === 'programs' && Programs && (
        <Programs suggestedPrograms={suggestedPrograms}
          onContinue={(programId) => { setSelectedProgram(programId); transitionTo('conversion'); }} />
      )}

      {step === 'conversion' && Conversion && (
        <Conversion selectedProgramId={selectedProgram} minigameResult={minigameResult}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { program: selectedProgram, fastTrack: isFastTrack });
            nextAfterConversion();
          }} />
      )}

      {step === 'socialProof' && SocialProof && (
        <SocialProof onContinue={() => { if (recipe.slots.done) transitionTo('done'); }} />
      )}

      {step === 'done' && (Done
        ? <Done selectedProgramId={selectedProgram} />
        : <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5">
            <div className="bg-[var(--lp-bg-card)] rounded-soft p-8 shadow-lg text-center max-w-sm w-full">
              <svg viewBox="0 0 48 48" className="w-12 h-12 text-teal-500 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
                <path d="M14 25l7 7 13-14" />
              </svg>
              <p className="font-extrabold text-xl text-cta">Đã nhận thông tin của bạn!</p>
              <p className="text-sm text-cta/60 mt-2">Chuyên viên sẽ liên hệ trong 24 giờ.</p>
            </div>
          </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: 0 new errors. If `registry.teaserPayoff` etc. don't exist yet on the registry type, errors will appear here — they'll be fixed in Task 13.

- [ ] **Step 3: Commit**

```bash
git add src/landing/LandingFlow.tsx
git commit -m "feat(LandingFlow): add teaserPayoff, pathChooser, expertHandoff steps + isFastTrack branching"
```

---

## Task 5: Create v21 — Electric Classic Chained (two-phase minigame)

**Files:**
- Create: `src/landing/variants/minigame/electric/classic-chained.tsx`

Phase 1 = zone tap using FaceDiagram from face-map.tsx. Phase 2 = 3-question chip quiz. `mapToConditions()` converts zone + acne type to conditions.

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';
import { FaceDiagram, mapToConditions } from '../face-map';
import type { Zone, AcneType } from '../face-map';

// Zone labels — mirrors ZONE_LABELS in face-map.tsx (not exported from there)
const ZONE_LABEL_MAP: Record<Zone, string> = {
  forehead:      'vùng trán',
  nose:          'vùng mũi / chữ T',
  'left-cheek':  'má trái',
  'right-cheek': 'má phải',
  'chin-jaw':    'cằm & quai hàm',
};

// ─── Phase 2 static question map ─────────────────────────────────────────────

type ChatQuestion = {
  text: string;
  options: { label: string; value: string }[];
};

const QUESTIONS: ChatQuestion[] = [
  {
    text: 'Loại mụn bạn hay gặp ở vùng đó?',
    options: [
      { label: 'Mụn viêm đỏ, có mủ',    value: 'inflamed'  },
      { label: 'Đầu đen / đầu trắng',   value: 'blackhead' },
      { label: 'Mẩn đỏ, dễ kích ứng',   value: 'sensitive' },
      { label: 'Lỗ chân lông to rõ',    value: 'pore'      },
    ],
  },
  {
    text: 'Mụn xuất hiện thường xuyên như thế nào?',
    options: [
      { label: 'Liên tục, không dứt',   value: 'constant'   },
      { label: 'Theo chu kỳ tháng',     value: 'periodic'   },
      { label: 'Thỉnh thoảng bùng phát',value: 'occasional' },
    ],
  },
  {
    text: 'Mức độ ảnh hưởng đến bạn?',
    options: [
      { label: 'Nhẹ — đôi khi có 1–2 nốt',  value: 'mild'   },
      { label: 'Vừa — thấy rõ trên mặt',    value: 'moderate'},
      { label: 'Nhiều — đang rất khó chịu', value: 'severe'  },
    ],
  },
];

// ─── Progress dots ────────────────────────────────────────────────────────────

function ProgressDots({ phase }: { phase: 1 | 2 }) {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {[1, 2].map(i => (
        <div
          key={i}
          className="w-2 h-2 rounded-full transition-all duration-300"
          style={{
            background: i <= phase ? 'var(--lp-accent)' : 'var(--lp-border)',
            transform: i === phase ? 'scale(1.3)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

// ─── Phase 1: Zone Tap ────────────────────────────────────────────────────────

function PhaseZoneTap({
  selectedZones,
  onToggle,
  onNext,
}: {
  selectedZones: Zone[];
  onToggle: (z: Zone) => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col items-center px-5 pt-8">
      <ProgressDots phase={1} />
      <h2 className="text-xl font-extrabold text-cta text-center mb-1">
        Bạn hay bị mụn ở vùng nào?
      </h2>
      <p className="text-sm text-cta/50 text-center mb-6">
        Chạm vào vùng trên mặt để chọn (tối đa 2 vùng)
      </p>
      <FaceDiagram selectedZones={selectedZones} onToggle={onToggle} isScanning={false} />
      {selectedZones.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {selectedZones.map(z => (
            <span key={z} className="text-xs bg-[var(--lp-accent)]/10 text-cta font-semibold rounded-full px-3 py-1">
              {ZONE_LABEL_MAP[z]}
            </span>
          ))}
        </div>
      )}
      <button
        onClick={onNext}
        disabled={selectedZones.length === 0}
        className="mt-8 w-full max-w-xs py-3.5 rounded-soft font-bold text-sm transition-all duration-200 disabled:opacity-30"
        style={{
          background: selectedZones.length > 0 ? 'var(--lp-accent)' : 'var(--lp-border)',
          color: selectedZones.length > 0 ? '#fff' : 'var(--lp-primary)',
        }}
      >
        Tiếp theo
      </button>
    </div>
  );
}

// ─── Phase 2: Skin Chat ───────────────────────────────────────────────────────

function PhaseSkinChat({
  onComplete,
}: {
  onComplete: (acneType: AcneType, frequency: string, severity: string) => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  function pick(value: string) {
    const next = [...answers, value];
    if (qIndex < QUESTIONS.length - 1) {
      setAnswers(next);
      setQIndex(i => i + 1);
    } else {
      onComplete(
        (next[0] ?? 'inflamed') as AcneType,
        next[1] ?? 'constant',
        next[2] ?? 'moderate',
      );
    }
  }

  const q = QUESTIONS[qIndex]!;

  return (
    <div className="flex flex-col items-center px-5 pt-8" style={{ animation: 'slideInUp 0.3s ease-out' }}>
      <ProgressDots phase={2} />
      <div className="w-full max-w-xs mb-6">
        <div className="flex gap-1 mb-4">
          {QUESTIONS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-300"
              style={{ background: i <= qIndex ? 'var(--lp-accent)' : 'var(--lp-border)' }}
            />
          ))}
        </div>
        <p className="text-xs text-cta/40 uppercase tracking-widest mb-3">
          Câu {qIndex + 1} / {QUESTIONS.length}
        </p>
        <h2 className="text-xl font-extrabold text-cta mb-6">{q.text}</h2>
        <div className="flex flex-col gap-3">
          {q.options.map(opt => (
            <button
              key={opt.value}
              onClick={() => pick(opt.value)}
              className="w-full py-3.5 px-4 rounded-soft border-2 text-sm font-semibold text-left transition-all duration-150 active:scale-[0.98]"
              style={{
                borderColor: 'var(--lp-border)',
                background: 'var(--lp-bg-card)',
                color: 'var(--lp-primary)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ElectricClassicChainedMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]               = useState<1 | 2>(1);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);

  function toggleZone(z: Zone) {
    setSelectedZones(prev => {
      if (prev.includes(z)) return prev.filter(x => x !== z);
      if (prev.length >= 2)  return [...prev.slice(1), z]; // replace oldest if 2 already
      return [...prev, z];
    });
  }

  function handlePhase2Complete(acneType: AcneType, frequency: string, severity: string) {
    const conditionIds = mapToConditions(selectedZones, acneType);
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']!].filter(Boolean);
    const condition = conditions[0];
    if (!condition) return;

    const zoneLabel = selectedZones.map(z => ZONE_LABEL_MAP[z]).join(', ');
    onComplete({
      conditions,
      condition,
      zoneLabel,
      zoneIds: [...selectedZones],
      triggerNote: `Tần suất: ${frequency}; Mức độ: ${severity}`,
    });
  }

  return (
    <div
      className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)]"
      style={{ overflow: 'hidden' }}
    >
      <style>{`@keyframes slideInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {phase === 1 && (
        <PhaseZoneTap
          selectedZones={selectedZones}
          onToggle={toggleZone}
          onNext={() => setPhase(2)}
        />
      )}

      {phase === 2 && (
        <PhaseSkinChat onComplete={handlePhase2Complete} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep classic-chained`

Expected: no errors for this file.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/minigame/electric/classic-chained.tsx
git commit -m "feat(minigame): add ElectricClassicChainedMinigame — two-phase zone-tap + skin-chat (v21)"
```

---

## Task 6: Create v22 — Electric Glow Scratch (scratch-card reveal)

**Files:**
- Create: `src/landing/variants/minigame/electric/glow-scratch.tsx`

Phase 1 = single question (3 cards). Phase 2 = SVG mask-based scratch reveal. No canvas.

Condition map (real IDs from quiz.ts):
- "Mụn" → `'da-nhon-mun-viem'`
- "Thâm sẹo" → `'da-mun-tham-seo'`
- "Da nhờn kích ứng" → `'lo-chan-long'`

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

const CHOICES = [
  { label: 'Mụn',              sub: 'Mụn viêm, mụn trứng cá',              conditionId: 'da-nhon-mun-viem' as ConditionId },
  { label: 'Thâm sẹo',         sub: 'Vết thâm sau mụn, da không đều màu',  conditionId: 'da-mun-tham-seo'  as ConditionId },
  { label: 'Da nhờn kích ứng', sub: 'Lỗ chân lông to, dễ nổi mẩn',        conditionId: 'lo-chan-long'       as ConditionId },
] as const;

type ScratchPoint = { x: number; y: number };

// Coverage estimate: count unique 30px-radius circles that don't strongly overlap
function estimateCoverage(points: ScratchPoint[], width: number, height: number): number {
  if (width <= 0 || height <= 0) return 0;
  // Grid sampling: 20x20 sample points, check if any reveal circle covers them
  const R = 30;
  let covered = 0;
  const total = 400;
  for (let gx = 0; gx < 20; gx++) {
    for (let gy = 0; gy < 20; gy++) {
      const sx = (gx + 0.5) * (width / 20);
      const sy = (gy + 0.5) * (height / 20);
      if (points.some(p => Math.hypot(p.x - sx, p.y - sy) < R)) covered++;
    }
  }
  return covered / total;
}

export function ElectricGlowScratchMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase]             = useState<1 | 2>(1);
  const [chosen, setChosen]           = useState<typeof CHOICES[number] | null>(null);
  const [scratchPoints, setScratchPoints] = useState<ScratchPoint[]>([]);
  const [revealed, setRevealed]       = useState(false);
  const [fallbackVisible, setFallbackVisible] = useState(false);
  const overlayRef                    = useRef<SVGSVGElement>(null);
  const scratchBoxRef                 = useRef<HTMLDivElement>(null);
  const scratchTimerRef               = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef                  = useRef(false);

  // Fallback: show "Xem kết quả" after 8s if user hasn't scratched
  useEffect(() => {
    if (phase !== 2) return;
    scratchTimerRef.current = setTimeout(() => setFallbackVisible(true), 8000);
    return () => { if (scratchTimerRef.current) clearTimeout(scratchTimerRef.current); };
  }, [phase]);

  const finishReveal = useCallback(() => {
    if (completedRef.current || !chosen) return;
    completedRef.current = true;
    setRevealed(true);
    const condition = skinConditions[chosen.conditionId];
    if (!condition) return;
    setTimeout(() => {
      onComplete({
        conditions: [condition],
        condition,
        zoneLabel: 'Toàn mặt',
        zoneIds: [],
        triggerNote: `Phân tích theo lựa chọn: ${chosen.label}`,
      });
    }, 800);
  }, [chosen, onComplete]);

  function addScratchPoint(clientX: number, clientY: number) {
    if (!scratchBoxRef.current || completedRef.current) return;
    const rect = scratchBoxRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setScratchPoints(prev => {
      const next = [...prev, { x, y }];
      const coverage = estimateCoverage(next, rect.width, rect.height);
      if (coverage >= 0.6) {
        setTimeout(finishReveal, 0);
      }
      return next;
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (e.buttons === 0 && e.pointerType === 'mouse') return;
    e.preventDefault();
    addScratchPoint(e.clientX, e.clientY);
  }

  const condition = chosen ? skinConditions[chosen.conditionId] : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--lp-bg-minigame)] px-5 py-10">

      {phase === 1 && (
        <>
          <h2 className="text-xl font-extrabold text-cta text-center mb-2">
            Da bạn thường gặp vấn đề gì nhất?
          </h2>
          <p className="text-sm text-cta/50 text-center mb-8">Chọn 1 để khám phá kết quả của bạn</p>
          <div className="flex flex-col gap-4 w-full max-w-xs">
            {CHOICES.map(c => (
              <button
                key={c.conditionId}
                onClick={() => setChosen(c)}
                className="w-full py-4 px-5 rounded-soft border-2 text-left transition-all duration-150 active:scale-[0.98]"
                style={{
                  borderColor: chosen?.conditionId === c.conditionId ? 'var(--lp-accent)' : 'var(--lp-border)',
                  background:  chosen?.conditionId === c.conditionId
                    ? 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))'
                    : 'var(--lp-bg-card)',
                }}
              >
                <p className="font-bold text-cta">{c.label}</p>
                <p className="text-xs text-cta/50 mt-0.5">{c.sub}</p>
              </button>
            ))}
          </div>
          {chosen && (
            <button
              onClick={() => setPhase(2)}
              className="mt-8 w-full max-w-xs py-3.5 rounded-soft font-bold text-sm text-white transition-all duration-200"
              style={{ background: 'var(--lp-accent)' }}
            >
              Cào để khám phá
            </button>
          )}
        </>
      )}

      {phase === 2 && (
        <>
          <h2 className="text-lg font-extrabold text-cta text-center mb-2">
            Cào để xem kết quả phân tích da của bạn
          </h2>
          <p className="text-xs text-cta/40 text-center mb-8">Vuốt ngón tay qua thẻ bên dưới</p>

          {/* Scratch card */}
          <div
            ref={scratchBoxRef}
            className="relative w-full max-w-xs rounded-soft overflow-hidden select-none"
            style={{ height: 180, touchAction: 'none' }}
            onPointerMove={onPointerMove}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); addScratchPoint(e.clientX, e.clientY); }}
          >
            {/* Result layer (below scratch overlay) */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-6 rounded-soft"
              style={{ background: 'var(--lp-bg-card)', border: '2px solid var(--lp-border)' }}
            >
              {condition && (
                <>
                  <p className="text-xs uppercase tracking-widest text-cta/40 mb-2">Kết quả của bạn</p>
                  <p className="text-xl font-extrabold text-cta text-center">{condition.label}</p>
                  <p className="text-xs text-cta/60 text-center mt-2 leading-relaxed line-clamp-2">{condition.bridge}</p>
                </>
              )}
            </div>

            {/* SVG scratch overlay */}
            {!revealed && (
              <svg
                ref={overlayRef}
                className="absolute inset-0 w-full h-full"
                style={{ pointerEvents: 'none' }}
                aria-hidden="true"
              >
                <defs>
                  <mask id="scratch-mask">
                    <rect width="100%" height="100%" fill="white" />
                    {scratchPoints.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r="30" fill="black" />
                    ))}
                  </mask>
                </defs>
                <rect
                  width="100%" height="100%"
                  rx="12"
                  fill="var(--lp-accent)"
                  mask="url(#scratch-mask)"
                  opacity="0.9"
                />
                <text
                  x="50%" y="50%"
                  textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="13" fontWeight="700"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  Cào tại đây
                </text>
              </svg>
            )}

            {/* Fade overlay when fully revealed */}
            {revealed && (
              <div
                className="absolute inset-0 rounded-soft"
                style={{ animation: 'fadeOut 0.5s ease-out forwards', background: 'var(--lp-accent)' }}
              />
            )}
          </div>

          {fallbackVisible && !revealed && (
            <button
              onClick={finishReveal}
              className="mt-6 w-full max-w-xs py-3 rounded-soft font-bold text-sm text-white transition-all"
              style={{ background: 'var(--lp-accent)' }}
            >
              Xem kết quả
            </button>
          )}
        </>
      )}

      <style>{`@keyframes fadeOut { to { opacity: 0; } }`}</style>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep glow-scratch`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/minigame/electric/glow-scratch.tsx
git commit -m "feat(minigame): add ElectricGlowScratchMinigame — SVG mask scratch-reveal mechanic (v22)"
```

---

## Task 7: Create v23 — Electric Soft Swipe (swipe card quiz)

**Files:**
- Create: `src/landing/variants/minigame/electric/soft-swipe.tsx`

5 cards, swipe right = "yes" / swipe left = "no". Threshold 80px. Progress dots. Two "No"/"Yes" buttons for desktop.

Card-to-condition map (real IDs):
- Card 0 → `'da-nhon-mun-viem'`
- Card 1 → `'lo-chan-long'`
- Card 2 → `'da-mun-tham-seo'`
- Card 3 → `'da-nhay-cam'`
- Card 4 → `'mun-noi-tiet'`

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React, { useState, useRef } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

const CARDS = [
  { text: 'Mình hay bị mụn ở vùng trán và mũi', conditionId: 'da-nhon-mun-viem' as ConditionId },
  { text: 'Da mình nhờn bóng, lỗ chân lông to', conditionId: 'lo-chan-long'       as ConditionId },
  { text: 'Mình có nhiều thâm sẹo sau khi mụn lặn', conditionId: 'da-mun-tham-seo' as ConditionId },
  { text: 'Da mình nhạy cảm, dễ đỏ và kích ứng', conditionId: 'da-nhay-cam'       as ConditionId },
  { text: 'Mình bị mụn đầu đen nhiều ở vùng cằm', conditionId: 'mun-noi-tiet'     as ConditionId },
] as const;

const SWIPE_THRESHOLD = 80;
const VELOCITY_THRESHOLD = 0.4; // px/ms

export function ElectricSoftSwipeMinigame({ onComplete }: MinigameSlotProps) {
  const [current, setCurrent]   = useState(0);
  const [answers, setAnswers]   = useState<boolean[]>([]);
  const [dragX, setDragX]       = useState(0);
  const [exiting, setExiting]   = useState<'left' | 'right' | null>(null);
  const startXRef               = useRef(0);
  const startYRef               = useRef(0);
  const startTimeRef            = useRef(0);
  const isSwipingRef            = useRef(false);

  function buildResult(finalAnswers: boolean[]) {
    const yesIds = CARDS
      .filter((_, i) => finalAnswers[i])
      .map(c => c.conditionId);
    const conditionIds: ConditionId[] = yesIds.length > 0 ? yesIds : ['da-moi-bat-dau'];
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']!].filter(Boolean);
    const condition = conditions[0];
    if (!condition) return;
    onComplete({
      conditions,
      condition,
      zoneLabel: 'Toàn mặt',
      zoneIds: [],
      triggerNote: `Đồng ý với ${yesIds.length}/${CARDS.length} vấn đề`,
    });
  }

  function advance(yes: boolean) {
    const nextAnswers = [...answers, yes];
    setExiting(yes ? 'right' : 'left');
    setTimeout(() => {
      setExiting(null);
      setDragX(0);
      if (current >= CARDS.length - 1) {
        buildResult(nextAnswers);
      } else {
        setAnswers(nextAnswers);
        setCurrent(c => c + 1);
      }
    }, 280);
  }

  function onPointerDown(e: React.PointerEvent) {
    startXRef.current    = e.clientX;
    startYRef.current    = e.clientY;
    startTimeRef.current = Date.now();
    isSwipingRef.current = false;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const dx = e.clientX - startXRef.current;
    const dy = e.clientY - startYRef.current;
    if (!isSwipingRef.current && Math.abs(dx) > Math.abs(dy) * 1.2 && Math.abs(dx) > 8) {
      isSwipingRef.current = true;
    }
    if (isSwipingRef.current) {
      e.preventDefault();
      setDragX(dx);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!isSwipingRef.current) return;
    const dx = e.clientX - startXRef.current;
    const dt = Date.now() - startTimeRef.current;
    const velocity = Math.abs(dx) / Math.max(dt, 1);
    if (Math.abs(dx) > SWIPE_THRESHOLD || velocity > VELOCITY_THRESHOLD) {
      advance(dx > 0);
    } else {
      setDragX(0);
    }
    isSwipingRef.current = false;
  }

  const tilt = dragX * 0.08;
  const hint = dragX > 40 ? 'yes' : dragX < -40 ? 'no' : null;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-between bg-[var(--lp-bg-minigame)] px-5 py-8 select-none">

      {/* Progress dots */}
      <div className="flex gap-2">
        {CARDS.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i === current ? 20 : 8,
              height: 8,
              background: i < current ? 'var(--lp-accent)' : i === current ? 'var(--lp-accent)' : 'var(--lp-border)',
              opacity: i < current ? 0.4 : 1,
            }}
          />
        ))}
      </div>

      {/* Card area */}
      <div className="relative flex items-center justify-center w-full" style={{ height: 320 }}>
        {/* Next card (scaled down, behind current) */}
        {current + 1 < CARDS.length && (
          <div
            className="absolute w-full max-w-xs rounded-soft bg-[var(--lp-bg-card)] border-2 border-[var(--lp-border)] flex items-center justify-center p-8"
            style={{
              height: 220,
              transform: `scale(${exiting ? 1 : 0.95})`,
              transition: 'transform 0.28s ease-out',
              zIndex: 0,
            }}
          >
            <p className="text-base font-semibold text-cta/40 text-center">{CARDS[current + 1]?.text}</p>
          </div>
        )}

        {/* Current card */}
        <div
          className="absolute w-full max-w-xs rounded-soft bg-[var(--lp-bg-card)] border-2 flex items-center justify-center p-8 cursor-grab active:cursor-grabbing"
          style={{
            height: 220,
            borderColor: hint === 'yes' ? 'var(--lp-accent)' : hint === 'no' ? '#ef4444' : 'var(--lp-border)',
            transform: exiting
              ? `translateX(${exiting === 'right' ? 120 : -120}%) rotate(${exiting === 'right' ? 18 : -18}deg)`
              : `translateX(${dragX}px) rotate(${tilt}deg)`,
            transition: exiting ? 'transform 0.28s ease-in' : dragX !== 0 ? 'none' : 'transform 0.2s ease-out',
            zIndex: 1,
          }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* Hint overlays */}
          {hint === 'yes' && (
            <div className="absolute top-4 left-4 text-xs font-extrabold uppercase tracking-widest px-2 py-1 rounded border-2" style={{ color: 'var(--lp-accent)', borderColor: 'var(--lp-accent)' }}>
              Có
            </div>
          )}
          {hint === 'no' && (
            <div className="absolute top-4 right-4 text-xs font-extrabold uppercase tracking-widest px-2 py-1 rounded border-2 text-red-500 border-red-500">
              Không
            </div>
          )}
          <p className="text-lg font-bold text-cta text-center leading-snug" style={{ pointerEvents: 'none' }}>
            {CARDS[current]?.text}
          </p>
        </div>
      </div>

      {/* Button fallback for desktop / no-swipe */}
      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={() => !exiting && advance(false)}
          className="flex-1 py-3 rounded-soft border-2 border-red-400 text-red-500 font-bold text-sm transition-all active:scale-95"
        >
          Không
        </button>
        <button
          onClick={() => !exiting && advance(true)}
          className="flex-1 py-3 rounded-soft font-bold text-sm text-white transition-all active:scale-95"
          style={{ background: 'var(--lp-accent)' }}
        >
          Có
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep soft-swipe`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/minigame/electric/soft-swipe.tsx
git commit -m "feat(minigame): add ElectricSoftSwipeMinigame — TikTok-style swipe card quiz (v23)"
```

---

## Task 8: Create v15 — Natural Editorial Journey (programs variant)

**Files:**
- Create: `src/landing/variants/programs/natural/editorial-journey.tsx`

Timeline layout. 4 milestone cards. Picks `suggestedPrograms[0]`. No program selection UI.

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React from 'react';
import type { ProgramsSlotProps } from '../../../slots';

const MILESTONES = [
  {
    period: 'Tuần 1–2',
    title: 'Thăm khám và làm sạch nền',
    desc: 'Đánh giá tình trạng da, loại bỏ nhân mụn ẩn và làm sạch lỗ chân lông toàn diện.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="12" stroke="var(--lp-accent)" strokeWidth="1.5" />
        <path d="M9 14h10M14 9v10" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    period: 'Tuần 3–4',
    title: 'Liệu trình điều trị cá nhân',
    desc: 'Chuyên viên xây dựng phác đồ riêng theo loại da, kiên trì điều trị từng bước.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <rect x="5" y="5" width="18" height="18" rx="4" stroke="var(--lp-accent)" strokeWidth="1.5" />
        <path d="M9 14l3 3 7-7" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    period: 'Tháng 2',
    title: 'Những thay đổi đầu tiên',
    desc: 'Da bắt đầu sáng đều, mụn giảm rõ rệt. Bạn sẽ thấy sự khác biệt từ gương.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <circle cx="14" cy="14" r="8" stroke="var(--lp-accent)" strokeWidth="1.5" />
        <path d="M14 10v4l3 2" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    period: 'Tháng 3+',
    title: 'Da ổn định và đẹp hơn',
    desc: 'Làn da mới: ổn định, ít mụn, đều màu. Duy trì kết quả với routine đơn giản hơn.',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path d="M5 20c3-6 5-4 9-10 4 6 6 4 9 10" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="14" cy="8" r="3" fill="var(--lp-accent)" opacity="0.3" />
      </svg>
    ),
  },
] as const;

export function NaturalEditorialJourneyPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const topProgram = suggestedPrograms[0];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)] px-5 py-12">
      <p className="text-xs uppercase tracking-widest text-cta/40 text-center mb-2">Hành trình của bạn</p>
      <h2 className="text-2xl font-extrabold text-cta text-center mb-2 leading-snug">
        Da đẹp hơn sau 3 tháng — từng bước rõ ràng
      </h2>
      {topProgram && (
        <p className="text-sm text-cta/50 text-center mb-10">
          Đề xuất: <span className="font-semibold text-cta">{topProgram.program.name}</span>
        </p>
      )}

      {/* Vertical timeline */}
      <div className="relative flex flex-col gap-0 max-w-md mx-auto w-full">
        {MILESTONES.map((m, i) => (
          <div key={i} className="flex gap-4">
            {/* Left connector */}
            <div className="flex flex-col items-center">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))' }}
              >
                {m.icon}
              </div>
              {i < MILESTONES.length - 1 && (
                <div className="w-px flex-1 my-1" style={{ background: 'var(--lp-border)', minHeight: 24 }} />
              )}
            </div>
            {/* Content */}
            <div className="pb-8 pt-1">
              <p className="text-[10px] uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--lp-accent)' }}>
                {m.period}
              </p>
              <p className="text-base font-bold text-cta mb-1">{m.title}</p>
              <p className="text-sm text-cta/60 leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onContinue(topProgram?.program.id ?? '')}
        className="mt-4 w-full max-w-md mx-auto py-4 rounded-soft font-bold text-white text-base transition-all active:scale-[0.98]"
        style={{ background: 'var(--lp-accent)' }}
      >
        Bắt đầu hành trình của bạn
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep editorial-journey`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/programs/natural/editorial-journey.tsx
git commit -m "feat(programs): add NaturalEditorialJourneyPrograms — 4-milestone treatment timeline (v15)"
```

---

## Task 9: Create v20 — Bold Typographic Commitment (programs variant)

**Files:**
- Create: `src/landing/variants/programs/bold/typographic-commitment.tsx`

3 intensity options (nhẹ / đều đặn / chuyên sâu). Maps to suggestedPrograms by index.

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React, { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ScoredProgram } from '../../../../content/recommend';

const LEVELS = [
  {
    value: 'light' as const,
    title: 'Nhẹ nhàng',
    sub: 'Cải thiện dần, phù hợp với lịch trình bận rộn',
  },
  {
    value: 'steady' as const,
    title: 'Đều đặn',
    sub: 'Kết quả rõ ràng sau 4–6 tuần — được nhiều người chọn nhất',
  },
  {
    value: 'intensive' as const,
    title: 'Chuyên sâu',
    sub: 'Tập trung điều trị triệt để trong thời gian ngắn',
  },
] as const;

type Level = typeof LEVELS[number]['value'];

function pickProgram(level: Level, programs: ScoredProgram[]) {
  if (programs.length === 0) return null;
  if (programs.length === 1) return programs[0]!;
  if (level === 'light')     return programs[programs.length - 1]!;
  if (level === 'steady')    return programs[0]!;
  // intensive: pick the one with highest score that is also a VIP/intensive session count
  const vipMatch = programs.find(p => p.program.isVip);
  return vipMatch ?? programs[0]!;
}

export function BoldTypographicCommitmentPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [selected, setSelected] = useState<Level | null>(null);

  function handleContinue() {
    if (!selected) return;
    const picked = pickProgram(selected, suggestedPrograms);
    onContinue(picked?.program.id ?? suggestedPrograms[0]?.program.id ?? '');
  }

  return (
    <div className="min-h-[100dvh] flex flex-col justify-center bg-[var(--lp-bg-minigame)] px-6 py-12">
      <p className="text-xs uppercase tracking-widest text-cta/40 mb-3">Cam kết của bạn</p>
      <h2 className="text-3xl font-extrabold text-cta leading-tight mb-10">
        Bạn muốn tiếp cận theo hướng nào?
      </h2>

      <div className="flex flex-col gap-0 mb-10">
        {LEVELS.map((l, i) => {
          const isSelected = selected === l.value;
          return (
            <button
              key={l.value}
              onClick={() => setSelected(l.value)}
              className="w-full py-6 text-left transition-all duration-150 active:scale-[0.99]"
              style={{
                borderBottom: i < LEVELS.length - 1 ? '1px solid var(--lp-border)' : 'none',
                opacity: selected && !isSelected ? 0.35 : 1,
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="mt-1 w-4 h-4 rounded-full border-2 shrink-0 transition-all duration-150"
                  style={{
                    borderColor: isSelected ? 'var(--lp-accent)' : 'var(--lp-border)',
                    background: isSelected ? 'var(--lp-accent)' : 'transparent',
                  }}
                />
                <div>
                  <p className="text-xl font-extrabold text-cta">{l.title}</p>
                  <p className="text-sm text-cta/50 mt-1 leading-relaxed">{l.sub}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <button
          onClick={handleContinue}
          className="w-full py-4 rounded-soft font-extrabold text-white text-base transition-all active:scale-[0.98]"
          style={{ background: 'var(--lp-accent)' }}
        >
          Tiếp tục
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep typographic-commitment`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/programs/bold/typographic-commitment.tsx
git commit -m "feat(programs): add BoldTypographicCommitmentPrograms — 3-intensity commitment chooser (v20)"
```

---

## Task 10: Create v14 — Expert Handoff (new slot, natural/spa variant)

**Files:**
- Create: `src/landing/variants/expertHandoff/natural/spa.tsx` (new directory `expertHandoff/natural/`)

Sequential chat bubbles personalized to `result.condition.id`. CTA after last bubble.

- [ ] **Step 1: Create directory structure and file**

Create `src/landing/variants/expertHandoff/natural/spa.tsx`:

```tsx
'use client';
import React, { useState, useEffect } from 'react';
import type { ExpertHandoffSlotProps } from '../../../slots';
import type { ConditionId } from '../../../../content/quiz';

const HANDOFF_MESSAGES: Partial<Record<ConditionId, string>> = {
  'mun-noi-tiet':    'Da bạn đang có mụn nội tiết — cần được chăm sóc từ gốc rễ, không chỉ bề mặt. Mình thấy liệu trình điều trị chuyên sâu sẽ phù hợp nhất với bạn.',
  'da-nhon-mun-viem':'Da nhờn và mụn viêm của bạn hoàn toàn có thể kiểm soát được. Bên mình có phác đồ riêng giúp da cân bằng bã nhờn và giảm viêm hiệu quả.',
  'da-nhay-cam':     'Da nhạy cảm cần được tiếp cận nhẹ nhàng. Mình sẽ hướng dẫn bạn từng bước để da không bị kích ứng thêm trong quá trình điều trị.',
  'lo-chan-long':    'Lỗ chân lông to có thể cải thiện rõ rệt khi được làm sạch đúng cách. Bên mình có liệu trình chuyên cho da dầu và lỗ chân lông mà bạn có thể thử.',
  'da-mun-tham-seo': 'Thâm sẹo sau mụn là điều nhiều bạn gặp phải và hoàn toàn có thể điều trị. Mình nghĩ protocol phục hồi da của bên mình sẽ rất phù hợp với tình trạng của bạn.',
  'da-seo-ro':       'Sẹo rỗ cần thời gian và đúng phương pháp. Mình sẽ tư vấn cho bạn quy trình điều trị từng giai đoạn để da phục hồi tốt nhất.',
};

const DEFAULT_MESSAGE = 'Tình trạng da của bạn hoàn toàn có thể cải thiện được. Mình nghĩ bên mình có thể giúp bạn đạt được làn da bạn muốn.';

export function NaturalSpaExpertHandoff({ result, onContinue }: ExpertHandoffSlotProps) {
  const [visibleCount, setVisibleCount] = useState(0);

  const personalMessage = HANDOFF_MESSAGES[result.condition.id as ConditionId] ?? DEFAULT_MESSAGE;

  const bubbles = [
    'Mình đã xem qua kết quả phân tích của bạn rồi ...',
    personalMessage,
    'Bạn muốn đặt lịch tư vấn để mình hướng dẫn chi tiết hơn không?',
  ];

  useEffect(() => {
    if (visibleCount >= bubbles.length) return;
    const timer = setTimeout(() => setVisibleCount(n => n + 1), visibleCount === 0 ? 600 : 900);
    return () => clearTimeout(timer);
  }, [visibleCount, bubbles.length]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)] px-5 pt-10 pb-8">
      {/* Avatar */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center text-white text-base font-bold shrink-0"
          style={{ background: 'var(--lp-accent)' }}
          aria-hidden="true"
        >
          L
        </div>
        <div>
          <p className="text-sm font-bold text-cta">Chuyên viên Lan</p>
          <p className="text-xs text-cta/40">O2 Skin Clinic</p>
        </div>
      </div>

      {/* Chat bubbles */}
      <div className="flex flex-col gap-4 flex-1">
        {bubbles.map((text, i) => (
          <div
            key={i}
            className="max-w-[80%] transition-all duration-500"
            style={{
              opacity: i < visibleCount ? 1 : 0,
              transform: i < visibleCount ? 'translateY(0)' : 'translateY(12px)',
            }}
            aria-live={i < visibleCount ? 'polite' : undefined}
          >
            <div
              className="rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed"
              style={{
                background: 'var(--lp-bg-card)',
                border: '1px solid var(--lp-border)',
                color: 'var(--lp-primary)',
              }}
            >
              {text}
            </div>
          </div>
        ))}
      </div>

      {/* CTA — appears after last bubble */}
      <div
        className="mt-6 transition-all duration-500"
        style={{
          opacity: visibleCount >= bubbles.length ? 1 : 0,
          transform: visibleCount >= bubbles.length ? 'translateY(0)' : 'translateY(12px)',
        }}
      >
        <button
          onClick={onContinue}
          disabled={visibleCount < bubbles.length}
          className="w-full py-4 rounded-soft font-bold text-white text-base transition-all active:scale-[0.98] disabled:opacity-0"
          style={{ background: 'var(--lp-accent)' }}
        >
          Đặt lịch ngay
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep expertHandoff`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/expertHandoff/natural/spa.tsx
git commit -m "feat(expertHandoff): add NaturalSpaExpertHandoff — chat bubble sequence with personalized message (v14)"
```

---

## Task 11: Create v17 — Teaser Payoff (new slot, bold/classic variant)

**Files:**
- Create: `src/landing/variants/teaserPayoff/bold/classic.tsx` (new directory `teaserPayoff/bold/`)

Blurred result preview with "breathing" pulse animation. Shown before minigame to prime curiosity.

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React from 'react';
import type { TeaserPayoffSlotProps } from '../../../slots';

export function BoldClassicTeaserPayoff({ onContinue }: TeaserPayoffSlotProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[var(--lp-bg-minigame)] px-5 py-12">
      <style>{`
        @keyframes teaser-breathe {
          0%, 100% { filter: blur(8px) opacity(0.65); transform: scale(1); }
          50%       { filter: blur(6px) opacity(0.8);  transform: scale(1.015); }
        }
      `}</style>

      <p className="text-xs uppercase tracking-widest text-cta/40 mb-3 text-center">Kết quả cá nhân hoá</p>
      <h2 className="text-2xl font-extrabold text-cta text-center mb-2 leading-snug">
        Kết quả phân tích da của bạn
      </h2>
      <p className="text-sm text-cta/50 text-center mb-10 max-w-xs">
        Hoàn thành phân tích da để nhận đánh giá chính xác dành riêng cho bạn
      </p>

      {/* Blurred teaser card */}
      <div className="relative w-full max-w-xs mb-10">
        {/* Fake result cards (blurred) */}
        <div
          className="w-full rounded-soft overflow-hidden"
          style={{ animation: 'teaser-breathe 2.4s ease-in-out infinite' }}
        >
          {['Da nhờn + mụn viêm', 'Lỗ chân lông to', 'Da ổn định'].map((label, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
              style={{
                background: 'var(--lp-bg-card)',
                borderColor: 'var(--lp-border)',
              }}
            >
              <div className="w-4 h-4 rounded-full shrink-0" style={{ background: 'var(--lp-accent)', opacity: 0.4 }} />
              <div className="flex-1">
                <div className="h-3 rounded-full w-2/3" style={{ background: 'var(--lp-border)' }} />
              </div>
              <div className="text-xs font-bold" style={{ color: 'var(--lp-accent)', opacity: 0.5 }}>
                {['●●', '●●●', '●'][i]}
              </div>
            </div>
          ))}
        </div>

        {/* Overlay label */}
        <div className="absolute inset-0 flex items-center justify-center rounded-soft" style={{ backdropFilter: 'blur(0px)' }}>
          <div
            className="px-4 py-2 rounded-full text-xs font-bold text-white"
            style={{ background: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)' }}
          >
            Cá nhân hóa cho bạn sau khi phân tích
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full max-w-xs py-4 rounded-soft font-extrabold text-white text-base transition-all active:scale-[0.98]"
        style={{ background: 'var(--lp-accent)' }}
      >
        Phân tích da của bạn
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep teaserPayoff`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/teaserPayoff/bold/classic.tsx
git commit -m "feat(teaserPayoff): add BoldClassicTeaserPayoff — blurred preview teaser before minigame (v17)"
```

---

## Task 12: Create v18 — Path Chooser (new slot, bold/stacked variant)

**Files:**
- Create: `src/landing/variants/pathChooser/bold/stacked.tsx` (new directory `pathChooser/bold/`)

Two full-width path cards. Tap = choose. No separate CTA button.

- [ ] **Step 1: Create the file**

```tsx
'use client';
import React from 'react';
import type { PathChooserSlotProps } from '../../../slots';

export function BoldStackedPathChooser({ onFastTrack, onFullFlow }: PathChooserSlotProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--lp-bg-minigame)]">
      {/* Fast track — top half */}
      <button
        onClick={onFastTrack}
        className="flex-1 flex flex-col justify-center px-8 transition-all duration-150 active:opacity-80 active:scale-[0.99]"
        style={{ borderBottom: '1px solid var(--lp-border)' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-2xl font-extrabold text-cta leading-tight mb-2">
              Tôi biết da mình<br />cần gì
            </p>
            <p className="text-sm text-cta/50">Đặt lịch tư vấn nhanh</p>
          </div>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <path d="M8 16h16M18 10l6 6-6 6" stroke="var(--lp-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {/* Full flow — bottom half */}
      <button
        onClick={onFullFlow}
        className="flex-1 flex flex-col justify-center px-8 transition-all duration-150 active:opacity-80 active:scale-[0.99]"
        style={{ background: 'color-mix(in srgb, var(--lp-accent) 6%, var(--lp-bg-minigame))' }}
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <p className="text-2xl font-extrabold text-cta leading-tight mb-2">
              Hãy phân tích da<br />giúp mình
            </p>
            <p className="text-sm text-cta/50">Nhận kết quả cá nhân hóa</p>
          </div>
          {/* Scan/sparkle icon */}
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="8" stroke="var(--lp-accent)" strokeWidth="2" />
            <circle cx="16" cy="16" r="3" fill="var(--lp-accent)" opacity="0.6" />
            <path d="M16 4v4M16 24v4M4 16h4M24 16h4" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
          </svg>
        </div>
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | grep pathChooser`

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/landing/variants/pathChooser/bold/stacked.tsx
git commit -m "feat(pathChooser): add BoldStackedPathChooser — two-path fast-track vs full-flow chooser (v18)"
```

---

## Task 13: Wire everything into registry.ts

**Files:**
- Modify: `src/landing/registry.ts`

Add 3 new imports groups + 3 new registry branches + 4 new entries to existing branches.

- [ ] **Step 1: Add new imports**

At the bottom of the existing import block (after the last `ElectricLightPop*` imports, before `export const registry`), add:

```ts
// Electric — new mechanic variants
import { ElectricClassicChainedMinigame } from './variants/minigame/electric/classic-chained';
import { ElectricGlowScratchMinigame }    from './variants/minigame/electric/glow-scratch';
import { ElectricSoftSwipeMinigame }      from './variants/minigame/electric/soft-swipe';
// Natural — new programs variant
import { NaturalEditorialJourneyPrograms } from './variants/programs/natural/editorial-journey';
// Bold — new programs variant
import { BoldTypographicCommitmentPrograms } from './variants/programs/bold/typographic-commitment';
// New slots
import { NaturalSpaExpertHandoff } from './variants/expertHandoff/natural/spa';
import { BoldClassicTeaserPayoff }  from './variants/teaserPayoff/bold/classic';
import { BoldStackedPathChooser }   from './variants/pathChooser/bold/stacked';
```

- [ ] **Step 2: Update the minigame branch in registry**

In the `minigame:` line, add 3 new entries to the end of the object (before the `as Record<...>` cast):

```ts
  'electric-classic-chained': ElectricClassicChainedMinigame,
  'electric-glow-scratch':    ElectricGlowScratchMinigame,
  'electric-soft-swipe':      ElectricSoftSwipeMinigame,
```

- [ ] **Step 3: Update the programs branch in registry**

In the `programs:` line, add 2 new entries:

```ts
  'natural-editorial-journey':       NaturalEditorialJourneyPrograms,
  'bold-typographic-commitment':     BoldTypographicCommitmentPrograms,
```

- [ ] **Step 4: Add 3 new registry branches**

Add these 3 new branches to the registry object after the `done:` branch:

```ts
  expertHandoff: { 'natural-spa': NaturalSpaExpertHandoff } as Record<string, ComponentType<ExpertHandoffSlotProps>>,
  teaserPayoff:  { 'bold-classic': BoldClassicTeaserPayoff } as Record<string, ComponentType<TeaserPayoffSlotProps>>,
  pathChooser:   { 'bold-stacked': BoldStackedPathChooser } as Record<string, ComponentType<PathChooserSlotProps>>,
```

Also add `ExpertHandoffSlotProps, TeaserPayoffSlotProps, PathChooserSlotProps` to the import from `'./slots'` at the top of the file.

- [ ] **Step 5: Verify TypeScript**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: 0 errors. This is the integration point — if any import is wrong, the error will appear here.

- [ ] **Step 6: Commit**

```bash
git add src/landing/registry.ts
git commit -m "feat(registry): wire 3 new minigame variants, 2 programs variants, expertHandoff/teaserPayoff/pathChooser slots"
```

---

## Task 14: Update 8 recipe files

**Files:**
- Modify: `src/landing/recipes/v14-natural-spa.ts`
- Modify: `src/landing/recipes/v15-natural-editorial.ts`
- Modify: `src/landing/recipes/v17-bold-classic.ts`
- Modify: `src/landing/recipes/v18-bold-stacked.ts`
- Modify: `src/landing/recipes/v20-bold-typographic.ts`
- Modify: `src/landing/recipes/v21-electric-classic.ts`
- Modify: `src/landing/recipes/v22-electric-glow-heavy.ts`
- Modify: `src/landing/recipes/v23-electric-soft-dark.ts`

- [ ] **Step 1: Update v14 — add expertHandoff slot**

```ts
// src/landing/recipes/v14-natural-spa.ts
import type { Recipe } from '../validateRecipe';

export const v14NaturalSpa: Recipe = {
  id: 'v14-natural-spa',
  label: 'v14 — Natural Sage / Spa',
  theme: 'dusty-rose',
  slots: {
    hook:          'natural-spa',
    minigame:      'natural-spa',
    payoff:        'natural-spa',
    expertHandoff: 'natural-spa',
    conversion:    'natural-spa',
    done:          'natural-spa',
  },
};
```

- [ ] **Step 2: Update v15 — change programs variant**

Read existing file and replace just the `programs` slot value:

```ts
// src/landing/recipes/v15-natural-editorial.ts — only the programs slot changes
programs: 'natural-editorial-journey',
```

The full file:

```ts
import type { Recipe } from '../validateRecipe';

export const v15NaturalEditorial: Recipe = {
  id: 'v15-natural-editorial',
  label: 'v15 — Natural Sage / Editorial',
  theme: 'cherry-jp',
  slots: {
    hook:       'natural-editorial',
    minigame:   'natural-editorial',
    payoff:     'natural-editorial',
    programs:   'natural-editorial-journey',
    conversion: 'natural-editorial',
    done:       'natural-editorial',
  },
};
```

- [ ] **Step 3: Update v17 — add teaserPayoff slot**

Read existing v17 file first, then update. Typical existing content:

```ts
import type { Recipe } from '../validateRecipe';

export const v17BoldClassic: Recipe = {
  id: 'v17-bold-classic',
  label: 'v17 — Bold / Classic',
  theme: 'lilac',
  slots: {
    hook:         'bold-classic',
    teaserPayoff: 'bold-classic',
    minigame:     'bold-classic',
    payoff:       'bold-classic',
    programs:     'bold-classic',
    conversion:   'bold-classic',
    done:         'bold-classic',
  },
};
```

- [ ] **Step 4: Update v18 — add pathChooser slot**

```ts
import type { Recipe } from '../validateRecipe';

export const v18BoldStacked: Recipe = {
  id: 'v18-bold-stacked',
  label: 'v18 — Bold / Stacked',
  theme: 'lilac',
  slots: {
    hook:        'bold-stacked',
    pathChooser: 'bold-stacked',
    minigame:    'bold-stacked',
    payoff:      'bold-stacked',
    programs:    'bold-stacked',
    conversion:  'bold-stacked',
    done:        'bold-stacked',
  },
};
```

- [ ] **Step 5: Update v20 — change programs variant**

```ts
import type { Recipe } from '../validateRecipe';

export const v20BoldTypographic: Recipe = {
  id: 'v20-bold-typographic',
  label: 'v20 — Bold / Typographic',
  theme: 'lilac',
  slots: {
    hook:       'bold-typographic',
    minigame:   'bold-typographic',
    payoff:     'bold-typographic',
    programs:   'bold-typographic-commitment',
    conversion: 'bold-typographic',
    done:       'bold-typographic',
  },
};
```

- [ ] **Step 6: Update v21 — change minigame variant**

```ts
import type { Recipe } from '../validateRecipe';

export const v21ElectricClassic: Recipe = {
  id: 'v21-electric-classic',
  label: 'v21 — Electric Magenta / Classic',
  theme: 'magenta',
  slots: {
    hook:       'electric-classic',
    minigame:   'electric-classic-chained',
    payoff:     'electric-classic',
    programs:   'electric-classic',
    conversion: 'electric-classic',
    done:       'electric-classic',
  },
};
```

- [ ] **Step 7: Update v22 — change minigame variant, drop programs**

```ts
import type { Recipe } from '../validateRecipe';

export const v22ElectricGlowHeavy: Recipe = {
  id: 'v22-electric-glow-heavy',
  label: 'v22 — Electric Magenta / Glow Heavy',
  theme: 'crimson',
  slots: {
    hook:       'electric-glow-heavy',
    minigame:   'electric-glow-scratch',
    payoff:     'electric-glow-heavy',
    conversion: 'electric-glow-heavy',
    done:       'electric-glow-heavy',
  },
};
```

- [ ] **Step 8: Update v23 — change minigame variant, drop programs**

```ts
import type { Recipe } from '../validateRecipe';

export const v23ElectricSoftDark: Recipe = {
  id: 'v23-electric-soft-dark',
  label: 'v23 — Electric Magenta / Soft Dark',
  theme: 'periwinkle',
  slots: {
    hook:       'electric-soft-dark',
    minigame:   'electric-soft-swipe',
    payoff:     'electric-soft-dark',
    conversion: 'electric-soft-dark',
    done:       'electric-soft-dark',
  },
};
```

- [ ] **Step 9: Run all tests to verify nothing broke**

Run: `npx vitest run`

Expected: all tests pass. The existing 25 versions (v01–v13, v16, v19, v24, v25) must still validate correctly since we only added optional slots.

- [ ] **Step 10: Verify TypeScript across the project**

Run: `npx tsc --noEmit 2>&1 | head -30`

Expected: 0 errors.

- [ ] **Step 11: Commit**

```bash
git add src/landing/recipes/
git commit -m "feat(recipes): update v14/v15/v17/v18/v20/v21/v22/v23 with new workflow slots and variants"
```

---

## Task 15: Smoke test all 8 versions in browser

**Goal:** Visually confirm each version's flow runs end-to-end without crashes.

- [ ] **Step 1: Start dev server and navigate to versions page**

Navigate to `/versions` in the browser (dev server at localhost:3000 or configured port).

- [ ] **Step 2: Test v21 — Classic Chained**

Click v21. Flow: hook → zone tap phase → choose 2 zones → "Tiếp theo" → skin chat phase 3 questions → payoff → programs → conversion.

Expected: Phase transition is visible (slide animation). Payoff receives correct `condition.label`.

- [ ] **Step 3: Test v22 — Glow Scratch**

Click v22. Flow: hook → select 1 of 3 choices → "Cào để khám phá" → scratch reveal (drag finger/mouse) → payoff → conversion.

Expected: Overlay erases as pointer moves. Reveal auto-completes at ~60% coverage or via fallback button.

- [ ] **Step 4: Test v23 — Soft Swipe**

Click v23. Flow: hook → 5 swipe cards → swipe or tap Yes/No → payoff → conversion.

Expected: Card tilts during drag. Progress dots update. "Yes" swipes move card right, "No" moves card left.

- [ ] **Step 5: Test v15 — Editorial Journey**

Click v15. Flow: hook → minigame → payoff → editorial timeline → conversion.

Expected: 4 milestone cards show with timeline connector. CTA at bottom triggers conversion.

- [ ] **Step 6: Test v20 — Commitment Level**

Click v20. Flow: hook → minigame → payoff → 3 intensity options → conversion.

Expected: Selecting an option dims others. "Tiếp tục" button appears after selection.

- [ ] **Step 7: Test v14 — Expert Handoff**

Click v14. Flow: hook → minigame → payoff → chat bubbles (staggered) → conversion.

Expected: 3 chat bubbles appear sequentially with delay. Bubble 2 is personalized to result condition. CTA appears after bubble 3.

- [ ] **Step 8: Test v17 — Teaser Payoff**

Click v17. Flow: hook → teaser preview (blurred cards with pulse animation) → "Phân tích da của bạn" → minigame → payoff → programs → conversion.

Expected: Blurred preview has breathing animation. Click CTA immediately enters minigame.

- [ ] **Step 9: Test v18 — Path Chooser**

Click v18. Flow: hook → two-card chooser.
- Path A (fast track): Tap "Tôi biết da mình cần gì" → skips to conversion with `minigameResult = null`. Form should render without crashing.
- Path B (full flow): Tap "Hãy phân tích da giúp mình" → minigame → payoff → programs → conversion.

Expected: Both paths work. Fast track form shows without condition card (null handled in ConversionOrganism).

- [ ] **Step 10: Verify existing versions are unchanged**

Navigate to v01, v16, v19. Confirm they still flow: hook → minigame → payoff → conversion as before.

- [ ] **Step 11: Commit smoke test verification**

If any bugs were found and fixed in steps 2–10, commit the fixes. Otherwise:

```bash
git log --oneline -10
```

Confirm all 10 task commits are present (tasks 1–14, with task 14 combined into one commit).

---

## Self-Review

### Spec coverage check

| Spec item | Task |
|-----------|------|
| v21: two-phase zone-tap + skin-chat | Task 5 |
| v22: single question + scratch reveal | Task 6 |
| v23: 5-card swipe quiz | Task 7 |
| v15: editorial treatment journey timeline | Task 8 |
| v20: 3-level commitment chooser | Task 9 |
| v14: expertHandoff with chat bubbles | Task 10 |
| v17: teaserPayoff blurred preview before minigame | Task 11 |
| v18: pathChooser + branching isFastTrack | Tasks 12 + 4 |
| slots.ts — 3 new types | Task 1 |
| validateRecipe.ts — 3 new optional slots | Task 2 |
| LandingFlow.tsx — nextAfterHook, nextAfterPayoff, new steps | Task 4 |
| registry.ts — 3 new branches + 5 new entries | Task 13 |
| 8 recipe files updated | Task 14 |
| No other versions broken | Task 14 step 9 |

### Type consistency check

- `ExpertHandoffSlotProps` defined in Task 1, used in Task 10 (component) and Task 13 (registry cast)
- `TeaserPayoffSlotProps` defined in Task 1, used in Task 11 (component) and Task 13 (registry cast)
- `PathChooserSlotProps` defined in Task 1, used in Task 12 (component) and Task 13 (registry cast)
- `ConditionId` imported from `'../../../../content/quiz'` in Tasks 5, 6, 7
- `mapToConditions` imported from `'../face-map'` in Task 5 — exported from face-map.tsx (confirmed)
- `FaceDiagram` imported from `'../face-map'` in Task 5 — exported from face-map.tsx (confirmed)
- `Zone`, `AcneType` imported from `'../face-map'` in Task 5 — exported types (confirmed)
- `ZONE_LABEL_MAP` defined locally in classic-chained.tsx — `ZONE_LABELS` is NOT exported from face-map.tsx
- `skinConditions` imported from `'../../../../content/quiz'` in Tasks 5, 6, 7, 10
- All condition IDs used in v22 and v23 (`'da-nhon-mun-viem'`, `'da-mun-tham-seo'`, `'lo-chan-long'`, `'da-nhay-cam'`, `'mun-noi-tiet'`) are confirmed in `ConditionId` union and `skinConditions` object from quiz.ts

### Placeholder scan

No "TBD", "TODO", or placeholder patterns found. All tasks contain runnable code.

### Import path verification

Component files are at depth 4 from `src/` (e.g., `variants/expertHandoff/natural/spa.tsx`). Content imports use `'../../../../content/quiz'` (4 levels up). Slot imports use `'../../../slots'` (3 levels up). These match the actual directory structure.

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-19-workflow-diversity-8versions.md`.

**Two execution options:**

**1. Subagent-Driven (recommended)** — Dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
