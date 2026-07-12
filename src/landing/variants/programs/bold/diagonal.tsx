'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldDiagonalPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);

  return (
    <div className="min-h-[100dvh] w-full overflow-hidden">
      <div className="py-10 px-5" style={{ background: 'var(--lp-band-bg)' }}>
        <h2 className="text-center font-extrabold text-2xl md:text-3xl" style={{ color: 'var(--lp-band-text)' }}>
          Liệu trình dành cho bạn
        </h2>
      </div>
      <div className="px-5 py-10" style={{ background: 'var(--lp-bg-hero)', clipPath: 'polygon(0 4%, 100% 0, 100% 100%, 0 100%)', marginTop: '-16px', paddingTop: '32px' }}>
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
          {allPrograms.map((program) => {
            const isSuggested = suggestedIds.has(program.id);
            const isSelected = selected === program.id;
            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left rounded-[var(--lp-radius-card)] overflow-hidden transition-all duration-200',
                  isSelected ? 'shadow-lg scale-[1.01]' : 'hover:scale-[1.005]',
                ].join(' ')}
              >
                <div
                  className="py-2.5 px-4 font-bold text-sm"
                  style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
                >
                  {program.name}
                </div>
                <div className="p-4" style={{ background: 'var(--lp-bg-card)' }}>
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
            );
          })}
          <CtaButton onClick={() => onContinue(selected)} fullWidth size="lg">
            Đăng ký liệu trình →
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
