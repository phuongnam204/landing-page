'use client';
import { useEffect, useRef } from 'react';
import type { MinigameResult } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

// ─── Canvas animations ────────────────────────────────────────────────────────

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

// ─── Inline HTML renderer (internal data — <b> and <em> only) ────────────────

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

// ─── Zone insights ────────────────────────────────────────────────────────────

const ZONE_INSIGHTS: Record<string, { label: string; text: string }> = {
  forehead:    { label: 'Trán',           text: 'Thường liên quan đến stress, thiếu ngủ, hoặc sản phẩm tóc bít lỗ chân lông.' },
  nose:        { label: 'Mũi / Chữ T',    text: 'Vùng chữ T có mật độ tuyến bã nhờn cao nhất — dễ hình thành đầu đen và lỗ chân lông to.' },
  'left-cheek':  { label: 'Má trái',       text: 'Hay bị do tiếp xúc màn hình điện thoại và vỏ gối không được thay thường xuyên.' },
  'right-cheek': { label: 'Má phải',       text: 'Hay bị do tiếp xúc màn hình điện thoại và vỏ gối không được thay thường xuyên.' },
  'chin-jaw':    { label: 'Cằm & quai hàm', text: 'Dấu hiệu điển hình của mụn nội tiết — thường bùng phát theo chu kỳ hoặc khi stress tăng cao.' },
};

function getZoneInsightRows(zoneIds: string[]) {
  const hasBothCheeks = zoneIds.includes('left-cheek') && zoneIds.includes('right-cheek');
  const rows: { key: string; label: string; text: string }[] = [];
  const seen = new Set<string>();
  for (const z of zoneIds) {
    if (z === 'left-cheek' || z === 'right-cheek') {
      if (hasBothCheeks && !seen.has('cheeks')) {
        seen.add('cheeks');
        rows.push({ key: 'both-cheeks', label: 'Má phải + Má trái', text: 'Có thể do tiếp xúc màn hình điện thoại quá nhiều hoặc vỏ gối chưa được thay thường xuyên.' });
      } else if (!hasBothCheeks && ZONE_INSIGHTS[z]) {
        rows.push({ key: z, ...ZONE_INSIGHTS[z] });
      }
    } else if (ZONE_INSIGHTS[z]) {
      rows.push({ key: z, ...ZONE_INSIGHTS[z] });
    }
  }
  return rows;
}

// ─── Headers ─────────────────────────────────────────────────────────────────

const HEADERS: Record<'positive' | 'concern', string> = {
  positive: 'Tuyệt vời, da bạn đang rất khỏe!',
  concern:  'Hmm, có điều bạn cần biết về da mình...',
};

// ─── ResultCard atom ──────────────────────────────────────────────────────────

export type ResultCardProps = {
  result: MinigameResult;
  onScrollDown: () => void;
  containerRef?: React.Ref<HTMLDivElement>;
};

import React from 'react';

export function ResultCard({ result, onScrollDown, containerRef }: ResultCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isPositive = result.condition.tone === 'positive';

    useEffect(() => {
      const canvas = canvasRef.current; if (!canvas) return;
      if (isPositive) return runConfetti(canvas);
      return runWorryParticles(canvas);
    }, [isPositive]);

    return (
      <div ref={containerRef} className="relative min-h-[100dvh] flex items-center justify-center px-5 overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }} />
        <div
          className={[
            'max-w-lg md:max-w-3xl w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-10 shadow-lg shadow-cta/10 relative',
            isPositive ? 'animate-fade-in-up' : 'payoff-concern-enter',
          ].join(' ')}
          style={{ zIndex: 10 }}
        >
          <h1 className={['font-extrabold text-xl md:text-2xl mb-4', isPositive ? 'text-teal-800' : 'text-amber-900'].join(' ')}>
            {HEADERS[result.condition.tone]}
          </h1>

          {(result.zoneLabel || result.triggerNote || (result.zoneIds && result.zoneIds.length > 0)) && (
            <div className="mb-4">
              <p className="text-sm md:text-base text-cta/80 mb-2">Sau khi soi da của bạn:</p>
              {result.zoneLabel && (
                <div className="flex flex-wrap gap-2 mb-2.5">
                  <span className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm font-semibold text-cta" style={{ animationDelay: '0.5s' }}>
                    <span className="inline-block w-2.5 h-2.5 rounded-full shrink-0" style={{ background: 'var(--lp-accent)' }} />
                    <span>da bạn hay bị ở <b>{result.zoneLabel}</b></span>
                  </span>
                </div>
              )}
              {result.triggerNote && (
                <p className="payoff-stat-chip text-xs md:text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed" style={{ animationDelay: '0.86s' }}>
                  {result.triggerNote}
                </p>
              )}
              {result.zoneIds && result.zoneIds.length > 0 && (() => {
                const rows = getZoneInsightRows(result.zoneIds!);
                return rows.length > 0 ? (
                  <div className="flex flex-col gap-1.5 mt-2.5">
                    {rows.map((row, i) => (
                      <p
                        key={row.key}
                        className="payoff-stat-chip text-xs text-cta/80 bg-[var(--lp-bg-minigame)] border border-[var(--lp-border)] rounded-lg px-3 py-2 leading-relaxed"
                        style={{ animationDelay: `${1.0 + i * 0.12}s` }}
                      >
                        <span className="font-semibold text-cta">{row.label}: </span>
                        {row.text}
                      </p>
                    ))}
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {result.condition.body && (
            <SafeBody html={result.condition.body} className="text-sm md:text-base text-cta/80 leading-relaxed mb-2" />
          )}
          {result.condition.bridge && (
            <p className="text-sm md:text-base text-cta/70 leading-relaxed mb-5">{result.condition.bridge}</p>
          )}

          <CtaButton fullWidth onClick={onScrollDown} className="md:text-base">
            Tìm hiểu thêm về da của bạn &#8595;
          </CtaButton>
        </div>
      </div>
    );
}
