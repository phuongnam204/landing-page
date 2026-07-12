'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldTypographicPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-5 py-12 overflow-hidden" style={{ background: 'var(--lp-bg-programs)' }}>
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-6 animate-fade-in-up">
        <div className="text-center mb-2">
          <h2 className="font-extrabold text-2xl md:text-3xl text-cta mb-2">
            Liệu trình dành cho bạn
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {allPrograms.map((program, index) => {
            const isSuggested = suggestedIds.has(program.id);
            const isSelected = selected === program.id;
            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left flex items-center gap-4 rounded-[var(--lp-radius-card)] p-4 transition-all duration-200',
                  isSelected ? 'bg-[var(--lp-bg-card)] shadow-lg scale-[1.01]' : 'bg-[var(--lp-bg-card)]/60 hover:scale-[1.005]',
                ].join(' ')}
              >
                <span
                  className="text-4xl md:text-6xl font-extrabold shrink-0 w-16 text-center"
                  style={{ color: 'var(--lp-band-accent)' }}
                >
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-cta text-sm md:text-base">{program.name}</h3>
                    {isSuggested && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--lp-band-accent)', color: 'var(--lp-band-bg)' }}>
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
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0 text-[var(--lp-accent)]">
                    <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="2" />
                    <circle cx="9" cy="9" r="4" fill="currentColor" />
                  </svg>
                )}
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
