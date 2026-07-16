'use client';
import type { HookSlotProps } from '../../../slots';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function PlayfulDarkAccentHook({ onStart }: HookSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-primary)] relative flex items-center overflow-hidden">
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-[var(--lp-blob-3)] blur-3xl opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full px-5 md:flex md:items-center md:gap-12 relative z-10">
        <div className="relative h-48 md:h-[420px] mb-4 md:mb-0 flex items-center justify-center shrink-0">
          <img
            src="/face-map-hook.svg"
            alt="Phân tích vùng da mụn"
            className="h-full w-auto max-w-full object-contain drop-shadow-xl"
          />
        </div>

        <div className="flex-1 text-center md:text-left animate-fade-in-up">
          <h1 className="font-extrabold text-4xl md:text-6xl text-white leading-snug [text-wrap:balance]">
            Da mụn không{' '}
            <span className="text-[var(--lp-blob-3)]">tự hết</span>{' '}
            đâu
          </h1>
          <p className="text-base md:text-lg text-white/90 mt-5">
            Cần phác đồ đúng, không cần thêm thử nghiệm. 60 giây phân tích — liệu trình phù hợp cho bạn.
          </p>
          <div className="flex justify-center md:justify-start mt-7">
            <CtaButton onClick={onStart} size="lg" variant="blob">
              Phân tích ngay →
            </CtaButton>
          </div>
          <p className="text-sm md:text-base text-white/75 mt-4">Không cam kết, không ràng buộc</p>
        </div>
      </div>
    </div>
  );
}
