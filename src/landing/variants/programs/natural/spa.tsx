'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalSpaPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-8 py-20 overflow-hidden">
      <div className="max-w-3xl mx-auto w-full flex flex-col gap-10 animate-fade-in-up">
        <div className="text-center mb-4">
          <h2 className="font-extrabold text-3xl md:text-4xl text-cta mb-3">
            Liệu trình dành cho bạn
          </h2>
          <p className="text-base text-cta/50 max-w-md mx-auto">
            Dựa trên kết quả phân tích da của bạn
          </p>
        </div>

        <div className="flex flex-col gap-5">
          {allPrograms.map((program) => {
            const isSelected = selected === program.id;
            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left rounded-[var(--lp-radius-card)] px-8 py-6 transition-all duration-200',
                  isSelected
                    ? 'bg-[var(--lp-bg-card)] shadow-lg shadow-cta/10'
                    : 'bg-[var(--lp-bg-card)]/40 hover:bg-[var(--lp-bg-card)]/70',
                ].join(' ')}
              >
                <h3 className="font-bold text-cta text-base md:text-lg mb-1">{program.name}</h3>
                {program.summary && (
                  <p className="text-sm text-cta/50 leading-relaxed">
                    {program.summary[0]}
                  </p>
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
