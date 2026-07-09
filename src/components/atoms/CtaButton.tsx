'use client';

type CtaButtonVariant = 'primary' | 'secondary' | 'accent';
type CtaButtonSize = 'sm' | 'md' | 'lg';

interface CtaButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: CtaButtonVariant;
  size?: CtaButtonSize;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

const SIZE: Record<CtaButtonSize, string> = {
  sm:  'py-2.5 px-6 text-xs',
  md:  'py-3.5 px-9 text-sm',
  lg:  'py-4 px-10 text-base',
};

const VARIANT: Record<CtaButtonVariant, string> = {
  primary:   'bg-cta text-white hover:opacity-90',
  secondary: 'bg-white text-cta border-2 border-[var(--lp-border)] hover:bg-[var(--lp-bg-hero)]',
  accent:    'bg-[var(--lp-accent)] text-white hover:opacity-90',
};

export function CtaButton({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
}: CtaButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        'font-bold rounded-soft transition-opacity duration-200',
        'disabled:opacity-60 flex items-center justify-center gap-2',
        SIZE[size],
        VARIANT[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {children}
    </button>
  );
}
