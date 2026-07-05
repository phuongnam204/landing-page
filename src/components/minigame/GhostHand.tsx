// Bàn tay ma demo thao tác. `className` mang animation loop cụ thể của từng pha.
export function GhostHand({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`absolute z-20 pointer-events-none ${className ?? ''}`} style={style}>
      <svg width="46" height="60" viewBox="0 0 46 60" fill="none" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.25))' }}>
        <path d="M13 31 Q13 20 20 20 L31 20 Q38 20 38 31 L38 48 Q38 57 28 57 L24 57 Q13 57 13 48 Z" fill="white" fillOpacity="0.92" stroke="rgba(45,38,64,0.5)" strokeWidth="1.4" />
        <path d="M20 20 Q20 7 24 7 Q28 7 28 20 Z" fill="white" fillOpacity="0.92" stroke="rgba(45,38,64,0.5)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}
