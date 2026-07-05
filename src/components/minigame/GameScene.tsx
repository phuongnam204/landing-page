import type { ReactNode, RefObject } from 'react';
import { SKY_RATIO } from './gameConstants';

// Chrome dùng chung cho 1 pha: HUD header + vùng chơi trời/da tỉ lệ 3:2.
// `children` là các đối tượng tương tác, absolute theo % bên trong vùng chơi.
export function GameScene({
  phaseIndex,
  title,
  progress,
  total,
  sceneRef,
  onScenePointerDown,
  onScenePointerMove,
  onScenePointerUp,
  children,
}: {
  phaseIndex: number;
  title: string;
  progress: number;
  total: number;
  sceneRef: RefObject<HTMLDivElement | null>;
  onScenePointerDown?: (e: React.PointerEvent) => void;
  onScenePointerMove?: (e: React.PointerEvent) => void;
  onScenePointerUp?: (e: React.PointerEvent) => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col h-[90vh] max-h-[720px]">
      {/* HUD */}
      <div className="px-5 pt-4 pb-3 md:px-8 md:pt-6 bg-white dark:bg-[#2D2640] shrink-0">
        <div className="text-[10px] md:text-xs font-bold tracking-wide text-cta/55 dark:text-white/55">
          PHA {phaseIndex} / 3
        </div>
        <div className="text-base md:text-xl font-extrabold text-cta dark:text-white mt-0.5">{title}</div>
        <div className="flex items-center gap-2 mt-2.5">
          <div className="flex-1 h-1.5 rounded-full bg-cta/10 dark:bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${(progress / total) * 100}%`, background: 'linear-gradient(90deg,#FF5C9E,#B39DFF)' }}
            />
          </div>
          <div className="text-[11px] font-extrabold text-cta dark:text-white whitespace-nowrap">
            {progress} / {total}
          </div>
        </div>
      </div>

      {/* Play area: sky over skin, 3:2 */}
      <div
        ref={sceneRef}
        onPointerDown={onScenePointerDown}
        onPointerMove={onScenePointerMove}
        onPointerUp={onScenePointerUp}
        className="relative flex-1 overflow-hidden select-none"
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-x-0 top-0" style={{ height: `${SKY_RATIO}%`, background: '#7A9EBB' }} />
        <div className="absolute inset-x-0 bottom-0" style={{ top: `${SKY_RATIO}%`, background: '#E8A57E', position: 'absolute' }} />
        {/* Torn-paper boundary */}
        <div
          className="absolute inset-x-0"
          style={{
            top: `calc(${SKY_RATIO}% - 4px)`, height: 8,
            background: 'repeating-linear-gradient(90deg,#E8A57E 0 8px,transparent 8px 12px)',
          }}
        />
        {children}
      </div>
    </div>
  );
}
