'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { PayoffSlotProps, MinigameResult } from '../../slots';
import type { PayoffCopy } from '../../copy';
import type { ConditionId, SkinCondition } from '../../../content/quiz';
import { NumberedBadgeCirclesRight, CarouselKenBurn } from './feature-layouts';
import { CONDITION_EDUCATION } from './constant/ConditionEducation';
import { CtaButton } from '../../../components/atoms/CtaButton';
import { ResultCard } from './result-layouts/ResultCard';

// ─── helpers ─────────────────────────────────────────────────────────────────

function resolveEdu(conditionId: ConditionId, triggerNote?: string) {
  const base = CONDITION_EDUCATION[conditionId];
  if (!base) return null;
  const override = triggerNote ? base.perTrigger?.[triggerNote] : undefined;
  return {
    ...base,
    ...(override?.whyTitle ? { whyTitle: override.whyTitle } : {}),
    ...(override?.steps    ? { steps: override.steps }         : {}),
  };
}

// ─── ConditionEduContent ─────────────────────────────────────────────────────

function ConditionEduContent({ conditionId, triggerNote }: {
  conditionId: ConditionId;
  triggerNote?: string;
}) {
  const edu = resolveEdu(conditionId, triggerNote);
  if (!edu) return null;
  return (
    <>
      <div className="flex flex-col gap-4">
        {edu.steps.map((step, i) => (
          <div key={i} className="flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-cta text-white font-bold text-sm flex items-center justify-center shrink-0 mt-0.5">
              {i + 1}
            </div>
            <div>
              <p className="font-bold text-cta text-sm md:text-base">{step.title}</p>
              <p className="text-sm text-cta/80 leading-relaxed mt-1">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <blockquote className="relative bg-white border border-cta/10 rounded-lg px-5 pt-7 pb-4">
        <span className="absolute top-3 left-4 text-3xl font-black text-[var(--lp-accent)] opacity-25 leading-none select-none" aria-hidden="true">&ldquo;</span>
        <p className="text-sm md:text-base text-cta/85 italic leading-relaxed">{edu.expertQuote}</p>
        <cite className="not-italic text-xs text-cta/75 font-semibold mt-2 block">{edu.expertName}</cite>
      </blockquote>
    </>
  );
}

// ─── WhySectionMulti ─────────────────────────────────────────────────────────

const WHY_ARROW_STYLE: React.CSSProperties = {
  background: 'color-mix(in srgb, var(--lp-accent) 10%, white 90%)',
  border: '1px solid color-mix(in srgb, var(--lp-accent) 18%, transparent)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
};

function WhySectionMulti({ conditions, tone, triggerNote, onScrollDown }: {
  conditions: SkinCondition[];
  tone: 'positive' | 'concern';
  triggerNote?: string;
  onScrollDown: () => void;
}) {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [showAll, setShowAll]       = useState(false);
  const [slideDir, setSlideDir]     = useState<'left' | 'right' | null>(null);
  const [dragX, setDragX]           = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpringBack, setIsSpringBack] = useState(false);
  const dragRef                     = useRef<{ startX: number; live: boolean }>({ startX: 0, live: false });
  const lastMoveRef                 = useRef<{ x: number; t: number }>({ x: 0, t: 0 });
  const velocityRef                 = useRef(0);
  const lastNavWasSwipeRef              = useRef(false);
  const [cardHasMore, setCardHasMore]   = useState(false);
  const [cardAtBottom, setCardAtBottom] = useState(true);
  const cardScrollRef                   = useRef<HTMLDivElement>(null);

  const SHOW_INITIAL      = 3;
  const eduConditions     = conditions.filter(c => CONDITION_EDUCATION[c.id as ConditionId]);
  const visibleConditions = showAll ? eduConditions : eduConditions.slice(0, SHOW_INITIAL);
  const hiddenCount       = !showAll && eduConditions.length > SHOW_INITIAL
    ? eduConditions.length - SHOW_INITIAL : 0;
  const clampedIdx = Math.min(activeIdx, visibleConditions.length - 1);
  const active     = visibleConditions[clampedIdx];

  useEffect(() => {
    const el = cardScrollRef.current;
    if (!el) return;
    const check = () => {
      setCardHasMore(el.scrollHeight > el.clientHeight + 2);
      setCardAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 4);
    };
    check();
    el.addEventListener('scroll', check, { passive: true });
    return () => el.removeEventListener('scroll', check);
  }, [clampedIdx]);

  if (!active) return null;

  // ── Single condition ──────────────────────────────────────────────────────
  if (eduConditions.length <= 1) {
    const singleEdu = resolveEdu(active.id as ConditionId, triggerNote);
    return (
      <div className="max-w-lg md:max-w-3xl mx-auto px-5 py-5 md:py-10 flex flex-col gap-4 md:gap-6 w-full">
        <h2 className="font-extrabold text-xl md:text-2xl text-cta">{singleEdu?.whyTitle}</h2>
        <ConditionEduContent conditionId={active.id as ConditionId} triggerNote={triggerNote} />
        <CtaButton
          fullWidth
          onClick={onScrollDown}
          className="md:text-base"
          style={{ animation: 'cta-nudge 1.6s ease-in-out 2.5s 3' }}
        >
          {tone === 'positive' ? 'Làm sao để duy trì làn da này? ↓' : 'Tôi phải làm sao? ↓'}
        </CtaButton>
      </div>
    );
  }

  // ── Multi condition ───────────────────────────────────────────────────────
  const activeEdu = resolveEdu(active.id as ConditionId, clampedIdx === 0 ? triggerNote : undefined);
  const isFirst   = clampedIdx === 0;
  const isLast    = clampedIdx === visibleConditions.length - 1;

  function goTo(newIdx: number) {
    lastNavWasSwipeRef.current = false;
    setSlideDir(newIdx > clampedIdx ? 'left' : 'right');
    setActiveIdx(newIdx);
  }

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { startX: e.clientX, live: true };
    lastMoveRef.current = { x: e.clientX, t: Date.now() };
    velocityRef.current = 0;
    setIsSpringBack(false);
    setIsDragging(false);
    setDragX(0);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.live) return;
    const delta = e.clientX - dragRef.current.startX;
    const now = Date.now();
    const dt = now - lastMoveRef.current.t;
    if (dt > 0) velocityRef.current = (e.clientX - lastMoveRef.current.x) / dt;
    lastMoveRef.current = { x: e.clientX, t: now };
    if (Math.abs(delta) > 6) {
      setIsDragging(true);
      setDragX(delta);
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!dragRef.current.live) return;
    const delta = e.clientX - dragRef.current.startX;
    const velocity = velocityRef.current; // px/ms
    dragRef.current.live = false;
    setIsDragging(false);

    const DIST_THRESHOLD = 72;
    const VEL_THRESHOLD  = 0.38; // px/ms — fast flick dismisses early
    const shouldDismiss  = Math.abs(delta) >= DIST_THRESHOLD || (Math.abs(delta) > 20 && Math.abs(velocity) >= VEL_THRESHOLD);

    if (!shouldDismiss) {
      setIsSpringBack(true);
      setDragX(0);
      setTimeout(() => setIsSpringBack(false), 380);
      return;
    }

    setDragX(0);
    lastNavWasSwipeRef.current = true;
    setSlideDir(null);
    setActiveIdx(prev =>
      delta < 0
        ? Math.min(visibleConditions.length - 1, prev + 1)
        : Math.max(0, prev - 1),
    );
  }

  const cardAnimation = isDragging
    ? 'none'
    : lastNavWasSwipeRef.current
    ? 'none'
    : slideDir === 'left'
    ? 'why-slide-from-right 400ms cubic-bezier(0.22,1,0.36,1) both'
    : slideDir === 'right'
    ? 'why-slide-from-left 400ms cubic-bezier(0.22,1,0.36,1) both'
    : 'why-fade-in 320ms ease-in-out both';

  return (
    <>
      <style>{`
        @keyframes why-slide-from-right { from { opacity:0; transform:translateX(22px) } to { opacity:1; transform:translateX(0) } }
        @keyframes why-slide-from-left  { from { opacity:0; transform:translateX(-22px) } to { opacity:1; transform:translateX(0) } }
        @keyframes why-fade-in          { from { opacity:0; transform:translateY(4px)  } to { opacity:1; transform:translateY(0) } }
        .why-card::-webkit-scrollbar        { width: 3px; }
        .why-card::-webkit-scrollbar-track  { background: transparent; border-radius: 99px; }
        .why-card::-webkit-scrollbar-thumb  { background: color-mix(in srgb, var(--lp-accent) 40%, transparent); border-radius: 99px; }
        .why-card::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--lp-accent) 62%, transparent); }
      `}</style>
      <div className="max-w-lg md:max-w-3xl mx-auto px-5 py-4 md:py-10 flex flex-col gap-3 md:gap-5 w-full">

        {/* Heading */}
        <div>
          <p className="text-xs font-bold text-[var(--lp-accent)] uppercase tracking-widest mb-1.5">
            Giải thích từ chuyên gia
          </p>
          <h2 className="font-extrabold text-lg md:text-2xl text-cta leading-snug">
            {eduConditions.length} tình trạng da đang ảnh hưởng đến bạn
          </h2>
        </div>

        {/* Pagination chips */}
        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {visibleConditions.map((c, i) => (
            <button
              key={c.id}
              onClick={() => goTo(i)}
              className="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150"
              style={
                i === clampedIdx
                  ? { background: 'var(--lp-accent)', color: '#fff', boxShadow: '0 1px 4px color-mix(in srgb, var(--lp-accent) 35%, transparent)' }
                  : { background: 'color-mix(in srgb, var(--lp-accent) 10%, white 90%)', color: 'var(--lp-accent)', border: '1px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)' }
              }
            >
              {c.label ?? c.id}
            </button>
          ))}
        </div>

        {/* Card + side arrows */}
        <div className="relative" style={{ overflow: 'visible' }}>

          {/* Left arrow — vertically centered on card's left edge */}
          {visibleConditions.length > 1 && (
            <button
              onClick={() => !isFirst && goTo(clampedIdx - 1)}
              disabled={isFirst}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 z-10 rounded-full flex items-center justify-center transition-all duration-200 text-cta disabled:opacity-0 disabled:pointer-events-none"
              style={WHY_ARROW_STYLE}
              aria-label="Tình trạng trước"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          {/* Animated wrapper — handles slide animation + drag transform */}
          <div
            key={`card-${clampedIdx}`}
            className="relative"
            style={{
              animation: cardAnimation,
              transform: isDragging
                ? `translateX(${dragX}px) rotate(${(dragX / 420) * 7}deg)`
                : undefined,
              opacity: isDragging ? Math.max(0.45, 1 - Math.abs(dragX) / 380) : 1,
              transition: isSpringBack
                ? 'transform 0.38s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease'
                : isDragging ? 'none' : undefined,
            }}
          >
            {/* Scrollable card */}
            <div
              ref={cardScrollRef}
              className="flex flex-col gap-3 md:gap-4 bg-white/70 border border-cta/8 rounded-2xl p-4 md:p-5 cursor-grab active:cursor-grabbing select-none why-card"
              style={{
                boxShadow: '0 1px 8px color-mix(in srgb, var(--lp-primary, #1e293b) 5%, transparent)',
                touchAction: 'pan-y',
                maxHeight: 'calc(100dvh - 290px)',
                overflowY: 'auto',
              }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={() => { dragRef.current.live = false; setIsDragging(false); setDragX(0); }}
            >
              {activeEdu && (
                <h3 className="font-extrabold text-base md:text-xl text-cta leading-snug pointer-events-none">
                  {activeEdu.whyTitle}
                </h3>
              )}
              <ConditionEduContent
                conditionId={active.id as ConditionId}
                triggerNote={clampedIdx === 0 ? triggerNote : undefined}
              />
            </div>

            {/* Bottom scroll hint — gradient fade + label, hidden once scrolled to bottom */}
            {cardHasMore && !cardAtBottom && (
              <div
                className="absolute bottom-0 left-0 right-0 pointer-events-none rounded-b-2xl flex items-end justify-center"
                style={{ height: 64, paddingBottom: 8, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 55%)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--lp-accent)', opacity: 0.8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>Cuộn để xem thêm</span>
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            )}
          </div>

          {/* Right arrow OR expand badge — vertically centered on card's right edge */}
          {visibleConditions.length > 1 && (
            hiddenCount > 0 && isLast ? (
              <button
                onClick={() => { setShowAll(true); goTo(SHOW_INITIAL); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 px-3 py-2 rounded-full text-xs font-bold transition-all duration-150 hover:brightness-95 whitespace-nowrap"
                style={{ background: 'color-mix(in srgb, var(--lp-accent) 10%, white 90%)', color: 'var(--lp-accent)', border: '1px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
              >
                {`+${hiddenCount} nữa →`}
              </button>
            ) : (
              <button
                onClick={() => !isLast && goTo(clampedIdx + 1)}
                disabled={isLast}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-9 h-9 z-10 rounded-full flex items-center justify-center transition-all duration-200 text-cta disabled:opacity-0 disabled:pointer-events-none"
                style={WHY_ARROW_STYLE}
                aria-label="Tình trạng tiếp theo"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            )
          )}
        </div>

        {/* Dot pagination */}
        {visibleConditions.length > 1 && (
          <div className="flex gap-1.5 items-center justify-center">
            {visibleConditions.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Tình trạng ${i + 1}`}
                style={{
                  borderRadius: 999, width: i === clampedIdx ? 16 : 8, height: 8,
                  border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s ease',
                  background: i === clampedIdx ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 20%, white 80%)',
                }}
              />
            ))}
          </div>
        )}

        {/* CTA */}
        <CtaButton fullWidth onClick={onScrollDown} className="md:text-base" style={{ animation: 'cta-nudge 1.6s ease-in-out 2.5s 3' }}>
          {tone === 'positive' ? 'Làm sao để duy trì làn da này? ↓' : 'Tôi phải làm sao? ↓'}
        </CtaButton>
      </div>
    </>
  );
}

// ─── ClinicIntroSection ───────────────────────────────────────────────────────

const CLINIC_COPY = {
  concern: {
    headline: 'Chúng tôi có giải pháp cho làn da của bạn!',
    subtext:  '',
    scrollCta: 'Cùng tham quan một chút nhé! ↓',
  },
  positive: {
    headline: (<>Da bạn đang ổn — chúng tôi<br />giúp bạn giữ mãi được như vậy.</>),
    subtext:  'Chúng tôi có liệu trình chăm sóc phù hợp giúp duy trì làn da khỏe mạnh lâu dài.',
    scrollCta: 'Cùng khám phá giải pháp nhé! ↓',
  },
} as const;

function ClinicIntroSection({ tone, onScrollDown }: { tone: 'positive' | 'concern'; onScrollDown: () => void }) {
  const copy = CLINIC_COPY[tone];
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-payoff)] flex flex-col md:flex-row md:items-center px-6 md:px-12 lg:px-20 py-14 gap-10 md:gap-12">
      {/* Text — mobile: dưới ảnh (order-2), desktop: bên trái (order-1) */}
      <div className="flex-1 flex flex-col items-start gap-5 order-2 md:order-1">
        <h2 className="font-extrabold text-3xl md:text-4xl text-cta leading-snug">
          {copy.headline}
        </h2>
        <button
          onClick={onScrollDown}
          className="mt-2 text-sm font-semibold text-[var(--lp-accent)] hover:text-cta transition-colors flex items-center gap-1.5"
          style={{ animation: 'cta-nudge 1.6s ease-in-out 2s 3' }}
        >
          {copy.scrollCta}
        </button>
      </div>
      {/* Ảnh — mobile: trên cùng (order-1), desktop: bên phải (order-2), kích thước tự nhiên */}
      <div className="flex-1 order-1 md:order-2">
        <img
          src="/clinic/hinh-banner-about-us-desktop-update.png"
          alt="Phòng khám da liễu O2 Skin"
          className="w-full h-auto rounded-soft"
        />
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export type TopbarConfig = {
  labels: {
    result: string;
    why: string;
    clinic?: string;
    benefit: string;
  };
  style?: React.CSSProperties;
  className?: string;
};

export function ConfettiCardWhyPayoff({
  result,
  onContinue,
  copy,
  FeatureComponent: FeatureComp = CarouselKenBurn,
  BenefitComponent: BenefitComp = NumberedBadgeCirclesRight,
  ResultComponent: ResultComp = ResultCard,
  topbarConfig,
}: PayoffSlotProps & {
  FeatureComponent?: React.ComponentType<{ onContinue: () => void }>;
  BenefitComponent?: React.ComponentType<{ onContinue: () => void }>;
  ResultComponent?: React.ComponentType<{ result: MinigameResult; onScrollDown: () => void; containerRef?: React.Ref<HTMLDivElement>; copy?: PayoffCopy['resultCard'] }>;
  topbarConfig?: TopbarConfig;
}) {
  const whyRef             = useRef<HTMLDivElement>(null);
  const clinicRef          = useRef<HTMLDivElement>(null);
  const statsRef           = useRef<HTMLDivElement>(null);
  const featureRef         = useRef<HTMLDivElement>(null);
  const resultSectRef      = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSkipCta, setShowSkipCta] = useState(false);
  const [activeSection, setActiveSection] = useState<'result' | 'why' | 'clinic' | 'benefit'>('result');
  const prevSectionRef = useRef<string>('result');

  // Show sticky skip CTA once WhySection is partially scrolled past
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    function onScroll() {
      const whyTop = whyRef.current?.offsetTop ?? Infinity;
      setShowSkipCta(container!.scrollTop >= whyTop + 80);
    }
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!topbarConfig) return;
    const root = scrollContainerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          let next: 'result' | 'why' | 'clinic' | 'benefit' = 'result';
          if (entry.target === resultSectRef.current) next = 'result';
          else if (entry.target === whyRef.current) next = 'why';
          else if (entry.target === clinicRef.current) next = 'clinic';
          else next = 'benefit';
          if (next !== prevSectionRef.current) {
            prevSectionRef.current = next;
            setActiveSection(next);
          }
        }
      },
      { root, threshold: 0.4 },
    );
    [resultSectRef, whyRef, clinicRef, statsRef, featureRef].forEach((r) => { if (r.current) observer.observe(r.current); });
    return () => observer.disconnect();
  }, [topbarConfig]);

  return (
    <div ref={scrollContainerRef} className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto" style={{ scrollSnapType: 'y proximity' }}>
      <style>{`@keyframes cta-nudge{0%,100%{transform:translateY(0)}40%{transform:translateY(-4px)}70%{transform:translateY(-2px)}}`}</style>

      {topbarConfig && (
        <div
          className={`sticky top-0 z-50 py-3.5 px-6 text-center font-bold text-base md:text-lg tracking-widest uppercase overflow-hidden${topbarConfig.className ? ` ${topbarConfig.className}` : ''}`}
          style={topbarConfig.style}
        >
          <span key={activeSection} className="topbar-label-in inline-block">
            {topbarConfig.labels[activeSection] ?? topbarConfig.labels.benefit}
          </span>
        </div>
      )}

      {/* Sticky skip CTA — xuất hiện khi Benefit section vào view */}
      {showSkipCta && (
        <div className="fixed bottom-5 right-4 z-50 animate-fade-in-up">
          <button
            onClick={onContinue}
            className="text-white text-sm font-bold py-3 px-5 rounded-soft hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            style={{ background: 'white', color: 'var(--lp-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.22)', border: '1.5px solid color-mix(in srgb, var(--lp-primary) 12%, transparent)' }}
          >
            Đặt lịch ngay &#8594;
          </button>
        </div>
      )}

      {/* Section 1: Kết quả (above fold) */}
      {(() => {
        const condId = result.condition.id as ConditionId;
        const triggerBody = result.triggerNote
          ? CONDITION_EDUCATION[condId]?.perTrigger?.[result.triggerNote]?.body
          : undefined;
        const displayResult = triggerBody
          ? { ...result, condition: { ...result.condition, body: triggerBody } }
          : result;
        return (
          <ResultComp
            containerRef={resultSectRef}
            result={displayResult}
            onScrollDown={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })}
            copy={copy?.resultCard}
          />
        );
      })()}

      {/* Section 2: Why */}
      <div ref={whyRef} className="min-h-[100dvh] bg-[var(--lp-bg-payoff)] border-t border-cta/8 flex flex-col justify-center" style={{ scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
        <WhySectionMulti
          conditions={result.conditions}
          tone={result.condition.tone}
          triggerNote={result.triggerNote || undefined}
          onScrollDown={() => clinicRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      {/* Section 2.5: Clinic Intro */}
      <div ref={clinicRef}>
        <ClinicIntroSection
          tone={result.condition.tone}
          onScrollDown={() => statsRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      {/* Section 3: Benefit */}
      <div ref={statsRef}>
        <BenefitComp onContinue={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* Section 4: Feature + final CTA */}
      <div ref={featureRef}>
        <FeatureComp onContinue={onContinue} />
      </div>

    </div>
  );
}
