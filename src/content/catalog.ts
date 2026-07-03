import { skinConditions, type ConditionId, type SkinCondition } from './quiz';
import { programs, type Program } from './programs';

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
  return getProgramsTreating(conditionId)[0] ?? programs[0];
}
