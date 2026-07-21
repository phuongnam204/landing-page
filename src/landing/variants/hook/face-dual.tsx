'use client';
import type { HookSlotProps } from '../../slots';
import { CtaButton } from '../../../components/atoms/CtaButton';

// ─── Image positioning constants ───────────────────────────────────────────────
// Adjust these values to fix overlap without touching the SVG files.
// x  : translateX(%) applied from left-1/2 — negative = shift left of center
// h  : height % of parent panel (mobile)
// hMd: height % of parent panel (desktop ≥ 768px)
const IMG_A = { x: -45, h: 68, hMd: 92 } as const;
const IMG_B = { x: -62, h: 68, hMd: 92 } as const;

// CTA warm gold — pops on both dark purple and light lavender, complements the purple theme
export const CTA_TEAL = '#2DD4BF' as const;

export function FaceDualHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden relative">
      <style>{`
        /* ─── Keyframes ──────────────────────────────────────────────────────── */
        @keyframes fd-in-top {
          0%   { transform: translateY(-100%) skewX( 4deg) scaleY(0.94); opacity: 0; }
          62%  { transform: translateY( 2.2%) skewX(-0.6deg) scaleY(1.02); opacity: 1; }
          79%  { transform: translateY(-0.9%) skewX( 0.2deg) scaleY(0.995); }
          100% { transform: translateY(0)     skewX(0)       scaleY(1); }
        }
        @keyframes fd-in-bottom {
          0%   { transform: translateY( 100%) skewX(-4deg) scaleY(0.94); opacity: 0; }
          62%  { transform: translateY(-2.2%) skewX( 0.6deg) scaleY(1.02); opacity: 1; }
          79%  { transform: translateY( 0.9%) skewX(-0.2deg) scaleY(0.995); }
          100% { transform: translateY(0)     skewX(0)        scaleY(1); }
        }
        @keyframes fd-in-left {
          0%   { transform: translateX(-100%) skewY( 4deg) scaleX(0.94); opacity: 0; }
          62%  { transform: translateX( 2.2%) skewY(-0.6deg) scaleX(1.02); opacity: 1; }
          79%  { transform: translateX(-0.9%) skewY( 0.2deg) scaleX(0.995); }
          100% { transform: translateX(0)     skewY(0)        scaleX(1); }
        }
        @keyframes fd-in-right {
          0%   { transform: translateX( 100%) skewY(-4deg) scaleX(0.94); opacity: 0; }
          62%  { transform: translateX(-2.2%) skewY( 0.6deg) scaleX(1.02); opacity: 1; }
          79%  { transform: translateX( 0.9%) skewY(-0.2deg) scaleX(0.995); }
          100% { transform: translateX(0)     skewY(0)        scaleX(1); }
        }
        @keyframes fd-cta-in {
          0%   { opacity: 0; transform: scale(0.78) translateY(10px); }
          70%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ─── Panel animations ───────────────────────────────────────────────── */
        .fd-a { animation: fd-in-top 0.82s cubic-bezier(0.32, 1.42, 0.60, 1) both; }
        .fd-b {
          animation: fd-in-bottom 0.82s cubic-bezier(0.32, 1.42, 0.60, 1) 0.06s both;
          clip-path: polygon(0 10%, 100% 0%, 100% 100%, 0 100%);
          margin-top: -52px;
          padding-top: 68px;
        }
        @media (min-width: 768px) {
          .fd-a { animation-name: fd-in-left; }
          .fd-b {
            animation-name: fd-in-right;
            clip-path: polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%);
            margin-top: 0; margin-left: -48px;
            padding-top: 0; padding-left: 72px;
          }
        }

        /* ─── Image positioning (driven by IMG_A / IMG_B constants) ─────────── */
        .fd-img-a {
          transform: translateX(${IMG_A.x}%);
          height: ${IMG_A.h}%;
        }
        @media (min-width: 768px) {
          .fd-img-a { height: ${IMG_A.hMd}%; }
        }
        .fd-img-b {
          transform: translateX(${IMG_B.x}%);
          height: ${IMG_B.h}%;
        }
        @media (min-width: 768px) {
          .fd-img-b { height: ${IMG_B.hMd}%; }
        }

        /* ─── CTA entrance ───────────────────────────────────────────────────── */
        .fd-cta { animation: fd-cta-in 0.46s ease-out 0.68s both; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          PANEL A — dark / "Đã thử đủ thứ"
      ══════════════════════════════════════════════════════════════════ */}
      <div className="fd-a flex-1 relative overflow-hidden" style={{ background: 'var(--lp-primary)' }}>
        <h1
          className="absolute top-10 left-6 md:top-14 md:left-10 z-10
                     font-extrabold text-[2.6rem] md:text-[3.8rem] xl:text-[4.8rem]
                     leading-[1.12] text-white [text-wrap:balance] max-w-[14ch]"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          Đã thử<br />đủ thứ
        </h1>

        <img
          src="/face-map-v1/face-map-hook-1.svg"
          alt=""
          aria-hidden="true"
          className="fd-img-a absolute bottom-0 left-1/2 w-auto object-contain object-bottom"
          style={{
            filter: [
              'brightness(1.18)',
              'saturate(1.05)',
              'drop-shadow(0 0 28px rgba(255,255,255,0.18))',
              'drop-shadow(0 12px 40px rgba(0,0,0,0.4))',
            ].join(' '),
          }}
        />

        <div
          className="absolute inset-x-0 bottom-0 h-16 md:hidden"
          style={{ background: 'linear-gradient(to top, var(--lp-primary) 0%, transparent 100%)' }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PANEL B — light / "vẫn mụn?"
      ══════════════════════════════════════════════════════════════════ */}
      <div className="fd-b flex-1 relative overflow-hidden" style={{ background: 'var(--lp-bg-minigame)' }}>
        <img
          src="/face-map-v1/face-map-hook-2.svg"
          alt=""
          aria-hidden="true"
          className="fd-img-b absolute bottom-0 left-1/2 w-auto object-contain object-bottom"
          style={{
            filter: [
              'saturate(0.95)',
              'drop-shadow(0 0 24px color-mix(in srgb, var(--lp-accent) 30%, transparent))',
              'drop-shadow(0 12px 36px rgba(0,0,0,0.12))',
            ].join(' '),
          }}
        />

        <h2
          className="absolute top-10 right-6 md:top-14 md:right-10 z-10
                     font-extrabold text-[2.6rem] md:text-[3.8rem] xl:text-[4.8rem]
                     leading-[1.12] text-right [text-wrap:balance] max-w-[14ch]"
          style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-nunito)' }}
        >
          vẫn mụn?
        </h2>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CTA — teal pill at the diagonal boundary
      ══════════════════════════════════════════════════════════════════ */}
      <div className="fd-cta absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          <CtaButton
            onClick={onStart}
            variant="blob"
            size="lg"
            style={{
              fontFamily: 'var(--font-nunito)',
              background: CTA_TEAL,
              color: 'var(--lp-primary)',
              boxShadow: [
                '0 0 0 2.5px rgba(255,255,255,0.45)',
                `0 0 32px ${CTA_TEAL}99`,
                '0 6px 24px rgba(0,0,0,0.28)',
              ].join(', '),
            }}
          >
            Để da tôi lên tiếng →
          </CtaButton>

          <span
            className="text-xs font-semibold tracking-wide text-white"
            style={{ textShadow: '0 1px 10px rgba(0,0,0,0.65)' }}
          >
            Phân tích miễn phí trong 60 giây
          </span>
        </div>
      </div>
    </div>
  );
}
