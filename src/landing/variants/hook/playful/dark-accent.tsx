'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         'Phác đồ cá nhân hoá',
  heading:       'Da mụn không',
  headingAccent: 'tự hết đâu',
  subtext:       'Cần phác đồ đúng, không cần thêm thử nghiệm. 60 giây phân tích — liệu trình phù hợp cho bạn.',
  cta:           'Phân tích ngay →',
  hookImage:     '/face-map-hook.svg',
};

export function PlayfulDarkAccentHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-primary)] relative flex items-center overflow-hidden">
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--lp-blob-3)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full px-5 md:flex md:items-center md:gap-12 relative z-10">
        <div className="relative h-48 md:h-[420px] mb-4 md:mb-0 flex items-center justify-center shrink-0">
          <img
            src={c.hookImage}
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          {c.badge && (
            <div className="inline-block px-3 py-1 rounded-full mb-4"
                 style={{ background: 'color-mix(in srgb, var(--lp-blob-3) 18%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-blob-3) 28%, transparent)' }}>
              <span className="text-xs font-bold" style={{ color: 'var(--lp-blob-3)' }}>{c.badge}</span>
            </div>
          )}
          <h1 className="font-extrabold text-4xl md:text-6xl text-white leading-snug md:leading-snug [text-wrap:balance]">
            {c.heading}<br />
            <span className="text-[var(--lp-blob-3)]">{c.headingAccent}</span>
          </h1>
          <p className="text-base md:text-lg text-white/90 mt-5">{c.subtext}</p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg" variant="blob">{c.cta}</CtaButton>
          </div>
          <p className="text-sm md:text-base text-white/75 mt-4">Không cam kết, không ràng buộc</p>
        </div>
      </div>
    </div>
  );
}
