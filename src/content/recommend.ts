import type { ConditionId } from './quiz';
import { programs } from './programs';
import type { Program } from './programs';

export interface ScoredProgram {
  program: Program;
  score: number;
  matchedPrimary: ConditionId[];
  matchedSecondary: ConditionId[];
}

function scorePrograms(customerConditions: ConditionId[]): ScoredProgram[] {
  const conditionSet = new Set(customerConditions);
  return programs.map((program): ScoredProgram => {
    const matchedPrimary = program.primaryConditionIds.filter(id => conditionSet.has(id));
    const matchedSecondary = (program.secondaryConditionIds ?? []).filter(id => conditionSet.has(id));
    return {
      program,
      score: matchedPrimary.length * 2 + matchedSecondary.length,
      matchedPrimary,
      matchedSecondary,
    };
  });
}

export function recommendPrograms(
  customerConditions: ConditionId[],
  topN = 3,
): ScoredProgram[] {
  return scorePrograms(customerConditions)
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topN);
}

/** Trả về toàn bộ catalog với score — không filter, không slice. */
export function getAllScoredPrograms(customerConditions: ConditionId[]): ScoredProgram[] {
  return scorePrograms(customerConditions).sort((a, b) => b.score - a.score);
}
