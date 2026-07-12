'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function ElectricClassicDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-payoff)] flex items-center justify-center py-12 px-5">
      <div className="max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" fill="var(--lp-pastel-mint)" stroke="var(--lp-accent)" strokeWidth="2.5" strokeOpacity="0.6" />
              <path d="M14 25l7 7 13-14" stroke="var(--lp-accent)" strokeWidth="2.5" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-xl md:text-2xl mb-2" style={{ color: 'var(--lp-primary)' }}>
            Đã nhận yêu cầu!
          </h1>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(240,230,255,.7)' }}>
            Đội ngũ o2skin sẽ liên hệ trong vòng <b style={{ color: 'var(--lp-primary)' }}>30 phút</b> để xác nhận lịch hẹn.
          </p>
        </div>

        <div className="rounded-lg p-5" style={{ background: 'var(--lp-bg-card)', border: '1px solid var(--lp-border)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(240,230,255,.4)' }}>Chi nhánh o2skin</p>
          <div className="flex flex-col gap-3">
            {branches.map(b => (
              <div key={b.code} className="flex flex-col">
                <p className="text-sm font-semibold" style={{ color: 'var(--lp-primary)' }}>{b.name}</p>
                <p className="text-xs" style={{ color: 'rgba(240,230,255,.6)' }}>{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
