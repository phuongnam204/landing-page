'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalMinimalPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-5 py-12 overflow-hidden">
      <div className="max-w-lg mx-auto w-full flex flex-col gap-5 animate-fade-in-up">
        <h2 className="font-bold text-lg md:text-xl text-cta text-center mb-1">
          Liệu trình dành cho bạn
        </h2>

        <div className="flex flex-col gap-2">
          {allPrograms.map((program) => {
            const isSelected = selected === program.id;
            const isSuggested = suggestedIds.has(program.id);
            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-150',
                  isSelected
                    ? 'bg-[var(--lp-bg-card)] shadow-sm'
                    : 'hover:bg-[var(--lp-bg-card)]/60',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-cta">{program.name}</span>
                  {isSuggested && (
                    <span className="text-[10px] text-[var(--lp-accent)] font-bold">•</span>
                  )}
                </div>
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--lp-accent)]">
                    <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <CtaButton onClick={() => onContinue(selected)} fullWidth size="md" className="mt-2">
          Đăng ký →
        </CtaButton>
      </div>
    </div>
  );
}
