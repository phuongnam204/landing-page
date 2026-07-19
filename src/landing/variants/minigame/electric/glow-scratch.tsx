'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { SkinCondition } from '../../../../content/quiz';

const REVEAL_ZONES = [
  { id: 'forehead', label: 'Tran', x: 50, y: 20, w: 36, h: 14, conditionId: 'lo-chan-long' as const },
  { id: 'nose',     label: 'Mui',   x: 42, y: 36, w: 16, h: 16, conditionId: 'da-nhon-mun-viem' as const },
  { id: 'chin',     label: 'Cam',   x: 42, y: 60, w: 16, h: 14, conditionId: 'mun-noi-tiet' as const },
  { id: 'cheeks',   label: 'Ma',    x: 12, y: 32, w: 76, h: 28, conditionId: 'mun-trung-ca' as const },
];

export function ElectricGlowScratchMinigame({ onComplete }: MinigameSlotProps) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [phase, setPhase] = useState<'scratch' | 'done'>('scratch');
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const isDrawing = useRef(false);
  const [progress, setProgress] = useState(0);

  const maskId = 'scratch-mask';
  const totalPixels = 400; // threshold approximation

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

    revealed.forEach(() => {});
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
      const conditionId = 'da-nhon-mun-viem';
      const condition = skinConditions[conditionId]!;
      const result: MinigameResult = {
        conditions: [condition],
        condition,
        zoneLabel: 'Nhieu vung',
        zoneIds: REVEAL_ZONES.map(z => z.id),
        triggerNote: 'quet da phat hien',
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
      `}</style>

      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Glow Scan</div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>Quet ngon tay de kham pha vung da</div>
        </div>
        <div className="text-xs font-bold" style={{ color: 'var(--lp-primary)' }}>{Math.round(progress * 100)}%</div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
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
                <path ref={pathRef} fill="none" stroke="white" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
              </mask>
            </defs>
            {/* Face outline */}
            <ellipse cx="50" cy="45" rx="30" ry="36" fill="none" stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.5" />
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
                <text key={`label-${zone.id}`} x={zone.x + zone.w / 2} y={zone.y + zone.h / 2 + 1} textAnchor="middle" fontSize="5" fill="white" fontWeight="bold">{zone.label}</text>
              )
            ))}
          </svg>
          {phase === 'scratch' && (
            <p className="text-center text-xs mt-3" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>Quet ngon tay tren cac vung de kham pha</p>
          )}
        </div>
      </div>
    </div>
  );
}
