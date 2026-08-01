'use client';
import type { PathChooserSlotProps } from '../../../slots';
import { trackEvent } from '../../../../lib/trackEvent';

export function NaturalEditorialPathChooser({ onChoose }: PathChooserSlotProps) {
  return (
    <div
      className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden items-center justify-center px-6"
      style={{ animation: 'pc-fade-in 400ms ease-out both' }}
    >
      <style>{`
        @keyframes pc-fade-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pc-item-in {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-10">
        {/* Heading */}
        <h2
          className="font-serif font-bold text-2xl leading-snug text-center"
          style={{
            color: 'var(--lp-primary)',
            animation: 'pc-item-in 420ms ease-out 60ms both',
          }}
        >
          Trước khi bắt đầu, chúng tôi mong muốn hiểu hơn về da của bạn.
        </h2>

        <div className="w-full flex flex-col items-center gap-5">
          {/* Primary: go to minigame */}
          <button
            onClick={() => {
              trackEvent('path_chosen', { path: 'full_flow' });
              onChoose('full');
            }}
            className="w-full rounded-full py-4 text-base font-bold text-white transition-all active:scale-[0.97] hover:opacity-90"
            style={{
              background: 'var(--lp-accent)',
              animation: 'pc-item-in 420ms ease-out 160ms both',
            }}
          >
            Làm rõ da tôi trước
          </button>

          {/* Hyperlink: go directly to program carousel */}
          <button
            onClick={() => {
              trackEvent('path_chosen', { path: 'browse_programs' });
              onChoose('browse');
            }}
            className="text-sm font-semibold underline underline-offset-2 transition-opacity hover:opacity-60"
            style={{
              color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)',
              animation: 'pc-item-in 420ms ease-out 260ms both',
            }}
          >
            Đặt lịch tư vấn ngay và luôn
          </button>
        </div>
      </div>
    </div>
  );
}
