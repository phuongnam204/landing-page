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
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-cta hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span>{item.q}</span>
            <ChevronIcon open={openIdx === i} />
          </button>
          <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: openIdx === i ? '200px' : '0px' }}>
            <p className="px-4 pb-4 text-sm text-cta/70 leading-relaxed">{item.a}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConditionTagSmall({ conditionId }: { conditionId: string }) {
  const c = getConditionById(conditionId as ConditionId);
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
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
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-cta/20" />
        </div>
        <div className="flex items-center justify-between px-5 pt-2 pb-4 border-b border-[var(--lp-border)] shrink-0">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-cta/40 mb-0.5">Liệu trình được gợi ý</p>
            <h3 className="font-extrabold text-base text-cta">{program.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cta/10 transition-colors text-cta/60"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-5">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-[55%_1fr] md:gap-6 md:items-start">
            {/* Left column */}
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: tint }}>Về liệu trình</p>
                <p className="text-sm text-cta/75 leading-relaxed">{program.description}</p>
              </div>
              {program.benenif && program.benenif.length > 0 && (
                <div className="rounded-soft p-4 border border-[var(--lp-border)]" style={{ background: `${tint}14` }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: tint }}>Lợi ích nổi bật</p>
                  <ul className="flex flex-col gap-2">
                    {program.benenif.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-cta/75">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
                          <circle cx="8" cy="8" r="7.5" fill="currentColor" style={{ color: `${tint}33` }} />
                          <path d="M5 8.5l2.5 2.5 4-5" stroke={tint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-cta/40 mb-2">Phù hợp với</p>
                <div className="flex flex-wrap gap-2">
                  {getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
                </div>
              </div>
              {program.referenceLink && (
                <a
                  href={program.referenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold hover:underline underline-offset-2 transition-opacity hover:opacity-70"
                  style={{ color: tint }}
                >
                  Tìm hiểu thêm về liệu trình
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}
            </div>
            {/* Right column: images or tint placeholder */}
            <div className="flex flex-col gap-3">
              {program.images && program.images.length > 0 ? (
                program.images.slice(0, 2).map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-full rounded-soft object-cover"
                    style={{ aspectRatio: '4/3' }}
                  />
                ))
              ) : (
                <div
                  className="w-full rounded-soft"
                  style={{ background: `${tint}20`, minHeight: 120 }}
                />
              )}
            </div>
          </div>
          <div className="h-2" />
        </div>
        <div className="px-5 py-4 border-t border-[var(--lp-border)] shrink-0">
          <CtaButton variant="golden" fullWidth onClick={onBook}>
            Đặt lịch với liệu trình này
          </CtaButton>
        </div>
      </div>
    </>
  );
}

function ProgramHighlight({ program, tint, onOpenDrawer }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  onOpenDrawer: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold text-cta/60 uppercase tracking-widest text-center md:text-left">
        Gợi ý liệu trình cho bạn
      </p>
      <div className="bg-[var(--lp-bg-card)] rounded-soft shadow-lg shadow-cta/10 overflow-hidden">
        <div
          className="px-5 py-4 lg:px-8 lg:py-6"
          style={{ background: tint }}
        >
          <div className="flex items-center gap-2 mb-2 lg:mb-3">
            <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
              Phù hợp nhất
            </span>
            {program.sessions && (
              <span className="text-xs text-white/70 font-semibold">{program.sessions} buổi</span>
            )}
          </div>
          <h2 className="text-lg lg:text-xl font-extrabold text-white">{program.name}</h2>
        </div>
        {program.summary && program.summary.length > 0 ? (
          <ul className="px-5 pt-4 pb-2 lg:px-8 flex flex-col gap-2.5">
            {program.summary.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cta/75">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="7.5" fill="currentColor" style={{ color: `${tint}33` }} />
                  <path d="M5 8.5l2.5 2.5 4-5" stroke={tint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-5 pt-4 pb-2 lg:px-8 text-sm text-cta/70 leading-relaxed">{program.description}</p>
        )}
        <div className="px-5 pb-5 lg:px-8">
          <div className="flex flex-wrap gap-2 mt-4 mb-3">
            {getAllConditionIds(program).map(cid => <ConditionTagSmall key={cid} conditionId={cid} />)}
          </div>
          <button
            type="button"
            onClick={onOpenDrawer}
            className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
            style={{ color: tint }}
          >
            Xem chi tiết liệu trình &#8595;
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqSection({ items }: { items: FaqItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-sm font-bold text-cta/60 whitespace-nowrap">Câu hỏi thường gặp</span>
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
  const cond = program ? getConditionById(program.primaryConditionIds[0]) : null;
  const tint = cond?.color ?? '#A0AEC0';
  const faqItems = FAQ_BY_CONDITION[primaryConditionId] ?? FAQ_BY_CONDITION['da-nhon-mun-viem'] ?? [];

  if (!program) return null;

  const handleOpenDrawer = () => {
    setDrawerOpen(true);
    trackEvent('program_detail_open', { programId: topProgramId });
  };

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center">
      <div className="max-w-5xl w-full mx-auto px-5 py-8">
        <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8 md:items-start">
          <ProgramHighlight
            program={program}
            tint={tint}
            onOpenDrawer={handleOpenDrawer}
          />
          <FaqSection items={faqItems} />
        </div>
        <div className="mt-6">
          <CtaButton variant="golden" fullWidth onClick={() => onContinue(topProgramId)}>
            Đặt lịch với liệu trình này
          </CtaButton>
        </div>
        <div className="h-4" />
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
