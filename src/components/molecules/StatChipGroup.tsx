import { StatChip } from '../atoms/StatChip';

interface StatChipGroupProps {
  zoneLabel: string;
  triggerNote?: string;
}

export function StatChipGroup({ zoneLabel, triggerNote }: StatChipGroupProps) {
  if (!zoneLabel && !triggerNote) return null;
  return (
    <div className="mb-4">
      <p className="text-sm md:text-base text-cta/60 mb-2">Sau khi soi da của bạn:</p>
      {zoneLabel && (
        <div className="flex flex-wrap gap-2 mb-2.5">
          <StatChip dotColor="var(--lp-accent)" animationDelay="0.68s">
            da bạn hay bị ở <b>{zoneLabel}</b>
          </StatChip>
        </div>
      )}
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
