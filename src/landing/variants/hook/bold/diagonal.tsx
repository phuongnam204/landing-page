'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function BoldDiagonalHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden">
      {/* Top band: bold title */}
      <div
        className="flex-[1] flex items-center justify-center px-5 min-h-0"
        style={{ background: 'var(--lp-band-bg)' }}
      >
        <h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-center leading-[1.1]"
          style={{ color: 'var(--lp-band-text)' }}
        >
          Đã filter đến mức
          <br />
          <span style={{ color: 'var(--lp-band-accent)' }}>không nhận ra mình nữa?</span>
        </h1>
      </div>

      {/* Bottom section: diagonal clip, image + text side by side */}
      <div
        className="flex-[2] flex items-center justify-center px-5"
        style={{
          background: 'var(--lp-bg-hero)',
          clipPath: 'polygon(0 10%, 100% 0, 100% 100%, 0 100%)',
          marginTop: '-32px',
          paddingTop: '56px',
        }}
      >
        <div className="max-w-4xl w-full mx-auto flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div className="shrink-0 flex items-center justify-center order-first md:order-last">
            <img
              src="/face-map-hook.svg"
              alt="Phân tích vùng da"
              className="h-52 md:h-[280px] w-auto object-contain"
              style={{ filter: 'drop-shadow(0 4px 20px color-mix(in srgb, var(--lp-accent) 35%, transparent))' }}
            />
          </div>
          <div className="flex flex-col items-center md:items-start gap-4 text-center md:text-left">
            <p className="text-sm md:text-base text-cta/70 max-w-xs md:max-w-sm leading-relaxed">
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
