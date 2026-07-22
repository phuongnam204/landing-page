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
// Circle at center (110,110) r=90 — text flows clockwise from leftmost point
const CIRC_PATH = 'M 20,110 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0';

// Perfect arch = top radius equals exactly half the element's pixel width.
// Single-value border-radius shorthand: `Xpx Xpx Ypx Ypx` sets EQUAL horizontal
// AND vertical radii per corner → perfect quarter-circles → semicircular arch top.
// Oval 1: 268px wide → top radius 134px
// Oval 2: 248px wide → top radius 124px
// Oval 3: 284px wide → top radius 142px

export function EditorialGalleryHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* topbar clearance */}
      <div className="h-16 shrink-0" />

      {/* ── Hero ovals ── */}
      <div className="flex-1 flex items-end">

        {/* ─── Desktop: 3 overlapping arches ─── */}
        <div className="hidden md:flex items-end justify-center w-full max-w-5xl mx-auto px-6">

          {/* Oval 1 — dark, heading + circular stamp */}
          <div
            className="relative shrink-0 flex flex-col items-center justify-end pb-10"
            style={{
              width: 268,
              height: 510,
              borderRadius: '134px 134px 14px 14px',
              background: 'var(--lp-primary)',
              zIndex: 1,
            }}
          >
            {/* Circular stamp text */}
            <svg
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
              width="220"
              height="220"
              viewBox="0 0 220 220"
              aria-hidden="true"
            >
              <defs>
                <path id="gal-circ" d={CIRC_PATH} />
              </defs>
              <text
                fill="rgba(255,255,255,0.42)"
                fontSize="8.5"
                letterSpacing="3.6"
                fontWeight="700"
                fontFamily="'Be Vietnam Pro', sans-serif"
              >
                <textPath href="#gal-circ" startOffset="4%">
                  {CIRC_TEXT}
                </textPath>
              </text>
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center px-8 gap-6">
              <h1
                className="font-serif font-bold text-white leading-[1.06] [text-wrap:balance]"
                style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }}
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

          {/* Oval 2 — gradient texture, center elevated */}
          <div
            className="relative shrink-0 flex items-center justify-center"
            style={{
              width: 248,
              height: 550,
              marginLeft: -60,
              borderRadius: '124px 124px 14px 14px',
              background: 'radial-gradient(ellipse at 40% 28%, var(--lp-border) 0%, var(--lp-accent) 50%, var(--lp-primary) 100%)',
              zIndex: 2,
              boxShadow: '0 0 0 5px var(--lp-bg-hero)',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl"
              style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                color: 'rgba(255,255,255,0.9)',
                border: '1.5px solid rgba(255,255,255,0.3)',
              }}
            >
              &amp;
            </div>
          </div>

          {/* Oval 3 — portrait photo */}
          <div
            className="relative shrink-0 overflow-hidden"
            style={{
              width: 284,
              height: 510,
              marginLeft: -60,
              borderRadius: '142px 142px 14px 14px',
              zIndex: 1,
              boxShadow: '0 0 0 5px var(--lp-bg-hero)',
            }}
          >
            <img
              src={c.hookImage}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            <div
              className="absolute inset-x-0 bottom-0 pb-6 pt-14 px-6 text-center"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)' }}
            >
              <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-white">
                Da khỏe · Da đẹp
              </span>
            </div>
          </div>
        </div>

        {/* ─── Mobile: single arch photo oval ─── */}
        {/*
          Width: min(280px, 84vw). For the arch to stay perfect at any narrow screen,
          both top radii use min(140px, 42vw) = always exactly half the actual width.
        */}
        <div className="md:hidden w-full flex flex-col items-center px-5 pb-6">
          <div
            className="relative overflow-hidden"
            style={{
              width: 'min(280px, 84vw)',
              height: 'min(424px, 127vw)',
              borderRadius: 'min(140px, 42vw) min(140px, 42vw) 14px 14px',
            }}
          >
            <img
              src={c.hookImage}
              alt=""
              className="w-full h-full object-cover object-top"
            />
            <div
              className="absolute inset-0 flex flex-col items-center justify-end pb-8 px-7 text-center"
              style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.06) 52%, transparent 100%)',
              }}
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

      {/* ── Bottom: tagline + subtext ── */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8 py-6 md:py-7 flex flex-col md:flex-row md:items-center gap-2 md:gap-0">
        <p
          className="font-bold leading-tight flex-1"
          style={{ fontSize: 'clamp(1rem, 1.8vw, 1.38rem)', color: 'var(--lp-primary)' }}
        >
          Mỗi loại mụn đều có lý do riêng —
        </p>
        <p
          className="text-sm leading-relaxed md:max-w-xs md:ml-8"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 56%, transparent)' }}
        >
          {c.subtext}
        </p>
      </div>
    </div>
  );
}
