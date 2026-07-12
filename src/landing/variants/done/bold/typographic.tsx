'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function BoldTypographicDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full flex flex-col overflow-hidden">
      <div
        className="py-12 md:py-16 text-center px-5"
        style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
      >
        <div className="flex items-center justify-center mb-4">
          <svg viewBox="0 0 48 48" className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--lp-band-accent)' }}>
            <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
            <circle cx="24" cy="24" r="21" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
            <path d="M14 25l7 7 13-14" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
          </svg>
        </div>
        <h2 className="font-extrabold text-5xl md:text-7xl tracking-tight mb-3">
          ĐÃ NHẬN!
        </h2>
        <p className="text-sm md:text-base opacity-80 leading-relaxed max-w-md mx-auto">
          Chuyên viên o2skin sẽ liên hệ trong vòng <b>24 giờ</b> để tư vấn và đặt lịch phù hợp.
        </p>
      </div>
      <div
        className="flex-1 flex items-start justify-center px-5 py-10"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-[var(--lp-radius-card)] p-6 md:p-8 shadow-lg">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-3">
            Chi nhánh o2skin
          </p>
          <div className="flex flex-col gap-2">
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
