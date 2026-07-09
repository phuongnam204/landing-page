interface BridgeBlockProps {
  children: React.ReactNode;
  tone?: 'neutral' | 'accent';
}

export function BridgeBlock({ children, tone = 'accent' }: BridgeBlockProps) {
  const styles =
    tone === 'accent'
      ? 'bg-[var(--lp-accent)]/5 border-[var(--lp-accent)]'
      : 'bg-[var(--lp-bg-hero)] border-[var(--lp-border)]';
  return (
    <p className={`text-sm md:text-base text-cta/70 leading-snug px-3 py-2.5 border-l-2 rounded-r-lg ${styles}`}>
      {children}
    </p>
  );
}
