'use client';
import React, { useState, useRef, useCallback } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { Program } from '../../../content/programs';
import { getPrograms, getConditionById } from '../../../content/catalog';
import type { ConditionId } from '../../../content/quiz';

const PROGRAM_TAGLINES: Record<string, string> = {
  'combo-peel-acne':         'Làm sạch sâu & kiểm soát nhờn',
  'ipl-oil-control':         'Ánh sáng IPL chuyên sâu',
  'laser-scar-treatment':    'Tái tạo collagen & thu nhỏ lỗ chân lông',
  'microneedling-repair':    'Phục hồi hàng rào bảo vệ tự nhiên',
  'hormonal-acne-plan':      'Phác đồ điều trị gốc rễ nội tiết',
  'maintenance-skin-health': 'Duy trì kết quả bền vững',
};

// ─── Program illustrations ────────────────────────────────────────────────────
// Each SVG uses the card's tint color at varying opacities.

function IllustComboPeel({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Skin layers — three wavy curves */}
      <path d="M0 72 Q50 58 100 68 Q150 78 200 65" stroke={tint} strokeWidth="2" opacity="0.55" />
      <path d="M0 82 Q50 70 100 78 Q150 88 200 76" stroke={tint} strokeWidth="1.5" opacity="0.3" />
      <path d="M0 92 Q50 82 100 88 Q150 96 200 87" stroke={tint} strokeWidth="1" opacity="0.18" />
      {/* Particles lifting off top layer */}
      {[30, 62, 95, 128, 158].map((x, i) => (
        <circle key={x} cx={x} cy={52 - i % 2 * 8} r="3" fill={tint} opacity="0.5" />
      ))}
      {/* Upward motion trails */}
      {[45, 82, 118, 152].map(x => (
        <line key={x} x1={x} y1={60} x2={x - 4} y2={35} stroke={tint} strokeWidth="1" opacity="0.2" strokeDasharray="3 4" />
      ))}
      {/* Highlight arc at surface */}
      <path d="M60 67 Q100 55 140 67" stroke={tint} strokeWidth="1" opacity="0.7" strokeLinecap="round" />
    </svg>
  );
}

function IllustIPL({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Device head — rounded rect at top */}
      <rect x="76" y="8" width="48" height="18" rx="9" fill={tint} opacity="0.18" />
      <rect x="80" y="12" width="40" height="10" rx="5" fill={tint} opacity="0.35" />
      {/* Light rays fanning downward */}
      {[-52, -32, -14, 0, 14, 32, 52].map((offset, i) => {
        const mid = 100;
        const srcX = mid + offset * 0.3;
        const dstX = mid + offset;
        const opacity = i === 3 ? 0.55 : 0.22;
        return (
          <line key={i} x1={srcX} y1={26} x2={dstX} y2={80} stroke={tint} strokeWidth={i === 3 ? 1.5 : 1} opacity={opacity} />
        );
      })}
      {/* Skin surface */}
      <path d="M20 82 Q100 76 180 82" stroke={tint} strokeWidth="1.5" opacity="0.5" />
      {/* Treatment dots on skin */}
      {[60, 80, 100, 120, 140].map(x => (
        <circle key={x} cx={x} cy={83} r="2.5" fill={tint} opacity="0.45" />
      ))}
      {/* Glow ring on center ray */}
      <circle cx="100" cy="78" r="6" stroke={tint} strokeWidth="1" opacity="0.3" />
    </svg>
  );
}

function IllustLaser({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Dot grid — skin texture map */}
      {[50, 75, 100, 125, 150].map(x =>
        [30, 52, 74].map(y => {
          const isTarget = x === 100 && y === 52;
          return (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={isTarget ? 4 : 2.5}
              fill={tint} opacity={isTarget ? 0.85 : 0.25} />
          );
        })
      )}
      {/* Crosshair on target dot */}
      <line x1="100" y1="42" x2="100" y2="62" stroke={tint} strokeWidth="1" opacity="0.6" />
      <line x1="90" y1="52" x2="110" y2="52" stroke={tint} strokeWidth="1" opacity="0.6" />
      <circle cx="100" cy="52" r="10" stroke={tint} strokeWidth="1" opacity="0.35" />
      {/* Laser beam from top-right */}
      <line x1="185" y1="15" x2="104" y2="50" stroke={tint} strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      {/* Beam source dot */}
      <circle cx="185" cy="15" r="4" fill={tint} opacity="0.4" />
      {/* Collagen rings radiating from target */}
      <circle cx="100" cy="52" r="16" stroke={tint} strokeWidth="0.75" opacity="0.2" />
      <circle cx="100" cy="52" r="22" stroke={tint} strokeWidth="0.5" opacity="0.12" />
    </svg>
  );
}

