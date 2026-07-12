'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function PlayfulMinimalDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center justify-center py-12 px-5">
      <div className="max-w-lg w-full text-center animate-fade-in-up">
        <h1 className="font-extrabold text-xl md:text-2xl text-cta mb-2">
          Đã nhận yêu cầu!
        </h1>
        <p className="text-sm md:text-base text-cta/70 leading-relaxed mb-8">
          Đội ngũ o2skin sẽ liên hệ trong vòng <b className="text-cta">30 phút</b> để xác nhận lịch hẹn.
        </p>

        <div className="flex flex-col gap-2">
          {branches.map(b => (
            <p key={b.code} className="text-sm text-cta">
              <span className="font-semibold">{b.name}</span>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
