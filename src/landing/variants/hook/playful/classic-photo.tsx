'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phân tích da nhanh',
  heading:       'Da đẹp như thế này —',
  headingAccent: 'không phải chuyện ngẫu nhiên.',
  subtext:       '30 giây để biết chính xác da bạn cần gì — và tại sao routine cũ chưa đủ để đến đó.',
  cta:           'Khám phá ngay',
  hookImage:     '/image-hook/Picture6.jpg',
};

export function PlayfulClassicPhotoHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="h-[100dvh] w-full relative flex items-center overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)' }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--lp-blob-1)] blur-3xl opacity-40 pointer-events-none" />
      <div className="absolute bottom-8 left-1/4 w-72 h-72 rounded-full bg-[var(--lp-blob-2)] blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/4 right-8 w-64 h-64 rounded-full bg-[var(--lp-blob-3)] blur-3xl opacity-30 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full px-6 md:px-10 relative z-10 pt-20 md:pt-0">
        <div className="flex flex-col md:flex-row md:items-center md:gap-14 lg:gap-20">

          {/* Text column — left on desktop, below image on mobile */}
          <div className="flex-1 flex flex-col gap-4 md:gap-5 text-center md:text-left animate-fade-in-up order-2 md:order-1">
            {c.badge && (
              <div
                className="inline-flex items-center self-center md:self-start px-3 py-1 rounded-full"
                style={{
                  background: 'color-mix(in srgb, var(--lp-accent) 10%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--lp-accent) 22%, transparent)',
                }}
              >
                <span
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ color: 'var(--lp-accent)' }}
                >
                  {c.badge}
                </span>
              </div>
            )}

            <h1
              className="font-serif font-bold text-4xl md:text-[3rem] lg:text-[3.5rem] leading-tight [text-wrap:balance]"
              style={{ color: 'var(--lp-primary)' }}
            >
              {c.heading}
              <br />
              <em style={{ color: 'var(--lp-accent)', fontStyle: 'italic' }}>{c.headingAccent}</em>
            </h1>

            <p
              className="text-base md:text-lg leading-relaxed max-w-sm md:max-w-none"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}
            >
              {c.subtext}
            </p>

            <div className="flex justify-center md:justify-start mt-1">
              <CtaButton onClick={onStart} size="lg">{c.cta}</CtaButton>
            </div>

            <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
              Miễn phí, không cần đăng ký
            </p>
          </div>

          {/* Circle-cropped image — right on desktop, top on mobile */}
          <div className="shrink-0 flex flex-col items-center gap-4 order-1 md:order-2 mb-2 md:mb-0">
            <div
              className="w-[220px] h-[220px] md:w-[340px] md:h-[340px] lg:w-[420px] lg:h-[420px] rounded-full overflow-hidden"
              style={{
                boxShadow: [
                  '0 24px 64px color-mix(in srgb, var(--lp-accent) 18%, transparent)',
                  '0 4px 20px rgba(0,0,0,0.08)',
                ].join(', '),
                border: '5px solid color-mix(in srgb, var(--lp-blob-1) 70%, white)',
              }}
            >
              <img
                src={c.hookImage}
                alt=""
                className="w-full h-full object-cover object-center"
              />
            </div>

            {/* Palette swatches */}
            <div className="flex items-center gap-2.5">
              {[
                'var(--lp-blob-1)',
                'var(--lp-accent)',
                'var(--lp-blob-3)',
                'var(--lp-blob-2)',
                '#ffffff',
              ].map((col, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: col,
                    border: '2px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.14)',
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
