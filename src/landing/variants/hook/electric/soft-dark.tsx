'use client';
import type { HookSlotProps } from '../../../slots';

export function ElectricSoftDarkHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] relative flex items-center justify-center overflow-hidden">
      <div className="max-w-2xl mx-auto w-full px-5 relative z-10 text-center animate-fade-in-up">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full" style={{ background: 'rgba(219,39,119,.12)', border: '1px solid rgba(219,39,119,.2)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--lp-accent)' }}>Phân tích vùng da</span>
        </div>

        <h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-5" style={{ color: 'var(--lp-primary)' }}>
          Da bạn<br />
          <span style={{ color: 'var(--lp-accent)' }}>đang nói gì</span>?
        </h1>

        <p className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'rgba(240,230,255,.7)' }}>
          Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
        </p>

        <button
          onClick={onStart}
          className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer"
          style={{
            background: 'var(--lp-accent)',
            color: '#fff',
            boxShadow: '0 0 12px rgba(219,39,119,.3)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(219,39,119,.5)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(219,39,119,.3)'; }}
        >
          Soi da ngay
        </button>
      </div>
    </div>
  );
}
