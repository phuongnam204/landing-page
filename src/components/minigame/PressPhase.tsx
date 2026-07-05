'use client';

import { useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { GhostHand } from './GhostHand';
import { useAdvancingHint } from './useAdvancingHint';
import { PRESS_HOLD_MS } from './gameConstants';

type Spot = { id: number; x: number; y: number; state: 'normal' | 'pressed' | 'popped' };

// 5 mụn cụm sát ranh giới (y 62–86%), x rải ngang.
const INITIAL: Spot[] = [
  { id: 0, x: 22, y: 64, state: 'normal' },
  { id: 1, x: 50, y: 62, state: 'normal' },
  { id: 2, x: 74, y: 66, state: 'normal' },
  { id: 3, x: 34, y: 82, state: 'normal' },
  { id: 4, x: 63, y: 84, state: 'normal' },
];

const SRC = {
  normal: '/acne_press/normal.svg',
  pressed: '/acne_press/Pressed.svg',
  popped: '/acne_press/Pop.svg',
};

export function PressPhase({ onComplete }: { onComplete: () => void }) {
  const [spots, setSpots] = useState<Spot[]>(INITIAL);
  const sceneRef = useRef<HTMLDivElement>(null);
  const holdTimer = useRef<number | null>(null);
  const doneRef = useRef(false);
  const { showInitialHint, escalate, markInteracted, markProgress } = useAdvancingHint(() => {
    setSpots((prev) => prev.map((s) => ({ ...s, state: 'popped' })));
    finish();
  });

  const popped = spots.filter((s) => s.state === 'popped').length;

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(onComplete, 400);
  }

  function setState(id: number, state: Spot['state']) {
    setSpots((prev) => prev.map((s) => (s.id === id ? { ...s, state } : s)));
  }

  function startPress(id: number) {
    markInteracted();
    const spot = spots.find((s) => s.id === id);
    if (!spot || spot.state === 'popped') return;
    setState(id, 'pressed');
    holdTimer.current = window.setTimeout(() => {
      setState(id, 'popped');
      markProgress();
      setSpots((prev) => {
        const next = prev.map((s) => (s.id === id ? { ...s, state: 'popped' as const } : s));
        if (next.every((s) => s.state === 'popped')) finish();
        return next;
      });
    }, PRESS_HOLD_MS);
  }

  function cancelPress(id: number) {
    if (holdTimer.current) { clearTimeout(holdTimer.current); holdTimer.current = null; }
    const spot = spots.find((s) => s.id === id);
    if (spot && spot.state === 'pressed') setState(id, 'normal');
  }

  const firstUnpopped = spots.find((s) => s.state !== 'popped');

  return (
    <GameScene phaseIndex={1} title="Chăm mụn đầu trắng" progress={popped} total={spots.length} sceneRef={sceneRef}>
      {spots.map((s) => (
        <img
          key={s.id}
          src={SRC[s.state]}
          alt="mụn đầu trắng"
          draggable={false}
          onPointerDown={(e) => { e.preventDefault(); startPress(s.id); }}
          onPointerUp={() => cancelPress(s.id)}
          onPointerLeave={() => cancelPress(s.id)}
          className={escalate && firstUnpopped?.id === s.id ? 'mg-target-glow' : undefined}
          style={{
            position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
            width: 72, transform: 'translate(-50%, -50%)', transformOrigin: 'center bottom',
            cursor: s.state === 'popped' ? 'default' : 'pointer',
          }}
        />
      ))}

      {showInitialHint && firstUnpopped && (
        <>
          <div className="absolute left-1/2 z-10 text-sm font-extrabold text-white text-center whitespace-nowrap" style={{ top: '15%', transform: 'translateX(-50%)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Nhấn giữ để nặn mụn
          </div>
          <div className="mg-hint-arrow absolute left-1/2 z-10" style={{ top: '24%' }}>
            <svg width="16" height="20" viewBox="0 0 16 20" fill="none" style={{ filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.4))' }}>
              <path d="M8 0 L8 13 M2 10 L8 17 L14 10" stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <GhostHand style={{ left: `${firstUnpopped.x}%`, top: `calc(${firstUnpopped.y}% + 18px)`, transform: 'translateX(-50%)', animation: 'mgHintArrow 2.4s ease-in-out infinite' }} />
        </>
      )}
    </GameScene>
  );
}
