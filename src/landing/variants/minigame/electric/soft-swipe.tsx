'use client';
import { useState, useRef } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

interface SwipeCard {
  id: string;
  label: string;
  emojiLabel: string;
  conditionId: ConditionId;
  zones: string[];
}

const CARDS: SwipeCard[] = [
  { id: 'oily',    label: 'Da nhon, nhieu dau',       emojiLabel: 'Bong dau',         conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'] },
  { id: 'acne',    label: 'Mun viem, mun boc',         emojiLabel: 'Mun do',           conditionId: 'mun-trung-ca',     zones: ['cheeks'] },
  { id: 'dry-red', label: 'Kho, do, kich ung',         emojiLabel: 'Kich ung',         conditionId: 'da-nhay-cam',      zones: ['cheeks', 'forehead'] },
  { id: 'pores',   label: 'Lo chan long to, khong mun', emojiLabel: 'Lo to',           conditionId: 'lo-chan-long',     zones: ['nose', 'forehead'] },
  { id: 'clear',   label: 'Da khoe, khong co van de gi',emojiLabel: 'Da dep',          conditionId: 'clean-skin',       zones: [] },
];

export function ElectricSoftSwipeMinigame({ onComplete }: MinigameSlotProps) {
  const [queue, setQueue] = useState<SwipeCard[]>(CARDS);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);
  const startX = useRef(0);
  const offsetX = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const current = queue[currentIdx];

  function swipe(dir: 'left' | 'right') {
    if (animating || !current) return;
    setAnimating(true);
    setDirection(dir);
    setTimeout(() => {
      setAnimating(false);
      setDirection(null);
      offsetX.current = 0;
      if (dir === 'right') {
        // Selected this card
        const condition = skinConditions[current.conditionId]!;
        const result: MinigameResult = {
          conditions: [condition],
          condition,
          zoneLabel: current.zones.join(', ') || 'Khong co vung cu the',
          zoneIds: current.zones,
          triggerNote: current.label,
        };
        onComplete(result);
      } else {
        // Skip to next
        const next = currentIdx + 1;
        if (next >= queue.length) {
          // Fallback: last card
          const last = queue[queue.length - 1];
          const condition = skinConditions[last.conditionId]!;
          const result: MinigameResult = {
            conditions: [condition],
            condition,
            zoneLabel: last.zones.join(', ') || 'Khong co vung cu the',
            zoneIds: last.zones,
            triggerNote: last.label,
          };
          onComplete(result);
        } else {
          setCurrentIdx(next);
        }
      }
    }, 250);
  }

  const handlePointerDown = (e: React.PointerEvent) => {
    if (animating) return;
    startX.current = e.clientX;
    const el = cardRef.current;
    if (el) el.style.transition = 'none';
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (animating || !startX.current) return;
    const dx = e.clientX - startX.current;
    offsetX.current = dx;
    const el = cardRef.current;
    if (el) {
      el.style.transform = `translateX(${dx}px) rotate(${dx * 0.05}deg)`;
      el.style.opacity = `${1 - Math.abs(dx) / 300}`;
    }
  };

  const handlePointerUp = () => {
    if (animating) return;
    const threshold = 80;
    if (offsetX.current > threshold) { swipe('right'); }
    else if (offsetX.current < -threshold) { swipe('left'); }
    else {
      const el = cardRef.current;
      if (el) {
        el.style.transition = 'transform 200ms ease, opacity 200ms ease';
        el.style.transform = '';
        el.style.opacity = '1';
      }
    }
    offsetX.current = 0;
    startX.current = 0;
  };

  if (!current) {
    return <div className="h-screen bg-[var(--lp-bg-hero)]" />;
  }

  return (
    <div
      className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden"
      style={{ animation: 'fade-in 350ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes swipe-out { from { opacity: 1; transform: translateX(0) rotate(0); } to { opacity: 0; } }
      `}</style>

      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Swipe</div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>Vuot phai de chon, trai de bo qua</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div
          ref={cardRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full max-w-xs rounded-soft p-6 text-center select-none"
          style={{
            background: 'var(--lp-bg-card)',
            boxShadow: '0 8px 32px color-mix(in srgb, var(--lp-accent) 18%, transparent)',
            border: '1px solid color-mix(in srgb, var(--lp-accent) 14%, transparent)',
            touchAction: 'none',
            transition: animating ? 'transform 250ms ease, opacity 250ms ease' : 'none',
            transform: direction === 'left' ? 'translateX(-120%) rotate(-12deg)' : direction === 'right' ? 'translateX(120%) rotate(12deg)' : '',
            opacity: direction ? 0 : 1,
            animation: 'fade-in 300ms ease-out both',
          }}
        >
          <div className="text-2xl font-black mb-2" style={{ color: 'var(--lp-primary)' }}>
            {current.emojiLabel}
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--lp-primary)' }}>
            {current.label}
          </p>
          <p className="text-xs mt-4" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
            Vuot phai de chon / Vuot trai de bo qua
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4 pb-6">
        <button onClick={() => swipe('left')}
          className="w-14 h-14 rounded-full flex items-center justify-center border-2 text-lg font-bold transition-transform active:scale-90"
          style={{ borderColor: 'var(--lp-accent)', color: 'var(--lp-accent)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
        </button>
        <div className="flex items-center gap-1">
          {queue.slice(currentIdx, currentIdx + 3).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full" style={{ background: i === 0 ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 25%, transparent)' }} />
          ))}
        </div>
        <button onClick={() => swipe('right')}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold transition-transform active:scale-90"
          style={{ background: 'var(--lp-accent)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
