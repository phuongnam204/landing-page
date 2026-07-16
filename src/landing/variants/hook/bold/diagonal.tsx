'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldDiagonalHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden">
      <style>{`
        @keyframes v19SlideTop {
          from { transform: translateY(-100%); opacity: 0; }
          65%  { transform: translateY(5%); opacity: 1; }
          82%  { transform: translateY(-2%); }
          to   { transform: translateY(0); }
        }
        @keyframes v19SlideBottom {
          from { transform: translateY(100%); opacity: 0; }
          65%  { transform: translateY(-5%); opacity: 1; }
          82%  { transform: translateY(2%); }
          to   { transform: translateY(0); }
        }
        @keyframes v19SlideLeft {
          from { transform: translateX(-100%); opacity: 0; }
          65%  { transform: translateX(5%); opacity: 1; }
          82%  { transform: translateX(-2%); }
          to   { transform: translateX(0); }
        }
        @keyframes v19SlideRight {
          from { transform: translateX(100%); opacity: 0; }
          65%  { transform: translateX(-5%); opacity: 1; }
          82%  { transform: translateX(2%); }
          to   { transform: translateX(0); }
        }
        .v19-top {
          animation: v19SlideTop 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        .v19-bottom {
          animation: v19SlideBottom 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          clip-path: polygon(0 12%, 100% 0, 100% 100%, 0 100%);
          margin-top: -40px;
          padding-top: 64px;
        }
        @media (min-width: 768px) {
          .v19-top {
            animation-name: v19SlideLeft;
          }
          .v19-bottom {
            animation-name: v19SlideRight;
            clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);
            margin-top: 0;
            margin-left: -32px;
            padding-top: 0;
            padding-left: 56px;
          }
        }
      `}</style>

      {/* Left on desktop / Top on mobile: bold title */}
      <div
        className="v19-top flex-1 flex items-center justify-center px-5 min-h-0"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-center md:text-left leading-snug md:leading-snug [text-wrap:balance]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          Đã filter đến mức
          <br />
          <span style={{ color: 'var(--lp-band-accent)' }}>không nhận ra mình nữa?</span>
        </h1>
      </div>

      {/* Right on desktop / Bottom on mobile: diagonal, image + text */}
      <div
        className="v19-bottom flex-1 flex items-center justify-center px-5"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <div className="max-w-4xl md:max-w-none w-full mx-auto flex flex-col md:flex-col items-center gap-6">
          <div className="shrink-0 flex items-center justify-center">
            <img
              src="/face-map-hook.svg"
              alt="Phân tích vùng da"
              className="h-52 md:h-[260px] w-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 20px color-mix(in srgb, var(--lp-accent) 35%, transparent))' }}
            />
          </div>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-sm md:text-base text-cta/70 max-w-xs leading-relaxed">
              Da thật không cần filter — chỉ cần đúng cách chăm.
            </p>
            <CtaButton onClick={onStart} size="lg">
              Soi da ngay
            </CtaButton>
          </div>
        </div>
      </div>
    </div>
  );
}
