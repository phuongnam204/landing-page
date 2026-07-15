'use client';
import { useState, useEffect } from 'react';
import { CtaButton } from '../../../../components/atoms/CtaButton';
import { O2SKIN_FEATURES } from '../constant/Features';

function CarouselCard({
  image, alt, title, highlighted,
}: {
  image: string; alt: string; title: string; highlighted?: boolean;
}) {
  return (
    <div
      className="relative rounded-soft overflow-hidden transition-all duration-300"
      style={{
        aspectRatio: '3/4',
        border: highlighted ? '2px solid rgba(143,227,188,0.55)' : '1px solid rgba(255,255,255,0.12)',
        transform: highlighted ? 'scale(1.025)' : 'scale(1)',
      }}
    >
      <img src={image} alt={alt} className="absolute inset-0 w-full h-full object-cover" />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(45,38,64,0.92) 0%, rgba(45,38,64,0.25) 50%, transparent 100%)' }}
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, var(--lp-accent), var(--lp-primary))', opacity: 0.18 }}
      />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <p className="text-white font-bold text-sm md:text-base leading-snug">{title}</p>
      </div>
    </div>
  );
}

export function Carousel({ onContinue }: { onContinue: () => void }) {
  const [idx, setIdx] = useState(0);
  const n = O2SKIN_FEATURES.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % n), 4000);
    return () => clearInterval(t);
  }, [n]);

  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center gap-8 overflow-hidden px-5 py-16"
      style={{ background: 'linear-gradient(135deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 50%, var(--lp-accent)) 50%, var(--lp-accent) 100%)' }}
    >
      <div className="text-center">
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

      {/* Desktop: 3-column grid, active card highlighted by auto-cycling dot */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-5 w-full max-w-5xl mx-auto">
        {O2SKIN_FEATURES.map((item, i) => (
          <CarouselCard key={i} image={item.image} alt={item.alt} title={item.title} highlighted={i === idx} />
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
            {O2SKIN_FEATURES.map((item, i) => (
              <div key={i} className="shrink-0" style={{ width: '85%', marginRight: '12px' }}>
                <CarouselCard image={item.image} alt={item.alt} title={item.title} highlighted={i === idx} />
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
        {O2SKIN_FEATURES.map((_, i) => (
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
