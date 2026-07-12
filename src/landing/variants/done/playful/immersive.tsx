'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function PlayfulImmersiveDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-payoff)] flex items-center justify-center py-12 px-5 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-[var(--lp-blob-1)] blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-[var(--lp-blob-2)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-lg w-full animate-fade-in-up relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" fill="var(--lp-pastel-mint)" stroke="var(--lp-accent)" strokeWidth="2.5" strokeOpacity="0.6" />
              <path d="M14 25l7 7 13-14" stroke="var(--lp-accent)" strokeWidth="2.5" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-2xl md:text-3xl text-cta mb-2">
            Đã nhận yêu cầu!
          </h1>
          <p className="text-sm md:text-base text-cta/70 leading-relaxed">
            Đội ngũ o2skin sẽ liên hệ trong vòng <b className="text-cta">30 phút</b> để xác nhận lịch hẹn.
          </p>
        </div>

        <div className="bg-[var(--lp-bg-card)] rounded-lg border border-[var(--lp-border)] p-6">
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
