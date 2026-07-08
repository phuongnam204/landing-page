import type { ComponentType } from 'react';
import type { HookSlotProps, MinigameSlotProps, PayoffSlotProps, ProgramsSlotProps, ConversionSlotProps, SocialProofSlotProps, DoneSlotProps } from './slots';
import { TwoColumnHook } from './variants/hook/two-column';
import { BoldSingleHook } from './variants/hook/bold-single';
import { FindgameMinigame } from './variants/minigame/findgame';
import { SkincareMinigame } from './variants/minigame/skincare';
import { FaceMapMinigame } from './variants/minigame/face-map';
import { ConfettiCardPayoff } from './variants/payoff/confetti-card';
import { GridPrograms } from './variants/programs/grid';
import { CarouselPrograms } from './variants/programs/carousel';
import { ShortFormConversion } from './variants/conversion/short-form';
import { ContactInfoDone } from './variants/done/contact-info';

export const registry = {
  hook:        { 'two-column': TwoColumnHook, 'bold-single': BoldSingleHook } as Record<string, ComponentType<HookSlotProps>>,
  minigame:    { findgame: FindgameMinigame, skincare: SkincareMinigame, 'face-map': FaceMapMinigame } as Record<string, ComponentType<MinigameSlotProps>>,
  payoff:      { 'confetti-card': ConfettiCardPayoff } as Record<string, ComponentType<PayoffSlotProps>>,
  programs:    { grid: GridPrograms, carousel: CarouselPrograms } as Record<string, ComponentType<ProgramsSlotProps>>,
  conversion:  { 'short-form': ShortFormConversion } as Record<string, ComponentType<ConversionSlotProps>>,
  socialProof: {} as Record<string, ComponentType<SocialProofSlotProps>>,
  done:        { 'contact-info': ContactInfoDone } as Record<string, ComponentType<DoneSlotProps>>,
};
