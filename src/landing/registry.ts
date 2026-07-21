import type { ComponentType } from 'react';
import type { HookSlotProps, MinigameSlotProps, PayoffSlotProps, ProgramsSlotProps, ConversionSlotProps, SocialProofSlotProps, DoneSlotProps, ExpertHandoffSlotProps, TeaserPayoffSlotProps, PathChooserSlotProps } from './slots';
import { TwoColumnHook } from './variants/hook/two-column';
import { BoldSingleHook } from './variants/hook/bold-single';
import { FaceMapMinigame } from './variants/minigame/face-map';
import { FaceMapCardsMinigame } from './variants/minigame/face-map-cards';
import { FaceMapWizardMinigame } from './variants/minigame/face-map-wizard';
import { FaceMapV2Minigame } from './variants/minigame/face-map-v2';
import { FaceMapV3Minigame } from './variants/minigame/face-map-v3';
import { StoryDayMinigame } from './variants/minigame/story-day';
import { ConfettiCardPayoff } from './variants/payoff/ConfettiCardPayoff';
import { ConfettiCardWhyPayoff } from './variants/payoff/ConfettiCardWhyPayoff';
import { GridPrograms } from './variants/programs/GridPrograms';
import { CarouselPrograms } from './variants/programs/CarouselPrograms';
import { GridWithFaqPrograms } from './variants/programs/GridWithFaqPrograms';
import { ShortFormConversion } from './variants/conversion/short-form';
import { ShortFormWithTestimonialsConversion } from './variants/conversion/short-form-with-testimonials';
import { VideoProofSocial } from './variants/socialProof/video-proof';
import { ContactInfoDone } from './variants/done/contact-info';
import { ContactInfoWithVideoDone } from './variants/done/contact-info-with-video';
// Playful Blossom
import { PlayfulClassicHook } from './variants/hook/playful/classic';
import { PlayfulMinimalHook } from './variants/hook/playful/minimal';
import { PlayfulImmersiveHook } from './variants/hook/playful/immersive';
import { PlayfulImmersivePhotoHook } from './variants/hook/playful/immersive-photo';
import { PlayfulDarkAccentHook } from './variants/hook/playful/dark-accent';
import { PlayfulClassicMinigame } from './variants/minigame/playful/classic';
import { PlayfulMinimalMinigame } from './variants/minigame/playful/minimal';
import { PlayfulImmersiveMinigame } from './variants/minigame/playful/immersive';
import { PlayfulDarkAccentMinigame } from './variants/minigame/playful/dark-accent';
import { PlayfulClassicPayoff } from './variants/payoff/playful/classic';
import { PlayfulMinimalPayoff } from './variants/payoff/playful/minimal';
import { PlayfulImmersivePayoff } from './variants/payoff/playful/immersive';
import { PlayfulDarkAccentPayoff } from './variants/payoff/playful/dark-accent';
import { PlayfulClassicPrograms } from './variants/programs/playful/classic';
import { PlayfulMinimalPrograms } from './variants/programs/playful/minimal';
import { PlayfulImmersivePrograms } from './variants/programs/playful/immersive';
import { PlayfulDarkAccentPrograms } from './variants/programs/playful/dark-accent';
import { PlayfulClassicConversion } from './variants/conversion/playful/classic';
import { PlayfulMinimalConversion } from './variants/conversion/playful/minimal';
import { PlayfulImmersiveConversion } from './variants/conversion/playful/immersive';
import { PlayfulDarkAccentConversion } from './variants/conversion/playful/dark-accent';
import { PlayfulClassicDone } from './variants/done/playful/classic';
import { PlayfulMinimalDone } from './variants/done/playful/minimal';
import { PlayfulImmersiveDone } from './variants/done/playful/immersive';
import { PlayfulDarkAccentDone } from './variants/done/playful/dark-accent';
// Clinical Ocean
import { ClinicalClassicHook } from './variants/hook/clinical/classic';
import { ClinicalCompactHook } from './variants/hook/clinical/compact';
import { ClinicalDashboardHook } from './variants/hook/clinical/dashboard';
import { ClinicalEditorialHook } from './variants/hook/clinical/editorial';
import { ClinicalClassicMinigame } from './variants/minigame/clinical/classic';
import { ClinicalCompactMinigame } from './variants/minigame/clinical/compact';
import { ClinicalDashboardMinigame } from './variants/minigame/clinical/dashboard';
import { ClinicalEditorialMinigame } from './variants/minigame/clinical/editorial';
import { ClinicalClassicPayoff } from './variants/payoff/clinical/classic';
import { ClinicalCompactPayoff } from './variants/payoff/clinical/compact';
import { ClinicalDashboardPayoff } from './variants/payoff/clinical/dashboard';
import { ClinicalEditorialPayoff } from './variants/payoff/clinical/editorial';
import { ClinicalClassicPrograms } from './variants/programs/clinical/classic';
import { ClinicalCompactPrograms } from './variants/programs/clinical/compact';
import { ClinicalDashboardPrograms } from './variants/programs/clinical/dashboard';
import { ClinicalEditorialPrograms } from './variants/programs/clinical/editorial';
import { ClinicalClassicConversion } from './variants/conversion/clinical/classic';
import { ClinicalCompactConversion } from './variants/conversion/clinical/compact';
import { ClinicalDashboardConversion } from './variants/conversion/clinical/dashboard';
import { ClinicalEditorialConversion } from './variants/conversion/clinical/editorial';
import { ClinicalClassicDone } from './variants/done/clinical/classic';
import { ClinicalCompactDone } from './variants/done/clinical/compact';
import { ClinicalDashboardDone } from './variants/done/clinical/dashboard';
import { ClinicalEditorialDone } from './variants/done/clinical/editorial';
// Natural Sage
import { NaturalClassicHook } from './variants/hook/natural/classic';
import { NaturalSpaHook } from './variants/hook/natural/spa';
import { NaturalEditorialHook } from './variants/hook/natural/editorial';
import { NaturalMinimalHook } from './variants/hook/natural/minimal';
import { NaturalClassicMinigame } from './variants/minigame/natural/classic';
import { NaturalSpaMinigame } from './variants/minigame/natural/spa';
import { NaturalEditorialMinigame } from './variants/minigame/natural/editorial';
import { NaturalMinimalMinigame } from './variants/minigame/natural/minimal';
import { NaturalClassicPayoff } from './variants/payoff/natural/classic';
import { NaturalSpaPayoff } from './variants/payoff/natural/spa';
import { NaturalEditorialPayoff } from './variants/payoff/natural/editorial';
import { NaturalMinimalPayoff } from './variants/payoff/natural/minimal';
import { NaturalClassicPrograms } from './variants/programs/natural/classic';
import { NaturalSpaPrograms } from './variants/programs/natural/spa';
import { NaturalEditorialPrograms } from './variants/programs/natural/editorial';
import { NaturalMinimalPrograms } from './variants/programs/natural/minimal';
import { NaturalClassicConversion } from './variants/conversion/natural/classic';
import { NaturalSpaConversion } from './variants/conversion/natural/spa';
import { NaturalEditorialConversion } from './variants/conversion/natural/editorial';
import { NaturalMinimalConversion } from './variants/conversion/natural/minimal';
import { NaturalClassicDone } from './variants/done/natural/classic';
import { NaturalSpaDone } from './variants/done/natural/spa';
import { NaturalEditorialDone } from './variants/done/natural/editorial';
import { NaturalMinimalDone } from './variants/done/natural/minimal';
import { BoldClassicHook } from './variants/hook/bold/classic';
import { BoldStackedHook } from './variants/hook/bold/stacked';
import { BoldDiagonalHook } from './variants/hook/bold/diagonal';
import { FaceDualHook } from './variants/hook/face-dual';
import { BoldTypographicHook } from './variants/hook/bold/typographic';
import { BoldClassicMinigame } from './variants/minigame/bold/classic';
import { BoldStackedMinigame } from './variants/minigame/bold/stacked';
import { BoldDiagonalMinigame } from './variants/minigame/bold/diagonal';
import { BoldTypographicMinigame } from './variants/minigame/bold/typographic';
import { BoldClassicPayoff } from './variants/payoff/bold/classic';
import { BoldStackedPayoff } from './variants/payoff/bold/stacked';
import { BoldDiagonalPayoff } from './variants/payoff/bold/diagonal';
import { BoldTypographicPayoff } from './variants/payoff/bold/typographic';
import { BoldClassicPrograms } from './variants/programs/bold/classic';
import { BoldStackedPrograms } from './variants/programs/bold/stacked';
import { BoldDiagonalPrograms } from './variants/programs/bold/diagonal';
import { BoldTypographicPrograms } from './variants/programs/bold/typographic';
import { BoldClassicConversion } from './variants/conversion/bold/classic';
import { BoldStackedConversion } from './variants/conversion/bold/stacked';
import { BoldDiagonalConversion } from './variants/conversion/bold/diagonal';
import { BoldTypographicConversion } from './variants/conversion/bold/typographic';
import { BoldClassicDone } from './variants/done/bold/classic';
import { BoldStackedDone } from './variants/done/bold/stacked';
import { BoldDiagonalDone } from './variants/done/bold/diagonal';
import { BoldTypographicDone } from './variants/done/bold/typographic';
import { ElectricClassicHook } from './variants/hook/electric/classic';
import { ElectricGlowHeavyHook } from './variants/hook/electric/glow-heavy';
import { ElectricSoftDarkHook } from './variants/hook/electric/soft-dark';
import { ElectricLightPopHook } from './variants/hook/electric/light-pop';
import { ElectricClassicMinigame } from './variants/minigame/electric/classic';
import { ElectricGlowHeavyMinigame } from './variants/minigame/electric/glow-heavy';
import { ElectricSoftDarkMinigame } from './variants/minigame/electric/soft-dark';
import { ElectricLightPopMinigame } from './variants/minigame/electric/light-pop';
import { ElectricClassicPayoff } from './variants/payoff/electric/classic';
import { ElectricGlowHeavyPayoff } from './variants/payoff/electric/glow-heavy';
import { ElectricSoftDarkPayoff } from './variants/payoff/electric/soft-dark';
import { ElectricLightPopPayoff } from './variants/payoff/electric/light-pop';
import { ElectricClassicPrograms } from './variants/programs/electric/classic';
import { ElectricGlowHeavyPrograms } from './variants/programs/electric/glow-heavy';
import { ElectricSoftDarkPrograms } from './variants/programs/electric/soft-dark';
import { ElectricLightPopPrograms } from './variants/programs/electric/light-pop';
import { ElectricClassicConversion } from './variants/conversion/electric/classic';
import { ElectricGlowHeavyConversion } from './variants/conversion/electric/glow-heavy';
import { ElectricSoftDarkConversion } from './variants/conversion/electric/soft-dark';
import { ElectricLightPopConversion } from './variants/conversion/electric/light-pop';
import { ElectricClassicDone } from './variants/done/electric/classic';
import { ElectricGlowHeavyDone } from './variants/done/electric/glow-heavy';
import { ElectricSoftDarkDone } from './variants/done/electric/soft-dark';
import { ElectricLightPopDone } from './variants/done/electric/light-pop';
// Workflow Diversity — new minigame mechanics
import { ElectricClassicChainedMinigame } from './variants/minigame/electric/classic-chained';
import { ElectricGlowScratchMinigame } from './variants/minigame/electric/glow-scratch';
import { ElectricSoftSwipeMinigame } from './variants/minigame/electric/soft-swipe';
import { SkinScanChatMinigame } from './variants/minigame/skin-scan-chat';
// Workflow Diversity — new programs variants
import { NaturalEditorialJourneyPrograms } from './variants/programs/natural/editorial-journey';
import { BoldTypographicCommitmentPrograms } from './variants/programs/bold/typographic-commitment';
// Workflow Diversity — new slot types
import { NaturalSpaExpertHandoff } from './variants/expertHandoff/natural/spa';
import { BoldClassicTeaserPayoff } from './variants/teaserPayoff/bold/classic';
import { BoldStackedPathChooser } from './variants/pathChooser/bold/stacked';
import { ConfettiCardWhyVideoSplitPayoff } from './variants/payoff/confetti-card-why-video-split';
import { ConfettiCardWhyCirclesQuadPayoff } from './variants/payoff/confetti-card-why-circles-quad';

