'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import { getPrograms } from '../../../../content/catalog';
import type { ProgramId } from '../../../../content/programs';
import { trackEvent } from '../../../../lib/trackEvent';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const MILESTONES = [
  { step: 1, label: 'Tham da & tu van', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { step: 2, label: 'Lieu trinh ca nhan hoa', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
  { step: 3, label: 'Theo doi & dieu chinh', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
];

export function NaturalEditorialJourneyPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [activeStep, setActiveStep] = useState(0);
  const program = suggestedPrograms[0]?.program ?? getPrograms()[0];
  const programId = program.id as ProgramId;

  function handleContinue() {
    trackEvent('programs_journey_continue', { programId });
    onContinue(programId);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center px-5 py-8">
        <div className="max-w-lg w-full flex flex-col gap-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              Hanh trinh cua ban
            </p>
            <h2 className="text-xl font-extrabold mt-2" style={{ color: 'var(--lp-primary)' }}>
              {program.name}
            </h2>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
              {program.description}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            {MILESTONES.map((m, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              return (
                <button
                  key={m.step}
                  onClick={() => setActiveStep(i)}
                  className="flex items-start gap-4 rounded-soft p-4 text-left transition-all duration-200"
                  style={{
                    background: isActive ? 'color-mix(in srgb, var(--lp-accent) 8%, white)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--lp-accent)' : '3px solid transparent',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{
                      background: isPast || isActive ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 15%, white)',
                    }}
                  >
                    {isPast ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isActive ? 'white' : 'var(--lp-accent)'} strokeWidth="2" strokeLinecap="round">
                        <path d={m.icon} />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold" style={{ color: isActive ? 'var(--lp-primary)' : 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
                      {m.label}
                    </p>
                    {isActive && (
                      <p className="text-xs mt-1 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
                        {i === 0 && 'Chuyen vien se phan tich da va tu van lieu trinh phu hop.'}
                        {i === 1 && 'Lieu trinh duoc thiet ke rieng cho tinh trang da cua ban.'}
                        {i === 2 && 'Theo doi dinh ky va dieu chinh de dat ket qua tot nhat.'}
                      </p>
                    )}
                  </div>
                  {!isPast && !isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--lp-accent)" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  )}
                </button>
              );
            })}
          </div>

          <CtaButton variant="golden" fullWidth onClick={handleContinue}>
            Bat dau hanh trinh
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
