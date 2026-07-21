'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';

const REVEAL_ZONES = [
  { id: 'forehead', label: 'Trán', x: 50, y: 20, w: 36, h: 14, conditionId: 'lo-chan-long' as const },
  { id: 'nose',     label: 'Mũi',  x: 42, y: 36, w: 16, h: 16, conditionId: 'da-nhon-mun-viem' as const },
  { id: 'chin',     label: 'Cằm',  x: 42, y: 60, w: 16, h: 14, conditionId: 'mun-noi-tiet' as const },
  { id: 'cheeks',   label: 'Má',   x: 12, y: 32, w: 76, h: 28, conditionId: 'mun-trung-ca' as const },
];

export function ElectricGlowScratchMinigame({ onComplete, copy }: MinigameSlotProps) {
  const [phase, setPhase] = useState<'intro' | 'scratch' | 'done'>('intro');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const isDrawing = useRef(false);
  const [progress, setProgress] = useState(0);

  const maskId = 'scratch-mask';

  const handlePointerDown = useCallback(() => { isDrawing.current = true; }, []);
  const handlePointerUp = useCallback(() => { isDrawing.current = false; }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing.current || !svgRef.current || !pathRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const d = pathRef.current.getAttribute('d') || '';
    const newD = d ? `${d} M ${x} ${y} L ${x} ${y}` : `M ${x} ${y} L ${x} ${y}`;
    pathRef.current.setAttribute('d', newD);

    const newlyRevealed = new Set(revealed);
    REVEAL_ZONES.forEach(zone => {
      if (!newlyRevealed.has(zone.id)) {
        const cx = zone.x + zone.w / 2;
        const cy = zone.y + zone.h / 2;
        if (Math.abs(x - cx) < zone.w / 2 + 5 && Math.abs(y - cy) < zone.h / 2 + 5) {
          newlyRevealed.add(zone.id);
        }
      }
    });
    setRevealed(newlyRevealed);
    setProgress(Math.min(1, newlyRevealed.size / REVEAL_ZONES.length));
  }, [revealed]);

  useEffect(() => {
    if (revealed.size >= REVEAL_ZONES.length && phase === 'scratch') {
      setPhase('done');
      const condition = skinConditions['da-nhon-mun-viem']!;
      const result: MinigameResult = {
        conditions: [condition],
        condition,
        zoneLabel: 'Nhiều vùng',
        zoneIds: REVEAL_ZONES.map(z => z.id),
        triggerNote: 'quét da phát hiện',
      };
      setTimeout(() => onComplete(result), 500);
    }
  }, [revealed, phase, onComplete]);

  return (
    <div
      className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden"
      style={{ animation: 'fade-in 350ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hint-scan {
          0%   { transform: translateY(0)    rotate(-8deg); opacity: 0; }
          10%  { opacity: 1; }
          45%  { transform: translateY(60px) rotate(5deg);  opacity: 1; }
          80%  { transform: translateY(110px) rotate(-4deg); opacity: 0.7; }
          100% { transform: translateY(130px) rotate(0deg); opacity: 0; }
        }
        .scan-hint { animation: hint-scan 1.6s ease-in-out 0.4s infinite; }
      `}</style>

      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--lp-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Glow Scan</div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
            {phase === 'intro' ? 'Hướng dẫn' : phase === 'scratch' ? 'Quét ngón tay lên khuôn mặt' : 'Đang phân tích...'}
          </div>
        </div>
        {phase === 'scratch' && (
          <div className="text-xs font-bold" style={{ color: 'var(--lp-primary)' }}>{Math.round(progress * 100)}%</div>
        )}
      </div>

      {phase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6"
          style={{ animation: 'fade-in 350ms ease-out both' }}>
          <div className="relative w-40 h-48 flex items-center justify-center">
            {/* Face outline */}
            <svg viewBox="0 0 100 120" className="w-full h-full">
              <ellipse cx="50" cy="55" rx="34" ry="42"
                fill="color-mix(in srgb, var(--lp-accent) 6%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 35%, transparent)"
                strokeWidth="2" />
              {/* Zone highlights */}
              <rect x="33" y="22" width="34" height="14" rx="5"
                fill="color-mix(in srgb, var(--lp-accent) 18%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.2" />
              <rect x="42" y="42" width="16" height="14" rx="4"
                fill="color-mix(in srgb, var(--lp-accent) 18%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.2" />
              <rect x="42" y="65" width="16" height="14" rx="4"
                fill="color-mix(in srgb, var(--lp-accent) 18%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.2" />
            </svg>
            {/* Animated finger icon */}
            <div className="scan-hint absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 11V6a2 2 0 0 0-4 0v5" />
                <path d="M14 10V4a2 2 0 0 0-4 0v6" />
                <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
                <path d="M6 14a4 4 0 0 0 4 4h4a6 6 0 0 0 6-6v-2a2 2 0 0 0-4 0" />
              </svg>
            </div>
          </div>

          <div className="text-center max-w-xs">
            <h2 className="font-extrabold text-xl mb-2" style={{ color: 'var(--lp-primary)' }}>
              {copy?.intro?.heading ?? 'Quét để khám phá da của bạn'}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
              {copy?.intro?.subtext ?? 'Dùng ngón tay (hoặc chuột) quét lên các vùng khuôn mặt — hệ thống sẽ phát hiện vùng da cần chú ý.'}
            </p>
          </div>

          <button
            onClick={() => setPhase('scratch')}
            className="px-8 py-3.5 rounded-full font-bold text-base text-white transition-all active:scale-[0.97]"
            style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)' }}>
            {copy?.intro?.cta ?? 'Bắt đầu quét →'}
          </button>
        </div>
      )}

      {phase === 'scratch' && (
        <div className="flex-1 flex items-center justify-center p-4"
          style={{ animation: 'fade-in 300ms ease-out both' }}>
          <div className="relative w-full max-w-xs mx-auto">
            <svg ref={svgRef} viewBox="0 0 100 100" className="w-full h-auto"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: 'none', cursor: 'crosshair' }}
            >
              <defs>
                <mask id={maskId}>
                  <rect width="100" height="100" fill="black" />
                  <path ref={pathRef} fill="none" stroke="white" strokeWidth="8"
                    strokeLinecap="round" strokeLinejoin="round" />
                </mask>
              </defs>
              <ellipse cx="50" cy="45" rx="30" ry="36" fill="none"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.5" />
              {REVEAL_ZONES.map(zone => (
                <g key={zone.id} mask={`url(#${maskId})`}>
                  <rect x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx="6"
                    fill={revealed.has(zone.id) ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 12%, white)'}
                    stroke={revealed.has(zone.id) ? 'var(--lp-primary)' : 'color-mix(in srgb, var(--lp-accent) 20%, transparent)'}
                    strokeWidth="1.5"
                  />
                </g>
              ))}
              {REVEAL_ZONES.map(zone => (
                revealed.has(zone.id) && (
                  <text key={`label-${zone.id}`}
                    x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 1}
                    textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">
                    {zone.label}
                  </text>
                )
              ))}
            </svg>
            <p className="text-center text-xs mt-3" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              Quét ngón tay trên các vùng để khám phá
            </p>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3"
          style={{ animation: 'fade-in 300ms ease-out both' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--lp-accent)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>Đang phân tích...</p>
        </div>
      )}
    </div>
  );
}
