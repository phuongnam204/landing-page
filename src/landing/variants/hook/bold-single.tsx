'use client';
import type { HookSlotProps } from '../../slots';

function PhoneMockup() {
  return (
    <div className="relative w-32 h-52 md:w-52 md:h-[420px]">
      <div className="absolute inset-0 bg-cta rounded-[1.5rem] md:rounded-[2.5rem] shadow-xl md:shadow-2xl shadow-cta/25 md:shadow-cta/30" />
      <div className="absolute inset-[2px] md:inset-[3px] bg-[var(--lp-bg-minigame)] rounded-[1.35rem] md:rounded-[2.3rem] overflow-hidden flex flex-col items-center justify-center gap-1.5 md:gap-3 px-3 md:px-5">
        <div className="absolute top-1.5 md:top-2.5 left-1/2 -translate-x-1/2 w-7 md:w-10 h-1 md:h-1.5 bg-cta/30 rounded-full" />
        <p className="text-[8px] md:text-[11px] font-bold text-cta/50 text-center">Bạn hay bị mụn ở đâu?</p>
        <svg viewBox="0 0 100 130" className="w-12 h-16 md:w-24 md:h-32" fill="none">
          <ellipse cx="50" cy="65" rx="38" ry="52" stroke="currentColor" strokeWidth="1.5" className="text-cta/20" />
          <ellipse cx="12" cy="65" rx="5" ry="9" stroke="currentColor" strokeWidth="1" className="text-cta/15" />
          <ellipse cx="88" cy="65" rx="5" ry="9" stroke="currentColor" strokeWidth="1" className="text-cta/15" />
          <ellipse cx="36" cy="50" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1" className="text-cta/20" />
          <ellipse cx="64" cy="50" rx="7" ry="4.5" stroke="currentColor" strokeWidth="1" className="text-cta/20" />
          <path d="M44 63 Q50 69 56 63" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-cta/15" />
          <path d="M38 84 Q50 92 62 84" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-cta/15" />
          <ellipse cx="50" cy="22" rx="23" ry="9" fill="currentColor" fillOpacity="0.15" className="text-violet-500" />
          <ellipse cx="50" cy="97" rx="29" ry="11" fill="currentColor" fillOpacity="0.15" className="text-pink-500" />
        </svg>
        <p className="text-[7px] md:text-[10px] text-cta/35 text-center leading-relaxed">
          Chạm vào vùng da<br />bạn hay có mụn nhất
        </p>
        <div className="w-14 md:w-28 h-5 md:h-8 bg-cta/10 rounded-lg md:rounded-xl flex items-center justify-center">
          <span className="text-[7px] md:text-[10px] font-bold text-cta/40">Tiếp theo →</span>
        </div>
      </div>
    </div>
  );
}

export function BoldSingleHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-screen w-full bg-gradient-to-br from-[var(--lp-bg-hero)] via-[var(--lp-bg-minigame)] to-[var(--lp-bg-payoff)] flex items-center overflow-hidden px-6">
      <div className="max-w-6xl mx-auto w-full flex flex-col items-center gap-6 md:grid md:grid-cols-2 md:gap-16 md:items-center">

        {/* Text block */}
        <div className="flex flex-col gap-4 md:gap-5 animate-fade-in-up text-center md:text-left items-center md:items-start">
          <h1 className="font-extrabold text-4xl md:text-7xl text-cta leading-[1.05] tracking-tight">
            Da bạn đang{' '}
            <span className="bg-gradient-to-r from-violet-500 to-pink-500 bg-clip-text text-transparent">
              nói gì
            </span>{' '}
            với bạn?
          </h1>
          <p className="text-sm md:text-base text-cta/55 max-w-xs leading-relaxed">
            Chỉ mất 60 giây để biết da bạn thực sự cần gì.
          </p>
          <button
            onClick={onStart}
            className="bg-cta text-white font-bold rounded-soft px-10 py-4 text-base md:text-lg hover:opacity-90 transition-opacity duration-200"
          >
            Khám phá ngay →
          </button>
        </div>

        {/* Phone mockup — small on mobile, large on desktop */}
        <div className="flex justify-center items-center">
          <PhoneMockup />
        </div>
      </div>
    </div>
  );
}
