'use client';
import React, { useEffect, useRef, useState } from 'react';
import type { PayoffSlotProps } from '../../slots';
import type { ConditionId } from '../../../content/quiz';
import { Benefit } from './Benefit';
import { Feature } from './Feature';
import { CONDITION_EDUCATION } from './constant/ConditionEducation';
import { CtaButton } from '../../../components/atoms/CtaButton';

// ─── Canvas animations ───────────────────────────────────────────────────────

const CONFETTI_COLORS = ['#ff6b9d','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ff4d6d','#48cae4'];

function runConfetti(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 90 }, () => ({
    x: canvas.width * 0.1 + Math.random() * canvas.width * 0.8,
    y: -8 - Math.random() * 50, vx: (Math.random() - 0.5) * 3.5,
    vy: 2.5 + Math.random() * 4, size: 6 + Math.random() * 8,
    rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 12,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    isCircle: Math.random() > 0.45,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y < canvas.height + 20) {
        alive = true; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        if (p.isCircle) { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        else { ctx.fillRect(-p.size/2,-p.size/4,p.size,p.size/2); }
        ctx.restore();
      }
    }
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

function runWorryParticles(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d')!;
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const particles = Array.from({ length: 25 }, () => ({
    x: canvas.width * 0.25 + Math.random() * canvas.width * 0.5,
    y: canvas.height * 0.55 + Math.random() * 60,
    vx: (Math.random() - 0.5) * 1.2, vy: -1.2 - Math.random() * 1.5,
    size: 3 + Math.random() * 4, alpha: 0.5 + Math.random() * 0.4,
  }));
  let rafId: number;
  const draw = () => {
    ctx.clearRect(0,0,canvas.width,canvas.height); let alive = false;
    for (const p of particles) {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.008;
      if (p.y > -20 && p.alpha > 0) {
        alive = true; ctx.globalAlpha = p.alpha; ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
    if (alive) rafId = requestAnimationFrame(draw);
  };
  rafId = requestAnimationFrame(draw);
  return () => cancelAnimationFrame(rafId);
}

// ─── Safe inline HTML renderer (internal data only — <b> and <em> only) ─────

function SafeBody({ html, className }: { html: string; className?: string }) {
  const parts = html.split(/(<b>.*?<\/b>|<em>.*?<\/em>)/);
  return (
    <p className={className}>
      {parts.map((chunk, i) => {
        if (chunk.startsWith('<b>')) return <b key={i}>{chunk.slice(3, -4)}</b>;
        if (chunk.startsWith('<em>')) return <em key={i}>{chunk.slice(4, -5)}</em>;
        return chunk;
      })}
    </p>
  );
}

// ─── Result section text ─────────────────────────────────────────────────────

const HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe!',
  concern:  'Hmm, có điều bạn cần biết về da mình...',
};
const BRIDGE: Record<'positive' | 'concern', string> = {
  positive: 'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài.',
  concern:  'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng từ gốc rễ.',
};

// ─── WhySection ───────────────────────────────────────────────────────────────

function WhySection({ conditionId, onScrollDown }: { conditionId: ConditionId; onScrollDown: () => void }) {
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
              <p className="text-sm text-cta/70 leading-relaxed mt-1">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
      <blockquote className="relative bg-[var(--lp-accent)]/5 border border-cta/10 rounded-lg px-5 pt-7 pb-4">
        <span className="absolute top-3 left-4 text-3xl font-black text-[var(--lp-accent)] opacity-25 leading-none select-none" aria-hidden="true">&ldquo;</span>
        <p className="text-sm md:text-base text-cta/80 italic leading-relaxed">{edu.expertQuote}</p>
        <cite className="not-italic text-xs text-cta/65 font-semibold mt-2 block">{edu.expertName}</cite>
      </blockquote>
      <CtaButton fullWidth onClick={onScrollDown} className="md:text-base">
        Tìm ngay giải pháp cho bạn! &#8595;
      </CtaButton>
      <div className="h-4" />
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ConfettiCardWhyPayoff({ result, onContinue }: PayoffSlotProps) {
  const canvasRef        = useRef<HTMLCanvasElement>(null);
  const whyRef           = useRef<HTMLDivElement>(null);
  const statsRef         = useRef<HTMLDivElement>(null);
  const featureRef       = useRef<HTMLDivElement>(null);
  const resultSectRef    = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showSkipCta, setShowSkipCta] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    if (result.condition.tone === 'positive') return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [result.condition.tone]);

  // Show sticky skip CTA once the result card scrolls out of the scroll container
  useEffect(() => {
    const el = resultSectRef.current;
    const container = scrollContainerRef.current;
    if (!el || !container) return;
    function onScroll() {
      setShowSkipCta(container!.scrollTop > el!.offsetHeight - 80);
    }
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  const isPositive = result.condition.tone === 'positive';

  return (
    <div ref={scrollContainerRef} className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">

      {/* Sticky skip CTA — appears after result card scrolls out */}
      {showSkipCta && (
        <div className="fixed bottom-5 right-4 z-50 animate-fade-in-up">
          <button
            onClick={onContinue}
            className="bg-cta text-white text-sm font-bold py-3 px-5 rounded-soft shadow-lg shadow-cta/30 hover:opacity-90 transition-opacity"
          >
            Đặt lịch ngay &#8594;
          </button>
        </div>
      )}

      {/* Section 1: Kết quả (above fold) */}
      <div ref={resultSectRef} className="relative min-h-[100dvh] flex items-center justify-center px-5 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <div
          className={['max-w-lg md:max-w-3xl w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative', isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter'].join(' ')}
          style={{ zIndex: 10 }}
        >
          <h1 className={['font-extrabold text-xl md:text-2xl mb-4', isPositive ? 'text-teal-800' : 'text-amber-900'].join(' ')}>
            {HEADERS[result.condition.tone]}
          </h1>
          <div className="mb-4">
            <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
            <div className="flex flex-wrap gap-2 mb-2.5">
              {[
                // { key: 'found', color: '#FF5C9E', content: <span>đã soi <b>{result.foundCount}</b> nốt mụn</span> },
                { key: 'zone',  color: 'var(--lp-accent)', content: <span>da bạn hay bị ở <b>{result.zoneLabel}</b></span> },
              ].map((chip, i) => (
                <span key={chip.key} className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm font-semibold text-cta" style={{ animationDelay: `${0.5 + i * 0.18}s` }}>
                  <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: chip.color }} />
                  {chip.content}
                </span>
              ))}
            </div>
            {result.triggerNote && (
              <p className="payoff-stat-chip text-xs md:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed" style={{ animationDelay: '0.86s' }}>
                {result.triggerNote}
              </p>
            )}
          </div>
          {result.condition.body && (
            <SafeBody html={result.condition.body} className="text-sm md:text-base text-cta/80 leading-relaxed mb-3" />
          )}
          <p className="text-sm md:text-base text-cta/70 leading-snug px-3.5 py-2.5 bg-[var(--lp-accent)]/5 border border-[var(--lp-border)] rounded-lg mb-5">
            {BRIDGE[result.condition.tone]}
          </p>
          <CtaButton fullWidth onClick={() => whyRef.current?.scrollIntoView({ behavior: 'smooth' })} className="md:text-base">
            Tìm hiểu thêm về da của bạn &#8595;
          </CtaButton>
        </div>
      </div>

      {/* Section 2: Why */}
      <div ref={whyRef} className="bg-[var(--lp-bg-payoff)]">
        <WhySection
          conditionId={result.condition.id as ConditionId}
          onScrollDown={() => statsRef.current?.scrollIntoView({ behavior: 'smooth' })}
        />
      </div>

      {/* Section 3: Benefit */}
      <div ref={statsRef}>
        <Benefit onScrollDown={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })} />
      </div>

      {/* Section 4: Feature + final CTA */}
      <div ref={featureRef}>
        <Feature onContinue={onContinue} />
      </div>

    </div>
  );
}
