'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function ClinicalCompactDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full animate-fade-in-up">
        <div className="text-center mb-5">
          <div className="flex items-center justify-center mb-2">
            <svg viewBox="0 0 48 48" className="w-10 h-10" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" stroke="var(--lp-accent)" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" stroke="var(--lp-accent)" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" stroke="var(--lp-accent)" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-lg text-[var(--lp-text)] mb-1">
            Đã nhận thông tin!
          </h1>
          <p className="text-xs text-[var(--lp-text)]/55">
            Chuyên viên O2Skin sẽ liên hệ trong 24 giờ.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          {branches.map((b) => (
            <div key={b.code} className="text-sm">
              <p className="font-semibold text-[var(--lp-text)]">{b.name}</p>
              <p className="text-xs text-[var(--lp-text)]/45">{b.address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
