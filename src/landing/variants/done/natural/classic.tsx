'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function NaturalClassicDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] p-6 md:p-10 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-14 h-14 text-[var(--lp-accent)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h2 className="font-extrabold text-xl md:text-2xl text-cta mb-2">
            Đã nhận thông tin của bạn!
          </h2>
          <p className="text-sm md:text-base text-cta/70 leading-relaxed">
            Chuyên viên o2skin sẽ liên hệ trong vòng{' '}
            <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>

        <div className="border-t border-cta/10 pt-5">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-3">
            Chi nhánh o2skin
          </p>
          <div className="bg-[var(--lp-bg-hero)] rounded-[var(--lp-radius-card)] p-4 flex flex-col gap-2">
            {branches.map((b) => (
              <div key={b.code} className="flex items-start gap-2">
                <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0 mt-0.5 text-[var(--lp-accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11z" />
                  <circle cx="12" cy="10" r="2" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-cta">{b.name}</p>
                  <p className="text-xs text-cta/55">{b.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
