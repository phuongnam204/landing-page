'use client';
import { useState, useEffect, useRef } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { ProgramId } from '../../../content/programs';
import type { ConditionId } from '../../../content/quiz';
import { getPrograms, getConditionById, getAllConditionIds } from '../../../content/catalog';
import { trackEvent } from '../../../lib/trackEvent';
import { CtaButton } from '../../../components/atoms/CtaButton';
import { FAQ_BY_CONDITION } from './const/FAQCondition';

const OCEAN_TINT = 'var(--lp-accent)';

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

function ProgramDetailDrawer({ program, tint, open, onClose, onBook, ctaVariant = 'golden' }: {
  program: ReturnType<typeof getPrograms>[number];
  tint: string;
  open: boolean;
  onClose: () => void;
  onBook: () => void;
  ctaVariant?: 'golden' | 'dark';
}) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const el = drawerRef.current;
    if (!el) return;
    const focusables = el.querySelectorAll<HTMLElement>(
      'button, [href], input, [tabindex]:not([tabindex="-1"])'
    );
    focusables[0]?.focus();
    function trap(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key !== 'Tab' || !focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [open, onClose]);

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none' }}
        onClick={onClose}
        aria-hidden="true"
      />
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .program-detail-drawer { transition: none !important; }
        }
      `}</style>
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Chi tiết: ${program.name}`}
        className="program-detail-drawer fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-[var(--lp-bg-card)] rounded-t-2xl shadow-2xl shadow-cta/20 max-h-[85dvh]"
        style={{
          transform: open ? 'translateY(0)' : 'translateY(100%)',
          transition: open
            ? 'transform 420ms cubic-bezier(0.34, 1.28, 0.64, 1)'
            : 'transform 220ms cubic-bezier(0.4, 0, 1, 1)',
        }}
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
                          <circle cx="8" cy="8" r="7.5" fill="var(--lp-primary)" opacity="0.15" />
                          <path d="M5 8.5l2.5 2.5 4-5" stroke="var(--lp-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
            <div className="flex flex-col gap-2">
              {program.images && program.images.length > 0 ? (
                (() => {
                  const imgs = program.images!.slice(0, 3);
                  if (imgs.length === 1) {
                    return (
                      <img src={imgs[0]} alt="" className="w-full rounded-soft object-cover"
                        style={{ aspectRatio: '4/3' }} />
                    );
                  }
                  if (imgs.length === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-2">
                        {imgs.map((src, i) => (
                          <img key={i} src={src} alt="" className="w-full rounded-soft object-cover"
                            style={{ aspectRatio: '1/1' }} />
                        ))}
                      </div>
                    );
                  }
                  // 3 images: top row 2:1 + bottom row 2×1:1
                  // Both rows render at the same height (W/2), visually balanced
                  return (
                    <>
                      <img src={imgs[0]} alt="" className="w-full rounded-soft object-cover"
                        style={{ aspectRatio: '2/1' }} />
                      <div className="grid grid-cols-2 gap-2">
                        {imgs.slice(1).map((src, i) => (
                          <img key={i} src={src} alt="" className="w-full rounded-soft object-cover"
                            style={{ aspectRatio: '1/1' }} />
                        ))}
                      </div>
                    </>
                  );
                })()
              ) : (
                <div className="w-full rounded-soft" style={{ background: `${tint}20`, minHeight: 120 }} />
              )}
            </div>
          </div>
          <div className="h-2" />
        </div>
        <div className="px-5 py-4 border-t border-[var(--lp-border)] shrink-0">
          <CtaButton variant={ctaVariant} fullWidth onClick={onBook}>
            Đặt lịch với liệu trình này
          </CtaButton>
        </div>
      </div>
    </>
  );
}

