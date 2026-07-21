'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'DA BẠN',
  headingAccent: 'CẦN GÌ?',
  subtext:       '60 giây phân tích — nhận kết quả cá nhân hóa về tình trạng da của bạn.',
  cta:           'Nhận kết quả của tôi →',
  hookImage:     '/face-map-hook.svg',
};

export function BoldClassicHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full flex flex-col md:flex-row overflow-hidden">
      <style>{`
        @keyframes v17SlideTop {
          from { transform: translateY(-100%); opacity: 0; }
          65%  { transform: translateY(2%); opacity: 1; }
          82%  { transform: translateY(-1%); }
          to   { transform: translateY(0); }
        }
        @keyframes v17SlideBottom {
          from { transform: translateY(100%); opacity: 0; }
          65%  { transform: translateY(-2%); opacity: 1; }
          82%  { transform: translateY(1%); }
          to   { transform: translateY(0); }
        }
        @keyframes v17SlideLeft {
          from { transform: translateX(-100%); opacity: 0; }
          65%  { transform: translateX(2%); opacity: 1; }
          82%  { transform: translateX(-1%); }
          to   { transform: translateX(0); }
        }
        @keyframes v17SlideRight {
          from { transform: translateX(100%); opacity: 0; }
          65%  { transform: translateX(-2%); opacity: 1; }
          82%  { transform: translateX(1%); }
          to   { transform: translateX(0); }
        }
        .v17-top {
          animation: v17SlideTop 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) both;
        }
        .v17-bottom {
          animation: v17SlideBottom 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) both;
          clip-path: polygon(0 10%, 100% 0, 100% 100%, 0 100%);
          margin-top: -36px;
          padding-top: 56px;
        }
        @media (min-width: 768px) {
          .v17-top {
            animation-name: v17SlideLeft;
          }
          .v17-bottom {
            animation-name: v17SlideRight;
            clip-path: polygon(8% 0, 100% 0, 100% 100%, 0 100%);
            margin-top: 0;
            margin-left: -32px;
            padding-top: 0;
            padding-left: 56px;
          }
        }
      `}</style>

      {/* Top on mobile / Left on desktop: bold title */}
      <div
        className="v17-top flex-1 flex items-center justify-center px-5 min-h-0"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-5xl md:text-8xl font-extrabold tracking-tight text-center md:text-left leading-[1.15] md:leading-[1.15]"
          style={{ color: 'var(--lp-band-text)', fontFamily: 'var(--font-plus-jakarta)' }}
        >
          {c.heading}
          <br />
          <span style={{ color: 'var(--lp-band-accent)' }}>{c.headingAccent}</span>
        </h1>
      </div>

      {/* Bottom on mobile / Right on desktop: image + CTA */}
      <div
        className="v17-bottom flex-1 flex flex-col items-center justify-center px-5 gap-5"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <img
          src={c.hookImage}
          alt="Phân tích vùng da"
          className="h-56 md:h-full max-h-[52vh] w-auto object-contain drop-shadow-xl"
        />
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm md:text-base text-cta/60 max-w-sm leading-relaxed">{c.subtext}</p>
          <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
        </div>
      </div>
    </div>
  );
}
