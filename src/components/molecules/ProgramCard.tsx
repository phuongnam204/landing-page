import type { Program } from '../../content/programs';
import { getConditionById } from '../../content/catalog';
import { ColoredDot } from '../atoms/ColoredDot';

interface ProgramCardProps {
  program: Program;
  selected: boolean;
  isSuggested: boolean;
  onSelect: () => void;
  style?: React.CSSProperties;
}

export function ProgramCard({ program, selected, isSuggested, onSelect, style }: ProgramCardProps) {
  const cond = getConditionById(program.treatsConditions[0]);
  const tint = cond?.color ?? '#A0AEC0';
  return (
    <button
      onClick={onSelect}
      style={style}
      className={[
        'ps-cardUp text-left rounded-soft shadow-md shadow-cta/10 flex flex-col overflow-hidden border-2 transition-colors duration-[160ms]',
        selected ? 'border-[var(--lp-accent)]' : 'border-transparent',
      ].join(' ')}
    >
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${tint}CC` }}>
        <div className="font-bold text-base text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>
          {program.name}
        </div>
        {selected && <span className="font-bold text-sm text-white" aria-label="Da chon">✓</span>}
      </div>
      <div
        className="px-4 py-3 flex flex-col gap-2 flex-1"
        style={{ background: selected ? `${tint}0A` : 'var(--lp-bg-card)' }}
      >
        {program.isVip && (
          <span className="self-start inline-flex items-center rounded-full bg-[var(--lp-accent)]/10 px-2 py-0.5 text-xs font-bold text-[var(--lp-accent)]">
            VIP
          </span>
        )}
        <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {program.treatsConditions.map(cid => {
            const c = getConditionById(cid);
            return (
              <span
                key={cid}
                className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{
                  background: c ? `${c.color}30` : '#e8e8e8',
                  color: c ? c.color : '#555',
                  filter: c ? 'brightness(0.82)' : 'none',
                }}
              >
                <ColoredDot color={c?.color ?? '#999'} size="sm" />
                {c?.label ?? cid}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
