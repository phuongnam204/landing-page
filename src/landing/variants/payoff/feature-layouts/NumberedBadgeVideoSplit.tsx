'use client';
import { useEffect, useRef, useState } from 'react';
import type { PayoffItem } from './types';
import { benefitsAsItems } from '../constant/Benefit';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NumberedBadgeVideoSplit({
  onContinue,
  items = benefitsAsItems,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
  accentImages?: [string, string];
}) {
  const leftRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const el = leftRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative min-h-[100dvh] bg-[var(--lp-bg-minigame)] flex flex-col md:flex-row overflow-hidden">

      {/* ─── Left: title + numbered list + CTA ─── */}
      <div
        ref={leftRef}
        className="relative flex flex-col gap-7 justify-center px-6 md:px-10 lg:px-14 py-16 md:py-20 md:basis-1/2 md:shrink-0"
      >
        {/* Orbit decoration */}
        <div className="absolute -top-8 -left-10 w-52 h-52 text-cta opacity-[0.08] pointer-events-none" aria-hidden="true">
          <svg viewBox="0 0 134.5 134.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <circle cx="67.25" cy="67.25" r="17.88" stroke="currentColor" strokeWidth="0.8"/>
            <circle cx="67.25" cy="67.25" r="33.24" stroke="currentColor" strokeWidth="0.8"/>
            <circle cx="67.25" cy="67.25" r="54"    stroke="currentColor" strokeWidth="0.8"/>
            <circle cx="67.25" cy="67.25" r="67.24" stroke="currentColor" strokeWidth="0.8"/>
          </svg>
        </div>

        <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-tight">
          Lợi ích khi chọn<br className="hidden md:block" /> trị mụn ở O2skin
        </h2>

        <div className="flex flex-col gap-5">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4"
              style={{
                opacity: visible || reducedMotion ? 1 : 0,
                transform: visible || reducedMotion ? 'none' : 'translateY(18px)',
                transition: reducedMotion
                  ? 'none'
                  : `opacity 480ms ease-out ${i * 130}ms, transform 480ms ease-out ${i * 130}ms`,
              }}
            >
              <div className="w-11 h-11 rounded-full bg-cta text-white font-black text-base flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div>
                <p className="font-black text-xl md:text-2xl text-cta leading-none">{item.title}</p>
                <p className="text-sm text-cta/75 leading-snug mt-0.5">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <CtaButton onClick={onContinue} className="self-start">
          O2 skin có gì đặc biệt ?
        </CtaButton>
      </div>

      {/* ─── Right: split-screen video, bo 2 góc trái ─── */}
      <div className="flex-1 relative min-h-[300px] md:min-h-0">
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            borderRadius: '80px 0 0 80px',
            borderTop: '7px solid color-mix(in srgb, var(--lp-accent) 42%, white)',
            borderLeft: '7px solid color-mix(in srgb, var(--lp-accent) 42%, white)',
            borderBottom: '7px solid color-mix(in srgb, var(--lp-accent) 42%, white)',
          }}
        >
          {!reducedMotion ? (
            <video
              autoPlay muted loop playsInline preload="metadata"
              src="/videos/hero-background.mp4"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{ background: 'color-mix(in srgb, var(--lp-primary) 70%, var(--lp-accent))' }}
            />
          )}
        </div>
      </div>

    </div>
  );
}
