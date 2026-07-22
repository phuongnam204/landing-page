'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Da bạn',
  headingAccent: 'có bản đồ riêng.',
  subtext:       'Mỗi loại mụn có lý do khác nhau. Tìm đúng lý do, chọn đúng cách điều trị.',
  cta:           'Tìm hiểu ngay',
  hookImage:     '/image-hook/Picture7.jpg',
};

const CIRC_TEXT = 'PHÂN TÍCH VÙNG DA · TÌM ĐÚNG NGUYÊN NHÂN · ';

// Perimeter pill path for oval-1 at 252×440, R=126.
// Inner offset 11px → R_inner=115. Top arc center=(126,126), bottom=(126,314).
// Clockwise from 12-o'clock. startOffset 73% ≈ 9-o'clock start.
const PILL_PATH =
  'M 126,11 ' +
  'A 115,115 0 0,1 241,126 ' +
  'L 241,314 ' +
  'A 115,115 0 0,1 126,429 ' +
  'A 115,115 0 0,1 11,314 ' +
  'L 11,126 ' +
  'A 115,115 0 0,1 126,11';

// Reusable inline CTA — fully rounded (pill-shaped) to echo the oval motif.
function GalleryCta({ onStart, label }: { onStart: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onStart}
      className="px-7 py-3 text-sm font-bold rounded-full text-white transition-opacity hover:opacity-90 active:opacity-80"
      style={{ background: 'var(--lp-accent)', letterSpacing: '0.03em' }}
    >
      {label}
    </button>
  );
}

// Rotating diamond badge with & symbol used in the center oval.
function DiamondBadge({ size = 70 }: { size?: number }) {
  const r = Math.round(size * 0.2);
  const fs = Math.round(size * 0.32);
  return (
    <div
      className="relative z-10 flex items-center justify-center shrink-0"
      style={{ width: size, height: size, borderRadius: r, background: 'rgba(0,0,0,0.72)', transform: 'rotate(45deg)' }}
    >
      <span style={{ display: 'block', transform: 'rotate(-45deg)', color: '#fff', fontSize: fs, fontWeight: 700, fontFamily: 'Georgia, "Times New Roman", serif', lineHeight: 1 }}>
        &amp;
      </span>
    </div>
  );
}

