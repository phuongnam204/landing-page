import type { ReactNode } from 'react';

// Lớp ngoài cùng — nền pastel + blob (light) / navy đậm + blob mờ (dark). Ổn định qua các phase.
export function BrandCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg, var(--lp-bg-hero) 0%, var(--lp-bg-minigame) 55%, var(--lp-bg-payoff) 100%)' }}
    >
      <span className="mg-blob" style={{ width: 220, height: 220, background: 'var(--lp-blob-1)', left: -40, top: -30 }} />
      <span className="mg-blob" style={{ width: 180, height: 180, background: 'var(--lp-blob-2)', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob" style={{ width: 140, height: 140, background: 'var(--lp-blob-3)', left: '12%', bottom: -30, animationDelay: '4s' }} />
      <div className="relative z-10 w-full flex items-center justify-center px-4">{children}</div>
    </div>
  );
}

// Khung game bo góc, canh giữa, KHÔNG edge-to-edge.
export function GameFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[92vw] max-w-[880px] max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden bg-[var(--lp-bg-card,#ffffff)]">
      {children}
    </div>
  );
}
