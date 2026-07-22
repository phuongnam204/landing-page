'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Bản đồ vùng da',
  heading:       'Mụn của bạn',
  headingAccent: 'có bản đồ riêng.',
  subtext:       'Vị trí mụn tiết lộ nguyên nhân — bản đồ da giúp bạn hiểu đúng hơn.',
  cta:           'Soi bản đồ da',
  hookImage:     '/image-hook/Picture7.jpg',
};

export function EditorialSassaHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="h-[100dvh] w-full relative overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* Decorative SVG curved line — the "sweep" motif from editorial fashion */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        viewBox="0 0 1200 750"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
        fill="none"
      >
        <path
          d="M 1050 0 C 1000 180 750 220 820 440 C 890 660 570 700 470 750"
          stroke="var(--lp-accent)"
          strokeWidth="1.5"
          opacity="0.3"
        />
        <path
          d="M 1080 0 C 1030 180 780 220 850 440 C 920 660 600 700 500 750"
          stroke="var(--lp-accent)"
          strokeWidth="0.8"
          opacity="0.14"
        />
      </svg>

      {/* Main layout */}
      <div className="relative z-10 h-full flex flex-col md:flex-row items-center max-w-6xl mx-auto px-6 md:px-14 pt-20 md:pt-0 pb-6 md:pb-0 gap-8 md:gap-0">

        {/* Text column — left on desktop, bottom on mobile */}
        <div className="flex-1 flex flex-col gap-4 md:gap-5 text-center md:text-left order-2 md:order-1 md:pr-10">
          {c.badge && (
            <span
              className="block text-xs font-bold tracking-[0.2em] uppercase"
              style={{ color: 'var(--lp-accent)' }}
            >
              {c.badge}
            </span>
          )}

          <h1
            className="font-serif font-bold leading-[1.06] [text-wrap:balance]"
            style={{
              fontSize: 'clamp(2rem, 4.2vw, 4rem)',
              color: 'var(--lp-primary)',
            }}
          >
            {c.heading}
            <br />
            <em style={{ fontStyle: 'italic', color: 'var(--lp-accent)' }}>
              {c.headingAccent}
            </em>
          </h1>

          <p
            className="text-sm md:text-base leading-relaxed max-w-xs md:max-w-sm mx-auto md:mx-0"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 62%, transparent)' }}
          >
            {c.subtext}
          </p>

          <div className="flex justify-center md:justify-start mt-1">
            <CtaButton onClick={onStart} variant="accent" size="lg">
              {c.cta}
            </CtaButton>
          </div>

          <p
            className="text-xs"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 38%, transparent)' }}
          >
            Miễn phí · Không cần đăng ký
          </p>
        </div>

        {/* Photo column — right on desktop, top on mobile */}
        <div className="shrink-0 relative flex items-center justify-center order-1 md:order-2">

          {/* 4-point star ornament */}
          <svg
            className="absolute z-20 pointer-events-none"
            style={{ top: '-14px', right: '-14px' }}
            width="38" height="38" viewBox="0 0 38 38"
            aria-hidden="true"
          >
            <path
              d="M19 1 L21.5 16.5 L37 19 L21.5 21.5 L19 37 L16.5 21.5 L1 19 L16.5 16.5 Z"
              fill="var(--lp-accent)"
              opacity="0.72"
            />
          </svg>

          {/* Main arch-top portrait photo */}
          <div
            className="overflow-hidden"
            style={{
              width: 'clamp(170px, 22vw, 300px)',
              height: 'clamp(250px, 50vh, 460px)',
              borderRadius: '50% 50% 10px 10px / 24% 24% 10px 10px',
              boxShadow: [
                '0 20px 56px rgba(0,0,0,0.15)',
                '0 0 0 1px color-mix(in srgb, var(--lp-accent) 18%, transparent)',
              ].join(', '),
            }}
          >
            <img
              src={c.hookImage}
              alt=""
              className="w-full h-full object-cover object-top"
            />
          </div>

          {/* Small circle accent photo — offset bottom-left */}
          <div
            className="absolute z-20 rounded-full overflow-hidden"
            style={{
              width: 68,
              height: 68,
              bottom: '-8px',
              left: '-24px',
              border: '3px solid var(--lp-bg-hero)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.16)',
            }}
          >
            <img
              src={c.hookImage}
              alt=""
              className="w-full h-full object-cover"
              style={{ objectPosition: '30% 10%' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
