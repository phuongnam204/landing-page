'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function ClinicalDashboardDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 py-16">
      <div className="max-w-2xl w-full animate-fade-in-up">
        <div className="text-center mb-8">
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
          <p className="text-sm text-[var(--lp-text)]/60">
            Chuyên viên O2Skin sẽ liên hệ trong vòng <strong className="text-[var(--lp-text)]">24 giờ</strong>.
          </p>
        </div>
        <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr] text-xs font-bold text-[var(--lp-text)]/50 uppercase tracking-wider border-b-2 border-[var(--lp-accent)]/20 px-4 py-2.5">
            <span>Tên chi nhánh</span>
            <span>Địa chỉ</span>
          </div>
          {branches.map((b, i) => (
            <div
              key={b.code}
              className={`grid grid-cols-[1fr_2fr] text-sm px-4 py-3 ${i < branches.length - 1 ? 'border-b border-[var(--lp-accent)]/10' : ''}`}
            >
              <span className="font-semibold text-[var(--lp-text)]">{b.name}</span>
              <span className="text-[var(--lp-text)]/60">{b.address}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
