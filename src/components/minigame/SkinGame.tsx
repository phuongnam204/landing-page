'use client';

import { useEffect, useRef, useState } from 'react';
import type { SkinCondition } from '../../content/quiz';
import { BrandCanvas, GameFrame } from './gameShell';
import { PressPhase } from './PressPhase';
import { DragPhase } from './DragPhase';
import { SwipePhase } from './SwipePhase';
import { SelfReportStep } from './SelfReportStep';
import { resolveProfile, type SelfReportAnswers } from '../MinigameCore/skinProfileLogic';
import { PRESS_SPOT_COUNT, DRAG_DOT_COUNT } from './gameConstants';

type Stage = 'disclaimer' | 'press' | 'drag' | 'swipe' | 'complete' | 'report';

const CONFETTI = [
  { x: '10%', y: '16%', color: '#FF5C9E', r: 9, delay: '0s' },
  { x: '84%', y: '12%', color: '#B39DFF', r: 7, delay: '0.07s' },
  { x: '90%', y: '68%', color: '#FFD166', r: 8, delay: '0.04s' },
  { x: '6%',  y: '76%', color: '#B39DFF', r: 6, delay: '0.11s' },
  { x: '52%', y: '5%',  color: '#FF5C9E', r: 5, delay: '0.06s' },
  { x: '46%', y: '92%', color: '#FFD166', r: 7, delay: '0.09s' },
  { x: '22%', y: '86%', color: '#FF5C9E', r: 5, delay: '0.14s' },
  { x: '76%', y: '80%', color: '#B39DFF', r: 5, delay: '0.12s' },
];

function GameCompleteScreen() {
  const [count, setCount] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current = [
      setTimeout(() => setCount(3), 1000),
      setTimeout(() => setCount(2), 2000),
      setTimeout(() => setCount(1), 3000),
    ];
    return () => timers.current.forEach(clearTimeout);
  }, []);

  return (
    <div className="bg-white dark:bg-[#2D2640] min-h-[60vh] flex flex-col items-center justify-center px-8 text-center relative overflow-hidden">
      {CONFETTI.map((c, i) => (
        <div key={i} style={{
          position: 'absolute', left: c.x, top: c.y,
          width: c.r * 2, height: c.r * 2, borderRadius: '50%',
          background: c.color,
          animation: `gcSparkle 0.65s ease-out ${c.delay} both`,
        }} />
      ))}
      <div style={{ animation: 'gcZoomIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both', marginBottom: 18 }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto',
          background: 'linear-gradient(135deg, #FF5C9E, #B39DFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(179,157,255,0.45)',
        }}>
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path d="M9 19 L16 26 L29 12" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ animation: 'gcTextIn 0.35s ease-out 0.18s both' }}>
        <div className="text-2xl font-extrabold text-cta dark:text-white mb-2">Tuyệt vời! 🎉</div>
        <div className="text-sm text-cta/60 dark:text-white/60 max-w-[260px] leading-relaxed">
          Bạn vừa giúp chuyên gia soi rõ làn da của bạn —{' '}
          <span className="font-semibold text-cta dark:text-white">giờ là lúc tìm giải pháp đúng nào!</span>
        </div>
      </div>
      {count !== null && (
        <div key={count} style={{
          marginTop: 20, width: 48, height: 48, borderRadius: '50%',
          background: 'linear-gradient(135deg, #FF5C9E, #B39DFF)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 900, color: '#fff',
          animation: 'gcCountNum 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
          boxShadow: '0 4px 14px rgba(255,92,158,0.4)',
        }}>
          {count}
        </div>
      )}
    </div>
  );
}

// Nhãn hiển thị vùng tự khai cho PayoffStats (giữ chữ ký stats.zoneLabel cũ).
const ZONE_LABEL: Record<SelfReportAnswers['zone'], string> = {
  'cam-quai-ham': 'cằm & quai hàm',
  'chu-t': 'vùng chữ T',
  'hai-ma': 'hai má',
  'khong-bi': 'gần như không bị',
};

export function SkinGame({
  onComplete,
}: {
  onComplete: (result: SkinCondition, stats: { foundCount: number; zoneLabel: string }) => void;
}) {
  const [stage, setStage] = useState<Stage>('disclaimer');

  // Disclaimer tự chuyển sau ~2s; complete screen tự chuyển sau 4s.
  useEffect(() => {
    if (stage === 'disclaimer') {
      const t = setTimeout(() => setStage('press'), 2000);
      return () => clearTimeout(t);
    }
    if (stage === 'complete') {
      const t = setTimeout(() => setStage('report'), 4000);
      return () => clearTimeout(t);
    }
  }, [stage]);

  return (
    <BrandCanvas>
      <GameFrame>
        {stage === 'disclaimer' && (
          <div className="bg-white dark:bg-[#2D2640] min-h-[60vh] flex flex-col items-center justify-center px-8 text-center">
            <div className="text-3xl mb-3">💛</div>
            <div className="text-lg md:text-xl font-extrabold text-cta dark:text-white">Cùng chơi một chút trước nha!</div>
            <div className="text-sm text-cta/60 dark:text-white/60 mt-2 max-w-xs">Các chuyên gia đang nổ lực chăm sóc da của bạn - hãy giúp họ nào !</div>
          </div>
        )}
        {stage === 'press' && <div className="mg-phase-in"><PressPhase onComplete={() => setStage('drag')} /></div>}
        {stage === 'drag' && <div className="mg-phase-in"><DragPhase onComplete={() => setStage('swipe')} /></div>}
        {stage === 'swipe' && <div className="mg-phase-in"><SwipePhase onComplete={() => setStage('complete')} /></div>}
        {stage === 'complete' && <div className="mg-phase-in"><GameCompleteScreen /></div>}
        {stage === 'report' && (
          <SelfReportStep
            onComplete={(answers) => {
              const result = resolveProfile(answers.zone, answers.feel, answers.trigger);
              onComplete(result, {
                foundCount: PRESS_SPOT_COUNT + DRAG_DOT_COUNT,
                zoneLabel: ZONE_LABEL[answers.zone],
              });
            }}
          />
        )}
      </GameFrame>
    </BrandCanvas>
  );
}