function IllustMicroneedling({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Skin surface — gentle curve */}
      <path d="M10 65 Q100 57 190 65" stroke={tint} strokeWidth="2" opacity="0.6" />
      {/* Healed skin layer below */}
      <path d="M10 78 Q100 72 190 78" stroke={tint} strokeWidth="1" opacity="0.2" />
      {/* Microneedles — fine vertical lines above surface */}
      {[35, 55, 75, 95, 115, 135, 155, 172].map((x, i) => {
        const baseY = 63 + Math.sin(x / 28) * 3;
        const height = 22 + (i % 3) * 4;
        return (
          <g key={x}>
            <line x1={x} y1={baseY} x2={x} y2={baseY - height} stroke={tint} strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
            <circle cx={x} cy={baseY - height} r="1.5" fill={tint} opacity="0.6" />
          </g>
        );
      })}
      {/* Penetration points below skin */}
      {[55, 95, 135].map(x => (
        <circle key={x} cx={x} cy={72} r="2" fill={tint} opacity="0.3" />
      ))}
      {/* Repair glow beneath */}
      <ellipse cx="100" cy="76" rx="55" ry="8" fill={tint} opacity="0.06" />
    </svg>
  );
}

function IllustHormonal({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Main cycle arc */}
      <path d="M60 50 A42 38 0 1 1 140 50" stroke={tint} strokeWidth="2" opacity="0.45" strokeLinecap="round" />
      <path d="M140 50 A42 38 0 0 1 60 50" stroke={tint} strokeWidth="1" opacity="0.2" strokeLinecap="round" strokeDasharray="4 5" />
      {/* Arrow at end of arc */}
      <path d="M137 42 L140 50 L133 52" stroke={tint} strokeWidth="1.5" opacity="0.55" strokeLinecap="round" strokeLinejoin="round" />
      {/* Key cycle nodes */}
      <circle cx="60" cy="50" r="5" fill={tint} opacity="0.5" />
      <circle cx="140" cy="50" r="5" fill={tint} opacity="0.5" />
      <circle cx="100" cy="12" r="4" fill={tint} opacity="0.3" />
      {/* Center balance point */}
      <circle cx="100" cy="50" r="3" fill={tint} opacity="0.7" />
      <circle cx="100" cy="50" r="9" stroke={tint} strokeWidth="1" opacity="0.2" />
      {/* Jaw/chin silhouette hint */}
      <path d="M72 85 Q100 95 128 85" stroke={tint} strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
      <path d="M60 75 Q65 88 72 85 M128 85 Q135 88 140 75" stroke={tint} strokeWidth="1" opacity="0.2" strokeLinecap="round" />
    </svg>
  );
}

function IllustMaintenance({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 200 100" fill="none" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      {/* Shield body */}
      <path d="M100 15 L132 28 L132 55 Q132 75 100 88 Q68 75 68 55 L68 28 Z" stroke={tint} strokeWidth="1.5" opacity="0.5" fill={tint} fillOpacity="0.07" />
      {/* Inner shield line */}
      <path d="M100 22 L124 33 L124 54 Q124 70 100 80 Q76 70 76 54 L76 33 Z" stroke={tint} strokeWidth="0.75" opacity="0.25" fill="none" />
      {/* Center leaf/star motif */}
      <circle cx="100" cy="52" r="8" fill={tint} opacity="0.2" />
      <path d="M100 44 L102 50 L100 60 L98 50 Z" fill={tint} opacity="0.5" />
      <path d="M92 52 L98 50 L108 52 L98 54 Z" fill={tint} opacity="0.5" />
      {/* Radiate lines from shield */}
      {[[-28, -18], [28, -18], [-34, 0], [34, 0], [-24, 20], [24, 20]].map(([dx, dy], i) => (
        <line key={i} x1={100 + dx * 0.8} y1={52 + dy * 0.8} x2={100 + dx * 1.4} y2={52 + dy * 1.4}
          stroke={tint} strokeWidth="1" opacity="0.25" strokeLinecap="round" />
      ))}
    </svg>
  );
}