export function EditorialGalleryHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  const cta = c.cta || 'Tìm hiểu ngay';
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* topbar clearance */}
      <div className="h-16 shrink-0" />

      {/* ── Hero ovals ── */}
      <div className="flex-1 flex items-center">

        {/* ── Desktop: 3 overlapping stadium ovals ── */}
        {/*
          Z-order: LEFT=3 (top), CENTER=2, RIGHT=1 (back).
          Left oval covers center; center covers right — same as the Gallery reference.
          BoxShadow cream ring on oval 1 & 2 creates the visible gap at their right edges.
        */}
        <div className="hidden md:flex items-end justify-center w-full max-w-5xl mx-auto px-6">

          {/* Oval 1 — dark, stamp text + heading + CTA. z=3 (topmost) */}
          {/* 252×440, R=126 (half-width = both caps are perfect semicircles) */}
          <div
            className="relative shrink-0 flex flex-col items-center justify-center"
            style={{
              width: 252,
              height: 440,
              borderRadius: 126,
              background: 'var(--lp-primary)',
              zIndex: 3,
              paddingTop: 24,
              boxShadow: '0 0 0 5px var(--lp-bg-hero)',
            }}
          >
            {/* Perimeter stamp text */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 252 440"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
              fill="none"
            >
              <defs><path id="gal-pill" d={PILL_PATH} /></defs>
              <text fill="rgba(255,255,255,0.36)" fontSize="9" letterSpacing="3.6" fontWeight="700" fontFamily="'Be Vietnam Pro', sans-serif">
                <textPath href="#gal-pill" startOffset="73%">{CIRC_TEXT}</textPath>
              </text>
            </svg>

            <div className="relative z-10 flex flex-col items-center text-center px-9 gap-5">
              <h1
                className="font-serif font-bold text-white leading-[1.06] [text-wrap:balance]"
                style={{ fontSize: 'clamp(1.8rem, 2.6vw, 2.8rem)' }}
              >
                {c.heading}
                <br />
                <em style={{ fontStyle: 'italic', opacity: 0.82 }}>{c.headingAccent}</em>
              </h1>
              <GalleryCta onStart={onStart} label={cta} />
            </div>
          </div>

          {/* Oval 2 — texture image + diamond badge. z=2, marginLeft overlaps oval 1 */}
          {/* 234×476, R=117 */}
          <div
            className="relative shrink-0 overflow-hidden flex items-center justify-center"
            style={{
              width: 234,
              height: 476,
              marginLeft: -65,
              borderRadius: 117,
              zIndex: 2,
              boxShadow: '0 0 0 5px var(--lp-bg-hero)',
            }}
          >
            <img src="/image-hook/womens-health-concept-vector.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
            <DiamondBadge size={70} />
          </div>

          {/* Oval 3 — portrait photo + text overlay. z=1 (rearmost) */}
          {/* 262×440, R=131 */}
          <div
            className="relative shrink-0 overflow-hidden"
            style={{
              width: 262,
              height: 440,
              marginLeft: -65,
              borderRadius: 131,
              zIndex: 1,
            }}
          >
            <img src={c.hookImage} alt="" className="w-full h-full object-cover object-top" />

            {/* "Bản đồ vùng da" text — placed in the straight mid-section (y≥131) to avoid clipping by border-radius */}
            <div className="absolute z-10 text-right" style={{ top: 148, right: 22 }}>
              <p
                className="font-serif font-bold text-white leading-[1.08]"
                style={{ fontSize: 'clamp(1rem, 1.6vw, 1.7rem)', textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}
              >
                Bản đồ<br />vùng da.
              </p>
            </div>

            {/* Vertical rotated subtext on right edge */}
            <div className="absolute z-10" style={{ right: -28, top: '50%', transform: 'translateY(-50%) rotate(90deg)', whiteSpace: 'nowrap' }}>
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-white" style={{ opacity: 0.55 }}>
                Phân tích · Xác định nguyên nhân
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 100%)' }} />
          </div>
        </div>

        {/* ── Mobile: 3 scaled-down ovals + text below ── */}
        {/*
          All 3 ovals visible at ~54% scale. Text + CTA below the oval row.
          Oval dims at 54%: 136×238 / 127×257 / 142×238. Total w≈335px, fits 375px.
        */}
        <div className="md:hidden w-full flex flex-col items-center gap-6 px-4 pb-4">
          {/* Oval row */}
          <div className="flex items-end justify-center">

            {/* Oval 1 mobile — dark, heading inside, z=3 */}
            <div
              className="relative shrink-0 flex items-center justify-center"
              style={{ width: 136, height: 238, borderRadius: 68, background: 'var(--lp-primary)', zIndex: 3, boxShadow: '0 0 0 3px var(--lp-bg-hero)' }}
            >
              <div className="relative z-10 flex flex-col items-center text-center px-4">
                <p
                  className="font-serif font-bold text-white leading-[1.12] [text-wrap:balance]"
                  style={{ fontSize: 'clamp(0.88rem, 3.8vw, 1rem)' }}
                >
                  {c.heading}
                  <br />
                  <em style={{ fontStyle: 'italic', opacity: 0.8 }}>{c.headingAccent}</em>
                </p>
              </div>
            </div>

            {/* Oval 2 mobile — texture, z=2 */}
            <div
              className="relative shrink-0 overflow-hidden flex items-center justify-center"
              style={{ width: 127, height: 257, borderRadius: 63, marginLeft: -34, zIndex: 2, boxShadow: '0 0 0 3px var(--lp-bg-hero)' }}
            >
              <img src="/image-hook/womens-health-concept-vector.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
              <DiamondBadge size={38} />
            </div>

            {/* Oval 3 mobile — photo, z=1 */}
            <div
              className="relative shrink-0 overflow-hidden"
              style={{ width: 142, height: 238, borderRadius: 71, marginLeft: -34, zIndex: 1 }}
            >
              <img src={c.hookImage} alt="" className="w-full h-full object-cover object-top" />
            </div>
          </div>

          {/* Text + CTA below */}
          <div className="flex flex-col items-center text-center gap-4 px-4">
            <p
              className="font-bold leading-tight [text-wrap:balance]"
              style={{ fontSize: 'clamp(1rem, 4.5vw, 1.2rem)', color: 'var(--lp-primary)' }}
            >
              Mỗi loại mụn đều có lý do riêng.
            </p>
            <GalleryCta onStart={onStart} label={cta} />
            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
              Miễn phí · Không cần đăng ký
            </p>
          </div>
        </div>
      </div>

      {/* ── Footer: 3-col tagline / subtext / avatar strip ── */}
      <div className="w-full max-w-5xl mx-auto px-6 md:px-8 pt-4 pb-5 md:pb-7 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-0 md:items-end">
        <p className="font-bold leading-tight" style={{ fontSize: 'clamp(0.95rem, 1.4vw, 1.2rem)', color: 'var(--lp-primary)' }}>
          Mỗi loại mụn<br className="hidden md:block" /> đều có lý do riêng.
        </p>
        <p className="text-sm leading-relaxed md:px-6" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
          {c.subtext}
        </p>
        <div className="flex justify-start md:justify-end items-center gap-3">
          <div className="flex -space-x-2">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-7 h-7 rounded-full overflow-hidden" style={{ opacity: 1 - i * 0.2, outline: '2px solid var(--lp-bg-hero)' }}>
                <img src={c.hookImage} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${20 + i * 30}% 10%` }} />
              </div>
            ))}
          </div>
          <span className="text-lg font-bold" style={{ color: 'var(--lp-primary)' }}>→</span>
        </div>
      </div>
    </div>
  );
}
