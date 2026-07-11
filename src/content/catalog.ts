import type { ConditionId, SkinCondition } from './quiz';
import { skinConditions } from './quiz';
import type { Program } from './programs';
import { programs } from './programs';

export function getConditionById(id: ConditionId): SkinCondition | undefined {
  return skinConditions[id];
}

export function getPrograms(): Program[] {
  return programs;
}

export function getProgramsTreating(conditionId: ConditionId): Program[] {
  return programs.filter((p) => p.treatsConditions.includes(conditionId));
}

export function getSuggestedProgram(conditionId: ConditionId): Program | undefined {
  const matching = getProgramsTreating(conditionId);
  if (matching.length > 0) return matching[0];
  return programs[0];
}
