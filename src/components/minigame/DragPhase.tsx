'use client';

import { useMemo, useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { useAdvancingHint } from './useAdvancingHint';
import { withinBox } from '../MinigameCore/collisionUtils';
import { SKY_RATIO } from './gameConstants';

type Dot = { id: number; x: number; y: number; attached: boolean };
type GameState = 'idle' | 'placed' | 'pulling';
type HintPhase = 'touch' | 'to-skin' | 'to-sky' | 'hidden';

function makeDots(): Dot[] {
  const dots: Dot[] = [];
  let id = 0;
  const cols = 7, rows = 4;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      dots.push({
        id: id++,
        x: 15 + (c / (cols - 1)) * 70 + (Math.random() - 0.5) * 5,
        y: 64 + (r / (rows - 1)) * 24 + (Math.random() - 0.5) * 4,
        attached: false,
      });
    }
  }
  return dots;
}

// Pulsing gradient ring — dùng cho hint "chạm vào đây".
function HintRing({ left, top, size = 96, color1 = '#FF5C9E', color2 = '#B39DFF', delay = '0s' }: {
  left: string; top: string; size?: number; color1?: string; color2?: string; delay?: string;
}) {
  const base: React.CSSProperties = {
    position: 'absolute', left, top,
    width: size, height: size, borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  };
  return (
    <>
      {/* Ping expanding ring */}
      <div style={{ ...base, border: `2px solid ${color1}`, opacity: 0, animationDelay: delay,
        animation: 'mgHintPing 1.8s ease-out infinite' }} />
      {/* Steady pulsing ring */}
      <div style={{ ...base, border: `2.5px solid ${color1}`,
        boxShadow: `0 0 0 3px ${color2}44, 0 0 24px ${color1}55`,
        animation: 'mgHintRing 1.8s ease-in-out infinite' }} />
    </>
  );
}

