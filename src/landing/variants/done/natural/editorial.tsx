'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function NaturalEditorialDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 py-12 overflow-hidden">
      <div className="max-w-lg w-full flex flex-col gap-8 animate-fade-in-up">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <svg viewBox="0 0 48 48" className="w-12 h-12 text-[var(--lp-accent)]" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-cta italic mb-3">
            Đã nhận thông tin của bạn!
          </h2>
          <p className="text-sm md:text-base text-cta/60 leading-relaxed max-w-sm mx-auto">
            Chuyên viên o2skin sẽ liên hệ trong vòng{' '}
            <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>

        <div className="bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] p-6 shadow-lg shadow-cta/10">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-4">
            Chi nhánh o2skin
          </p>
          <div className="flex flex-col gap-3">
            {branches.map((b) => (
              <div key={b.code} className="border-l-2 border-[var(--lp-accent)] pl-4 py-1">
                <p className="text-sm font-semibold text-cta">{b.name}</p>
                <p className="text-xs text-cta/55 mt-0.5">{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
