interface ColoredDotProps {
  color: string;
  size?: 'sm' | 'md';
}

const DOT_SIZE = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5' };

export function ColoredDot({ color, size = 'md' }: ColoredDotProps) {
  return (
    <span
      className={`inline-block ${DOT_SIZE[size]} rounded-full shrink-0`}
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
