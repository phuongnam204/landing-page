'use client';
import { useState, useEffect, useRef } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import { getPrograms } from '../../../../content/catalog';
import type { ProgramId } from '../../../../content/programs';
import { trackEvent } from '../../../../lib/trackEvent';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const MILESTONES = [
  { step: 1, label: 'Thăm da & tư vấn', desc: 'Chuyên viên sẽ phân tích da và tư vấn liệu trình phù hợp.', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
  { step: 2, label: 'Liệu trình cá nhân hóa', desc: 'Liệu trình được thiết kế riêng cho tình trạng da của bạn.', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' },
  { step: 3, label: 'Theo dõi & điều chỉnh', desc: 'Theo dõi định kỳ và điều chỉnh để đạt kết quả tốt nhất.', icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
];

export function NaturalEditorialJourneyPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const program = suggestedPrograms[0]?.program ?? getPrograms()[0];
  const programId = program.id as ProgramId;

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function handleContinue() {
    trackEvent('programs_journey_continue', { programId });
    onContinue(programId);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center px-5 py-8">
        <div className="max-w-lg w-full flex flex-col gap-6">

          {/* Header */}
          <div
            className="text-center"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(12px)',
              transition: 'opacity 500ms ease-out, transform 500ms ease-out',
            }}
          >
            <p className="text-xs font-bold uppercase tracking-widest"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              Hành trình của bạn
            </p>
            <h2 className="text-xl font-extrabold mt-2" style={{ color: 'var(--lp-primary)' }}>
              {program.name}
            </h2>
            <p className="text-sm mt-2 leading-relaxed"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
              {program.description}
            </p>
          </div>

          {/* Timeline */}
          <div ref={listRef} className="flex flex-col relative">
            {/* Vertical connector line */}
            <div
              className="absolute left-[1.125rem] top-9 bottom-9 w-0.5 origin-top pointer-events-none"
              style={{
                background: 'color-mix(in srgb, var(--lp-accent) 22%, transparent)',
                transform: visible ? 'scaleY(1)' : 'scaleY(0)',
                transition: 'transform 700ms ease-out 180ms',
              }}
            />

            {MILESTONES.map((m, i) => {
              const isActive = i === activeStep;
              const isPast = i < activeStep;
              const delay = `${100 + i * 140}ms`;
              return (
                <button
                  key={m.step}
                  onClick={() => setActiveStep(i)}
                  className="flex items-start gap-4 rounded-soft p-4 text-left relative z-10"
                  style={{
                    background: isActive ? 'color-mix(in srgb, var(--lp-accent) 8%, white)' : 'transparent',
                    borderLeft: isActive ? '3px solid var(--lp-accent)' : '3px solid transparent',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateX(-10px)',
                    transition: `opacity 420ms ease-out ${delay}, transform 420ms ease-out ${delay}, background 200ms ease, border-color 200ms ease`,
                  }}
                >
                  {/* Circle */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isPast
                        ? 'var(--lp-accent)'
                        : isActive
                          ? `linear-gradient(135deg, var(--lp-accent), color-mix(in srgb, var(--lp-accent) 70%, var(--lp-primary)))`
                          : 'color-mix(in srgb, var(--lp-accent) 15%, white)',
                      boxShadow: isActive ? '0 0 0 4px color-mix(in srgb, var(--lp-accent) 15%, transparent)' : 'none',
                      transition: 'background 300ms ease, box-shadow 300ms ease',
                    }}
                  >
                    {isPast ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke={isActive ? 'white' : 'var(--lp-accent)'}
                        strokeWidth="2" strokeLinecap="round">
                        <path d={m.icon} />
                      </svg>
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-bold"
                      style={{
                        color: isActive ? 'var(--lp-primary)' : 'color-mix(in srgb, var(--lp-primary) 60%, transparent)',
                        transition: 'color 200ms ease',
                      }}
                    >
                      {m.label}
                    </p>
                    {/* Smooth expand */}
                    <div
                      className="overflow-hidden"
                      style={{
                        maxHeight: isActive ? '80px' : '0',
                        opacity: isActive ? 1 : 0,
                        transition: 'max-height 300ms ease-in-out, opacity 250ms ease-in-out',
                      }}
                    >
                      <p className="text-xs mt-1 leading-relaxed pt-0.5"
                        style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
                        {m.desc}
                      </p>
                    </div>
                  </div>

                  {!isPast && !isActive && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--lp-accent)" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* CTA */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'none' : 'translateY(8px)',
              transition: 'opacity 500ms ease-out 500ms, transform 500ms ease-out 500ms',
            }}
          >
            <CtaButton variant="golden" fullWidth onClick={handleContinue}>
              Bắt đầu hành trình
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  );
}
