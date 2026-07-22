'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích da tức thì',
  heading:       'Dùng đủ thứ',
  headingAccent: 'vẫn nổi mụn?',
  subtext:       'Không phải sản phẩm sai — có thể là chưa đúng nguyên nhân. Chúng tôi giúp bạn tìm ra.',
  cta:           'Bắt đầu ngay',
  hookImage:     '/image-hook/Picture7.jpg',
};

function Squiggle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 8"
      fill="none"
      className={className}
      style={{ height: 8, display: 'block', marginTop: -1 }}
    >
      <path
        d="M2 5C16 2 30 7 45 5C60 3 74 7 89 5C104 3 118 7 133 5C148 3 162 7 177 5C185 3.5 192 5 198 4"
        stroke="var(--lp-accent)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function EditorialPortraitHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  const cta = c.cta || 'Bắt đầu ngay';

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* ── Desktop: arch trái + text phải ── */}
      <div className="hidden md:flex flex-1 items-stretch">

        {/* Arch photo — flat top bám top edge, dome rounded bottom */}
        <div
          className="relative shrink-0 overflow-hidden"
          style={{
            width: 'clamp(200px, 28vw, 320px)',
            borderRadius: '0 0 140px 140px',
            background: 'var(--lp-border)',
          }}
        >
          <img
            src={c.hookImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Content column */}
        <div className="flex-1 flex flex-col justify-center px-10 xl:px-16 py-10 gap-0">
          {c.badge && (
            <span
              className="block text-xs font-bold tracking-[0.18em] uppercase mb-5"
              style={{ color: 'var(--lp-accent)' }}
            >
              {c.badge}
            </span>
          )}

          <h1
            className="font-serif font-bold leading-[1.06]"
            style={{ fontSize: 'clamp(2.4rem, 3.8vw, 4rem)', margin: '0 0 1.25rem 0' }}
          >
            <span className="block [text-wrap:balance]" style={{ color: 'var(--lp-primary)' }}>
              {c.heading}
            </span>
            <span className="relative inline-block">
              <span className="block italic" style={{ color: 'var(--lp-accent)' }}>
                {c.headingAccent}
              </span>
              <Squiggle className="w-full" />
            </span>
          </h1>

          <p
            className="text-sm leading-relaxed max-w-sm mb-7"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}
          >
            {c.subtext}
          </p>

          <button
            type="button"
            onClick={onStart}
            className="self-start px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--lp-accent)', borderRadius: 99, letterSpacing: '0.02em' }}
          >
            {cta}
          </button>
        </div>
      </div>

      {/* ── Tagline bar (desktop only) ── */}
      <div
        className="hidden md:flex items-center gap-4 px-10 py-3 border-t shrink-0"
        style={{ background: 'var(--lp-bg-card)', borderColor: 'var(--lp-border)' }}
      >
        <p
          className="font-serif italic text-sm"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}
        >
          "Mỗi loại mụn đều có lý do riêng."
        </p>
        <div className="w-px h-5 shrink-0" style={{ background: 'var(--lp-border)' }} />
        <p
          className="text-xs"
          style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}
        >
          Chọn thẳng — chúng tôi trả lời thẳng.
        </p>
      </div>

      {/* ── Mobile: arch top + text below ── */}
      <div className="md:hidden flex flex-col min-h-[100dvh]">

        {/* Arch full-width — elliptical dome drop từ top */}
        <div
          className="relative w-full shrink-0 overflow-hidden"
          style={{
            height: 'clamp(200px, 55vw, 280px)',
            borderRadius: '0 0 50% 50% / 0 0 50px 50px',
            background: 'var(--lp-border)',
          }}
        >
          <img
            src={c.hookImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
        </div>

        {/* Text + CTA */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 gap-0">
          {c.badge && (
            <span
              className="block text-[10px] font-bold tracking-[0.18em] uppercase mb-4"
              style={{ color: 'var(--lp-accent)' }}
            >
              {c.badge}
            </span>
          )}

          <h1
            className="font-serif font-bold leading-[1.08]"
            style={{ fontSize: 'clamp(2rem, 8vw, 2.4rem)', margin: '0 0 1.25rem 0' }}
          >
            <span className="block [text-wrap:balance]" style={{ color: 'var(--lp-primary)' }}>
              {c.heading}
            </span>
            <span className="relative inline-block">
              <span className="block italic" style={{ color: 'var(--lp-accent)' }}>
                {c.headingAccent}
              </span>
              <Squiggle className="w-full" />
            </span>
          </h1>

          <p
            className="text-sm leading-relaxed max-w-[280px] mb-6"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}
          >
            {c.subtext}
          </p>

          <button
            type="button"
            onClick={onStart}
            className="px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:opacity-80"
            style={{ background: 'var(--lp-accent)', borderRadius: 99, letterSpacing: '0.02em' }}
          >
            {cta}
          </button>

          <p
            className="text-xs mt-3"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 38%, transparent)' }}
          >
            Miễn phí · Không cần đăng ký
          </p>
        </div>
      </div>
    </div>
  );
}
