'use client';
import { useState, useEffect } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { ProgramId } from '../../../content/programs';
import type { ConditionId } from '../../../content/quiz';
import { getPrograms, getConditionById, getAllConditionIds } from '../../../content/catalog';
import { trackEvent } from '../../../lib/trackEvent';
import { CtaButton } from '../../../components/atoms/CtaButton';
import { FAQ_BY_CONDITION } from './const/FAQCondition';
type FaqItem = { q: string; a: string };



function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-soft border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-bg-card)]">
      {items.map((item, i) => (
        <div key={i} className={i < items.length - 1 ? 'border-b border-[var(--lp-border)]' : ''}>
          <button
            type="button"
            onClick={() => {
              const next = openIdx === i ? null : i;
              setOpenIdx(next);
              if (next !== null) trackEvent('faq_item_open', { index: next });
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 lg:px-6 lg:py-5 text-left text-sm lg:text-base font-semibold text-cta hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span>{item.q}</span>
            <ChevronIcon open={openIdx === i} />
          </button>
          <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: openIdx === i ? '300px' : '0px' }}>
            <p className="px-4 pb-4 lg:px-6 lg:pb-5 text-sm lg:text-base text-cta/70 leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConditionTagSmall({ conditionId }: { conditionId: string }) {
  const c = getConditionById(conditionId as ConditionId);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs lg:text-sm font-semibold px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full"
      style={{ background: c ? `${c.color}22` : '#e8e8e8', color: c ? c.color : '#555', filter: 'brightness(0.82)' }}>
      <span className="w-2 h-2 rounded-full" style={{ background: c?.color ?? '#999' }} />
      {c?.label ?? conditionId}
    </span>
  );
}

function ProgramDetailDrawer({ program, tint, open, onClose, onBook }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  open: boolean;
  onClose: () => void;
  onBook: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết: ${program.name}`}
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[var(--lp-bg-card)] rounded-t-2xl shadow-2xl shadow-cta/20 max-h-[85dvh] transition-transform duration-300"
        style={{ transform: open ? 'translateY(0)' : 'translateY(100%)' }}
      >
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-cta/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--lp-border)] flex-shrink-0">
          <h2 className="text-base font-bold text-cta">{program.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--lp-bg-hero)] text-cta/50 hover:text-cta transition-colors"
            aria-label="Đóng"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cta/40 mb-2">Về liệu trình</p>
            <p className="text-sm text-cta/75 leading-relaxed">{program.description}</p>
          </div>
          {program.benenif && (
            <div className="rounded-soft p-4 border border-[var(--lp-border)]" style={{ background: `${tint}14` }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: tint, filter: 'brightness(0.75)' }}>Lợi ích nổi bật</p>
              <p className="text-sm text-cta/75 leading-relaxed">{program.benenif}</p>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 px-5 py-4 border-t border-[var(--lp-border)]">
          <CtaButton variant="golden" size="md" fullWidth onClick={() => { onClose(); onBook(); }}>
            Đặt lịch với liệu trình này
          </CtaButton>
        </div>
      </div>
    </>
  );
}

function ProgramHighlight({ program, tint, onContinue, suggestedProgramId, onOpenDrawer }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  onContinue: (id: ProgramId) => void;
  suggestedProgramId: ProgramId;
  onOpenDrawer: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <p className="text-xl font-bold uppercase tracking-widest text-cta/50 text-center md:text-left">
        Gợi ý liệu trình cho bạn
      </p>
      <div className="bg-[var(--lp-bg-card)] rounded-soft shadow-lg shadow-cta/10 overflow-hidden">
        <div className="px-5 py-4 lg:px-8 lg:py-6 border-l-4" style={{ background: `linear-gradient(135deg, ${tint}40, ${tint}15)`, borderLeftColor: tint }}>
          <div className="flex items-center gap-2 mb-2 lg:mb-3">
            <span className="text-xs lg:text-sm font-bold px-2.5 py-0.5 rounded-full text-cta" style={{ background: `${tint}70` }}>
              Phù hợp nhất
            </span>
            {program.sessions && (
              <span className="text-xs lg:text-sm font-bold px-2.5 py-0.5 rounded-full text-cta/70" style={{ background: `${tint}40` }}>
                {program.sessions} buổi
              </span>
            )}
          </div>
          <h2 className="text-lg lg:text-3xl font-extrabold text-cta">
            {program.name}
          </h2>
        </div>
        <div className="px-5 py-4 lg:px-8 lg:py-6">
          {program.summary && program.summary.length > 0 ? (
            <ul className="flex flex-col gap-2 lg:gap-3">
              {program.summary.map((item, i) => (
                <li key={i} className="flex items-start gap-2 lg:gap-3 text-sm lg:text-base text-cta/75">
                  <svg className="flex-shrink-0 mt-0.5 lg:w-5 lg:h-5" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <circle cx="7" cy="7" r="6" fill={tint} opacity="0.2" />
                    <path d="M4.5 7l2 2 3-3" stroke={tint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'brightness(0.7)' }} />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm lg:text-base text-cta/70 leading-relaxed">{program.description}</p>
          )}
          <div className="flex flex-wrap gap-2 mt-3 lg:mt-5">
            {getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
          </div>
        </div>
      </div>
      <CtaButton variant="golden" size="md" fullWidth onClick={() => onContinue(suggestedProgramId)}
        className="lg:py-4 lg:text-base">
        Đặt lịch với liệu trình này
      </CtaButton>
      <button
        onClick={onOpenDrawer}
        className="text-sm lg:text-base font-semibold text-cta/50 hover:text-cta transition-colors text-center py-1"
      >
        Xem chi tiết liệu trình
      </button>
    </div>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3 lg:gap-4">
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-xs lg:text-sm text-cta/40 font-semibold whitespace-nowrap">Câu hỏi thường gặp</span>
        <hr className="flex-1 border-[var(--lp-border)]" />
      </div>
      <p className="text-xs text-cta/40 text-center md:hidden">&#8595; Kéo xuống để đọc</p>
      <FaqAccordion items={items} />
    </div>
  );
}

export function GridWithFaqPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const program = suggestedPrograms[0]?.program;
  const topProgramId = (program?.id ?? getPrograms()[0].id) as ProgramId;
  const primaryConditionId = (program?.primaryConditionIds[0] ?? 'da-nhon-mun-viem') as ConditionId;
  const cond = program
    ? getAllConditionIds(program).map(id => getConditionById(id as ConditionId)).find(c => c !== undefined) ?? null
    : null;
  const tint = cond?.color ?? '#A0AEC0';
  const faqItems = FAQ_BY_CONDITION[primaryConditionId] ?? FAQ_BY_CONDITION['da-nhon-mun-viem'] ?? [];

  if (!program) return null;

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    trackEvent('program_detail_open', { programId: topProgramId });
  };

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-6xl mx-auto px-5 lg:px-12 py-8 lg:py-14">
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8 lg:gap-16 md:items-start">
          <ProgramHighlight
            program={program}
            tint={tint}
            onContinue={onContinue}
            suggestedProgramId={topProgramId}
            onOpenDrawer={handleOpenDrawer}
          />
          <FaqSection items={faqItems} />
        </div>
      </div>
      <ProgramDetailDrawer
        program={program}
        tint={tint}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onBook={() => onContinue(topProgramId)}
      />
    </div>
  );
}
