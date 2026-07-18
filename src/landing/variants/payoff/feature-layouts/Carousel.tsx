'use client';
import { useState, useEffect, useRef } from 'react';
import type { PayoffItem } from './types';
import { featuresAsItems } from '../constant/Features';
import { CtaButton } from '../../../../components/atoms/CtaButton';

function SlideContent({
  title, body, isExiting, delayOffset,
}: {
  title: string; body: string; isExiting: boolean; delayOffset: number;
}) {
  const animStyle = isExiting
    ? { animation: 'header-exit 350ms ease-in forwards' }
    : { animation: `header-enter 500ms ease-out ${200 + delayOffset}ms both` };
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center px-6">
      <h2
        className="text-white font-black text-3xl md:text-5xl leading-tight max-w-3xl"
        style={animStyle}
      >
        {title}
      </h2>
      <p
        className="text-white/80 text-base md:text-lg max-w-xl mt-4 leading-relaxed"
        style={isExiting
          ? { animation: 'header-exit 350ms ease-in forwards' }
          : { animation: `header-enter 500ms ease-out ${200 + delayOffset + 100}ms both` }
        }
      >
        {body}
      </p>
    </div>
  );
}

export function Carousel({
  onContinue,
  items = featuresAsItems,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [prevIdx, setPrevIdx]     = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const activeIdxRef = useRef(activeIdx);
  const isReduced   = useRef(false);
  const n = items.length;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    isReduced.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { isReduced.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function goTo(next: number) {
    clearTimeout(timerRef.current);
    setPrevIdx(prev => (prev !== null ? prev : activeIdxRef.current));
    setActiveIdx(next);
    activeIdxRef.current = next;
    setTimeout(() => setPrevIdx(null), isReduced.current ? 0 : 650);
    timerRef.current = setTimeout(() => goTo((next + 1) % n), 3500);
  }

  useEffect(() => {
    timerRef.current = setTimeout(() => goTo(1 % n), 3500);
    return () => clearTimeout(timerRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const slideSet = [prevIdx, activeIdx]
    .filter((v): v is number => v !== null)
    .filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div className="relative w-full min-h-[100dvh] overflow-hidden bg-black">
      <style>{`
        @keyframes ken-burns {
          from { transform: scale(1); }
          to   { transform: scale(1.12); }
        }
        @keyframes header-enter {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes header-exit {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-10px); }
        }
      `}</style>

      {/* Slide layers */}
      {slideSet.map(slideIdx => {
        const isExiting = slideIdx === prevIdx && slideIdx !== activeIdx;
        const item = items[slideIdx];
        if (!item) return null;
        return (
          <div
            key={slideIdx}
            className="absolute inset-0"
            style={{
              zIndex: isExiting ? 10 : 0,
              opacity: isExiting ? 0 : 1,
              transition: isReduced.current ? 'none' : 'opacity 600ms ease-in-out',
            }}
          >
            <img
              key={isExiting ? `exit-${slideIdx}` : `active-${activeIdx}`}
              src={item.image}
              alt={item.alt ?? ''}
              className="absolute inset-0 w-full h-full object-cover"
              style={isExiting || isReduced.current ? {} : {
                animation: 'ken-burns 3.5s linear forwards',
                transformOrigin: 'center center',
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.32) 55%, rgba(0,0,0,0.1) 100%)' }}
            />
            <SlideContent
              title={item.title}
              body={item.body}
              isExiting={isExiting}
              delayOffset={0}
            />
          </div>
        );
      })}

      {/* Left arrow */}
      <button
        onClick={() => goTo((activeIdx - 1 + n) % n)}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all z-20 backdrop-blur-sm"
        aria-label="Trước"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Right arrow */}
      <button
        onClick={() => goTo((activeIdx + 1) % n)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/35 flex items-center justify-center transition-all z-20 backdrop-blur-sm"
        aria-label="Tiếp"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* CTA */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20">
        <CtaButton variant="inverse" size="lg" onClick={onContinue}>
          Xem chương trình phù hợp &#8594;
        </CtaButton>
      </div>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{
              background: i === activeIdx ? 'white' : 'rgba(255,255,255,0.4)',
              transform: i === activeIdx ? 'scale(1.25)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
