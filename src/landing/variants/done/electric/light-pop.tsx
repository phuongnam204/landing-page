'use client';
import type { DoneSlotProps } from '../../../slots';
import { branches } from '../../../../content/branches';

export function ElectricLightPopDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <div className="min-h-[100dvh] flex items-center justify-center py-12 px-5" style={{ background: '#fdf4ff' }}>
      <div className="max-w-lg w-full animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-12 h-12" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" fill="#f3e8ff" stroke="#7e22ce" strokeWidth="2.5" strokeOpacity="0.6" />
              <path d="M14 25l7 7 13-14" stroke="#7e22ce" strokeWidth="2.5" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-xl md:text-2xl mb-2" style={{ color: '#1a0533' }}>
            Đã nhận yêu cầu!
          </h1>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: 'rgba(26,5,51,.7)' }}>
            Đội ngũ o2skin sẽ liên hệ trong vòng <b style={{ color: '#1a0533' }}>30 phút</b> để xác nhận lịch hẹn.
          </p>
        </div>

        <div className="rounded-lg p-5" style={{ background: '#ffffff', border: '1px solid rgba(126,34,206,.15)' }}>
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(26,5,51,.4)' }}>Chi nhánh o2skin</p>
          <div className="flex flex-col gap-3">
            {branches.map(b => (
              <div key={b.code} className="flex flex-col">
                <p className="text-sm font-semibold" style={{ color: '#1a0533' }}>{b.name}</p>
                <p className="text-xs" style={{ color: 'rgba(26,5,51,.6)' }}>{b.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
