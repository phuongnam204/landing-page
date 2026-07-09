import { ColoredDot } from './ColoredDot';

interface StatChipProps {
  dotColor: string;
  children: React.ReactNode;
  animationDelay?: string;
}

export function StatChip({ dotColor, children, animationDelay }: StatChipProps) {
  return (
    <span
      className="payoff-stat-chip inline-flex items-center gap-1.5 rounded-full bg-cta/5 px-3 py-1.5 text-sm font-semibold text-cta"
      style={animationDelay ? { animationDelay } : undefined}
    >
      <ColoredDot color={dotColor} />
      {children}
    </span>
  );
}
