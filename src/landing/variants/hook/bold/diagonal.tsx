'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Đã filter đến mức',
  headingAccent: 'không nhận ra mình nữa?',
  subtext:       'Da thật không cần filter',
  cta:           'Soi da ngay →',
  hookImage:     '',
};

// Desktop image positioning constants (mobile uses inline flex sizing)
// x  : translateX(%) from left-1/2 — negative = shift left of center
// hMd: height % of parent panel — reduced 20% from face-dual for visual balance
const IMG_A = { x: -45, hMd: 74 } as const;
const IMG_B = { x: -62, hMd: 74 } as const;

const CTA_COLOR = '#2DD4BF' as const;

const FILTER_A = [
  'brightness(1.18)',
  'saturate(1.05)',
  'drop-shadow(0 0 28px rgba(255,255,255,0.18))',
  'drop-shadow(0 12px 40px rgba(0,0,0,0.4))',
].join(' ');

const FILTER_B = [
  'saturate(0.95)',
  'drop-shadow(0 0 24px color-mix(in srgb, var(--lp-accent) 30%, transparent))',
  'drop-shadow(0 12px 36px rgba(0,0,0,0.12))',
].join(' ');

export function BoldDiagonalHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden relative"
      style={{ background: 'var(--lp-primary)' }}>
      <style>{`
        /* ─── Keyframes ──────────────────────────────────────────────────────── */
        @keyframes v19-in-top {
          0%   { transform: translateY(-100%) skewX( 4deg) scaleY(0.94); opacity: 0; }
          62%  { transform: translateY( 2.2%) skewX(-0.6deg) scaleY(1.02); opacity: 1; }
          79%  { transform: translateY(-0.9%) skewX( 0.2deg) scaleY(0.995); }
          100% { transform: translateY(0)     skewX(0)       scaleY(1); }
        }
        @keyframes v19-in-bottom {
          0%   { transform: translateY( 100%) skewX(-4deg) scaleY(0.94); opacity: 0; }
          62%  { transform: translateY(-2.2%) skewX( 0.6deg) scaleY(1.02); opacity: 1; }
          79%  { transform: translateY( 0.9%) skewX(-0.2deg) scaleY(0.995); }
          100% { transform: translateY(0)     skewX(0)        scaleY(1); }
        }
        @keyframes v19-in-left {
          0%   { transform: translateX(-100%) skewY( 4deg) scaleX(0.94); opacity: 0; }
          62%  { transform: translateX( 2.2%) skewY(-0.6deg) scaleX(1.02); opacity: 1; }
          79%  { transform: translateX(-0.9%) skewY( 0.2deg) scaleX(0.995); }
          100% { transform: translateX(0)     skewY(0)        scaleX(1); }
        }
        @keyframes v19-in-right {
          0%   { transform: translateX( 100%) skewY(-4deg) scaleX(0.94); opacity: 0; }
          62%  { transform: translateX(-2.2%) skewY( 0.6deg) scaleX(1.02); opacity: 1; }
          79%  { transform: translateX( 0.9%) skewY(-0.2deg) scaleX(0.995); }
          100% { transform: translateX(0)     skewY(0)        scaleX(1); }
        }
        @keyframes v19-cta-in {
          0%   { opacity: 0; transform: scale(0.78) translateY(10px); }
          70%  { transform: scale(1.04) translateY(-2px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        /* ─── Panel animations ───────────────────────────────────────────────── */
        .v19-a { animation: v19-in-top 0.82s cubic-bezier(0.32, 1.42, 0.60, 1) both; }
        .v19-b {
          animation: v19-in-bottom 0.82s cubic-bezier(0.32, 1.42, 0.60, 1) 0.06s both;
          clip-path: polygon(0 22%, 100% 4%, 100% 100%, 0 100%);
          margin-top: -52px;
          padding-top: 105px;
        }
        @media (min-width: 768px) {
          .v19-a { animation-name: v19-in-left; }
          .v19-b {
            animation-name: v19-in-right;
            clip-path: polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%);
            margin-top: 0; margin-left: -48px;
            padding-top: 0; padding-left: 72px;
          }
        }

        /* ─── Desktop image positioning ──────────────────────────────────────── */
        .v19-img-a {
          transform: translateX(${IMG_A.x}%);
          height: ${IMG_A.hMd}%;
        }
        .v19-img-b {
          transform: translateX(${IMG_B.x}%);
          height: ${IMG_B.hMd}%;
        }

        /* ─── CTA entrance ───────────────────────────────────────────────────── */
        .v19-cta { animation: v19-cta-in 0.46s ease-out 0.68s both; }
      `}</style>

      {/* ══════════════════════════════════════════════════════════════════
          PANEL A — dark / "Đã filter đến mức"
          Mobile: flex-row with heading left + image right
          Desktop: absolute-positioned heading (top-left) + image (bottom-center)
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="v19-a flex-1 relative overflow-hidden flex flex-row items-center gap-4 px-5 md:block md:px-0"
        style={{ background: 'var(--lp-primary)' }}
      >
        {/* Mobile: heading left */}
        <h1
          className="md:hidden flex-1 font-extrabold text-[1.75rem] leading-[1.12] text-white [text-wrap:balance]"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {c.heading}
        </h1>

        {/* Mobile: image right */}
        <img
          src="/face-map-v1/face-map-hook-1.svg"
          alt=""
          aria-hidden="true"
          className="md:hidden w-[50%] max-w-[175px] h-auto object-contain shrink-0"
          style={{ filter: FILTER_A }}
        />

        {/* Desktop: heading absolute top-left */}
        <h1
          className="hidden md:block absolute top-14 left-10 z-10
                     font-extrabold text-[3.8rem] xl:text-[4.8rem]
                     leading-[1.12] text-white [text-wrap:balance] max-w-[14ch]"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          {c.heading}
        </h1>

        {/* Desktop: image bottom-anchored */}
        <img
          src="/face-map-v1/face-map-hook-1.svg"
          alt=""
          aria-hidden="true"
          className="v19-img-a hidden md:block absolute bottom-0 left-1/2 w-auto object-contain object-bottom"
          style={{ filter: FILTER_A }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          PANEL B — light / "không nhận ra mình nữa?"
          Mobile: flex-row MIRRORED — image left + heading right
          Desktop: absolute-positioned image (bottom-center) + heading (top-right)
      ══════════════════════════════════════════════════════════════════ */}
      <div
        className="v19-b flex-1 relative overflow-hidden flex flex-row items-center gap-4 px-5 md:block md:px-0"
        style={{ background: 'var(--lp-bg-minigame)' }}
      >
        {/* Mobile: image left (mirrored from Panel A) */}
        <img
          src="/face-map-v1/face-map-hook-2.svg"
          alt=""
          aria-hidden="true"
          className="md:hidden w-[50%] max-w-[175px] h-auto object-contain shrink-0"
          style={{ filter: FILTER_B }}
        />

        {/* Mobile: heading right */}
        <h2
          className="md:hidden flex-1 font-extrabold text-[1.75rem] leading-[1.12] text-right [text-wrap:balance]"
          style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-nunito)' }}
        >
          {c.headingAccent}
        </h2>

        {/* Desktop: image bottom-anchored */}
        <img
          src="/face-map-v1/face-map-hook-2.svg"
          alt=""
          aria-hidden="true"
          className="v19-img-b hidden md:block absolute bottom-0 left-1/2 w-auto object-contain object-bottom"
          style={{ filter: FILTER_B }}
        />

        {/* Desktop: heading absolute top-right */}
        <h2
          className="hidden md:block absolute top-14 right-10 z-10
                     font-extrabold text-[3.8rem] xl:text-[4.8rem]
                     leading-[1.12] text-right [text-wrap:balance] max-w-[14ch]"
          style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-nunito)' }}
        >
          {c.headingAccent}
        </h2>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          CTA — teal pill at the diagonal boundary
      ══════════════════════════════════════════════════════════════════ */}
      <div className="v19-cta absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        <div className="flex flex-col items-center gap-2 pointer-events-auto">
          <CtaButton
            onClick={onStart}
            variant="blob"
            size="lg"
            style={{
              fontFamily: 'var(--font-nunito)',
              background: CTA_COLOR,
              color: 'var(--lp-primary)',
              boxShadow: [
                '0 0 0 2.5px rgba(255,255,255,0.45)',
                `0 0 32px ${CTA_COLOR}99`,
                '0 6px 24px rgba(0,0,0,0.28)',
              ].join(', '),
            }}
          >
            {c.cta}
          </CtaButton>

          {c.subtext && (
            <span
              className="text-xs font-semibold tracking-wide text-white px-3 py-1 rounded-full"
              style={{ background: 'rgba(4,47,46,0.65)', backdropFilter: 'blur(8px)' }}
            >
              {c.subtext}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