// White arrow — dùng cho hint hướng kéo.
function HintArrow({ left, top, direction, animName }: {
  left: string; top: string; direction: 'down' | 'up'; animName: string;
}) {
  const isDown = direction === 'down';
  const lineY = isDown ? ['4', '32'] : ['40', '12'];
  const arrowPts = isDown ? '5,22 14,36 23,22' : '5,22 14,8 23,22';
  return (
    <div style={{ position: 'absolute', left, top, pointerEvents: 'none',
      animation: `${animName} 1.6s ease-in-out infinite`,
      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
      <svg width="28" height="44" viewBox="0 0 28 44" fill="none">
        <line x1="14" y1={lineY[0]} x2="14" y2={lineY[1]} stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        <polyline points={arrowPts} stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    </div>
  );
}

export function DragPhase({ onComplete }: { onComplete: () => void }) {
  const initial = useMemo(makeDots, []);
  const [dots, setDots] = useState<Dot[]>(initial);
  const [sticker, setSticker] = useState({ x: 50, y: 30 });
  const [gsState, setGsState] = useState<GameState>('idle');
  const [hintPhase, setHintPhase] = useState<HintPhase>('touch');
  const gsRef = useRef<GameState>('idle');
  const lastPosRef = useRef({ x: 50, y: 30 });
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const doneRef = useRef(false);
  const { markInteracted, markProgress } = useAdvancingHint(() => {
    setDots([]); finish();
  });

  const total = initial.length;
  const removed = total - dots.length;

  function setGs(s: GameState) { gsRef.current = s; setGsState(s); }

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

  function getStickerBox(cx: number, cy: number) {
    const rect = sceneRef.current?.getBoundingClientRect();
    const halfPx = 110;
    const halfW = rect ? (halfPx / rect.width) * 100 : 29;
    const halfH = rect ? (halfPx / rect.height) * 100 : 19;
    return { cx, cy, halfW, halfH };
  }

  function onDown(e: React.PointerEvent) {
    markInteracted();
    const p = pctFromEvent(e);
    if (!p) return;
    draggingRef.current = true;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    lastPosRef.current = p;

    if (gsRef.current === 'idle') {
      setSticker(p);
      setHintPhase('to-skin');
    } else if (gsRef.current === 'placed') {
      setGs('pulling');
      setHintPhase('hidden');
    }
  }

  function onMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = pctFromEvent(e);
    if (!p) return;
    lastPosRef.current = p;
    if (gsRef.current === 'idle' || gsRef.current === 'pulling') setSticker(p);
    if (gsRef.current === 'pulling') {
      const box = getStickerBox(p.x, p.y);
      setDots(prev => {
        let changed = false;
        const next = prev.map(d => {
          if (!d.attached && withinBox(d, box)) { changed = true; return { ...d, attached: true }; }
          return d;
        });
        return changed ? next : prev;
      });
    }
  }

  function onUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const p = lastPosRef.current;

    if (gsRef.current === 'idle') {
      if (p.y > SKY_RATIO) { setGs('placed'); setHintPhase('to-sky'); }
      else { setHintPhase('hidden'); }
    } else if (gsRef.current === 'pulling') {
      if (p.y <= SKY_RATIO) {
        setDots(prev => {
          const box = getStickerBox(p.x, p.y);
          const next = prev.filter(d => !d.attached && !withinBox(d, box));
          if (next.length < prev.length) markProgress();
          if (next.length === 0) finish();
          return next;
        });
        setGs('idle');
      } else {
        setDots(prev => prev.map(d => ({ ...d, attached: false })));
        setGs('placed');
        setHintPhase('to-sky');
      }
    }
  }

  const hintLabel: React.CSSProperties = {
    position: 'absolute', left: '50%', top: '10%', transform: 'translateX(-50%)',
    zIndex: 10, fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap',
    textShadow: '0 1px 6px rgba(0,0,0,0.5)',
  };

  return (
    <GameScene
      phaseIndex={2} title="Hút mụn đầu đen"
      progress={removed} total={total}
      sceneRef={sceneRef}
      onScenePointerDown={onDown} onScenePointerMove={onMove} onScenePointerUp={onUp}
    >
      {dots.map((d) => (
        <img key={d.id} src="/black_acne_pull/black_acne.svg" alt="mụn đầu đen" draggable={false}
          style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: 18,
            transform: 'translate(-50%, -50%)', pointerEvents: 'none',
            opacity: d.attached ? 0 : 1, transition: 'opacity 200ms' }} />
      ))}

      <img src="/black_acne_pull/sticker.svg" alt="miếng dán" draggable={false}
        style={{ position: 'absolute', left: `${sticker.x}%`, top: `${sticker.y}%`, width: 220,
          transform: 'translate(-50%, -50%)', opacity: gsState === 'placed' ? 0.75 : 0.95, pointerEvents: 'none' }} />

      {/* ── Hint: chạm vào miếng dán ── */}
      {hintPhase === 'touch' && (
        <>
          <div style={{ ...hintLabel, top: '8%' }}>Chạm vào miếng dán</div>
          <HintRing left="50%" top="30%" size={110} />
          <HintArrow left="50%" top="46%" direction="down" animName="mgHintDown" />
        </>
      )}

      {/* ── Hint: kéo xuống vùng da ── */}
      {hintPhase === 'to-skin' && (
        <HintArrow left="50%" top="44%" direction="down" animName="mgHintDown" />
      )}

      {/* ── Hint: kéo miếng dán lên ── */}
      {hintPhase === 'to-sky' && (
        <>
          <div style={{ ...hintLabel, top: '8%' }}>Kéo miếng dán lên!</div>
          <HintRing left={`${sticker.x}%`} top={`${sticker.y}%`} size={130} color1="#B39DFF" color2="#FF5C9E" delay="0.3s" />
          <HintArrow left={`${sticker.x}%`} top={`${sticker.y}%`} direction="up" animName="mgHintPull" />
        </>
      )}
    </GameScene>
  );
}
