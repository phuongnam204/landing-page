'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalClassicPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-5 py-12 overflow-hidden">
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 animate-fade-in-up">
        <div className="text-center mb-2">
          <h2 className="font-extrabold text-2xl md:text-3xl text-cta mb-2">
            Liệu trình dành cho bạn
          </h2>
          <p className="text-sm text-cta/55">
            Dựa trên kết quả phân tích da của bạn
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {allPrograms.map((program) => {
            const isSuggested = suggestedIds.has(program.id);
            const isSelected = selected === program.id;
            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left border-l-4 rounded-[var(--lp-radius-card)] p-6 transition-all duration-200',
                  isSelected
                    ? 'border-[var(--lp-accent)] bg-[var(--lp-bg-card)] shadow-lg shadow-cta/10 scale-[1.01]'
                    : 'border-[var(--lp-border)] bg-[var(--lp-bg-card)]/60 hover:border-[var(--lp-accent)]/50',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-cta text-sm md:text-base">{program.name}</h3>
                      {isSuggested && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--lp-accent)]/10 text-[var(--lp-accent)] px-2 py-0.5 rounded-full">
                          Phù hợp
                        </span>
                      )}
                    </div>
                    {program.summary && (
                      <p className="text-xs text-cta/55 leading-relaxed line-clamp-2">
                        {program.summary[0]}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-[var(--lp-accent)] mt-0.5">
                      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
                      <circle cx="9" cy="9" r="4" fill="currentColor" />
                    </svg>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <CtaButton onClick={() => onContinue(selected)} fullWidth size="lg">
          Đăng ký liệu trình →
        </CtaButton>
      </div>
    </div>
  );
}
