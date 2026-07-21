import type { SkinCondition } from '../content/quiz';
import type { ProgramId } from '../content/programs';
import type { ScoredProgram } from '../content/recommend';
import type { HookCopy, MinigameCopy, PayoffCopy, TeaserPayoffCopy } from './copy';

export type MinigameResult = {
  conditions: SkinCondition[];
  condition: SkinCondition;
  zoneLabel: string;
  zoneIds: string[];
  triggerNote: string;
};

export type HookSlotProps = { onStart: () => void; copy?: HookCopy };

export type MinigameSlotProps = {
  onComplete: (result: MinigameResult) => void;
  copy?: MinigameCopy;
};

export type PayoffSlotProps = {
  result: MinigameResult;
  onContinue: () => void;
  copy?: PayoffCopy;
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

export type ExpertHandoffSlotProps = {
  result: MinigameResult;
  programId: ProgramId | null;
  onContinue: () => void;
};

export type TeaserPayoffSlotProps = {
  onContinue: () => void;
  copy?: TeaserPayoffCopy;
};

export type PathChooserSlotProps = {
  options: Array<{ id: string; label: string; description: string }>;
  onChoose: (optionId: string) => void;
};
