'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function ClinicalEditorialDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-6 py-20">
      <div className="max-w-xl w-full flex flex-col gap-8 animate-fade-in-up">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <svg viewBox="0 0 48 48" className="w-14 h-14" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" stroke="var(--lp-accent)" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" stroke="var(--lp-accent)" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" stroke="var(--lp-accent)" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-[var(--lp-text)] mb-3">
            Đã nhận thông tin của bạn!
          </h1>
          <p className="text-sm text-[var(--lp-text)]/50 leading-relaxed max-w-md mx-auto">
            Chuyên viên O2Skin sẽ liên hệ trong vòng 24 giờ để tư vấn liệu trình phù hợp với làn da của bạn.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold text-[var(--lp-text)]/40 uppercase tracking-widest">
            Chi nhánh O2Skin
          </p>
          {branches.map((b) => (
            <div key={b.code} className="flex items-start gap-4">
              <div className="w-0.5 self-stretch bg-[var(--lp-accent)]/30 rounded-full shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-sm text-[var(--lp-text)]">{b.name}</p>
                <p className="text-xs text-[var(--lp-text)]/50 mt-0.5">{b.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