export const registry = {
  hook:        { 'two-column': TwoColumnHook, 'bold-single': BoldSingleHook, 'playful-classic': PlayfulClassicHook, 'playful-minimal': PlayfulMinimalHook, 'playful-immersive': PlayfulImmersiveHook, 'playful-immersive-photo': PlayfulImmersivePhotoHook, 'playful-dark-accent': PlayfulDarkAccentHook, 'clinical-classic': ClinicalClassicHook, 'clinical-compact': ClinicalCompactHook, 'clinical-dashboard': ClinicalDashboardHook, 'clinical-editorial': ClinicalEditorialHook, 'natural-classic': NaturalClassicHook, 'natural-spa': NaturalSpaHook, 'natural-editorial': NaturalEditorialHook, 'natural-minimal': NaturalMinimalHook, 'bold-classic': BoldClassicHook, 'bold-stacked': BoldStackedHook, 'bold-diagonal': BoldDiagonalHook, 'bold-typographic': BoldTypographicHook, 'face-dual': FaceDualHook, 'electric-classic': ElectricClassicHook, 'electric-glow-heavy': ElectricGlowHeavyHook, 'electric-soft-dark': ElectricSoftDarkHook, 'electric-light-pop': ElectricLightPopHook } as Record<string, ComponentType<HookSlotProps>>,
  minigame:    { 'face-map': FaceMapMinigame, 'face-map-cards': FaceMapCardsMinigame, 'face-map-wizard': FaceMapWizardMinigame, 'face-map-v2': FaceMapV2Minigame, 'face-map-v3': FaceMapV3Minigame, 'story-day': StoryDayMinigame, 'playful-classic': PlayfulClassicMinigame, 'playful-minimal': PlayfulMinimalMinigame, 'playful-immersive': PlayfulImmersiveMinigame, 'playful-dark-accent': PlayfulDarkAccentMinigame, 'clinical-classic': ClinicalClassicMinigame, 'clinical-compact': ClinicalCompactMinigame, 'clinical-dashboard': ClinicalDashboardMinigame, 'clinical-editorial': ClinicalEditorialMinigame, 'natural-classic': NaturalClassicMinigame, 'natural-spa': NaturalSpaMinigame, 'natural-editorial': NaturalEditorialMinigame, 'natural-minimal': NaturalMinimalMinigame, 'bold-classic': BoldClassicMinigame, 'bold-stacked': BoldStackedMinigame, 'bold-diagonal': BoldDiagonalMinigame, 'bold-typographic': BoldTypographicMinigame, 'electric-classic': ElectricClassicMinigame, 'electric-classic-chained': ElectricClassicChainedMinigame, 'electric-glow-scratch': ElectricGlowScratchMinigame, 'electric-soft-swipe': ElectricSoftSwipeMinigame, 'electric-glow-heavy': ElectricGlowHeavyMinigame, 'electric-soft-dark': ElectricSoftDarkMinigame, 'electric-light-pop': ElectricLightPopMinigame,
  'skin-scan-chat': SkinScanChatMinigame } as Record<string, ComponentType<MinigameSlotProps>>,
  payoff:      { 'confetti-card': ConfettiCardPayoff, 'confetti-card-why': ConfettiCardWhyPayoff, 'playful-classic': PlayfulClassicPayoff, 'playful-minimal': PlayfulMinimalPayoff, 'playful-immersive': PlayfulImmersivePayoff, 'playful-dark-accent': PlayfulDarkAccentPayoff, 'clinical-classic': ClinicalClassicPayoff, 'clinical-compact': ClinicalCompactPayoff, 'clinical-dashboard': ClinicalDashboardPayoff, 'clinical-editorial': ClinicalEditorialPayoff, 'natural-classic': NaturalClassicPayoff, 'natural-spa': NaturalSpaPayoff, 'natural-editorial': NaturalEditorialPayoff, 'natural-minimal': NaturalMinimalPayoff, 'bold-classic': BoldClassicPayoff, 'bold-stacked': BoldStackedPayoff, 'bold-diagonal': BoldDiagonalPayoff, 'bold-typographic': BoldTypographicPayoff, 'electric-classic': ElectricClassicPayoff, 'electric-glow-heavy': ElectricGlowHeavyPayoff, 'electric-soft-dark': ElectricSoftDarkPayoff, 'electric-light-pop': ElectricLightPopPayoff,
  'confetti-card-why-video-split': ConfettiCardWhyVideoSplitPayoff,
  'confetti-card-why-circles-quad': ConfettiCardWhyCirclesQuadPayoff } as Record<string, ComponentType<PayoffSlotProps>>,
  programs:    { grid: GridPrograms, carousel: CarouselPrograms, 'grid-with-faq': GridWithFaqPrograms, 'playful-classic': PlayfulClassicPrograms, 'playful-minimal': PlayfulMinimalPrograms, 'playful-immersive': PlayfulImmersivePrograms, 'playful-dark-accent': PlayfulDarkAccentPrograms, 'clinical-classic': ClinicalClassicPrograms, 'clinical-compact': ClinicalCompactPrograms, 'clinical-dashboard': ClinicalDashboardPrograms, 'clinical-editorial': ClinicalEditorialPrograms, 'natural-classic': NaturalClassicPrograms, 'natural-spa': NaturalSpaPrograms, 'natural-editorial': NaturalEditorialPrograms, 'natural-editorial-journey': NaturalEditorialJourneyPrograms, 'natural-minimal': NaturalMinimalPrograms, 'bold-classic': BoldClassicPrograms, 'bold-stacked': BoldStackedPrograms, 'bold-diagonal': BoldDiagonalPrograms, 'bold-typographic': BoldTypographicPrograms, 'bold-typographic-commitment': BoldTypographicCommitmentPrograms, 'electric-classic': ElectricClassicPrograms, 'electric-glow-heavy': ElectricGlowHeavyPrograms, 'electric-soft-dark': ElectricSoftDarkPrograms, 'electric-light-pop': ElectricLightPopPrograms } as Record<string, ComponentType<ProgramsSlotProps>>,
  conversion:  { 'short-form': ShortFormConversion, 'short-form-with-testimonials': ShortFormWithTestimonialsConversion, 'playful-classic': PlayfulClassicConversion, 'playful-minimal': PlayfulMinimalConversion, 'playful-immersive': PlayfulImmersiveConversion, 'playful-dark-accent': PlayfulDarkAccentConversion, 'clinical-classic': ClinicalClassicConversion, 'clinical-compact': ClinicalCompactConversion, 'clinical-dashboard': ClinicalDashboardConversion, 'clinical-editorial': ClinicalEditorialConversion, 'natural-classic': NaturalClassicConversion, 'natural-spa': NaturalSpaConversion, 'natural-editorial': NaturalEditorialConversion, 'natural-minimal': NaturalMinimalConversion, 'bold-classic': BoldClassicConversion, 'bold-stacked': BoldStackedConversion, 'bold-diagonal': BoldDiagonalConversion, 'bold-typographic': BoldTypographicConversion, 'electric-classic': ElectricClassicConversion, 'electric-glow-heavy': ElectricGlowHeavyConversion, 'electric-soft-dark': ElectricSoftDarkConversion, 'electric-light-pop': ElectricLightPopConversion } as Record<string, ComponentType<ConversionSlotProps>>,
  socialProof: { 'video-proof': VideoProofSocial } as Record<string, ComponentType<SocialProofSlotProps>>,
  done:        { 'contact-info': ContactInfoDone, 'contact-info-with-video': ContactInfoWithVideoDone, 'playful-classic': PlayfulClassicDone, 'playful-minimal': PlayfulMinimalDone, 'playful-immersive': PlayfulImmersiveDone, 'playful-dark-accent': PlayfulDarkAccentDone, 'clinical-classic': ClinicalClassicDone, 'clinical-compact': ClinicalCompactDone, 'clinical-dashboard': ClinicalDashboardDone, 'clinical-editorial': ClinicalEditorialDone, 'natural-classic': NaturalClassicDone, 'natural-spa': NaturalSpaDone, 'natural-editorial': NaturalEditorialDone, 'natural-minimal': NaturalMinimalDone, 'bold-classic': BoldClassicDone, 'bold-stacked': BoldStackedDone, 'bold-diagonal': BoldDiagonalDone, 'bold-typographic': BoldTypographicDone, 'electric-classic': ElectricClassicDone, 'electric-glow-heavy': ElectricGlowHeavyDone, 'electric-soft-dark': ElectricSoftDarkDone, 'electric-light-pop': ElectricLightPopDone } as Record<string, ComponentType<DoneSlotProps>>,
  expertHandoff: { 'natural-spa': NaturalSpaExpertHandoff } as Record<string, ComponentType<ExpertHandoffSlotProps>>,
  teaserPayoff:  { 'bold-classic': BoldClassicTeaserPayoff } as Record<string, ComponentType<TeaserPayoffSlotProps>>,
  pathChooser:   { 'bold-stacked': BoldStackedPathChooser } as Record<string, ComponentType<PathChooserSlotProps>>,
};
