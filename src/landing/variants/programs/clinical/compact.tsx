'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';

export function ClinicalCompactPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full flex flex-col gap-4">
        <h2 className="font-extrabold text-xl text-[var(--lp-text)] text-center">
          Liệu trình dành cho bạn
        </h2>
        <div className="flex flex-col gap-2">
          {suggestedPrograms.map((sp) => (
            <div
              key={sp.program.id}
              className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] p-3 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[var(--lp-text)] truncate">
                  {sp.program.name}
                </p>
              </div>
              <button
                onClick={() => onContinue(sp.program.id as ProgramId)}
                className="shrink-0 text-xs font-bold text-[var(--lp-accent)] border border-[var(--lp-accent)]/30 rounded-lg px-3 py-1 hover:bg-[var(--lp-accent)]/10 transition-colors"
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
