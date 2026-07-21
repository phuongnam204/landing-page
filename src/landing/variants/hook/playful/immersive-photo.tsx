'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích da chuyên sâu',
  heading:       'Da bạn đang',
  headingAccent: 'cố gắng nói điều gì đó.',
  subtext:       'Mụn, dầu, lỗ chân lông — mỗi dấu hiệu đều có nghĩa. Hãy cùng giải mã.',
  cta:           'Giải mã da ngay',
  hookImage:     '/image-hook/Picture5.jpg',
};

export function PlayfulImmersivePhotoHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="h-[100dvh] w-full relative flex items-center overflow-hidden"
      style={{ background: 'var(--lp-band-bg)' }}
    >
      {/* ── Photo background ────────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        <img
          src={c.hookImage}
          alt=""
          className="w-full h-full object-cover object-[65%_top]"
        />

        {/* Base dark veil — flattens the bright peach background so text can breathe */}
        <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.42)' }} />

        {/* Berry accent tint — pulls the warm photo into the purple colour theme */}
        <div
          className="absolute inset-0"
          style={{ background: 'var(--lp-accent)', opacity: 0.22, mixBlendMode: 'multiply' }}
        />

        {/* Desktop horizontal scrim: solid brand slab on left → fades right (40:60) */}
        <div
          className="absolute inset-0 hidden md:block"
          style={{
            background:
              'linear-gradient(to right,' +
              ' var(--lp-band-bg) 0%,' +
              ' var(--lp-band-bg) 44%,' +
              ' color-mix(in srgb, var(--lp-band-bg) 60%, transparent) 58%,' +
              ' color-mix(in srgb, var(--lp-band-bg) 20%, transparent) 72%,' +
              ' color-mix(in srgb, var(--lp-band-bg) 6%, transparent) 100%' +
              ')',
          }}
        />

        {/* Mobile top scrim — keeps text legible above the fold */}
        <div
          className="absolute inset-x-0 top-0 h-[62%] md:hidden"
          style={{ background: 'linear-gradient(to bottom, var(--lp-band-bg) 50%, transparent 100%)' }}
        />
      </div>

      {/* ── Text content — left column ──────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto w-full px-6 md:px-10 relative z-10 pt-16 md:pt-0">
        <div className="flex flex-col gap-4 md:gap-5 items-center md:items-start text-center md:text-left md:max-w-[44%] animate-fade-in-up">

          {c.badge && (
            <div
              className="inline-flex items-center self-center md:self-start px-3 py-1 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--lp-blob-1) 14%, transparent)',
                border: '1px solid color-mix(in srgb, var(--lp-blob-1) 28%, transparent)',
              }}
            >
              <span
                className="text-xs font-bold tracking-widest uppercase"
                style={{ color: 'var(--lp-blob-1)' }}
              >
                {c.badge}
              </span>
            </div>
          )}

          <h1
            className="font-extrabold text-4xl md:text-[3.5rem] lg:text-6xl leading-tight [text-wrap:balance]"
            style={{
              color: 'var(--lp-band-text)',
              fontFamily: 'var(--font-plus-jakarta)',
              textShadow: '0 2px 16px rgba(74,4,78,0.7), 0 1px 4px rgba(0,0,0,0.4)',
            }}
          >
            {c.heading}
            <br />
            <span style={{ color: 'var(--lp-blob-1)' }}>{c.headingAccent}</span>
          </h1>

          <p
            className="text-base md:text-lg leading-relaxed max-w-sm md:max-w-none"
            style={{ color: 'rgba(255,255,255,0.82)' }}
          >
            {c.subtext}
          </p>

          <div className="mt-1">
            <CtaButton onClick={onStart} size="lg" variant="accent">{c.cta}</CtaButton>
          </div>

          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Phân tích miễn phí trong 60 giây
          </p>
        </div>
      </div>
    </div>
  );
}
