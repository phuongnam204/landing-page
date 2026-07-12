'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function PlayfulDarkAccentDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-accent)] flex items-center justify-center py-12 px-5">
      <div className="max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="2.5" strokeOpacity="0.6" />
              <path d="M14 25l7 7 13-14" stroke="white" strokeWidth="2.5" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-xl md:text-2xl text-white mb-2">
            Đã nhận yêu cầu!
          </h1>
          <p className="text-sm md:text-base text-white/70 leading-relaxed">
            Đội ngũ o2skin sẽ liên hệ trong vòng <b className="text-white">30 phút</b> để xác nhận lịch hẹn.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-[var(--lp-accent)] p-5">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-3">Chi nhánh o2skin</p>
          <div className="flex flex-col gap-3">
            {branches.map(b => (
              <div key={b.code} className="flex flex-col">
                <p className="text-sm font-semibold text-cta">{b.name}</p>
                <p className="text-xs text-cta/60">{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