const PROGRAM_ILLUSTRATIONS: Record<string, React.FC<{ tint: string }>> = {
  'combo-peel-acne':         IllustComboPeel,
  'ipl-oil-control':         IllustIPL,
  'laser-scar-treatment':    IllustLaser,
  'microneedling-repair':    IllustMicroneedling,
  'hormonal-acne-plan':      IllustHormonal,
  'maintenance-skin-health': IllustMaintenance,
};

// ─── Sub-components of ProgramCard ───────────────────────────────────────────

function CardHeader({ name, tint, isSuggested, isVip }: {
  name: string; tint: string; isSuggested: boolean; isVip?: boolean;
}) {
  return (
    <div className="px-5 py-3 relative shrink-0" style={{ background: `${tint}CC` }}>
      {isSuggested && (
        <span className="absolute top-2.5 right-3 text-[10px] font-bold bg-white/90 text-cta rounded-full px-2.5 py-0.5">
          Gợi ý cho bạn
        </span>
      )}
      {isVip && (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 mb-1.5">
          VIP
        </span>
      )}
      <p className="font-extrabold text-base text-white leading-tight" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}>
        {name}
      </p>
    </div>
  );
}

function ConditionTag({ conditionId }: { conditionId: string }) {
  const c = getConditionById(conditionId as ConditionId);
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: c ? `${c.color}25` : '#e8e8e8', color: c ? c.color : '#555', filter: c ? 'brightness(0.8)' : 'none' }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c?.color ?? '#999' }} />
      {c?.label ?? conditionId}
    </span>
  );
}

function VisualBand({ programId, sessions, tagline, tint }: {
  programId: string; sessions?: number; tagline: string; tint: string;
}) {
  const Illustration = PROGRAM_ILLUSTRATIONS[programId];
  return (
    <div
      className="relative shrink-0 overflow-hidden"
      style={{ height: '110px', background: `linear-gradient(135deg, ${tint}28 0%, ${tint}0a 100%)` }}
    >
      {Illustration && (
        <div className="absolute inset-0">
          <Illustration tint={tint} />
        </div>
      )}
      {sessions && (
        <div className="absolute bottom-3 left-5 flex items-baseline gap-1 z-10">
          <span className="font-black leading-none" style={{ fontSize: '2.25rem', color: tint, filter: 'brightness(0.7)' }}>
            {sessions}
          </span>
          <span className="text-xs font-bold" style={{ color: tint, filter: 'brightness(0.7)' }}>buổi</span>
        </div>
      )}
      <p className="absolute bottom-3 right-5 text-xs font-semibold text-right leading-snug max-w-[48%] z-10"
        style={{ color: tint, filter: 'brightness(0.7)' }}>
        {tagline}
      </p>
    </div>
  );
}

function CardBody({ description, conditions }: {
  description: string; conditions: string[];
}) {
  return (
    <div className="px-5 py-3 flex-1 flex flex-col gap-2.5 overflow-hidden">
      <p className="text-sm text-cta/75 leading-relaxed">{description}</p>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
        {conditions.map(cid => <ConditionTag key={cid} conditionId={cid} />)}
      </div>
    </div>
  );
}

function ProgramCard({ program, isSuggested }: { program: Program; isSuggested: boolean }) {
  const cond = getConditionById(program.treatsConditions[0] as ConditionId);
  const tint = cond?.color ?? '#A0AEC0';
  const tagline = PROGRAM_TAGLINES[program.id] ?? '';
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-soft shadow-xl shadow-cta/15 bg-[var(--lp-bg-card)]">
      <CardHeader name={program.name} tint={tint} isSuggested={isSuggested} isVip={program.isVip} />
      <VisualBand programId={program.id} sessions={program.sessions} tagline={tagline} tint={tint} />
      <CardBody description={program.description} conditions={program.treatsConditions} />
    </div>
  );
}

// ─── Sub-components of CarouselPrograms ──────────────────────────────────────

function DotsNav({ count, activeIndex, onChange }: {
  count: number; activeIndex: number; onChange: (i: number) => void;
}) {
  return (
    <div className="flex justify-center gap-1.5 py-3 shrink-0">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="h-1.5 rounded-full transition-all duration-300 bg-cta/25"
          style={{ width: i === activeIndex ? '1.5rem' : '0.375rem', opacity: i === activeIndex ? 1 : 0.4 }}
        />
      ))}
    </div>
  );
}

