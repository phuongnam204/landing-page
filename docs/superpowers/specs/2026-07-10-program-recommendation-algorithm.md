# Spec: Program Recommendation Algorithm

**Date:** 2026-07-10
**Branch:** fix/landing-ux-review
**Status:** Awaiting implementation plan

---

## Problem

The current mechanism for suggesting a treatment program to a customer takes only the first `ConditionId` from the minigame result and returns the first program in the array that contains that ID. This fails in two ways:

1. It ignores all but the first detected condition — the minigame can return up to 3–4 conditions simultaneously.
2. It cannot differentiate between programs that list the same condition as a primary indication versus a secondary side benefit (e.g., both `ipl-oil-control` and `microneedling-repair` list `da-nep-nhan`, but LKN is the clinically correct recommendation for a customer whose only symptom is wrinkles).

## Goal

Produce a ranked list of top 2–3 programs that best match the customer's full set of detected conditions, using a weighted scoring approach that distinguishes primary from secondary indications.

---

## Data Model Change — `programs.ts`

### Before

```ts
export interface Program {
  // ...
  treatsConditionIds: ConditionId[];
}
```

### After

```ts
export interface Program {
  // ...
  primaryConditionIds: ConditionId[];     // +2 per match
  secondaryConditionIds?: ConditionId[];  // +1 per match
}
```

`treatsConditionIds` is removed entirely. A helper replaces it for any code that needs the full flat list:

```ts
export const getAllConditionIds = (p: Program): ConditionId[] =>
  [...p.primaryConditionIds, ...(p.secondaryConditionIds ?? [])];
```

### Data migration for 6 programs

| Program | primaryConditionIds | secondaryConditionIds |
|---|---|---|
| `peel-acne` | `mun-trung-ca`, `da-nhon-mun-viem`, `da-mun-tham-seo` | `lo-chan-long` |
| `ipl-oil-control` | `da-nhon-mun-viem`, `da-tham-do` | `da-nep-nhan`, `tan-nhang` |
| `laser-scar-treatment` | `lo-chan-long` | `da-nhay-cam` |
| `microneedling-repair` | `da-tho-rap`, `da-san-sui`, `da-nep-nhan` | `lo-chan-long` |
| `hormonal-acne-plan` | `mun-noi-tiet` | `da-nhon-mun-viem` |
| `maintenance-skin-health` | `clean-skin`, `da-moi-bat-dau` | *(none)* |

**Rationale for key decisions:**
- `da-nep-nhan` is primary for `microneedling-repair` because LKN directly stimulates collagen and elastin — the root mechanism for wrinkle reduction.
- `da-nep-nhan` is secondary for `ipl-oil-control` because IPL targets acne bacteria and sebum; wrinkle improvement is a side benefit.
- `da-nhon-mun-viem` is secondary for `hormonal-acne-plan` because the plan targets the hormonal root cause, not the surface inflammation.

---

## Scoring Algorithm — `src/content/recommend.ts` (new file)

```ts
import type { ConditionId } from './quiz';
import { programs, getAllConditionIds } from './programs';
import type { Program } from './programs';

export interface ScoredProgram {
  program: Program;
  score: number;
  matchedPrimary: ConditionId[];
  matchedSecondary: ConditionId[];
}

export function recommendPrograms(
  customerConditions: ConditionId[],
  topN = 3
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

### Edge cases

| Scenario | Behaviour |
|---|---|
| Score = 0 for all programs | Returns `[]`. UI shows `maintenance-skin-health` as a safe default — it is the most general program and does not assume any specific condition. |
| Two programs tie on score | Stable sort preserves original `programs` array order — deterministic. |
| `clean-skin` alongside another condition | `maintenance-skin-health` scores +2, but loses to any program that matches the other condition with primary (+2 or +4). |

---

## Slots Change — `src/landing/slots.ts`

### `MinigameResult`

```ts
export type MinigameResult = {
  conditions: SkinCondition[];  // all detected conditions (new)
  condition: SkinCondition;     // primary condition — kept for PayoffSlot backward compat
  zoneLabel: string;
  triggerNote: string;
};
```

### `ProgramsSlotProps`

```ts
export type ProgramsSlotProps = {
  suggestedPrograms: ScoredProgram[];
  onContinue: (programId: ProgramId) => void;
};
```

`ConversionSlotProps` and `DoneSlotProps` are unchanged — they receive a single `ProgramId` after the customer makes a selection.

---

## Changes to `catalog.ts`

`getProgramsTreating` and `getSuggestedProgram` are kept for backward compatibility but reimplemented using the new primitives:

```ts
export function getProgramsTreating(conditionId: ConditionId): Program[] {
  return programs.filter(p => getAllConditionIds(p).includes(conditionId));
}

export function getSuggestedProgram(conditionId: ConditionId): Program | undefined {
  return recommendPrograms([conditionId], 1)[0]?.program ?? programs[0];
}
```

---

## Call Sites to Update

| File | Line | Change |
|---|---|---|
| `src/components/molecules/ProgramCard.tsx` | 14 | `treatsConditionIds[0]` → `primaryConditionIds[0]` |
| `src/components/molecules/ProgramCard.tsx` | 42 | `.treatsConditionIds.map(...)` → `getAllConditionIds(p).map(...)` |
| `src/landing/variants/programs/GridWithFaqPrograms.tsx` | 166 | `.treatsConditionIds.map(...)` → `getAllConditionIds(p).map(...)` |
| `src/landing/variants/programs/GridWithFaqPrograms.tsx` | 203 | `treatsConditionIds[0]` → `primaryConditionIds[0]` |

---

## Wiring — ProgramsOrganism

The organism (or recipe) that connects MinigameSlot to ProgramsSlot is the single wiring point:

```ts
function handleMinigameComplete(result: MinigameResult) {
  const conditionIds = result.conditions.map(c => c.id);
  setSuggestedPrograms(recommendPrograms(conditionIds));
}
```

---

## Test Changes — `catalog.test.ts`

Two existing assertions reference `treatsConditionIds` and must be updated:

```ts
// Before
expect(p.treatsConditionIds).toContain('mun-noi-tiet');
expect(suggested!.treatsConditionIds[0]).toBe('mun-noi-tiet');

// After
expect(p.primaryConditionIds).toContain('mun-noi-tiet');
expect(suggested!.primaryConditionIds[0]).toBe('mun-noi-tiet');
```

New tests to add for `recommendPrograms`:
- Single condition returns the most specific program first.
- Multiple conditions: program with more primary matches wins.
- Score = 0 for all programs returns empty array.
- Top N cap is respected.

---

## Out of Scope

- The ConditionId inconsistency between `quiz.ts` and `programs.ts` (`da-nep-nhan` / `tan-nhang` vs `da-nep-nhan-tan-nhang`) is a separate data integrity issue and is not addressed in this spec.
- UI design for the ranked program list (how the top recommendation is visually highlighted vs. alternatives) is a UI concern separate from the algorithm.
