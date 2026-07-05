import type { ReactNode } from 'react';

// Lớp ngoài cùng — nền pastel + blob (light) / navy đậm + blob mờ (dark). Ổn định qua các phase.
export function BrandCanvas({ children }: { children: ReactNode }) {
  return (
    <div
      className="h-screen w-full relative overflow-hidden flex items-center justify-center"
      style={{ background: 'linear-gradient(135deg,#FDE7F1 0%,#EDE9FF 55%,#E4FBF1 100%)' }}
    >
      {/* Light blobs */}
      <span className="mg-blob dark:hidden" style={{ width: 220, height: 220, background: '#FFB8D4', left: -40, top: -30 }} />
      <span className="mg-blob dark:hidden" style={{ width: 180, height: 180, background: '#B39DFF', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob dark:hidden" style={{ width: 140, height: 140, background: '#8FE3BC', left: '12%', bottom: -30, animationDelay: '4s' }} />
      {/* Dark blobs */}
      <span className="mg-blob hidden dark:block" style={{ width: 220, height: 220, background: '#4c1d95', left: -40, top: -30 }} />
      <span className="mg-blob hidden dark:block" style={{ width: 180, height: 180, background: '#1e40af', right: -30, bottom: '10%', animationDelay: '2s' }} />
      <span className="mg-blob hidden dark:block" style={{ width: 140, height: 140, background: '#312e81', left: '12%', bottom: -30, animationDelay: '4s' }} />
      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none hidden dark:block"
        style={{ background: 'linear-gradient(135deg,#0f0c1a 0%,#1a1030 55%,#0f0c1a 100%)' }}
      />
      <div className="relative z-10 w-full flex items-center justify-center px-4">{children}</div>
    </div>
  );
}

// Khung game bo góc, canh giữa, KHÔNG edge-to-edge.
export function GameFrame({ children }: { children: ReactNode }) {
  return (
    <div className="w-[92vw] max-w-[880px] max-h-[90vh] rounded-[28px] shadow-2xl overflow-hidden bg-white dark:bg-[#2D2640]">
      {children}
    </div>
  );
}
