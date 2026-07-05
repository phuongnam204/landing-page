'use client';

import { useMemo, useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { GhostHand } from './GhostHand';
import { useAdvancingHint } from './useAdvancingHint';
import { withinRadius } from '../MinigameCore/collisionUtils';
import { CATCH_RADIUS } from './gameConstants';

type Hair = { id: number; x: number; y: number; fading: boolean };

// ~40 lông tơ dày, cụm sát ranh giới (y 62–92%).
function makeHairs(): Hair[] {
  const hairs: Hair[] = [];
  let id = 0;
  const cols = 8, rows = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      hairs.push({
        id: id++,
        x: 12 + (c / (cols - 1)) * 76 + (Math.random() - 0.5) * 4,
        y: 63 + (r / (rows - 1)) * 29 + (Math.random() - 0.5) * 3,
        fading: false,
      });
    }
  }
  return hairs;
}

export function SwipePhase({ onComplete }: { onComplete: () => void }) {
  const initial = useMemo(makeHairs, []);
  const [hairs, setHairs] = useState<Hair[]>(initial);
  const [machine, setMachine] = useState({ x: 50, y: 30 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const doneRef = useRef(false);
  const { showInitialHint, markInteracted, markProgress } = useAdvancingHint(() => {
    setHairs([]); finish();
  });

  const total = initial.length;
  const cleared = total - hairs.length;

  function finish() {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(onComplete, 400);
  }

  function pctFromEvent(e: React.PointerEvent) {
    const rect = sceneRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return { x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 };
  }

  function burn(head: { x: number; y: number }) {
    setHairs((prev) => {
      let changed = false;
      const next = prev.map((h) => {
        if (!h.fading && withinRadius(head, h, CATCH_RADIUS)) { changed = true; return { ...h, fading: true }; }
        return h;
      });
      if (changed) {
        markProgress();
        // Xoá hẳn các sợi đang fade sau 300ms.
        setTimeout(() => {
          setHairs((cur) => {
            const remaining = cur.filter((h) => !h.fading);
            if (remaining.length === 0) finish();
            return remaining;
          });
        }, 300);
      }
      return next;
    });
  }

  function onDown(e: React.PointerEvent) {
    markInteracted();
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = pctFromEvent(e); if (p) { setMachine(p); burn(p); }
  }
  function onMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = pctFromEvent(e); if (p) { setMachine(p); burn(p); }
  }
  function onUp() { draggingRef.current = false; }

  return (
    <GameScene
      phaseIndex={3}
      title="Cạo lông tơ"
      progress={cleared}
      total={total}
      sceneRef={sceneRef}
      onScenePointerDown={onDown}
      onScenePointerMove={onMove}
      onScenePointerUp={onUp}
    >
      {hairs.map((h) => (
        <img key={h.id} src="/swipe/hair.svg" alt="lông tơ" draggable={false}
          style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`, width: 14, transform: 'translate(-50%, -50%)', opacity: h.fading ? 0.15 : 1, transition: 'opacity 300ms', pointerEvents: 'none' }} />
      ))}

      <img src="/swipe/machine.svg" alt="máy đốt lông" draggable={false}
        style={{ position: 'absolute', left: `${machine.x}%`, top: `${machine.y}%`, width: 96, transform: 'translate(-50%, -60%)', pointerEvents: 'none' }} />

      {showInitialHint && (
        <>
          <div className="absolute left-1/2 z-10 text-sm font-extrabold text-white text-center whitespace-nowrap" style={{ top: '10%', transform: 'translateX(-50%)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Vuốt máy qua lông tơ
          </div>
          <GhostHand style={{ left: '50%', top: '42%', transform: 'translateX(-50%)', animation: 'mgHintArrow 2.6s ease-in-out infinite' }} />
        </>
      )}
    </GameScene>
  );
}