function ProgramCard({ program, label, onOpenDrawer }: {
  program: ReturnType<typeof getPrograms>[number];
  label?: string;
  onOpenDrawer: () => void;
}) {
  return (
    <div className="bg-[var(--lp-bg-card)] rounded-soft shadow-lg shadow-cta/10 overflow-hidden flex-1 min-w-0">
      <div className="px-5 py-4 lg:px-6 lg:py-5" style={{ background: OCEAN_TINT }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full">
            {label ?? 'Phù hợp nhất'}
          </span>
          {program.sessions && (
            <span className="text-xs text-white/70 font-semibold">{program.sessions} buổi</span>
          )}
        </div>
        <h2 className="text-base lg:text-lg font-extrabold text-white">{program.name}</h2>
      </div>
      {program.summary && program.summary.length > 0 ? (
        <ul className="px-5 pt-4 pb-2 lg:px-6 flex flex-col gap-2">
          {program.summary.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-cta/75">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
                <circle cx="8" cy="8" r="7.5" fill="var(--lp-accent)" opacity="0.18" />
                <path d="M5 8.5l2.5 2.5 4-5" stroke={OCEAN_TINT} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-5 pt-4 pb-2 lg:px-6 text-sm text-cta/70 leading-relaxed">{program.description}</p>
      )}
      <div className="px-5 pb-5 lg:px-6 pt-3">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="text-xs font-semibold underline underline-offset-2 hover:opacity-70 transition-opacity"
          style={{ color: OCEAN_TINT }}
        >
          Xem chi tiết liệu trình &#8595;
        </button>
      </div>
    </div>
  );
}

function ProgramHighlight({ program, onOpenDrawer }: {
  program: ReturnType<typeof getPrograms>[number];
  onOpenDrawer: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold text-cta/60 uppercase tracking-widest text-center md:text-left">
        Gợi ý liệu trình cho bạn
      </p>
      <ProgramCard program={program} onOpenDrawer={onOpenDrawer} />
    </div>
  );
}

function ComboHighlight({ programs, onOpenDrawer }: {
  programs: ReturnType<typeof getPrograms>;
  onOpenDrawer: (idx: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-bold text-cta/60 uppercase tracking-widest text-center md:text-left">
        Combo gợi ý cho bạn
      </p>
      <div className="flex flex-col md:flex-row gap-3">
        {programs.map((prog, i) => (
          <ProgramCard
            key={prog.id}
            program={prog}
            label={i === 0 ? 'Bước 1' : 'Bước 2'}
            onOpenDrawer={() => onOpenDrawer(i)}
          />
        ))}
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

export function GridWithFaqPrograms({ suggestedPrograms, onContinue, ctaVariant = 'dark' }: ProgramsSlotProps & { ctaVariant?: 'golden' | 'dark' }) {
  useEffect(() => { trackEvent('programs_faq_view'); }, []);
  const [openDrawerIdx, setOpenDrawerIdx] = useState<number | null>(null);

  const program = suggestedPrograms[0]?.program ?? getPrograms()[0];
  const program2 = suggestedPrograms[1]?.program;
  const isCombo = !!(program.comboWith && program2 && program.comboWith === program2.id);
  const comboPrograms = isCombo ? [program, program2] : [];

  const topProgramId = program.id as ProgramId;
  // Use the condition the user actually matched (matchedPrimary) to pick FAQ, not the program's full list
  const faqConditionId = (
    suggestedPrograms[0]?.matchedPrimary[0]
    ?? program.primaryConditionIds[0]
    ?? 'da-nhon-mun-viem'
  ) as ConditionId;
  const faqItems = FAQ_BY_CONDITION[faqConditionId] ?? FAQ_BY_CONDITION['da-nhon-mun-viem'] ?? [];

  const drawerProgram = openDrawerIdx !== null
    ? (isCombo ? comboPrograms[openDrawerIdx] : program)
    : null;
  const drawerProgramId = drawerProgram?.id as ProgramId | undefined;

  const handleOpenDrawer = (idx = 0) => {
    setOpenDrawerIdx(idx);
    const pid = isCombo ? (comboPrograms[idx]?.id ?? topProgramId) : topProgramId;
    trackEvent('program_detail_open', { programId: pid });
  };

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center">
        <div className="max-w-5xl w-full mx-auto px-5 py-8">
          <div className="flex flex-col gap-5 md:grid md:grid-cols-2 md:gap-8 md:items-start">
            {isCombo ? (
              <ComboHighlight programs={comboPrograms} onOpenDrawer={handleOpenDrawer} />
            ) : (
              <ProgramHighlight program={program} onOpenDrawer={() => handleOpenDrawer(0)} />
            )}
            <FaqSection items={faqItems} />
          </div>
          <div className="mt-6">
            <CtaButton variant={ctaVariant} fullWidth onClick={() => onContinue(topProgramId)}>
              Đặt lịch với liệu trình này
            </CtaButton>
          </div>
          <div className="h-4" />
        </div>
      </div>
      <ProgramDetailDrawer
        program={drawerProgram ?? program}
        tint={OCEAN_TINT}
        open={openDrawerIdx !== null}
        onClose={() => setOpenDrawerIdx(null)}
        onBook={() => onContinue(drawerProgramId ?? topProgramId)}
        ctaVariant={ctaVariant}
      />
    </div>
  );
}
