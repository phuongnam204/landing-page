'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function ClinicalClassicDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 py-16">
      <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 p-6 md:p-10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" stroke="var(--lp-accent)" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" stroke="var(--lp-accent)" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" stroke="var(--lp-accent)" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-xl md:text-2xl text-[var(--lp-text)] mb-2">
            Đã nhận thông tin của bạn!
          </h1>
          <p className="text-sm text-[var(--lp-text)]/60 leading-relaxed">
            Chuyên viên O2Skin sẽ liên hệ trong vòng <strong className="text-[var(--lp-text)]">24 giờ</strong> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>
        <div className="border-t border-[var(--lp-accent)]/10 pt-5">
          <p className="text-xs font-bold text-[var(--lp-text)]/40 uppercase tracking-widest mb-3">
            Chi nhánh O2Skin
          </p>
          <div className="flex flex-col gap-2.5">
            {branches.map((b) => (
              <div key={b.code} className="flex items-start gap-3 text-sm">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--lp-accent)] mt-1.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--lp-text)]">{b.name}</p>
                  <p className="text-xs text-[var(--lp-text)]/50">{b.address}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
