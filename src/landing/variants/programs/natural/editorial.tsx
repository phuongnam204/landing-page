'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { getPrograms } from '../../../../content/catalog';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NaturalEditorialPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);
  const featured = allPrograms.find(p => p.id === selected);

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-5 py-12 overflow-hidden">
      <div className="max-w-4xl mx-auto w-full flex flex-col md:flex-row gap-10 animate-fade-in-up">
        {/* Left: program list */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-cta italic mb-2">
            Liệu trình dành cho bạn
          </h2>
          {allPrograms.map((program) => {
            const isSelected = selected === program.id;
            const isSuggested = suggestedIds.has(program.id);
            return (
              <button
                key={program.id}
                onClick={() => setSelected(program.id)}
                className={[
                  'w-full text-left rounded-[var(--lp-radius-card)] px-5 py-4 transition-all duration-200',
                  isSelected
                    ? 'bg-[var(--lp-bg-card)] shadow-md shadow-cta/10'
                    : 'bg-[var(--lp-bg-card)]/40 hover:bg-[var(--lp-bg-card)]/70',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-cta text-sm md:text-base">{program.name}</h3>
                  {isSuggested && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[var(--lp-accent)]/10 text-[var(--lp-accent)] px-2 py-0.5 rounded-full">
                      Gợi ý
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: featured program detail */}
        {featured && (
          <div className="flex-1 flex flex-col gap-4">
            <div className="bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] p-6 md:p-8 shadow-lg shadow-cta/10">
              <h3 className="font-serif font-bold text-xl md:text-2xl text-cta italic mb-3">
                {featured.name}
              </h3>
              {featured.summary && (
                <ul className="flex flex-col gap-2 mb-4">
                  {featured.summary.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-cta/70 leading-relaxed">
                      <span className="text-[var(--lp-accent)] mt-0.5 shrink-0">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              <blockquote className="border-l-2 border-[var(--lp-accent)] pl-4 py-2 text-xs text-cta/50 italic">
                {featured.description?.slice(0, 120)}...
              </blockquote>
            </div>
            <CtaButton onClick={() => onContinue(selected)} fullWidth size="lg">
              Đăng ký liệu trình →
            </CtaButton>
          </div>
        )}
      </div>
    </div>
  );
}
