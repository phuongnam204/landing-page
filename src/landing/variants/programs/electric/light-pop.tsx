'use client';
import type { ProgramsSlotProps } from '../../../slots';
import type { ProgramId } from '../../../../content/programs';

export function ElectricLightPopPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  return (
    <div className="py-12 px-5" style={{ background: '#fdf4ff' }}>
      <div className="max-w-2xl mx-auto">
        <h2 className="font-extrabold text-2xl md:text-3xl text-center mb-2" style={{ color: '#1a0533' }}>
          Liệu trình dành cho bạn
        </h2>
        <p className="text-sm md:text-base text-center mb-8" style={{ color: 'rgba(26,5,51,.6)' }}>
          Dựa trên kết quả phân tích da
        </p>

        <div className="flex flex-col gap-4">
          {suggestedPrograms.map(sp => (
            <div
              key={sp.program.id}
              className="rounded-lg p-5 flex flex-col gap-3"
              style={{ background: '#ffffff', border: '1px solid rgba(126,34,206,.15)' }}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base md:text-lg" style={{ color: '#1a0533' }}>{sp.program.name}</h3>
                {sp.score >= 2 && (
                  <span className="text-xs font-semibold rounded-full px-2.5 py-0.5" style={{ background: 'rgba(219,39,119,.1)', color: '#db2777' }}>
                    Gợi ý
                  </span>
                )}
              </div>
              {sp.program.description && (
                <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'rgba(26,5,51,.6)' }}>
                  {sp.program.description}
                </p>
              )}
              <button
                onClick={() => onContinue(sp.program.id as ProgramId)}
                className="self-start mt-1 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer"
                style={{ background: '#db2777', color: '#fff' }}
              >
                Chọn liệu trình này →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
