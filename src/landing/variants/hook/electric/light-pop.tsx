'use client';
import type { HookSlotProps } from '../../../slots';

export function ElectricLightPopHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full relative flex items-center justify-center overflow-hidden" style={{ background: '#fdf4ff' }}>
      <div className="max-w-2xl mx-auto w-full px-5 relative z-10 text-center animate-fade-in-up">
        <div className="inline-block mb-6 px-4 py-1.5 rounded-full" style={{ background: 'rgba(219,39,119,.08)', border: '1px solid rgba(219,39,119,.15)' }}>
          <span className="text-sm font-medium" style={{ color: '#db2777' }}>Phân tích vùng da</span>
        </div>

        <h1 className="font-extrabold text-4xl md:text-6xl leading-tight mb-5" style={{ color: '#1a0533' }}>
          Da bạn<br />
          <span style={{ color: '#db2777' }}>đang nói gì</span>?
        </h1>

        <p className="text-base md:text-lg max-w-md mx-auto mb-8 leading-relaxed" style={{ color: 'rgba(26,5,51,.6)' }}>
          Chỉ mất 60 giây để làn da bạn được&ldquo;nghe&rdquo; — và tìm ra điều thực sự cần thiết.
        </p>

        <button
          onClick={onStart}
          className="px-8 py-3.5 rounded-full font-bold text-base transition-all duration-200 cursor-pointer"
          style={{
            background: '#db2777',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(219,39,119,.25)',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 6px 20px rgba(219,39,119,.35)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 14px rgba(219,39,119,.25)'; }}
        >
          Soi da ngay
        </button>
      </div>
    </div>
  );
}
