type BgVar =
  | '--lp-bg-hero'
  | '--lp-bg-minigame'
  | '--lp-bg-payoff'
  | '--lp-bg-programs'
  | '--lp-bg-card';

interface SectionShellProps {
  children: React.ReactNode;
  bgVar: BgVar;
  center?: boolean;
  overflow?: 'hidden' | 'auto' | 'visible';
  className?: string;
}

export function SectionShell({
  children,
  bgVar,
  center = false,
  overflow = 'hidden',
  className = '',
}: SectionShellProps) {
  return (
    <div
      className={[
        'h-[100dvh] w-full relative px-5',
        center ? 'flex items-center justify-center' : '',
        overflow === 'hidden' ? 'overflow-hidden'
          : overflow === 'auto' ? 'overflow-y-auto'
          : '',
        className,
      ].filter(Boolean).join(' ')}
      style={{ background: `var(${bgVar})` }}
    >
      {children}
    </div>
  );
}
