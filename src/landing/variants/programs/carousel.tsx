'use client';
import React, { useState, useRef, useCallback } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { Program } from '../../../content/programs';
import { getPrograms, getConditionById } from '../../../content/catalog';

const PROGRAM_TAGLINES: Record<string, string> = {
  'combo-peel-acne':         'Làm sạch sâu & kiểm soát nhờn',
  'ipl-oil-control':         'Ánh sáng IPL chuyên sâu',
  'laser-scar-treatment':    'Tái tạo collagen & thu nhỏ lỗ chân lông',
  'microneedling-repair':    'Phục hồi hàng rào bảo vệ tự nhiên',
  'hormonal-acne-plan':      'Phác đồ điều trị gốc rễ nội tiết',
  'maintenance-skin-health': 'Duy trì kết quả bền vững',
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

function SessionBand({ sessions, tagline, tint }: {
  sessions?: number; tagline: string; tint: string;
}) {
  return (
    <div
      className="relative flex items-center justify-between px-5 shrink-0 overflow-hidden"
      style={{ height: '80px', background: `linear-gradient(135deg, ${tint}35 0%, ${tint}10 100%)` }}
    >
      <div className="absolute -right-3 -top-3 w-20 h-20 rounded-full opacity-15" style={{ background: tint }} />
      <div className="absolute right-2 -bottom-4 w-12 h-12 rounded-full opacity-10" style={{ background: tint }} />
      {sessions ? (
        <div className="flex items-baseline gap-1 z-10">
          <span className="font-black leading-none" style={{ fontSize: '2.75rem', color: tint, filter: 'brightness(0.72)' }}>
            {sessions}
          </span>
          <span className="text-xs font-bold" style={{ color: tint, filter: 'brightness(0.72)' }}>buổi</span>
        </div>
      ) : <div />}
      <p className="text-xs font-semibold text-right leading-relaxed max-w-[55%] z-10" style={{ color: tint, filter: 'brightness(0.72)' }}>
        {tagline}
      </p>
    </div>
  );
}

function ConditionTag({ conditionId }: { conditionId: string }) {
  const c = getConditionById(conditionId);
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
  const cond = getConditionById(program.treatsConditions[0]);
  const tint = cond?.color ?? '#A0AEC0';
  const tagline = PROGRAM_TAGLINES[program.id] ?? '';
  return (
    <div className="h-full flex flex-col overflow-hidden rounded-soft shadow-xl shadow-cta/15 bg-[var(--lp-bg-card)]">
      <CardHeader name={program.name} tint={tint} isSuggested={isSuggested} isVip={program.isVip} />
      <SessionBand sessions={program.sessions} tagline={tagline} tint={tint} />
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
