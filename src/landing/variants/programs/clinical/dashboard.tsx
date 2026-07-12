'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';

export function ClinicalDashboardPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-5 py-16">
      <div className="max-w-3xl w-full flex flex-col gap-6">
        <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--lp-text)] text-center">
          Liệu trình dành cho bạn
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {suggestedPrograms.map((sp) => (
            <div
              key={sp.program.id}
              className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] p-4 flex flex-col gap-2"
            >
              <p className="font-bold text-sm text-[var(--lp-text)]">
                {sp.program.name}
              </p>
              <span className="inline-flex items-center self-start rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-2 py-0.5">
                Hiệu quả cao
              </span>
              <button
                onClick={() => onContinue(sp.program.id as ProgramId)}
                className="mt-auto text-xs font-bold text-[var(--lp-accent)] border border-[var(--lp-accent)]/30 rounded-lg px-3 py-1.5 hover:bg-[var(--lp-accent)]/10 transition-colors"
              >
                Chọn →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
