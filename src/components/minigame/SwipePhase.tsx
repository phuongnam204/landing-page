'use client';

import { useMemo, useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { useAdvancingHint } from './useAdvancingHint';
import { withinRadius } from '../MinigameCore/collisionUtils';
import { CATCH_RADIUS } from './gameConstants';

type Hair = { id: number; x: number; y: number; fading: boolean };
type HintPhase = 'touch' | 'drag' | 'hidden';

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

// Re-exported from DragPhase style — đặt inline để tránh circular deps.
function HintRing({ left, top, size = 96, color1 = '#FF5C9E', color2 = '#B39DFF' }: {
  left: string; top: string; size?: number; color1?: string; color2?: string;
}) {
  const base: React.CSSProperties = {
    position: 'absolute', left, top,
    width: size, height: size, borderRadius: '50%',
    transform: 'translate(-50%, -50%)', pointerEvents: 'none',
  };
  return (
    <>
      <div style={{ ...base, border: `2px solid ${color1}`, opacity: 0,
        animation: 'mgHintPing 1.8s ease-out infinite' }} />
      <div style={{ ...base, border: `2.5px solid ${color1}`,
        boxShadow: `0 0 0 3px ${color2}44, 0 0 24px ${color1}55`,
        animation: 'mgHintRing 1.8s ease-in-out infinite' }} />
    </>
  );
}

function HintArrowDown({ left, top }: { left: string; top: string }) {
  return (
    <div style={{ position: 'absolute', left, top, pointerEvents: 'none',
      animation: 'mgHintDown 1.6s ease-in-out infinite',
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
      <svg width="28" height="44" viewBox="0 0 28 44" fill="none">
        <line x1="14" y1="4" x2="14" y2="32" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <polyline points="5,22 14,36 23,22" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

export function SwipePhase({ onComplete }: { onComplete: () => void }) {
  const initial = useMemo(makeHairs, []);
  const hairsRef = useRef<Hair[]>(initial);
  const [hairs, setHairs] = useState<Hair[]>(initial);
  const [machine, setMachine] = useState({ x: 50, y: 30 });
  const [hintPhase, setHintPhase] = useState<HintPhase>('touch');
  const hintPhaseRef = useRef<HintPhase>('touch');
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const doneRef = useRef(false);
  const { markInteracted, markProgress } = useAdvancingHint(() => {
    hairsRef.current = []; setHairs([]); finish();
  });

  const total = initial.length;
  const cleared = total - hairs.length;

  function setHP(p: HintPhase) { hintPhaseRef.current = p; setHintPhase(p); }
  function setHairsSync(next: Hair[]) { hairsRef.current = next; setHairs(next); }

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
    const prev = hairsRef.current;
    let changed = false;
    const next = prev.map((h) => {
      if (!h.fading && withinRadius(head, h, CATCH_RADIUS)) { changed = true; return { ...h, fading: true }; }
      return h;
    });
    if (!changed) return;
    setHairsSync(next);
    if (hintPhaseRef.current === 'drag') setHP('hidden');
    markProgress();
    setTimeout(() => {
      const remaining = hairsRef.current.filter((h) => !h.fading);
      setHairsSync(remaining);
      if (remaining.length === 0) finish();
    }, 300);
  }

  function onDown(e: React.PointerEvent) {
    markInteracted();
    if (hintPhaseRef.current === 'touch') setHP('drag');
    draggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    const p = pctFromEvent(e);
    if (p) { setMachine(p); burn(p); }
  }

  function onMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = pctFromEvent(e);
    if (p) { setMachine(p); burn(p); }
  }

  function onUp() { draggingRef.current = false; }

  const hintLabel: React.CSSProperties = {
    position: 'absolute', left: '50%', top: '8%', transform: 'translateX(-50%)',
    zIndex: 10, fontSize: 13, fontWeight: 800, whiteSpace: 'nowrap',
    color: '#fff', textShadow: '0 1px 6px rgba(0,0,0,0.5)',
  };

  return (
    <GameScene
      phaseIndex={3} title="Làm sạch lỗ chân lông"
      progress={cleared} total={total}
      sceneRef={sceneRef}
      onScenePointerDown={onDown} onScenePointerMove={onMove} onScenePointerUp={onUp}
    >
      {hairs.map((h) => (
        <img key={h.id} src="/swipe/hair.svg" alt="cặn bẩn lỗ chân lông" draggable={false}
          style={{ position: 'absolute', left: `${h.x}%`, top: `${h.y}%`,
            width: 14, transform: 'translate(-50%, -50%) scaleY(2.5)', pointerEvents: 'none',
            opacity: h.fading ? 0.15 : 1, transition: 'opacity 300ms' }} />
      ))}

      <img src="/swipe/machine.svg" alt="thiết bị làm sạch da" draggable={false}
        style={{ position: 'absolute', left: `${machine.x}%`, top: `${machine.y}%`,
          width: 156, transform: 'translate(-50%, -60%)', pointerEvents: 'none' }} />

      {/* ── Hint: chạm vào máy ── */}
      {hintPhase === 'touch' && (
        <>
          <div style={hintLabel}>Chạm vào đầu làm sạch</div>
          {/* Ring vòng quanh vị trí visual của machine (offset -60% of ~156px ≈ -93px ≈ -18% trên scene ~520px) */}
          <HintRing left="50%" top="18%" size={120} />
          <HintArrowDown left="50%" top="38%" />
        </>
      )}

      {/* ── Hint: kéo máy qua lông tơ ── */}
      {hintPhase === 'drag' && (
        <HintArrowDown left="50%" top="46%" />
      )}
    </GameScene>
  );
}
