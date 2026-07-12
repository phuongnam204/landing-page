'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulClassicPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  return (
    <div className="bg-[var(--lp-bg-programs)] py-12 px-5">
      <div className="max-w-2xl mx-auto">
        <h2 className="font-extrabold text-2xl md:text-3xl text-cta text-center mb-2">
          Liệu trình dành cho bạn
        </h2>
        <p className="text-sm md:text-base text-cta/60 text-center mb-8">
          Dựa trên kết quả phân tích da
        </p>

        <div className="flex flex-col gap-4">
          {suggestedPrograms.map(sp => (
            <div
              key={sp.program.id}
              className="bg-[var(--lp-bg-card)] rounded-lg border border-[var(--lp-border)] p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base md:text-lg text-cta">{sp.program.name}</h3>
                {sp.score >= 2 && (
                  <span className="text-xs font-semibold bg-[var(--lp-pastel-pink)] text-[var(--lp-accent)] rounded-full px-2.5 py-0.5">
                    Gợi ý
                  </span>
                )}
              </div>
              {sp.program.description && (
                <p className="text-sm text-cta/60 leading-relaxed line-clamp-2">
                  {sp.program.description}
                </p>
              )}
              <CtaButton
                onClick={() => onContinue(sp.program.id as ProgramId)}
                size="sm"
                className="self-start mt-1"
              >
                Chọn liệu trình này →
              </CtaButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
