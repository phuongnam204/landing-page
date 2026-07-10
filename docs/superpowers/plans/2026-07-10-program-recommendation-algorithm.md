# Program Recommendation Algorithm — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single-condition, first-match program selector with a weighted scoring algorithm that ranks top 2–3 programs by how well they match all conditions detected by the minigame.

**Architecture:** Split `treatsConditionIds` into `primaryConditionIds` (weight 2) and `secondaryConditionIds` (weight 1) in the data model; a pure `recommendPrograms(conditionIds, topN)` function scores and ranks programs; `MinigameResult` is extended to carry `conditions: SkinCondition[]`; `LandingFlow` wires the multi-condition array into the scorer and passes the ranked list down to the Programs slot.

**Tech Stack:** TypeScript, React 19, Next.js 15 App Router, Vitest

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Modify | `src/content/programs.ts` | Schema change + data migration for 6 programs |
| Create | `src/content/recommend.ts` | `ScoredProgram` type + `recommendPrograms()` pure function |
| Create | `src/content/recommend.test.ts` | Unit tests for `recommendPrograms` |
| Modify | `src/content/catalog.ts` | Re-implement `getProgramsTreating` + `getSuggestedProgram` using new primitives |
| Modify | `src/content/catalog.test.ts` | Fix 2 broken assertions; remove `treatsConditionIds` references |
| Modify | `src/landing/slots.ts` | Add `conditions: SkinCondition[]` to `MinigameResult`; change `ProgramsSlotProps` |
| Modify | `src/landing/variants/minigame/face-map.tsx` | `mapToCondition` → `mapToConditions` (multi-condition derivation) |
| Modify | `src/landing/variants/minigame/findgame.tsx` | Add `conditions: [condition]` |
| Modify | `src/landing/variants/minigame/skincare.tsx` | Add `conditions: [condition]` |
| Modify | `src/landing/LandingFlow.tsx` | Replace `getSuggestedProgram` with `recommendPrograms`; thread `suggestedPrograms` state |
| Modify | `src/landing/organisms/ProgramsOrganism.tsx` | Accept `suggestedPrograms: ScoredProgram[]`; mark top-N as suggested |
| Modify | `src/landing/variants/programs/GridWithFaqPrograms.tsx` | Adapt to new `ProgramsSlotProps`; fix `treatsConditionIds` usages |
| Modify | `src/components/molecules/ProgramCard.tsx` | Fix `treatsConditionIds[0]` → `primaryConditionIds[0]` and `.map` call |

---

## Task 1: Schema change + data migration in `programs.ts`

**Files:**
- Modify: `src/content/programs.ts`

- [ ] **Step 1: Update the `Program` interface**

Replace the interface block (lines 4–15) with:

```ts
export type ProgramId = string;

export interface Program {
  id: ProgramId;
  name: string;
  summary?: string[];
  description: string;
  benenif?: string;
  isVip?: boolean;
  primaryConditionIds: ConditionId[];
  secondaryConditionIds?: ConditionId[];
  sessions?: number;
  o2skinComboRef?: string;
}

export const getAllConditionIds = (p: Program): ConditionId[] =>
  [...p.primaryConditionIds, ...(p.secondaryConditionIds ?? [])];
```

- [ ] **Step 2: Migrate all 6 program data entries**

Replace the entire `programs` array with:

