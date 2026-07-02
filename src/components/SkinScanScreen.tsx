'use client';

import { useRef, useState, type CSSProperties } from 'react';
import {
  generateBoard,
  computeResultFromBoard,
  countByKind,
  type BoardCharacter,
  type CharacterKind,
  type KindCounts,
} from './MinigameCore/skinScanLogic';
import type { QuizResult } from '../content/quiz';

const TOTAL_CHARACTERS = 8;
const CATCH_RADIUS = 9;

type EarShape = 'flame' | 'straight' | 'petal';

const CHARACTER_VISUALS: Record<
  CharacterKind,
  { top: string; bottom: string; ear: string; gem: string; earShape: EarShape; glow?: boolean }
> = {
  'mun-viem': { top: '#FF8177', bottom: '#E5544A', ear: '#E53935', gem: '#FFC94D', earShape: 'flame' },
  'dau-den': { top: '#B0A99F', bottom: '#8D8378', ear: '#8D8378', gem: '#6D4C41', earShape: 'straight' },
  'man-do': { top: '#FFD3E0', bottom: '#FFB6C9', ear: '#FFB6C9', gem: '#FFC94D', earShape: 'petal' },
  'da-sang-khoe': { top: '#C2F0DC', bottom: '#8FE3BC', ear: '#8FE3BC', gem: '#FFC94D', earShape: 'petal', glow: true },
};

function earStyle(shape: EarShape, color: string, side: 'left' | 'right'): CSSProperties {
  const rotate = side === 'left' ? -30 : 30;
  const base: CSSProperties = {
    position: 'absolute',
    [side]: '2px',
    top: '-2px',
    background: color,
    transform: `rotate(${rotate}deg)`,
  };
  if (shape === 'flame') {
    return { ...base, width: '14px', height: '20px', clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' };
  }
  if (shape === 'straight') {
    return { ...base, width: '6px', height: '18px', borderRadius: '3px' };
  }
  return {
    ...base,
    width: '10px',
    height: '20px',
    borderRadius: side === 'left' ? '100% 0 100% 30%' : '0 100% 30% 100%',
  };
}

function findNearestUnfound(board: BoardCharacter[], x: number, y: number): BoardCharacter | null {
  let nearest: BoardCharacter | null = null;
  let nearestDist = Infinity;
  for (const character of board) {
    if (character.found) continue;
    const dist = Math.hypot(character.x - x, character.y - y);
    if (dist <= CATCH_RADIUS && dist < nearestDist) {
      nearest = character;
      nearestDist = dist;
    }
  }
  return nearest;
}

export function SkinScanScreen({
  onComplete,
}: {
  onComplete: (result: QuizResult, counts: KindCounts) => void;
}) {
  const [board, setBoard] = useState<BoardCharacter[]>(() => generateBoard());
  const [lensPos, setLensPos] = useState({ x: 50, y: 50 });
  const boardRef = useRef<HTMLDivElement>(null);
  const boardStateRef = useRef(board);
  boardStateRef.current = board;

  const foundCount = board.filter((c) => c.found).length;

  function handlePointer(clientX: number, clientY: number) {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const nearest = findNearestUnfound(boardStateRef.current, x, y);
    if (!nearest) {
      setLensPos({ x, y });
      return;
    }
    setLensPos({ x: nearest.x, y: nearest.y });
    const nextBoard = boardStateRef.current.map((c) =>
      c.id === nearest.id ? { ...c, found: true } : c
    );
    boardStateRef.current = nextBoard;
    setBoard(nextBoard);
    if (nextBoard.every((c) => c.found)) {
      onComplete(computeResultFromBoard(nextBoard), countByKind(nextBoard));
    }
  }

  return (
    <div className="h-screen w-full bg-pastel-mint flex flex-col items-center justify-center px-4 sm:px-5 overflow-hidden">
      <div className="w-full max-w-2xl md:max-w-[80%]">
        <div className="text-xs font-bold text-label-purple uppercase mb-1">
          Đã tìm {foundCount} / {TOTAL_CHARACTERS}
        </div>
        <div className="h-[5px] bg-violet-100 rounded-full mb-4 overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full"
            style={{ width: `${(foundCount / TOTAL_CHARACTERS) * 100}%`, transition: 'width 300ms ease' }}
          />
        </div>
        <p className="text-base md:text-lg font-bold text-cta text-center leading-snug mb-3 px-2">
          👆 Chạm vào màn hình để kéo kính lúp khắp vùng da
        </p>
        <div
          ref={boardRef}
          onPointerDown={(e) => handlePointer(e.clientX, e.clientY)}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            handlePointer(e.clientX, e.clientY);
          }}
          className="relative w-full h-[60vh] max-h-[620px] rounded-soft overflow-hidden touch-none select-none"
          style={{ background: 'radial-gradient(circle at 30% 30%, #FFE3D0 0%, #FBCFA0 40%, #F5B98A 100%)' }}
        >
          {board.map((character) => (
            <MascotCharacter key={character.id} character={character} />
          ))}
          <div
            className="absolute rounded-full border-4 border-cta pointer-events-none"
            style={{
              left: `${lensPos.x}%`,
              top: `${lensPos.y}%`,
              width: '84px',
              height: '84px',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(255,255,255,0.25)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function MascotCharacter({ character }: { character: BoardCharacter }) {
  const visual = CHARACTER_VISUALS[character.kind];
  return (
    <div
      className="absolute"
      style={{
        left: `${character.x}%`,
        top: `${character.y}%`,
        transform: 'translate(-50%, -50%)',
        width: '46px',
        height: '58px',
        opacity: character.found ? 1 : 0.12,
        transition: 'opacity 200ms ease',
      }}
    >
      <div style={earStyle(visual.earShape, visual.ear, 'left')} />
      <div style={earStyle(visual.earShape, visual.ear, 'right')} />
      {visual.glow && (
        <span style={{ position: 'absolute', left: '-2px', top: '-10px', fontSize: '10px' }}>✨</span>
      )}
      <div
        style={{
          position: 'absolute',
          left: '7px',
          top: '10px',
          width: '32px',
          height: '24px',
          background: visual.top,
          clipPath: 'polygon(50% 0%, 100% 34%, 80% 100%, 20% 100%, 0% 34%)',
        }}
      >
        <div style={{ position: 'absolute', left: '9px', top: '10px', width: '4px', height: '5px', background: '#2D2640', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: '9px', top: '10px', width: '4px', height: '5px', background: '#2D2640', borderRadius: '50%' }} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: '11px',
          top: '32px',
          width: '24px',
          height: '26px',
          background: `linear-gradient(to bottom, ${visual.top} 55%, ${visual.bottom} 100%)`,
          borderRadius: '14px 14px 12px 12px',
          boxShadow: visual.glow ? `0 0 10px 2px ${visual.bottom}` : undefined,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '8px',
            top: '9px',
            width: '8px',
            height: '8px',
            background: visual.gem,
            borderRadius: '50% 50% 50% 0',
            transform: 'rotate(-45deg)',
          }}
        />
      </div>
    </div>
  );
}
