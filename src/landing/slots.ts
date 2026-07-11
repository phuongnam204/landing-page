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
