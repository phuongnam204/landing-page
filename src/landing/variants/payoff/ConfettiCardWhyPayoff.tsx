'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { PayoffSlotProps, MinigameResult } from '../../slots';
import type { ConditionId } from '../../../content/quiz';
import { NumberedBadgeCirclesRight, CarouselKenBurn } from './feature-layouts';
import { CONDITION_EDUCATION } from './constant/ConditionEducation';
import { CtaButton } from '../../../components/atoms/CtaButton';
import { ResultCard } from './result-layouts/ResultCard';

// ─── WhySection ───────────────────────────────────────────────────────────────

function WhySection({ conditionId, tone, onScrollDown }: {
  conditionId: ConditionId;
  tone: 'positive' | 'concern';
  onScrollDown: () => void;
}) {
  const edu = CONDITION_EDUCATION[conditionId]!;
  return (
    <div className="max-w-lg md:max-w-3xl mx-auto px-5 py-10 flex flex-col gap-6">
      <h2 className="font-extrabold text-xl md:text-2xl text-cta">{edu.whyTitle}</h2>
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
      <CtaButton
        fullWidth
        onClick={onScrollDown}
        className="md:text-base"
        style={{ animation: 'cta-nudge 1.6s ease-in-out 2.5s 3' }}
      >
        {tone === 'positive' ? 'Làm sao để duy trì làn da này? ↓' : 'Tôi phải làm sao? ↓'}
      </CtaButton>
      <div className="h-4" />
    </div>
  );
}

// ─── ClinicIntroSection ───────────────────────────────────────────────────────

const CLINIC_COPY = {
  concern: {
    headline: (<>Tình trạng như của bạn,<br />chúng tôi đã có giải pháp.</>),
    subtext:  'Tại đây chúng tôi có giải pháp toàn diện cho làn da của bạn!',
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
        <p className="text-sm md:text-base text-cta/75 leading-relaxed">
          {copy.subtext}
        </p>
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
          alt="Phòng khám da liễu O2skin"
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
  FeatureComponent: FeatureComp = CarouselKenBurn,
  BenefitComponent: BenefitComp = NumberedBadgeCirclesRight,
  ResultComponent: ResultComp = ResultCard,
  topbarConfig,
}: PayoffSlotProps & {
  FeatureComponent?: React.ComponentType<{ onContinue: () => void }>;
  BenefitComponent?: React.ComponentType<{ onContinue: () => void }>;
  ResultComponent?: React.ComponentType<{ result: MinigameResult; onScrollDown: () => void; containerRef?: React.Ref<HTMLDivElement> }>;
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

  // Show sticky skip CTA once Benefit section enters view
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    function onScroll() {
      const benefitTop = statsRef.current?.offsetTop ?? Infinity;
      setShowSkipCta(container!.scrollTop >= benefitTop - 100);
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
    <div ref={scrollContainerRef} className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
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
            className="bg-cta text-white text-sm font-bold py-3 px-5 rounded-soft shadow-lg shadow-cta/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Đặt lịch ngay &#8594;
          </button>
        </div>
      )}

      {/* Section 1: Kết quả (above fold) */}
      <ResultComp
        containerRef={resultSectRef}
        result={result}
        onScrollDown={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Section 2: Why */}
      <div ref={whyRef} className="bg-[var(--lp-bg-payoff)]">
        <WhySection
          conditionId={result.condition.id as ConditionId}
          tone={result.condition.tone}
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
