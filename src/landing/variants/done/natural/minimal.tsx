'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function NaturalMinimalDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] flex items-center justify-center px-5 overflow-hidden">
      <div className="max-w-md w-full flex flex-col items-center gap-5 text-center animate-fade-in-up">
        <h2 className="font-bold text-lg md:text-xl text-cta">
          Đã nhận thông tin của bạn!
        </h2>
        <p className="text-sm text-cta/60 leading-relaxed max-w-xs">
          Chuyên viên o2skin sẽ liên hệ trong vòng{' '}
          <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
        </p>
        <div className="w-full pt-4 border-t border-cta/10">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-3">
            Chi nhánh o2skin
          </p>
          <div className="flex flex-col gap-1.5">
            {branches.map((b) => (
              <p key={b.code} className="text-sm text-cta/70">
                {b.name}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
