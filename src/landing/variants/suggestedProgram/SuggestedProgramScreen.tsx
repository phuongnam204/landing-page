'use client';
import type { ScoredProgram } from '../../../content/recommend';
import { getConditionById, getAllConditionIds } from '../../../content/catalog';
import { SectionShell } from '../../../components/atoms/SectionShell';
import { CtaButton } from '../../../components/atoms/CtaButton';
import { ColoredDot } from '../../../components/atoms/ColoredDot';

function ProgramHighlightCard({ sp }: { sp: ScoredProgram }) {
  const { program } = sp;
  const cond = getConditionById(program.primaryConditionIds[0]);
  const tint = cond?.color ?? '#A0AEC0';
  const allConds = getAllConditionIds(program)
    .map(id => getConditionById(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  return (
    <div
      className="w-full max-w-sm rounded-soft overflow-hidden shadow-lg shadow-cta/10 border-2"
      style={{ borderColor: 'var(--lp-accent)' }}
    >
      {/* Color header */}
      <div className="px-5 py-4" style={{ background: `${tint}CC` }}>
        <p className="font-extrabold text-lg text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>
          {program.name}
        </p>
        {program.isVip && (
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white">VIP</span>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 flex flex-col gap-3 bg-[var(--lp-bg-card)]">
        <p className="text-sm text-cta/75 leading-relaxed">{program.description}</p>

        {program.summary && program.summary.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {program.summary.slice(0, 3).map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-cta/80">
                <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ background: `${tint}25` }}>
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden="true">
                    <path d="M1.5 4l2 2 3-3" stroke={tint} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {s}
              </li>
            ))}
          </ul>
        )}

        {allConds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {allConds.map(c => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: `${c.color}30`, color: c.color, filter: 'brightness(0.82)' }}
              >
                <ColoredDot color={c.color} size="sm" />
                {c.label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export interface SuggestedProgramScreenProps {
  suggestedPrograms: ScoredProgram[];
  onConfirm: () => void;
  onBrowse: () => void;
}

export function SuggestedProgramScreen({ suggestedPrograms, onConfirm, onBrowse }: SuggestedProgramScreenProps) {
  const top = suggestedPrograms[0];

  return (
    <SectionShell bgVar="--lp-bg-payoff" overflow="auto">
      <div className="min-h-full flex flex-col items-center justify-center px-5 py-12 gap-6 animate-fade-in-up">

        {/* Heading */}
        <div className="text-center max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--lp-accent)' }}>
            Liệu trình phù hợp nhất với bạn
          </p>
          <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-snug [text-wrap:balance]">
            Chúng tôi đã tìm ra liệu trình cho bạn
          </h2>
        </div>

        {/* Program card */}
        {top && <ProgramHighlightCard sp={top} />}

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
          <CtaButton fullWidth onClick={onConfirm}>
            Đặt lịch với liệu trình này
          </CtaButton>
          <button
            onClick={onBrowse}
            className="text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-70"
            style={{ color: 'var(--lp-accent)' }}
          >
            Khám khảo các liệu trình khác
          </button>
        </div>

      </div>
    </SectionShell>
  );
}
