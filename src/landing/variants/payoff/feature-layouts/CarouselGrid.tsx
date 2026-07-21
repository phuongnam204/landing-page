'use client';
import { useState, useEffect } from 'react';
import type { PayoffItem } from './types';
import { featuresAsItems } from '../constant/Features';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const CARD_ICONS = [
  <svg key="building" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /><path d="M15 21V9" />
  </svg>,
  <svg key="zap" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>,
  <svg key="plus" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>,
];

function CarouselCard({
  image, alt, title, body, highlighted, index,
}: {
  image?: string; alt?: string; title: string; body?: string; highlighted?: boolean; index: number;
}) {
  return (
    <div
      className="relative transition-all duration-300"
      style={{
        transform: highlighted ? 'scale(1.025)' : 'scale(1)',
        borderRadius: 'var(--lp-radius-card)',
        border: highlighted
          ? '2px solid color-mix(in srgb, var(--lp-accent) 55%, transparent)'
          : '1px solid rgba(255,255,255,0.12)',
      }}
    >
      {/* Image zone — top portion of card */}
      <div
        className="relative overflow-hidden"
        style={{ height: '200px', borderRadius: 'var(--lp-radius-card) var(--lp-radius-card) 0 0' }}
      >
        {image && (
          <img src={image} alt={alt ?? ''} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(24,16,42,0.6) 100%)' }}
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, var(--lp-accent), var(--lp-primary))', opacity: 0.1 }}
        />
      </div>

      {/* Icon badge — outside overflow-hidden so it's never clipped */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          top: '200px',
          background: 'var(--lp-accent)',
          boxShadow: highlighted
            ? '0 0 0 3px white, 0 0 0 5px color-mix(in srgb, var(--lp-accent) 40%, transparent), 0 4px 16px rgba(0,0,0,0.25)'
            : '0 0 0 3px rgba(255,255,255,0.55), 0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {CARD_ICONS[index % CARD_ICONS.length]}
      </div>

      {/* Content zone — bottom portion */}
      <div
        className="relative text-center px-5 pb-5"
        style={{
          paddingTop: '44px',
          borderRadius: '0 0 var(--lp-radius-card) var(--lp-radius-card)',
          background: 'rgba(24,16,42,0.96)',
        }}
      >
        <p className="font-bold text-white text-sm leading-snug">{title}</p>
        {body && (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
            {body}
          </p>
        )}

        {/* Accent bar — full-width bottom border, brightens when highlighted */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-[inherit] transition-all duration-500"
          style={{
            background: 'var(--lp-accent)',
            opacity: highlighted ? 1 : 0.2,
          }}
        />
      </div>
    </div>
  );
}

export function CarouselGrid({
  onContinue,
  items = featuresAsItems,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
}) {
  const [idx, setIdx] = useState(0);
  const n = items.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center gap-8 overflow-hidden px-5 py-16"
      style={{ background: 'linear-gradient(135deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 50%, var(--lp-accent)) 50%, var(--lp-accent) 100%)' }}
    >
      <div className="text-center" data-cg="1">
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: 'var(--lp-blob-3)' }}
        >
          Đảm bảo chất lượng chuyên sâu
        </p>
        <h2 className="font-black text-3xl md:text-4xl text-white leading-tight">
          Những gì O2skin có
        </h2>
      </div>

      {/* Desktop: 3-column grid */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-6 w-full max-w-5xl mx-auto">
        {items.map((item, i) => (
          <CarouselCard
            key={i}
            image={item.image}
            alt={item.alt}
            title={item.title}
            body={item.body}
            highlighted={i === idx}
            index={i}
          />
        ))}
      </div>

      {/* Mobile: single-card sliding carousel */}
      <div className="md:hidden w-full relative">
        <div className="overflow-hidden">
          <div
            className="flex"
            style={{
              transform: `translateX(calc(-${idx} * (85% + 12px)))`,
              transition: 'transform 350ms ease-in-out',
            }}
          >
            {items.map((item, i) => (
              <div key={i} className="shrink-0" style={{ width: '85%', marginRight: '12px' }}>
                <CarouselCard
                  image={item.image}
                  alt={item.alt}
                  title={item.title}
                  body={item.body}
                  highlighted={i === idx}
                  index={i}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIdx(i => (i - 1 + n) % n)}
          className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all z-10"
          aria-label="Trước"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={() => setIdx(i => (i + 1) % n)}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/25 hover:bg-white/40 flex items-center justify-center transition-all z-10"
          aria-label="Tiếp"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <div className="flex gap-2.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === idx ? 'var(--lp-blob-3)' : 'rgba(255,255,255,0.35)',
              transform: i === idx ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>

      <CtaButton variant="dark" size="lg" onClick={onContinue}>
        Xem chương trình phù hợp &#8594;
      </CtaButton>
    </div>
  );
}
