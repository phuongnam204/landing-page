'use client';

import { useMemo, useRef, useState } from 'react';
import { GameScene } from './GameScene';
import { GhostHand } from './GhostHand';
import { useAdvancingHint } from './useAdvancingHint';
import { withinBox } from '../MinigameCore/collisionUtils';

type Dot = { id: number; x: number; y: number };

// Sinh ~28 mụn đen dày, cụm sát ranh giới (y 62–90%).
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
      });
    }
  }
  return dots;
}

// Nửa cạnh bounding-box của miếng dán tính theo % scene (sticker ~110px trên khung ~380px → ~15%).
const STICKER_HALF = 15;

export function DragPhase({ onComplete }: { onComplete: () => void }) {
  const initial = useMemo(makeDots, []);
  const [dots, setDots] = useState<Dot[]>(initial);
  // Vị trí miếng dán (%) — bắt đầu trên nền trời.
  const [sticker, setSticker] = useState({ x: 50, y: 30 });
  const [onSkin, setOnSkin] = useState(false); // đã thả xuống da (bước 1 xong) chưa
  const sceneRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const doneRef = useRef(false);
  const { showInitialHint, markInteracted, markProgress } = useAdvancingHint(() => {
    setDots([]); finish();
  });

  const total = initial.length;
  const removed = total - dots.length;

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

  function onDown(e: React.PointerEvent) {
    markInteracted();
    draggingRef.current = true;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }

  function onMove(e: React.PointerEvent) {
    if (!draggingRef.current) return;
    const p = pctFromEvent(e);
    if (p) setSticker(p);
  }

  function onUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (!onSkin) {
      // Bước 1: thả xuống da → dính tại chỗ.
      if (sticker.y > 60) setOnSkin(true);
    } else {
      // Bước 2: lift → hút mụn dưới bounding box.
      const box = { cx: sticker.x, cy: sticker.y, halfW: STICKER_HALF, halfH: STICKER_HALF };
      setDots((prev) => {
        const next = prev.filter((d) => !withinBox(d, box));
        if (next.length < prev.length) markProgress();
        if (next.length === 0) finish();
        return next;
      });
      setOnSkin(false);
    }
  }

  return (
    <GameScene
      phaseIndex={2}
      title="Hút mụn đầu đen"
      progress={removed}
      total={total}
      sceneRef={sceneRef}
      onScenePointerDown={onDown}
      onScenePointerMove={onMove}
      onScenePointerUp={onUp}
    >
      {dots.map((d) => (
        <img key={d.id} src="/black_acne_pull/black_acne.svg" alt="mụn đầu đen" draggable={false}
          style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: 12, transform: 'translate(-50%, -50%)', pointerEvents: 'none' }} />
      ))}

      <img src="/black_acne_pull/sticker.svg" alt="miếng dán" draggable={false}
        style={{ position: 'absolute', left: `${sticker.x}%`, top: `${sticker.y}%`, width: 110, transform: 'translate(-50%, -50%)', opacity: onSkin ? 0.75 : 0.95, pointerEvents: 'none' }} />

      {showInitialHint && (
        <>
          <div className="absolute left-1/2 z-10 text-sm font-extrabold text-white text-center whitespace-nowrap" style={{ top: '10%', transform: 'translateX(-50%)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
            Kéo miếng dán vào vùng mụn
          </div>
          <GhostHand style={{ left: '50%', top: '40%', transform: 'translateX(-50%)', animation: 'mgHintArrow 2.6s ease-in-out infinite' }} />
        </>
      )}
    </GameScene>
  );
}
