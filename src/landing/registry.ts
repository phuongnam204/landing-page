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
import { VideoProofSocial } from './variants/socialProof/video-proof';
import { GridWithFaqPrograms } from './variants/programs/grid-with-faq';
import { ShortFormWithTestimonialsConversion } from './variants/conversion/short-form-with-testimonials';

export const registry = {
  hook:        { 'two-column': TwoColumnHook, 'bold-single': BoldSingleHook } as Record<string, ComponentType<HookSlotProps>>,
  minigame:    { findgame: FindgameMinigame, skincare: SkincareMinigame, 'face-map': FaceMapMinigame } as Record<string, ComponentType<MinigameSlotProps>>,
  payoff:      { 'confetti-card': ConfettiCardPayoff } as Record<string, ComponentType<PayoffSlotProps>>,
    programs:    { grid: GridPrograms, carousel: CarouselPrograms, 'grid-with-faq': GridWithFaqPrograms } as Record<string, ComponentType<ProgramsSlotProps>>,
    conversion:  { 'short-form': ShortFormConversion, 'short-form-with-testimonials': ShortFormWithTestimonialsConversion } as Record<string, ComponentType<ConversionSlotProps>>,
  socialProof: { 'video-proof': VideoProofSocial } as Record<string, ComponentType<SocialProofSlotProps>>,
  done:        { 'contact-info': ContactInfoDone } as Record<string, ComponentType<DoneSlotProps>>,
};
