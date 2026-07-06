'use client';

import { useState } from 'react';
import type { SelfReportAnswers, SkinZone, SkinFeel, SkinTrigger } from '../MinigameCore/skinProfileLogic';

type OptionSet =
  | { key: 'zone'; q: string; options: { id: SkinZone; label: string }[] }
  | { key: 'feel'; q: string; options: { id: SkinFeel; label: string }[] }
  | { key: 'trigger'; q: string; options: { id: SkinTrigger; label: string }[] };

const QUESTIONS: OptionSet[] = [
  { key: 'zone', q: 'Da bạn hay "nổi loạn" ở đâu?', options: [
    { id: 'cam-quai-ham', label: 'Cằm & quai hàm' }, { id: 'chu-t', label: 'Vùng chữ T (trán, mũi)' },
    { id: 'hai-ma', label: 'Hai má' }, { id: 'khong-bi', label: 'Gần như không bị' }] },
  { key: 'feel', q: 'Cảm giác da chủ đạo?', options: [
    { id: 'dau', label: 'Bóng dầu' }, { id: 'kho', label: 'Khô căng' },
    { id: 'nhay-cam', label: 'Nhạy cảm, dễ ửng đỏ' }, { id: 'on-dinh', label: 'Ổn định' }] },
  { key: 'trigger', q: 'Da bạn "nổi loạn" khi nào?', options: [
    { id: 'ky-kinh', label: 'Gần kỳ kinh' }, { id: 'nang', label: 'Khi nắng nóng' },
    { id: 'stress', label: 'Khi stress' }, { id: 'thuc-khuya', label: 'Khi thức khuya' }] },
];

export function SelfReportStep({ onComplete }: { onComplete: (answers: SelfReportAnswers) => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<SelfReportAnswers>>({});
  const [pickedId, setPickedId] = useState<string | null>(null);
  const current = QUESTIONS[step];

  function pick(id: string) {
    if (pickedId) return;
    setPickedId(id);
    setTimeout(() => {
      const next = { ...answers, [current.key]: id } as Partial<SelfReportAnswers>;
      setAnswers(next);
      setPickedId(null);
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        onComplete(next as SelfReportAnswers);
      }
    }, 360);
  }

  return (
    <div className="bg-white dark:bg-[#f5f0ff] px-6 py-8 md:py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <div key={step} className="mg-phase-in w-full max-w-md">
        <div className="text-center mb-5">
          <div className="text-xl font-bold tracking-wide" style={{
            background: 'linear-gradient(90deg, #FF5C9E, #B39DFF)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Cùng tìm điều da bạn thực sự cần nhé 🌿 &nbsp;·&nbsp; {step + 1} / {QUESTIONS.length}
          </div>
          <div className="text-xl md:text-2xl font-extrabold leading-snug mt-1.5 text-cta">{current.q}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {current.options.map((o) => {
            const isPicked = pickedId === o.id;
            const isDimmed = pickedId !== null && !isPicked;
            return (
              <button
                key={o.id}
                onClick={() => pick(o.id)}
                disabled={!!pickedId}
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left border-2 transition-all duration-200"
                style={{
                  ...(isPicked ? {
                    background: 'linear-gradient(135deg, #FF5C9E, #B39DFF)',
                    borderColor: 'transparent',
                    transform: 'scale(1.03)',
                    animation: 'selfPickIn 0.2s ease-out both',
                  } : {
                    background: 'rgba(45,38,100,0.05)',
                    borderColor: 'rgba(45,38,100,0.1)',
                  }),
                  opacity: isDimmed ? 0.3 : 1,
                  color: isPicked ? '#fff' : '#2D2664',
                }}
              >
                <span className="font-bold text-[15px]">
                  {isPicked ? '✓ ' : ''}{o.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