```ts
export const programs: Program[] = [
  {
    id: 'peel-acne',
    name: 'Peel da trị mụn',
    summary: [
      "Điều trị mụn trứng cá, mụn ẩn, mụn viêm.",
      "Làm mờ vết thâm và sẹo sau mụn hiệu quả.",
      "Tái tạo lớp da mới, trắng sáng, sạch mụn.",
      "Không gây đau và không cần nghỉ dưỡng."
    ],
    description: 'Peel da trị mụn là phương pháp được nhiều người yêu thích bởi hiệu quả cao và \
    không tốn nhiều thời gian. Một số người vì muốn tiết kiệm chi phí mà tự peel da tại nhà, \
    thực hiện không đúng cách nên dẫn đến tổn thương da như kích ứng, bỏng rát, mụn nặng hơn,… \
    Vì vậy, để đảm bảo an toàn bạn nên chọn cơ sở uy tín, chuẩn y khoa và có bác sĩ da liễu tư vấn nhé.',
    primaryConditionIds: ['mun-trung-ca', 'da-nhon-mun-viem', 'da-mun-tham-seo'],
    secondaryConditionIds: ['lo-chan-long'],
    benenif: "Khi peel trị mụn với bác sĩ da liễu, bạn sẽ được tư vấn cẩn thận và cá nhân hóa liệu trình peel để đảm bảo an toàn và đạt hiệu quả điều trị mụn tối đa.",
    sessions: 4,
    o2skinComboRef: 'Combo 4: Sạch Mụn Và Điều Trị Mụn, Thâm Lấy Nhân Mụn & Peel Da',
  },
  {
    id: 'ipl-oil-control',
    name: 'IPL kiểm soát nhờn & mụn',
    description: 'Bạn đang tìm một phương pháp trị mụn không xâm lấn, an toàn và hiệu quả cao? \
    IPL trị mụn và kiểm soát nhờn chính là giải pháp dành riêng cho bạn. \
    Phương pháp không chỉ phù hợp với những tình trạng mụn mức độ nhẹ đến \
    trung bình mà còn đạt kết quả ấn tượng với trường hợp da mụn nặng và đổ \
    nhờn nhiều. Liệu trình hỗ trợ da hết nhờn, mụn viêm giảm rõ sau 6 buổi — phù hợp mụn lan rộng ở da mặt (từ cổ trở lên).',
    isVip: true,
    summary: [
      "Hỗ trợ trị mụn mức độ nhẹ đến trung bình.",
      "Điều tiết hoạt động tuyến bã nhờn, thu nhỏ lỗ chân lông.",
      "Cải thiện các dấu hiệu lão hóa sớm như nếp nhăn, sạm da…",
      "Tăng độ đàn hồi tự nhiên, giúp da săn chắc."
    ],
    primaryConditionIds: ['da-nhon-mun-viem', 'da-tham-do'],
    secondaryConditionIds: ['da-nep-nhan', 'tan-nhang'],
    benenif: "Không chỉ có ưu điểm ít xâm lấn, ít gây tổn thương cho da, trị mụn bằng IPL còn sở hữu rất nhiều công dụng nổi bật với thời gian điều trị ngắn và hồi phục nhanh và không có tác dụng phụ.",
    sessions: 6,
    o2skinComboRef: 'o2skin Combo IPL thật (đối chiếu)',
  },
  {
    id: 'laser-scar-treatment',
    name: 'Laser trị sẹo rỗ & tái tạo da',
    description: 'Sẹo rỗ mờ dần, lỗ chân lông se khít sau 7 buổi — da đều màu và sáng hơn nhìn thấy rõ.',
    isVip: true,
    primaryConditionIds: ['lo-chan-long'],
    secondaryConditionIds: ['da-nhay-cam'],
    sessions: 7,
    o2skinComboRef: 'o2skin Combo Laser thật (đối chiếu)',
  },
  {
    id: 'microneedling-repair',
    name: 'Lăn kim phục hồi & cấp ẩm',
    description: 'Làn da thô ráp, nhiều khuyết điểm là nỗi lo của rất nhiều khách hàng. Trong \
    trường hợp này, quý khách có thể áp dụng phương pháp lăn kim nông giúp tái tạo da tự \
    nhiên, an toàn và mang lại làn da khoẻ hơn, ít kích ứng và sáng dần sau 5 buổi — phục hồi hàng rào bảo vệ tự nhiên.',
    summary: [
      "Giúp da trắng sáng, đều màu.",
      "Thu nhỏ lỗ chân lông, điều tiết hoạt động bã nhờn.",
      "Cải thiện màu sắc ở các vết thâm, sạm, nám…",
      "Giúp làn da mịn màng, căng bóng."
    ],
    primaryConditionIds: ['da-tho-rap', 'da-san-sui', 'da-nep-nhan'],
    secondaryConditionIds: ['lo-chan-long'],
    sessions: 5,
    o2skinComboRef: 'o2skin Combo Lăn kim thật (đối chiếu)',
  },
  {
    id: 'hormonal-acne-plan',
    name: 'Phác đồ mụn nội tiết',
    description: 'Mụn cằm và quai hàm không tái phát sau 8 buổi — phác đồ tập trung vào nguyên nhân nội tiết gốc rễ.',
    isVip: true,
    primaryConditionIds: ['mun-noi-tiet'],
    secondaryConditionIds: ['da-nhon-mun-viem'],
    sessions: 8,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
  },
  {
    id: 'maintenance-skin-health',
    name: 'Duy trì & chống lão hóa',
    description: 'Giữ da sạch và ổn định lâu dài sau điều trị — ngăn tái phát với chu trình 3 buổi nhẹ nhàng.',
    primaryConditionIds: ['clean-skin', 'da-moi-bat-dau'],
    sessions: 3,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/content/programs.ts
git commit -m "refactor(programs): split treatsConditionIds into primary/secondary with getAllConditionIds helper"
```

