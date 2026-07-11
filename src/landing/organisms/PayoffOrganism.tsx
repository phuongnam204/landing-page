'use client';
import React, { useEffect, useRef } from 'react';
import type { PayoffSlotProps } from '../slots';
import { SectionShell } from '../../components/atoms/SectionShell';
import { CtaButton } from '../../components/atoms/CtaButton';
import { StatChipGroup } from '../../components/molecules/StatChipGroup';
import { BridgeBlock } from '../../components/molecules/BridgeBlock';

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

const HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe!',
  concern: 'Hmm, có điều bạn cần biết về da mình...',
};
const BRIDGE: Record<'positive' | 'concern', string> = {
  positive: 'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài. Hãy xem chương trình chúng tôi chuẩn bị cho bạn.',
  concern: 'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng. Tại o2skin, chúng tôi đã thiết kế chương trình phù hợp ngay cho bạn.',
};

export type PayoffLayout = 'confetti' | 'confetti-why' | 'benefit' | 'feature';

interface PayoffOrganismProps extends PayoffSlotProps {
  layout: PayoffLayout;
  headerSlot?: React.ReactNode;
  bodySlot?: React.ReactNode;
}

export function PayoffOrganism({ result, onContinue, layout, headerSlot, bodySlot }: PayoffOrganismProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPositive = result.condition.tone === 'positive';
  const showCanvas = layout === 'confetti' || layout === 'confetti-why';

  useEffect(() => {
    if (!showCanvas) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isPositive) return runConfetti(canvas);
    return runWorryParticles(canvas);
  }, [isPositive, showCanvas]);

  const cardAnimClass = isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter';

  return (
    <SectionShell bgVar="--lp-bg-payoff" center overflow="hidden">
      {showCanvas && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
      )}
      <div
        className={`max-w-lg md:max-w-3xl w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative ${cardAnimClass}`}
        style={{ zIndex: 10 }}
      >
        {headerSlot}
        {!headerSlot && (
          <p className={`font-extrabold text-xl md:text-2xl mb-4 ${isPositive ? 'text-teal-800' : 'text-amber-900'}`}>
            {HEADERS[result.condition.tone]}
          </p>
        )}

        <StatChipGroup
          zoneLabel={result.zoneLabel}
          triggerNote={result.triggerNote}
        />

        {bodySlot}
        {!bodySlot && (
          <>
            {result.condition.body && (
              <p className="text-sm md:text-base text-cta/80 leading-relaxed mb-3"
                dangerouslySetInnerHTML={{ __html: result.condition.body }} />
            )}
            <BridgeBlock>{BRIDGE[result.condition.tone]}</BridgeBlock>
          </>
        )}

        <CtaButton onClick={onContinue} fullWidth className="mt-5">
          Khám phá chương trình dành cho bạn →
        </CtaButton>
      </div>
    </SectionShell>
  );
}
