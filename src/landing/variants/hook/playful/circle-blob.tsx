'use client';
import type { HookSlotProps } from '../../../slots';
import type { HookCopy } from '../../../copy';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_COPY: Required<HookCopy> = {
  badge:         '',
  heading:       'Hiểu đúng da,',
  headingAccent: 'mọi thứ thay đổi.',
  subtext:       'Bản đồ vùng mụn phân tích chính xác nguyên nhân — 60 giây để biết da bạn đang cần gì.',
  cta:           'Xem bản đồ da của tôi',
  hookImage:     '/image-hook/Picture7.jpg',
};

// Organic blob path — 6 anchors, one concave dent on lower-left for a "pinched" feel
const BLOB_PATH =
  'M 100,15 C 140,5 188,30 175,65 C 163,92 190,98 182,125 C 174,155 168,180 140,188 C 112,196 80,198 55,190 C 50,188 70,142 38,115 C 22,95 12,88 18,75 C 22,58 62,8 100,15 Z';

export function PlayfulCircleBlobHook({ onStart, copy }: HookSlotProps) {
  const c = { ...DEFAULT_COPY, ...copy };
  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden px-4 pt-14 pb-10"
      style={{ background: 'var(--lp-bg-payoff)' }}
    >
      {/* Heading — huge serif, overlaps circle via negative bottom margin */}
      <h1
        className="relative z-20 text-center font-bold leading-[1.08] [text-wrap:balance] w-full max-w-2xl -mb-6 md:-mb-10"
        style={{
          fontSize: 'clamp(1.8rem, 5.6vw, 4.5rem)',
          fontFamily: 'Georgia, "Times New Roman", serif',
          color: '#ffffff',
          textShadow: '0 2px 0 rgba(0,0,0,.58), 0 0 28px rgba(0,0,0,.44)',
        }}
      >
        {c.heading}
        <br />
        <em style={{ fontStyle: 'italic' }}>{c.headingAccent}</em>
      </h1>

      {/* Circle + Blob composition */}
      <div className="relative z-10 w-[200px] h-[200px] md:w-[360px] md:h-[360px] flex-shrink-0">
        {/* Blob SVG — fills entire container */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path fill="var(--lp-accent)" d={BLOB_PATH} />
        </svg>

        {/* Circle photo — centered, 138px mobile / 260px desktop */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                     w-[138px] h-[138px] md:w-[260px] md:h-[260px]
                     rounded-full overflow-hidden z-10"
          style={{
            border: '4px solid rgba(255,255,255,0.92)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          }}
        >
          <img
            src={c.hookImage}
            alt=""
            className="w-full h-full object-cover object-center"
          />
        </div>
      </div>

      {/* Subtext + CTA below composition */}
      <div className="relative z-20 flex flex-col items-center text-center gap-5 mt-6 md:mt-10 max-w-sm md:max-w-md">
        <p
          className="text-sm md:text-base leading-relaxed"
          style={{ color: 'var(--lp-primary)', opacity: 0.72 }}
        >
          {c.subtext}
        </p>
        <CtaButton onClick={onStart} size="lg">
          {c.cta}
        </CtaButton>
        <p className="text-xs" style={{ color: 'var(--lp-primary)', opacity: 0.38 }}>
          Miễn phí · Không cần đăng ký
        </p>
      </div>
    </div>
  );
}