---

## Task 2: Create `recommend.ts` with TDD

**Files:**
- Create: `src/content/recommend.ts`
- Create: `src/content/recommend.test.ts`

- [ ] **Step 1: Write failing tests in `src/content/recommend.test.ts`**

```ts
import { describe, it, expect } from 'vitest';
import { recommendPrograms } from './recommend';

describe('recommendPrograms', () => {
  it('returns empty array when no program matches', () => {
    const result = recommendPrograms(['da-moi-bat-dau' as never]);
    // da-moi-bat-dau is primary of maintenance-skin-health, so this should match
    // Use a condition that no program treats
    expect(recommendPrograms([])).toEqual([]);
  });

  it('ranks primary match higher than secondary match for same condition', () => {
    // da-nep-nhan: primary of microneedling-repair (+2), secondary of ipl-oil-control (+1)
    const results = recommendPrograms(['da-nep-nhan']);
    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].program.id).toBe('microneedling-repair');
    expect(results[0].score).toBe(2);
    expect(results[1].program.id).toBe('ipl-oil-control');
    expect(results[1].score).toBe(1);
  });

  it('accumulates score across multiple conditions', () => {
    // mun-noi-tiet + da-nhon-mun-viem:
    //   hormonal-acne-plan: primary mun-noi-tiet (+2) + secondary da-nhon-mun-viem (+1) = 3
    //   peel-acne: primary da-nhon-mun-viem (+2) = 2
    const results = recommendPrograms(['mun-noi-tiet', 'da-nhon-mun-viem']);
    expect(results[0].program.id).toBe('hormonal-acne-plan');
    expect(results[0].score).toBe(3);
    expect(results[0].matchedPrimary).toContain('mun-noi-tiet');
    expect(results[0].matchedSecondary).toContain('da-nhon-mun-viem');
  });

  it('respects the topN cap', () => {
    const results = recommendPrograms(['da-nhon-mun-viem', 'lo-chan-long', 'da-mun-tham-seo'], 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('filters out programs with score 0', () => {
    // maintenance-skin-health only matches clean-skin or da-moi-bat-dau
    const results = recommendPrograms(['mun-noi-tiet']);
    expect(results.every(r => r.score > 0)).toBe(true);
    expect(results.find(r => r.program.id === 'maintenance-skin-health')).toBeUndefined();
  });

  it('returns matchedPrimary and matchedSecondary arrays correctly', () => {
    const results = recommendPrograms(['da-nep-nhan']);
    const lkn = results.find(r => r.program.id === 'microneedling-repair')!;
    expect(lkn.matchedPrimary).toEqual(['da-nep-nhan']);
    expect(lkn.matchedSecondary).toEqual([]);

    const ipl = results.find(r => r.program.id === 'ipl-oil-control')!;
    expect(ipl.matchedPrimary).toEqual([]);
    expect(ipl.matchedSecondary).toEqual(['da-nep-nhan']);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails (import error)**

```bash
npx vitest run src/content/recommend.test.ts
```

Expected: FAIL — `Cannot find module './recommend'`

- [ ] **Step 3: Implement `src/content/recommend.ts`**

```ts
import type { ConditionId } from './quiz';
import { programs } from './programs';
import type { Program } from './programs';

