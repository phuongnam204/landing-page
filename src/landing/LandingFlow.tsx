'use client';
import React, { useState } from 'react';
import type { ProgramId } from '../content/programs';
import { getSuggestedProgram } from '../content/catalog';
import { trackEvent } from '../lib/trackEvent';
import { registry } from './registry';
import type { MinigameResult } from './slots';
import type { Recipe } from './validateRecipe';

type Step = 'hook' | 'minigame' | 'payoff' | 'programs' | 'conversion' | 'socialProof' | 'done';

export default function LandingFlow({ recipe }: { recipe: Recipe }) {
  const [step, setStep] = useState<Step>('hook');
  const [transitioning, setTransitioning] = useState(false);
  const [minigameResult, setMinigameResult] = useState<MinigameResult | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<ProgramId | null>(null);

  function transitionTo(next: Step) {
    setTransitioning(true);
    setTimeout(() => { setStep(next); setTransitioning(false); }, 300);
  }

  function nextAfterPayoff() {
    if (recipe.slots.programs) return transitionTo('programs');
    return transitionTo('conversion');
  }

  function nextAfterConversion() {
    if (recipe.slots.socialProof) return transitionTo('socialProof');
    transitionTo('done');
  }

  const themeClass = `theme-${recipe.theme ?? 'blossom'}`;
  const containerClass = `transition-opacity duration-300 ${transitioning ? 'opacity-0' : 'opacity-100'}`;

  const Hook       = registry.hook[recipe.slots.hook];
  const Minigame   = registry.minigame[recipe.slots.minigame];
  const Payoff     = registry.payoff[recipe.slots.payoff];
  const Programs   = recipe.slots.programs   ? registry.programs[recipe.slots.programs]     : null;
  const Conversion = registry.conversion[recipe.slots.conversion];
  const SocialProof= recipe.slots.socialProof? registry.socialProof[recipe.slots.socialProof]: null;
  const Done       = recipe.slots.done       ? registry.done[recipe.slots.done]              : null;

  return (
    <div className={`${themeClass} ${containerClass}`}>
      {step === 'hook' && Hook && <Hook onStart={() => transitionTo('minigame')} />}

      {step === 'minigame' && Minigame && (
        <Minigame onComplete={(result) => {
          setMinigameResult(result);
          setSelectedProgram(getSuggestedProgram(result.condition.id)?.id ?? null);
          trackEvent('minigame_complete', { resultId: result.condition.id });
          transitionTo('payoff');
        }} />
      )}

      {step === 'payoff' && Payoff && minigameResult && (
        <Payoff result={minigameResult} onContinue={() => {
          trackEvent('payoff_view', { resultId: minigameResult.condition.id });
          nextAfterPayoff();
        }} />
      )}

      {step === 'programs' && Programs && (
        <Programs suggestedProgramId={selectedProgram!}
          onContinue={(programId) => { setSelectedProgram(programId); transitionTo('conversion'); }} />
      )}

      {step === 'conversion' && Conversion && (
        <Conversion selectedProgramId={selectedProgram}
          onSubmit={(name, phone) => {
            trackEvent('form_submit', { name, phone, program: selectedProgram });
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
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-extrabold text-xl text-cta">Đã nhận thông tin của bạn!</p>
              <p className="text-sm text-cta/60 mt-2">Chuyên viên sẽ liên hệ trong 24 giờ.</p>
            </div>
          </div>
      )}
    </div>
  );
}
