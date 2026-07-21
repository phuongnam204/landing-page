'use client';
import React, { useState } from 'react';
import type { ProgramId } from '../content/programs';
import { recommendPrograms, type ScoredProgram } from '../content/recommend';
import { trackEvent } from '../lib/trackEvent';
import { registry } from './registry';
import type { MinigameResult } from './slots';
import type { Recipe } from './validateRecipe';

type Step = 'hook' | 'minigame' | 'payoff' | 'expertHandoff' | 'programs' | 'pathChooser' | 'conversion' | 'teaserPayoff' | 'socialProof' | 'done';

export default function LandingFlow({ recipe }: { recipe: Recipe }) {
  const [step, setStep] = useState<Step>('hook');
  const [transitioning, setTransitioning] = useState(false);
  const [minigameResult, setMinigameResult] = useState<MinigameResult | null>(null);
  const [suggestedPrograms, setSuggestedPrograms] = useState<ScoredProgram[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);
  const [isFastTrack, setIsFastTrack] = useState(false);

  function transitionTo(next: Step) {
    setTransitioning(true);
    setTimeout(() => { setStep(next); setTransitioning(false); }, 300);
  }

  function nextAfterHook() {
    if (recipe.slots.pathChooser) return transitionTo('pathChooser');
    if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
    return transitionTo('minigame');
  }

  function nextAfterPayoff() {
    if (recipe.slots.expertHandoff) return transitionTo('expertHandoff');
    if (recipe.slots.programs) return transitionTo('programs');
    return transitionTo('conversion');
  }

  function nextAfterPrograms(programId: ProgramId) {
    setSelectedProgram(programId);
    transitionTo('conversion');
  }

  function nextAfterConversion() {
    if (recipe.slots.socialProof) return transitionTo('socialProof');
    transitionTo('done');
  }

  const themeClass = `theme-${recipe.theme ?? 'blossom'}`;
  const containerClass = `transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`;

  const Hook          = registry.hook[recipe.slots.hook];
  const Minigame      = registry.minigame[recipe.slots.minigame];
  const Payoff        = registry.payoff[recipe.slots.payoff];
  const ExpertHandoff = recipe.slots.expertHandoff ? registry.expertHandoff?.[recipe.slots.expertHandoff] : null;
  const Programs      = recipe.slots.programs       ? registry.programs[recipe.slots.programs]               : null;
  const PathChooser   = recipe.slots.pathChooser    ? registry.pathChooser?.[recipe.slots.pathChooser]       : null;
  const Conversion    = registry.conversion[recipe.slots.conversion];
  const TeaserPayoff  = recipe.slots.teaserPayoff   ? registry.teaserPayoff?.[recipe.slots.teaserPayoff]     : null;
  const SocialProof   = recipe.slots.socialProof    ? registry.socialProof[recipe.slots.socialProof]          : null;
  const Done          = recipe.slots.done            ? registry.done[recipe.slots.done]                       : null;

  return (
    <div className={`overflow-hidden ${themeClass} ${containerClass}`}>
      {step === 'hook' && Hook && <Hook onStart={nextAfterHook} copy={recipe.copy?.hook} />}

      {step === 'pathChooser' && PathChooser && (
        <PathChooser
          options={[
            { id: 'fast', label: 'Đặt lịch tư vấn', description: 'Chuyên viên sẽ liên hệ trong 24h' },
            { id: 'full', label: 'Phân tích da trước', description: 'Nhận kết quả cá nhân hóa' },
          ]}
          onChoose={(optionId) => {
            if (optionId === 'fast') {
              setIsFastTrack(true);
              trackEvent('path_chosen', { path: 'fast_track' });
              transitionTo('conversion');
            } else {
              trackEvent('path_chosen', { path: 'full_flow' });
              transitionTo('minigame');
            }
          }}
        />
      )}

      {step === 'teaserPayoff' && TeaserPayoff && (
        <TeaserPayoff onContinue={() => transitionTo('minigame')} />
      )}

      {step === 'minigame' && Minigame && (
        <Minigame onComplete={(result) => {
          setMinigameResult(result);
          const conditionIds = result.conditions.map(c => c.id);
          const ranked = recommendPrograms(conditionIds);
          setSuggestedPrograms(ranked);
          setSelectedProgram(ranked[0]?.program.id ?? null);
          trackEvent('minigame_complete', { resultId: result.condition.id });
          transitionTo('payoff');
        }} copy={recipe.copy?.minigame} />
      )}

      {step === 'payoff' && Payoff && minigameResult && (
        <Payoff result={minigameResult} onContinue={() => {
          trackEvent('payoff_view', { resultId: minigameResult.condition.id });
          nextAfterPayoff();
        }} copy={recipe.copy?.payoff} />
      )}

      {step === 'expertHandoff' && ExpertHandoff && minigameResult && (
        <ExpertHandoff
          result={minigameResult}
          programId={selectedProgram}
          onContinue={() => {
            if (recipe.slots.programs) return transitionTo('programs');
            if (recipe.slots.pathChooser) return transitionTo('pathChooser');
            if (recipe.slots.teaserPayoff) return transitionTo('teaserPayoff');
            transitionTo('conversion');
          }}
        />
      )}

      {step === 'programs' && Programs && (
        <Programs suggestedPrograms={suggestedPrograms}
          onContinue={(programId) => {
            trackEvent('program_selected', { programId });
            nextAfterPrograms(programId);
          }} />
      )}

      {step === 'conversion' && Conversion && (
        <Conversion selectedProgramId={selectedProgram} minigameResult={minigameResult}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { program: selectedProgram });
            nextAfterConversion();
          }} />
      )}

      {step === 'socialProof' && SocialProof && (
        <SocialProof onContinue={() => { if (recipe.slots.done) transitionTo('done'); }} />
      )}

      {step === 'done' && (Done
        ? <Done selectedProgramId={selectedProgram} />
        : <div className="h-screen w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5">
            <div className="bg-[var(--lp-bg-card)] rounded-soft p-8 shadow-lg text-center max-w-sm w-full">
              <svg viewBox="0 0 48 48" className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
                <path d="M14 25l7 7 13-14" />
              </svg>
              <p className="font-extrabold text-xl text-cta">Da nhan thong tin cua ban!</p>
              <p className="text-sm text-cta/60 mt-2">Chuyen vien se lien he trong 24 gio.</p>
            </div>
          </div>
      )}
    </div>
  );
}