export interface ScoredProgram {
  program: Program;
  score: number;
  matchedPrimary: ConditionId[];
  matchedSecondary: ConditionId[];
}

export function recommendPrograms(
  customerConditions: ConditionId[],
  topN = 3,
): ScoredProgram[] {
  const conditionSet = new Set(customerConditions);

  return programs
    .map((program): ScoredProgram => {
      const matchedPrimary = program.primaryConditionIds.filter(id => conditionSet.has(id));
      const matchedSecondary = (program.secondaryConditionIds ?? []).filter(id => conditionSet.has(id));
      return {
        program,
        score: matchedPrimary.length * 2 + matchedSecondary.length,
        matchedPrimary,
        matchedSecondary,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}
```

- [ ] **Step 4: Run tests — all must pass**

```bash
npx vitest run src/content/recommend.test.ts
```

Expected: all 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/content/recommend.ts src/content/recommend.test.ts
git commit -m "feat(recommend): add recommendPrograms with weighted primary/secondary scoring"
```

---

## Task 3: Update `catalog.ts`

**Files:**
- Modify: `src/content/catalog.ts`

- [ ] **Step 1: Replace the contents of `catalog.ts`**

```ts
import type { ConditionId, SkinCondition } from './quiz';
import { skinConditions } from './quiz';
import type { Program } from './programs';
import { programs, getAllConditionIds } from './programs';
import { recommendPrograms } from './recommend';

export function getConditionById(id: ConditionId): SkinCondition | undefined {
  return skinConditions[id];
}

export function getPrograms(): Program[] {
  return programs;
}

export function getProgramsTreating(conditionId: ConditionId): Program[] {
  return programs.filter(p => getAllConditionIds(p).includes(conditionId));
}

export function getSuggestedProgram(conditionId: ConditionId): Program | undefined {
  return recommendPrograms([conditionId], 1)[0]?.program ?? programs[0];
}
```

- [ ] **Step 2: Run all tests to confirm nothing new broke**

```bash
npx vitest run
```

Expected: catalog.test.ts will fail on 2 assertions (that's expected — Task 4 fixes them). `recommend.test.ts` stays green.

- [ ] **Step 3: Commit**

```bash
git add src/content/catalog.ts
git commit -m "refactor(catalog): reimplement getProgramsTreating and getSuggestedProgram using new primitives"
```

---

## Task 4: Fix `catalog.test.ts`

**Files:**
- Modify: `src/content/catalog.test.ts`

- [ ] **Step 1: Fix the two broken assertions**

Find and replace these two assertions:

```ts
// Line 41 — BEFORE
expect(p.treatsConditionIds).toContain('mun-noi-tiet');

// Line 41 — AFTER
expect(p.primaryConditionIds).toContain('mun-noi-tiet');
```

```ts
// Line 55 — BEFORE
expect(suggested!.treatsConditionIds[0]).toBe('mun-noi-tiet');

// Line 55 — AFTER
expect(suggested!.primaryConditionIds[0]).toBe('mun-noi-tiet');
```

- [ ] **Step 2: Run all tests — all must pass**

```bash
npx vitest run
```

Expected: all tests PASS

- [ ] **Step 3: Commit**

```bash
git add src/content/catalog.test.ts
git commit -m "fix(tests): update catalog.test.ts assertions to use primaryConditionIds"
```

---

## Task 5: Update `slots.ts`

**Files:**
- Modify: `src/landing/slots.ts`

- [ ] **Step 1: Replace the contents of `slots.ts`**

```ts
import type { SkinCondition } from '../content/quiz';
import type { ProgramId } from '../content/programs';
import type { ScoredProgram } from '../content/recommend';

export type MinigameResult = {
  conditions: SkinCondition[];
  condition: SkinCondition;
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
  suggestedPrograms: ScoredProgram[];
  onContinue: (programId: ProgramId) => void;
};

export type ConversionSlotProps = {
  selectedProgramId: ProgramId | null;
  minigameResult: MinigameResult | null;
  onSubmit: (name: string, phone: string) => void;
};

export type SocialProofSlotProps = { onContinue: () => void };

export type DoneSlotProps = { selectedProgramId: ProgramId | null };
```

- [ ] **Step 2: Run TypeScript check to surface all downstream type errors**

```bash
npx tsc --noEmit
```

Expected: errors in `face-map.tsx`, `findgame.tsx`, `skincare.tsx`, `LandingFlow.tsx`, `ProgramsOrganism.tsx`, `GridWithFaqPrograms.tsx`, `ProgramCard.tsx`. These are fixed in subsequent tasks.

- [ ] **Step 3: Commit**

```bash
git add src/landing/slots.ts
git commit -m "refactor(slots): MinigameResult adds conditions[]; ProgramsSlotProps uses suggestedPrograms"
```

---

## Task 6: Update minigame variants to emit `conditions[]`

**Files:**
- Modify: `src/landing/variants/minigame/face-map.tsx`
- Modify: `src/landing/variants/minigame/findgame.tsx`
- Modify: `src/landing/variants/minigame/skincare.tsx`

- [ ] **Step 1: Replace `mapToCondition` with `mapToConditions` in `face-map.tsx`**

Remove the existing `mapToCondition` function (lines 34–42) and replace with:

```ts
function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none' && zones.length === 0) return ['clean-skin'];

  const result = new Set<ConditionId>();

  if (zones.includes('chin-jaw')) result.add('mun-noi-tiet');
  if (acneType === 'sensitive') result.add('da-nhay-cam');
  if (acneType === 'pore') result.add('lo-chan-long');
  if (zones.includes('nose') && acneType === 'blackhead') result.add('lo-chan-long');
  if (zones.length > 0 && (acneType === 'inflamed' || acneType === 'blackhead')) {
    result.add('da-nhon-mun-viem');
  }

  return result.size > 0 ? [...result] : ['da-moi-bat-dau'];
}
```

- [ ] **Step 2: Update `handleSubmit` in `face-map.tsx`**

Replace the existing `handleSubmit` function (lines 199–212) with:

```ts
function handleSubmit() {
  const type = acneType ?? 'none';
  const conditionIds = mapToConditions(selectedZones, type);
  const conditions = conditionIds.map(id => skinConditions[id]).filter(Boolean);
  const condition = conditions[0];
  const zoneLabel = selectedZones.length > 0
    ? selectedZones.map(z => ZONE_LABELS[z]).join(', ')
    : 'không có vùng cụ thể';
  const typeInfo = ACNE_TYPES.find(t => t.id === type);
  onComplete({
    conditions,
    condition,
    zoneLabel,
    triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '',
  });
}
```

- [ ] **Step 3: Update `findgame.tsx`**

The current `onComplete` call (line 8) is:

```ts
onComplete={(condition, stats) => onComplete({
  condition,
  zoneLabel: stats.zoneLabel,
  triggerNote: '',
})}
```

Replace with:

```ts
onComplete={(condition, stats) => onComplete({
  conditions: [condition],
  condition,
  zoneLabel: stats.zoneLabel,
  triggerNote: '',
})}
```

- [ ] **Step 4: Update `skincare.tsx`**

The current `onComplete` call (line 8) is:

```ts
onComplete={(condition, stats) => onComplete({
  condition,
  zoneLabel: stats.zoneLabel,
  triggerNote: stats.triggerNote ?? '',
})}
```

Replace with:

```ts
onComplete={(condition, stats) => onComplete({
  conditions: [condition],
  condition,
  zoneLabel: stats.zoneLabel,
  triggerNote: stats.triggerNote ?? '',
})}
```

- [ ] **Step 5: Run TypeScript check — minigame errors should be gone**

```bash
npx tsc --noEmit 2>&1 | grep -E "minigame|face-map|findgame|skincare"
```

Expected: no errors for these three files

- [ ] **Step 6: Commit**

```bash
git add src/landing/variants/minigame/face-map.tsx src/landing/variants/minigame/findgame.tsx src/landing/variants/minigame/skincare.tsx
git commit -m "feat(minigame): emit conditions[] from all variants; face-map derives multi-condition from zones"
```

---

## Task 7: Wire `LandingFlow.tsx`

**Files:**
- Modify: `src/landing/LandingFlow.tsx`

- [ ] **Step 1: Replace the contents of `LandingFlow.tsx`**

```ts
'use client';
import React, { useState } from 'react';
import type { ProgramId } from '../content/programs';
import { recommendPrograms, type ScoredProgram } from '../content/recommend';
import { trackEvent } from '../lib/trackEvent';
import { registry } from './registry';
import type { MinigameResult } from './slots';
import type { Recipe } from './validateRecipe';

type Step = 'hook' | 'minigame' | 'payoff' | 'programs' | 'conversion' | 'socialProof' | 'done';

export default function LandingFlow({ recipe }: { recipe: Recipe }) {
  const [step, setStep] = useState<Step>('hook');
  const [transitioning, setTransitioning] = useState(false);
  const [minigameResult, setMinigameResult] = useState<MinigameResult | null>(null);
  const [suggestedPrograms, setSuggestedPrograms] = useState<ScoredProgram[]>([]);
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
    transitionTo('done');
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
    <div className={`overflow-hidden ${themeClass} ${containerClass}`}>
      {step === 'hook' && Hook && <Hook onStart={() => transitionTo('minigame')} />}

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

      {step === 'programs' && Programs && (
        <Programs suggestedPrograms={suggestedPrograms}
          onContinue={(programId) => { setSelectedProgram(programId); transitionTo('conversion'); }} />
      )}

      {step === 'conversion' && Conversion && (
        <Conversion selectedProgramId={selectedProgram} minigameResult={minigameResult}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { program: selectedProgram });
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

- [ ] **Step 2: Commit**

```bash
git add src/landing/LandingFlow.tsx
git commit -m "feat(landing): wire recommendPrograms into LandingFlow; thread suggestedPrograms to Programs slot"
```

---

## Task 8: Update `ProgramsOrganism.tsx`

**Files:**
- Modify: `src/landing/organisms/ProgramsOrganism.tsx`

- [ ] **Step 1: Replace the contents of `ProgramsOrganism.tsx`**

```ts
'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../slots';
import type { ProgramId } from '../../content/programs';
import { getPrograms } from '../../content/catalog';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';
import { ProgramCard } from '../../components/molecules/ProgramCard';
import { FaqAccordion, type FaqItem } from '../../components/molecules/FaqAccordion';
import { trackEvent } from '../../lib/trackEvent';

export type ProgramsLayout = 'grid' | 'carousel' | 'grid-faq';

interface ProgramsOrganismProps extends ProgramsSlotProps {
  layout: ProgramsLayout;
  faqItems?: FaqItem[];
}

export function ProgramsOrganism({ suggestedPrograms, onContinue, layout, faqItems }: ProgramsOrganismProps) {
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const allPrograms = getPrograms();
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);
  const selectedProgram = allPrograms.find(p => p.id === selected);

  return (
    <SectionShell bgVar="--lp-bg-programs" overflow="auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-5xl mb-5">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <img src="/mascots/nurse-cheer.png" alt="" className="ps-popCheer ps-floaty w-16 md:w-24 h-auto object-contain" style={{ zIndex: 20 }} />
            <h2 className="ps-fadeDown text-xl md:text-2xl font-extrabold text-cta text-center [animation-delay:0.1s]">
              Các gói dịch vụ tại O2Skin
            </h2>
            <img src="/mascots/nurse-review.png" alt="" className="ps-popCheer ps-floaty hidden sm:block w-16 md:w-24 h-auto object-contain" style={{ animationDelay: '0.2s', zIndex: 20 }} />
          </div>
        </div>

        {layout === 'carousel' ? (
          <div className="w-full max-w-5xl flex gap-4 overflow-x-auto pb-2 mb-6 snap-x snap-mandatory">
            {allPrograms.map((program, idx) => (
              <div key={program.id} className="snap-start shrink-0 w-56 md:w-64">
                <ProgramCard
                  program={program}
                  selected={selected === program.id}
                  isSuggested={suggestedIds.has(program.id)}
                  onSelect={() => setSelected(program.id)}
                  style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-5xl grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
            {allPrograms.map((program, idx) => (
              <ProgramCard
                key={program.id}
                program={program}
                selected={selected === program.id}
                isSuggested={suggestedIds.has(program.id)}
                onSelect={() => setSelected(program.id)}
                style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
              />
            ))}
          </div>
        )}

        {layout === 'grid-faq' && faqItems && faqItems.length > 0 && (
          <div className="w-full max-w-5xl mb-6">
            <FaqAccordion
              items={faqItems}
              onOpen={idx => trackEvent('faq_item_open', { index: idx })}
            />
          </div>
        )}

        <CtaButton onClick={() => onContinue(selected)} variant="accent" size="md">
          {`Đăng ký chương trình ${selectedProgram?.name ?? ''} →`}
        </CtaButton>
      </div>
    </SectionShell>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/landing/organisms/ProgramsOrganism.tsx
git commit -m "refactor(ProgramsOrganism): accept suggestedPrograms[]; mark top-N as isSuggested"
```

---

## Task 9: Update `GridWithFaqPrograms.tsx`

**Files:**
- Modify: `src/landing/variants/programs/GridWithFaqPrograms.tsx`

- [ ] **Step 1: Locate and update the component signature and program lookup (line 198–204)**

Replace:
```ts
export function GridWithFaqPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const program = getPrograms().find(p => p.id === suggestedProgramId);
  const primaryConditionId = (program?.treatsConditionIds[0] ?? 'da-nhon-mun-viem') as ConditionId;
  const cond = program?.treatsConditionIds
```

With:
```ts
export function GridWithFaqPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const program = suggestedPrograms[0]?.program;
  const primaryConditionId = (program?.primaryConditionIds[0] ?? 'da-nhon-mun-viem') as ConditionId;
  const cond = program?.primaryConditionIds
```

- [ ] **Step 2: Update `treatsConditionIds.map` call (line 166)**

Find:
```ts
{program.treatsConditionIds.map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
```

Replace with (import `getAllConditionIds` at the top of the file):
```ts
{getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
```

Add this import at the top of `GridWithFaqPrograms.tsx`:
```ts
import { getPrograms, getAllConditionIds } from '../../../content/catalog';
```

Note: `getAllConditionIds` must be re-exported from `catalog.ts`. Add to `catalog.ts`:
```ts
export { getAllConditionIds } from './programs';
```

- [ ] **Step 3: Update all remaining `suggestedProgramId` references within the file**

There are three more places: line 170 (`onContinue(suggestedProgramId)`), line 214 (`programId: suggestedProgramId`), line 225 (`suggestedProgramId={suggestedProgramId}`), line 236 (`onBook={() => onContinue(suggestedProgramId)}`).

The `suggestedProgramId` variable is replaced by `suggestedPrograms[0]?.program.id`. Create a local const at the top of the component:

```ts
const topProgramId = suggestedPrograms[0]?.program.id ?? (getPrograms()[0].id as ProgramId);
```

Then replace all occurrences of `suggestedProgramId` (inside the function body) with `topProgramId`.

The `ProgramHighlight` component prop `suggestedProgramId` also needs updating — change its type from `ProgramId` to `ProgramId | undefined` and update the comparison.

- [ ] **Step 4: Run TypeScript check — no remaining errors**

```bash
npx tsc --noEmit
```

Expected: 0 errors

- [ ] **Step 5: Commit**

```bash
git add src/content/catalog.ts src/landing/variants/programs/GridWithFaqPrograms.tsx
git commit -m "refactor(GridWithFaqPrograms): adapt to suggestedPrograms[]; use primaryConditionIds"
```

---

## Task 10: Fix `ProgramCard.tsx` call sites

**Files:**
- Modify: `src/components/molecules/ProgramCard.tsx`

- [ ] **Step 1: Add `getAllConditionIds` import**

At the top of `ProgramCard.tsx`, add to the programs import:
```ts
import { getAllConditionIds } from '../../content/catalog';
```

- [ ] **Step 2: Fix line 14 — primary condition lookup**

Replace:
```ts
const cond = getConditionById(program.treatsConditionIds[0]);
```

With:
```ts
const cond = getConditionById(program.primaryConditionIds[0]);
```

- [ ] **Step 3: Fix line 42 — condition tag list**

Replace:
```ts
{program.treatsConditionIds.map(cid => {
```

With:
```ts
{getAllConditionIds(program).map(cid => {
```

- [ ] **Step 4: Run TypeScript check and tests — all clean**

```bash
npx tsc --noEmit && npx vitest run
```

Expected: 0 type errors, all tests PASS

- [ ] **Step 5: Final commit**

```bash
git add src/components/molecules/ProgramCard.tsx
git commit -m "fix(ProgramCard): use primaryConditionIds[0] and getAllConditionIds for condition display"
```

---

## Self-Review

**Spec coverage:**
- [x] Data model: `primaryConditionIds` + `secondaryConditionIds` + `getAllConditionIds` — Task 1
- [x] Data migration for 6 programs — Task 1
- [x] `recommendPrograms` pure function + `ScoredProgram` type — Task 2
- [x] `catalog.ts` backward-compat layer — Task 3
- [x] `catalog.test.ts` fixes + new tests — Tasks 4 + 2
- [x] `MinigameResult.conditions[]` — Task 5 + 6
- [x] `ProgramsSlotProps.suggestedPrograms` — Task 5
- [x] `face-map.tsx` multi-condition derivation — Task 6
- [x] `findgame.tsx` + `skincare.tsx` — Task 6
- [x] `LandingFlow.tsx` wiring — Task 7
- [x] `ProgramsOrganism.tsx` — Task 8
- [x] `GridWithFaqPrograms.tsx` — Task 9
- [x] `ProgramCard.tsx` — Task 10

**Type consistency:** `ScoredProgram` defined in `recommend.ts` → imported in `slots.ts`, `LandingFlow.tsx`, `ProgramsOrganism.tsx`, `GridWithFaqPrograms.tsx`. `getAllConditionIds` defined in `programs.ts`, re-exported from `catalog.ts`, imported in `ProgramCard.tsx` and `GridWithFaqPrograms.tsx`. Consistent throughout.

**No placeholders found.**