function RegisterCTA({ program, onContinue }: {
  program: Program; onContinue: (id: string) => void;
}) {
  return (
    <div className="px-5 pb-8 shrink-0">
      <button
        onClick={() => onContinue(program.id)}
        className="w-full bg-cta text-white font-bold py-4 rounded-soft text-sm hover:opacity-90 transition-opacity duration-200"
      >
        Đăng ký {program.name} →
      </button>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function CarouselPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const sorted = [
    ...allPrograms.filter(p => p.id === suggestedProgramId),
    ...allPrograms.filter(p => p.id !== suggestedProgramId),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragDelta, setDragDelta] = useState(0);
  const isDraggingRef = useRef(false);
  const pointerStartX = useRef(0);
  const wheelLocked = useRef(false);

  const prev = useCallback(() => setActiveIndex(i => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setActiveIndex(i => Math.min(i + 1, sorted.length - 1)), [sorted.length]);

  function startDrag(clientX: number) {
    pointerStartX.current = clientX;
    isDraggingRef.current = true;
  }
  function moveDrag(clientX: number) {
    if (!isDraggingRef.current) return;
    setDragDelta(clientX - pointerStartX.current);
  }
  function endDrag(clientX: number) {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const delta = clientX - pointerStartX.current;
    setDragDelta(0);
    if (delta < -35) next();
    else if (delta > 35) prev();
  }

  function handleWheel(e: React.WheelEvent) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    if (wheelLocked.current) return;
    wheelLocked.current = true;
    if (e.deltaX > 0) next(); else prev();
    setTimeout(() => { wheelLocked.current = false; }, 500);
  }

  function getCardStyle(index: number): React.CSSProperties {
    const diff = index - activeIndex;
    const transition = isDraggingRef.current ? 'none' : 'transform 0.4s ease-out, opacity 0.4s ease-out';
    if (diff === 0) {
      return { transform: `translateX(calc(-50% + ${dragDelta}px)) scale(1) rotateY(0deg)`, opacity: 1, zIndex: 10, pointerEvents: 'auto', transition };
    }
    if (Math.abs(diff) === 1) {
      const sign = diff > 0 ? 1 : -1;
      return { transform: `translateX(calc(-50% + ${sign * 68}% + ${dragDelta}px)) scale(0.82) rotateY(${-sign * 22}deg)`, opacity: 0.65, zIndex: 5, pointerEvents: 'none', transition };
    }
    const sign = diff > 0 ? 1 : -1;
    return { transform: `translateX(calc(-50% + ${sign * 120}% + ${dragDelta}px)) scale(0.65) rotateY(${-sign * 38}deg)`, opacity: 0, zIndex: 1, pointerEvents: 'none', transition };
  }

  return (
    <div className="h-screen w-full bg-[var(--lp-bg-programs)] flex flex-col overflow-hidden">
      <div className="pt-8 pb-3 px-5 text-center shrink-0">
        <h2 className="font-extrabold text-xl text-cta">Chúng tôi đề xuất chương trình phù hợp với bạn</h2>
      </div>

      <div
        className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing select-none"
        style={{ perspective: '1000px', touchAction: 'none' }}
        onPointerDown={e => { startDrag(e.clientX); (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); }}
        onPointerMove={e => moveDrag(e.clientX)}
        onPointerUp={e => endDrag(e.clientX)}
        onPointerCancel={() => { isDraggingRef.current = false; setDragDelta(0); }}
        onWheel={handleWheel}
      >
        {activeIndex > 0 && (
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--lp-bg-card)] shadow-md flex items-center justify-center text-cta/60 hover:text-cta transition-colors">‹</button>
        )}
        {activeIndex < sorted.length - 1 && (
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[var(--lp-bg-card)] shadow-md flex items-center justify-center text-cta/60 hover:text-cta transition-colors">›</button>
        )}
        {sorted.map((program, idx) => (
          <div key={program.id} className="absolute top-3 bottom-3 left-1/2" style={{ width: '78%', ...getCardStyle(idx) }}>
            <ProgramCard program={program} isSuggested={program.id === suggestedProgramId} />
          </div>
        ))}
      </div>

      <DotsNav count={sorted.length} activeIndex={activeIndex} onChange={setActiveIndex} />
      <RegisterCTA program={sorted[activeIndex]} onContinue={onContinue} />
    </div>
  );
}
