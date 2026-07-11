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

export { getAllConditionIds } from './programs';

export function getProgramsTreating(conditionId: ConditionId): Program[] {
  return programs.filter(p => getAllConditionIds(p).includes(conditionId));
}

export function getSuggestedProgram(conditionId: ConditionId): Program | undefined {
  return recommendPrograms([conditionId], 1)[0]?.program ?? programs[0];
}
