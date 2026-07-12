'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function ClinicalEditorialPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [featured, ...rest] = suggestedPrograms;

  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-programs)] flex items-center justify-center px-6 py-20">
      <div className="max-w-3xl w-full flex flex-col gap-8">
        <h2 className="font-serif text-3xl md:text-4xl text-[var(--lp-text)] text-center">
          Liệu trình dành cho bạn
        </h2>

        {featured && (
          <div className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/20 bg-[var(--lp-bg-card)] p-6 md:p-8 flex flex-col gap-3">
            <p className="font-bold text-base text-[var(--lp-text)]">
              {featured.program.name}
            </p>
            {featured.program.description && (
              <p className="text-sm text-[var(--lp-text)]/55 leading-relaxed max-w-lg">
                {featured.program.description}
              </p>
            )}
            <div>
              <CtaButton
                onClick={() => onContinue(featured.program.id as ProgramId)}
                size="sm"
              >
                Chọn liệu trình này →
              </CtaButton>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="flex flex-col gap-3">
            {rest.map((sp) => (
              <div
                key={sp.program.id}
                className="rounded-[var(--lp-radius-card)] border border-[var(--lp-accent)]/10 bg-[var(--lp-bg-card)] p-4 flex items-center justify-between gap-4"
              >
                <p className="font-bold text-sm text-[var(--lp-text)]">
                  {sp.program.name}
                </p>
                <button
                  onClick={() => onContinue(sp.program.id as ProgramId)}
                  className="shrink-0 text-xs font-bold text-[var(--lp-accent)] border border-[var(--lp-accent)]/30 rounded-lg px-3 py-1.5 hover:bg-[var(--lp-accent)]/10 transition-colors"
                >
                  Chọn →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
