'use client';
import type { TeaserPayoffSlotProps } from '../../../slots';
import type { TeaserPayoffCopy } from '../../../copy';
import { trackEvent } from '../../../../lib/trackEvent';

const DEFAULT_COPY: Required<TeaserPayoffCopy> = {
  heading:       'Khám phá tình trạng da —',
  headingAccent: 'nhận ngay phác đồ cho riêng mình!',
  subtext:       'Chỉ ra vùng da đang có vấn đề. Hệ thống phân tích và gợi ý liệu trình điều trị ngay sau đó — miễn phí.',
  cta:           'Bắt đầu ngay →',
};

export function BoldClassicTeaserPayoff({ onContinue, copy }: TeaserPayoffSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden items-center justify-center px-5"
      style={{ animation: 'fade-in 400ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        @keyframes unblur  { from { filter: blur(8px); opacity: 0.5; } to { filter: blur(0); opacity: 1; } }
        .teaser-card {
          animation: breathe 3.5s ease-in-out 1.8s infinite,
                     unblur  800ms ease-out   1.0s both;
        }
      `}</style>

      <div className="w-full max-w-sm mx-auto flex flex-col gap-7 text-center">

        <div className="flex flex-col gap-3">
          <h1
            className="font-extrabold text-[2.6rem] leading-[1.1] [text-wrap:balance]"
            style={{ color: 'var(--lp-primary)', fontFamily: 'var(--font-plus-jakarta)' }}
          >
            {c.heading}<br />
            <span style={{ color: 'var(--lp-accent)' }}>{c.headingAccent}</span>
          </h1>
          <p
            className="text-sm leading-relaxed max-w-xs mx-auto"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 58%, transparent)' }}
          >
            {c.subtext}
          </p>
        </div>

        <div
          className="teaser-card rounded-soft p-5 text-left"
          style={{
            background: 'color-mix(in srgb, var(--lp-accent) 6%, white)',
            border: '1px solid color-mix(in srgb, var(--lp-accent) 16%, transparent)',
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              style={{ color: 'var(--lp-accent)', flexShrink: 0 }}>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span
              className="text-[11px] font-bold uppercase tracking-widest"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}
            >
              Mở khóa sau khi phân tích
            </span>
          </div>

          <div className="font-extrabold text-base mb-3" style={{ color: 'var(--lp-primary)' }}>
            Phác đồ điều trị cá nhân hóa
          </div>

          <div className="flex flex-col gap-2 mb-3">
            <div className="h-2 w-full rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 13%, white)' }} />
            <div className="h-2 w-4/5 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 13%, white)' }} />
            <div className="h-2 w-11/12 rounded-full" style={{ background: 'color-mix(in srgb, var(--lp-accent) 13%, white)' }} />
          </div>

          <div className="text-xs font-semibold" style={{ color: 'var(--lp-accent)' }}>
            + Liệu trình được gợi ý dựa trên kết quả của bạn
          </div>
        </div>

        <button
          onClick={() => { trackEvent('teaser_continue'); onContinue(); }}
          className="w-full rounded-full py-4 text-base font-bold text-white transition-all active:scale-[0.98]"
          style={{ background: 'var(--lp-accent)' }}
        >
          {c.cta}
        </button>
      </div>
    </div>
  );
}
