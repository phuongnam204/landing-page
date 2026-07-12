'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function NaturalSpaDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-8 py-20 overflow-hidden">
      <div className="max-w-lg w-full flex flex-col items-center gap-8 animate-fade-in-up">
        <div className="text-center">
          <div className="flex items-center justify-center mb-5">
            <svg viewBox="0 0 64 64" className="w-20 h-20 text-[var(--lp-accent)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="32" cy="32" r="28" strokeOpacity="0.2" />
              <circle cx="32" cy="32" r="28" strokeDasharray="176" strokeDashoffset="176" style={{ animation: 'dashIn 0.8s ease-out forwards', strokeOpacity: 0.7 }} />
              <path d="M20 33l9 9 15-17" style={{ animation: 'fadeIn 0.4s ease-out 0.6s both' }} />
            </svg>
          </div>
          <h2 className="font-extrabold text-2xl md:text-3xl text-cta mb-3">
            Đã nhận thông tin của bạn!
          </h2>
          <p className="text-base text-cta/55 leading-relaxed max-w-sm mx-auto">
            Chuyên viên o2skin sẽ liên hệ trong vòng{' '}
            <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>

        <div className="w-full">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-4 text-center">
            Chi nhánh o2skin
          </p>
          <div className="flex flex-col gap-3">
            {branches.map((b) => (
              <div key={b.code} className="text-center py-3">
                <p className="font-semibold text-sm text-cta">{b.name}</p>
                <p className="text-xs text-cta/50 mt-0.5">{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
