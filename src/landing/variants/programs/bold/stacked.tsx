'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldStackedPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);

  return (
    <div className="min-h-[100dvh] w-full px-5 py-12 overflow-hidden" style={{ background: 'var(--lp-bg-hero)' }}>
      <div className="max-w-2xl mx-auto w-full flex flex-col gap-0 animate-fade-in-up">
        {allPrograms.map((program, i) => {
          const isSuggested = suggestedIds.has(program.id);
          const isSelected = selected === program.id;
          return (
            <div key={program.id}>
              {i > 0 && <div className="h-1" style={{ background: 'var(--lp-band-bg)' }} />}
              <button
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left transition-all duration-200',
                  isSelected ? 'shadow-lg scale-[1.01]' : 'hover:scale-[1.005]',
                ].join(' ')}
              >
                <div
                  className="py-3 px-5 font-bold text-sm"
                  style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
                >
                  {program.name}
                </div>
                <div className="p-5" style={{ background: 'var(--lp-bg-card)' }}>
                  {program.summary && (
                    <p className="text-xs text-cta/55 leading-relaxed line-clamp-2 mb-3">
                      {program.summary[0]}
                    </p>
                  )}
                  {isSuggested && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'var(--lp-band-accent)', color: 'var(--lp-band-bg)' }}>
                      Phù hợp
                    </span>
                  )}
                </div>
              </button>
            </div>
          );
        })}
        <div className="mt-6">
          <CtaButton onClick={() => onContinue(selected)} fullWidth size="lg">
            Đăng ký liệu trình →
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
