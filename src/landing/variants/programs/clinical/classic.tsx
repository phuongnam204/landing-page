'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function ClinicalClassicPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-5 py-16">
      <div className="max-w-3xl w-full flex flex-col gap-6">
        <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--lp-text)] text-center">
          Liệu trình dành cho bạn
        </h2>
        <div className="flex flex-col gap-3">
          {suggestedPrograms.map((sp) => (
            <div
              key={sp.program.id}
              className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/15 bg-[var(--lp-bg-card)] p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-[var(--lp-text)] truncate">
                  {sp.program.name}
                </p>
                {sp.program.description && (
                  <p className="text-xs text-[var(--lp-text)]/50 mt-0.5 truncate">
                    {sp.program.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => onContinue(sp.program.id as ProgramId)}
                className="shrink-0 text-xs font-bold text-[var(--lp-accent)] border border-[var(--lp-accent)]/30 rounded-lg px-3 py-1.5 hover:bg-[var(--lp-accent)]/10 transition-colors"
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
