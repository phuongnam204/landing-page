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
  minigameResult: MinigameResult | null;
  onSubmit: (name: string, phone: string) => void;
};

export type SocialProofSlotProps = { onContinue: () => void };

export type DoneSlotProps = { selectedProgramId: ProgramId | null };
