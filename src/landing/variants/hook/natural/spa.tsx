'use client';
import type { HookSlotProps } from '../../../slots';

const ARC_FILL = 'M 0 0 L 50 0 C 54 0, 57 25, 57 50 C 57 75, 54 100, 50 100 L 0 100 Z';
const ARC_LINE = 'M 50 0 C 54 0, 57 25, 57 50 C 57 75, 54 100, 50 100';

// Dark Blush palette
const C = {
  panel:   '#221318',
  heading: '#F4ECF0',
  accent:  '#ECA0B8',
  sub:     '#AA8898',
  gold:    '#C4A038',
  ctaBg:   '#F0AABF',
  ctaText: '#221318',
};

function OrnamentDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <div className="flex-1" style={{ height: '0.5px', background: C.gold, opacity: 0.5 }} />
      <span style={{ color: C.gold, opacity: 0.65, fontSize: '10px', lineHeight: 1 }}>✦</span>
      <div className="flex-1" style={{ height: '0.5px', background: C.gold, opacity: 0.5 }} />
    </div>
  );
}

function LeafIcon({ color }: { color: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  );
}

export function NaturalSpaHook({ onStart, copy }: HookSlotProps) {
  const heading       = copy?.heading       ?? 'Da nhạy cảm';
  const headingAccent = copy?.headingAccent ?? 'không phải bạn phải sống chung mãi.';
  const subtext       = copy?.subtext       ?? 'Khi hàng rào bảo vệ được phục hồi đúng cách, da ngừng phản ứng quá mức — và bạn không còn phải lo mỗi lần thử sản phẩm mới.';
  const cta           = copy?.cta           ?? 'Tìm giải pháp cho da tôi';

  return (
    <section
      className="relative min-h-[100dvh] w-full overflow-hidden"
      style={{ background: C.panel }}
      aria-label="Giới thiệu"
    >
      <style>{`
        @keyframes v14-bg-in {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes v14-content-in {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .v14-bg-anim, .v14-content-anim { animation: none !important; }
        }
      `}</style>

      {/* Desktop background */}
      <div
        className="v14-bg-anim hidden md:block absolute inset-0"
        style={{
          backgroundImage: 'url(/image-hook/sunscreen-hadaare5.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          animation: 'v14-bg-in 900ms ease-out both',
        }}
        aria-hidden="true"
      />

      {/* Mobile background */}
      <div
        className="v14-bg-anim md:hidden absolute inset-0"
        style={{
          backgroundImage: 'url(/image-hook/sunscreen-hadaare5.jpg)',
          backgroundSize: 'auto 65dvh',
          backgroundPosition: 'right top',
          backgroundRepeat: 'no-repeat',
          animation: 'v14-bg-in 900ms ease-out both',
        }}
        aria-hidden="true"
      />

      {/* Dark blush panel + gold arc */}
      <svg
        className="hidden md:block absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="v14-panel" x1="0" y1="0" x2="57" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={C.panel} />
            <stop offset="78%"  stopColor={C.panel} />
            <stop offset="100%" stopColor={C.panel} stopOpacity="0.94" />
          </linearGradient>
        </defs>
        <path d={ARC_FILL} fill="url(#v14-panel)" />
        <path d={ARC_LINE} fill="none" stroke={C.gold} strokeWidth="0.22" opacity="0.75" />
      </svg>

      {/* Mobile dark scrim */}
      <div
        className="md:hidden absolute inset-x-0 bottom-0"
        style={{
          height: '55%',
          background: `linear-gradient(to top, ${C.panel} 60%, rgba(34,19,24,0.92) 85%, transparent 100%)`,
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 min-h-[100dvh] flex flex-col">

        {/* Desktop */}
        <div
          className="v14-content-anim hidden md:flex flex-1 items-center"
          style={{ maxWidth: '49%', paddingLeft: 'clamp(32px, 6vw, 96px)', paddingRight: '3%', animation: 'v14-content-in 700ms ease-out 250ms both' }}
        >
          <div className="flex flex-col gap-5 w-full">
            <OrnamentDivider />
            <h1
              className="font-extrabold leading-tight"
              style={{ fontSize: 'clamp(26px, 3.2vw, 50px)', color: C.heading }}
            >
              {heading}
              <span className="block" style={{ color: C.accent }}>
                {headingAccent}
              </span>
            </h1>
            <p
              className="leading-relaxed"
              style={{ fontSize: 'clamp(13px, 1.1vw, 17px)', color: C.sub, maxWidth: '30ch' }}
            >
              {subtext}
            </p>
            <OrnamentDivider />
            <button
              onClick={onStart}
              className="flex items-center gap-3 rounded-full transition-all active:scale-[0.98] hover:opacity-90"
              style={{
                background: C.ctaBg,
                color: C.ctaText,
                padding: '10px 22px 10px 10px',
                alignSelf: 'flex-start',
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(34,19,24,0.1)' }}
              >
                <LeafIcon color={C.ctaText} />
              </div>
              <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.01em' }}>{cta}</span>
            </button>
          </div>
        </div>

        {/* Mobile */}
        <div className="v14-content-anim md:hidden flex-1 flex flex-col justify-end px-6 pb-10" style={{ animation: 'v14-content-in 700ms ease-out 250ms both' }}>
          <h1 className="font-extrabold leading-tight text-[26px] mb-3" style={{ color: C.heading }}>
            {heading}
            <span className="block" style={{ color: C.accent }}>
              {headingAccent}
            </span>
          </h1>
          <p className="text-sm leading-relaxed mb-5" style={{ color: C.sub, maxWidth: '36ch' }}>
            {subtext}
          </p>
          <button
            onClick={onStart}
            className="flex items-center gap-3 w-full rounded-full transition-all active:scale-[0.98]"
            style={{
              background: C.ctaBg,
              color: C.ctaText,
              padding: '12px 20px 12px 12px',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(34,19,24,0.1)' }}
            >
              <LeafIcon color={C.ctaText} />
            </div>
            <span style={{ fontSize: '15px', fontWeight: 700, flex: 1, textAlign: 'left' }}>{cta}</span>
          </button>
        </div>

      </div>
    </section>
  );
}
