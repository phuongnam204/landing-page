'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../slots';
import type { ProgramId } from '../../content/programs';
import { getPrograms } from '../../content/catalog';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';
import { ProgramCard } from '../../components/molecules/ProgramCard';
import { FaqAccordion, type FaqItem } from '../../components/molecules/FaqAccordion';
import { trackEvent } from '../../lib/trackEvent';

export type ProgramsLayout = 'grid' | 'carousel' | 'grid-faq';

interface ProgramsOrganismProps extends ProgramsSlotProps {
  layout: ProgramsLayout;
  faqItems?: FaqItem[];
}

export function ProgramsOrganism({ suggestedPrograms, onContinue, layout, faqItems }: ProgramsOrganismProps) {
  const suggestedIds = new Set(suggestedPrograms.map(sp => sp.program.id));
  const topId = suggestedPrograms[0]?.program.id;
  const allPrograms = getPrograms();
  const [selected, setSelected] = useState<ProgramId>(topId ?? allPrograms[0].id);
  const selectedProgram = allPrograms.find(p => p.id === selected);

  return (
    <SectionShell bgVar="--lp-bg-programs" overflow="auto">
      <div className="min-h-full flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-full max-w-5xl mb-5">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <img src="/mascots/nurse-cheer.png" alt="" className="ps-popCheer ps-floaty w-16 md:w-24 h-auto object-contain" style={{ zIndex: 20 }} />
            <h2 className="ps-fadeDown text-xl md:text-2xl font-extrabold text-cta text-center [animation-delay:0.1s]">
              Các gói dịch vụ tại O2Skin
            </h2>
            <img src="/mascots/nurse-review.png" alt="" className="ps-popCheer ps-floaty hidden sm:block w-16 md:w-24 h-auto object-contain" style={{ animationDelay: '0.2s', zIndex: 20 }} />
          </div>
        </div>

        {layout === 'carousel' ? (
          <div className="w-full max-w-5xl flex gap-4 overflow-x-auto pb-2 mb-6 snap-x snap-mandatory">
            {allPrograms.map((program, idx) => (
              <div key={program.id} className="snap-start shrink-0 w-56 md:w-64">
                <ProgramCard
                  program={program}
                  selected={selected === program.id}
                  isSuggested={suggestedIds.has(program.id)}
                  onSelect={() => setSelected(program.id)}
                  style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-5xl grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
            {allPrograms.map((program, idx) => (
              <ProgramCard
                key={program.id}
                program={program}
                selected={selected === program.id}
                isSuggested={suggestedIds.has(program.id)}
                onSelect={() => setSelected(program.id)}
                style={{ animationDelay: `${0.15 + idx * 0.08}s` }}
              />
            ))}
          </div>
        )}

        {layout === 'grid-faq' && faqItems && faqItems.length > 0 && (
          <div className="w-full max-w-5xl mb-6">
            <FaqAccordion
              items={faqItems}
              onOpen={idx => trackEvent('faq_item_open', { index: idx })}
            />
          </div>
        )}

        <CtaButton onClick={() => onContinue(selected)} variant="accent" size="md">
          {`Đăng ký chương trình ${selectedProgram?.name ?? ''} →`}
        </CtaButton>
      </div>
    </SectionShell>
  );
}
