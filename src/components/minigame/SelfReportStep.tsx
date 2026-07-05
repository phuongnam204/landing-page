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
  const current = QUESTIONS[step];

  function pick(id: string) {
    const next = { ...answers, [current.key]: id } as Partial<SelfReportAnswers>;
    setAnswers(next);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      onComplete(next as SelfReportAnswers);
    }
  }

  return (
    <div className="bg-white dark:bg-[#f5f0ff] px-6 py-8 md:py-12 flex flex-col items-center justify-center min-h-[70vh]">
      <div key={step} className="mg-phase-in w-full max-w-md">
        <div className="text-center mb-5">
          <div className="text-[13px] font-bold tracking-wide" style={{ color: '#FF5C9E' }}>
            SOI XONG RỒI 🎉 &nbsp;·&nbsp; {step + 1} / {QUESTIONS.length}
          </div>
          <div className="text-xl md:text-2xl font-extrabold leading-snug mt-1.5 text-cta">{current.q}</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {current.options.map((o) => (
            <button key={o.id} onClick={() => pick(o.id)}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5 text-left border-2 transition-colors bg-cta/5 hover:bg-cta/10 border-cta/10 text-cta">
              <span className="font-bold text-[15px]">{o.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
