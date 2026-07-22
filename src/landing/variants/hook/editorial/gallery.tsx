'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Da bạn',
  headingAccent: 'có bản đồ riêng.',
  subtext:       'Mỗi loại mụn có lý do khác nhau. Tìm đúng lý do, chọn đúng cách điều trị.',
  cta:           'Xác định nguyên nhân',
  hookImage:     '/image-hook/Picture7.jpg',
};

const CIRC_TEXT = 'PHÂN TÍCH VÙNG DA · TÌM ĐÚNG NGUYÊN NHÂN · ';

// Perimeter path of oval-1 (280×490, all-corner R=140) inset 11px → R_inner=129.
// Center of top arc = (140,140), center of bottom arc = (140,350).
// Starts at 12-o'clock, runs clockwise.
const PILL_PATH =
  'M 140,11 ' +
  'A 129,129 0 0,1 269,140 ' +   // top-right quarter arc
  'L 269,350 ' +                  // right side down
  'A 129,129 0 0,1 140,479 ' +   // bottom-right quarter arc
  'A 129,129 0 0,1 11,350 ' +    // bottom-left quarter arc
  'L 11,140 ' +                   // left side up
  'A 129,129 0 0,1 140,11';      // top-left quarter arc back to start

export function EditorialGalleryHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* topbar clearance */}
      <div className="h-16 shrink-0" />

      {/* ── Hero: 3 overlapping stadium ovals ── */}
      <div className="flex-1 flex items-end">

        {/* Desktop */}
        <div className="hidden md:flex items-end justify-center w-full max-w-5xl mx-auto px-6">

          {/* Oval 1 — dark, heading + CTA + perimeter stamp text */}
          {/*
            Stadium shape: borderRadius = half the width (140px).
            Single-value shorthand = equal H+V radii on all 4 corners
            → both top AND bottom are perfect semicircles, no distortion.
          */}
          <div
            className="relative shrink-0 flex flex-col items-center justify-end pb-12"
            style={{
              width: 280,
              height: 490,
              borderRadius: 140,
              background: 'var(--lp-primary)',
              zIndex: 1,
            }}
          >
            {/* Perimeter stamp text — follows pill outline */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 280 490"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
              fill="none"
            >
              <defs>
                <path id="gal-pill" d={PILL_PATH} />
              </defs>
              <text
                fill="rgba(255,255,255,0.36)"
                fontSize="9"
                letterSpacing="3.6"
                fontWeight="700"
                fontFamily="'Be Vietnam Pro', sans-serif"
              >
                {/* startOffset 73% ≈ 9-o'clock — text runs up left side + over top */}
                <textPath href="#gal-pill" startOffset="73%">
                  {CIRC_TEXT}
                </textPath>
              </text>
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center px-9 gap-6">
              <h1
                className="font-serif font-bold text-white leading-[1.06] [text-wrap:balance]"
                style={{ fontSize: 'clamp(2rem, 2.8vw, 3rem)' }}
              >
                {c.heading}
                <br />
                <em style={{ fontStyle: 'italic', opacity: 0.82 }}>
                  {c.headingAccent}
                </em>
              </h1>
              <CtaButton onClick={onStart} variant="accent" size="md">
                {c.cta}
              </CtaButton>
            </div>
          </div>

          {/* Oval 2 — texture image + diamond & badge */}
          {/*
            Z-index 2: overlaps oval 1 on left edge.
            Box-shadow cream ring creates visible separator at left edge.
            Width = 260px → borderRadius = 130px.
          */}
          <div
            className="relative shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              width: 260,
              height: 530,
              marginLeft: -65,
              borderRadius: 130,
              zIndex: 2,
              boxShadow: '0 0 0 5px var(--lp-bg-hero)',
            }}
          >
            <img
              src="/image-hook/womens-health-concept-vector.jpg"
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Diamond badge (rotated rounded-rect + counter-rotated text) */}
            <div
              className="relative z-10 flex items-center justify-center"
              style={{
                width: 70,
                height: 70,
                borderRadius: 14,
                background: 'rgba(0,0,0,0.72)',
                transform: 'rotate(45deg)',
              }}
            >
              <span
                style={{
                  display: 'block',
                  transform: 'rotate(-45deg)',
                  color: '#fff',
                  fontSize: 22,
                  fontWeight: 700,
                  fontFamily: 'Georgia, "Times New Roman", serif',
                  lineHeight: 1,
                }}
              >
                &amp;
              </span>
            </div>
          </div>

          {/* Oval 3 — portrait photo */}
          {/*
            Z-index 3: topmost. Overlaps oval 2 on the right side of oval 2.
            Width = 292px → borderRadius = 146px.
          */}
          <div
            className="relative shrink-0 overflow-hidden"
            style={{
              width: 292,
              height: 490,
              marginLeft: -65,
              borderRadius: 146,
              zIndex: 3,
              boxShadow: '0 0 0 5px var(--lp-bg-hero)',
            }}
          >
            <img
              src={c.hookImage}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            {/* Text heading overlay — upper-right area like "21st. century" */}
            <div className="absolute top-8 right-7 text-right z-10">
              <p
                className="font-serif font-bold text-white leading-[1.08]"
                style={{ fontSize: 'clamp(1.2rem, 1.8vw, 2rem)', textShadow: '0 2px 12px rgba(0,0,0,0.45)' }}
              >
                Bản đồ<br />vùng da.
              </p>
            </div>
            {/* Rotated subtext — right edge, like "MATERIAL & PAINTERLY WAY" */}
            <div
              className="absolute right-0 top-1/2 z-10"
              style={{ transform: 'translateY(-50%) translateX(32%) rotate(90deg)', transformOrigin: 'center center' }}
            >
              <span
                className="text-[9px] font-bold tracking-[0.22em] uppercase text-white"
                style={{ opacity: 0.6 }}
              >
                Phân tích · Xác định nguyên nhân
              </span>
            </div>
            {/* Bottom gradient */}
            <div
              className="absolute inset-x-0 bottom-0 h-24"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)' }}
            />
          </div>
        </div>

        {/* Mobile: single stadium photo oval */}
        <div className="md:hidden w-full flex justify-center px-5 pb-6">
          <div
            className="relative overflow-hidden"
            style={{
              width: 'min(280px, 84vw)',
              height: 'min(420px, 126vw)',
              // min(140px, 42vw) always = half the actual width → perfect stadium top+bottom
              borderRadius: 'min(140px, 42vw)',
            }}
          >
            <img
              src={c.hookImage}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-end pb-10 px-7 text-center"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.06) 55%, transparent 100%)' }}
            >
              <h1
                className="font-serif font-bold text-white leading-[1.08] mb-5 [text-wrap:balance]"
                style={{ fontSize: 'clamp(1.6rem, 8vw, 2.1rem)' }}
              >
                {c.heading}
                <br />
                <em style={{ fontStyle: 'italic', opacity: 0.84 }}>{c.headingAccent}</em>
              </h1>
              <CtaButton onClick={onStart} variant="accent" size="md">
                {c.cta}
              </CtaButton>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom: 3-col like Gallery footer ── */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8 pt-5 pb-6 md:pb-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 md:items-end">
        <p
          className="font-bold leading-tight md:col-span-1"
          style={{ fontSize: 'clamp(1rem, 1.5vw, 1.25rem)', color: 'var(--lp-primary)' }}
        >
          Mỗi loại mụn<br className="hidden md:block" /> đều có lý do riêng.
        </p>
        <p
          className="text-sm leading-relaxed md:col-span-1 md:px-6"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 52%, transparent)' }}
        >
          {c.subtext}
        </p>
        <div className="md:col-span-1 flex justify-start md:justify-end items-center gap-3">
          <div className="flex -space-x-2">
            {[0.9, 0.7, 0.5].map((op, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full overflow-hidden ring-2"
                style={{ opacity: op }}
              >
                <img src={c.hookImage} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${20 + i * 30}% 10%` }} />
              </div>
            ))}
          </div>
          <span
            className="text-xl font-bold"
            style={{ color: 'var(--lp-primary)' }}
          >
            →
          </span>
        </div>
      </div>
    </div>
  );
}
