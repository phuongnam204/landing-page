'use client';

import { useEffect, useState } from 'react';
import type { SkinCondition } from '../../content/quiz';
import { BrandCanvas, GameFrame } from './gameShell';
import { PressPhase } from './PressPhase';
import { DragPhase } from './DragPhase';
import { SwipePhase } from './SwipePhase';
import { SelfReportStep } from './SelfReportStep';
import { resolveProfile, type SelfReportAnswers } from '../MinigameCore/skinProfileLogic';

type Stage = 'disclaimer' | 'press' | 'drag' | 'swipe' | 'report';

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

  // Disclaimer tự mờ sau ~2s.
  useEffect(() => {
    if (stage !== 'disclaimer') return;
    const t = setTimeout(() => setStage('press'), 2000);
    return () => clearTimeout(t);
  }, [stage]);

  return (
    <BrandCanvas>
      <GameFrame>
        {stage === 'disclaimer' && (
          <div className="bg-white dark:bg-[#2D2640] min-h-[60vh] flex flex-col items-center justify-center px-8 text-center">
            <div className="text-3xl mb-3">💛</div>
            <div className="text-lg md:text-xl font-extrabold text-cta dark:text-white">Mô phỏng vui thôi nhé</div>
            <div className="text-sm text-cta/60 dark:text-white/60 mt-2 max-w-xs">Da thật cần chuyên gia chăm — cùng chơi một chút trước nha!</div>
          </div>
        )}
        {stage === 'press' && <div className="mg-phase-in"><PressPhase onComplete={() => setStage('drag')} /></div>}
        {stage === 'drag' && <div className="mg-phase-in"><DragPhase onComplete={() => setStage('swipe')} /></div>}
        {stage === 'swipe' && <div className="mg-phase-in"><SwipePhase onComplete={() => setStage('report')} /></div>}
        {stage === 'report' && (
          <SelfReportStep
            onComplete={(answers) => {
              const result = resolveProfile(answers.zone, answers.feel, answers.trigger);
              onComplete(result, { foundCount: 0, zoneLabel: ZONE_LABEL[answers.zone] });
            }}
          />
        )}
      </GameFrame>
    </BrandCanvas>
  );
}
