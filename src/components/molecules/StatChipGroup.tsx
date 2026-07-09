import { StatChip } from '../atoms/StatChip';

interface StatChipGroupProps {
  foundCount: number;
  zoneLabel: string;
  triggerNote?: string;
}

const CHIPS = [
  { key: 'found', color: '#FF5C9E', delay: '0.5s' },
  { key: 'zone',  color: '#B39DFF', delay: '0.68s' },
];

export function StatChipGroup({ foundCount, zoneLabel, triggerNote }: StatChipGroupProps) {
  return (
    <div className="mb-4">
      <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
      <div className="flex flex-wrap gap-2 mb-2.5">
        <StatChip dotColor={CHIPS[0].color} animationDelay={CHIPS[0].delay}>
          đã soi <b>{foundCount}</b> nốt mụn
        </StatChip>
        <StatChip dotColor={CHIPS[1].color} animationDelay={CHIPS[1].delay}>
          da bạn hay bị ở <b>{zoneLabel}</b>
        </StatChip>
      </div>
      {triggerNote && (
        <p
          className="payoff-stat-chip text-xs md:text-sm text-cta/80 bg-[var(--lp-accent)]/5 border border-[var(--lp-border)] rounded-lg px-3 py-2 leading-relaxed"
          style={{ animationDelay: '0.86s' }}
        >
          {triggerNote}
        </p>
      )}
    </div>
  );
}
