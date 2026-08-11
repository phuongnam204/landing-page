'use client';
import type { ScoredProgram } from '../../../content/recommend';

export interface BrowseChooserProps {
  relevant: ScoredProgram[];
  onRelevant: () => void;
  onAll: () => void;
  onBack?: () => void;
}

const ARROW = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
    <path d="M4 8h8M10 5l3 3-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function BrowseChooser({ relevant, onRelevant, onAll, onBack }: BrowseChooserProps) {
  const hasTwoCtas = relevant.length > 0;

  return (
    <div
      className="min-h-[100dvh] flex flex-col md:flex-row"
      style={{ background: 'var(--lp-bg-programs)' }}
    >
      {/* ── Content column ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 md:flex-none md:w-[38%] p-5 pb-8 md:p-12 md:justify-center">

        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-semibold mb-6 transition-opacity hover:opacity-70 self-start underline underline-offset-2"
            style={{ color: 'var(--lp-accent)' }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Quay lại
          </button>
        )}

        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--lp-accent)' }}>
          Khám phá liệu trình
        </p>
        <h2 className="font-extrabold text-xl text-cta leading-snug mb-6">
          Bạn muốn bắt đầu từ đâu?
        </h2>

        {/* CTAs: 2-col grid on mobile (when both exist), fit-width col on desktop */}
        <div
          className={`grid gap-3 mb-6 md:flex md:flex-col md:items-start ${hasTwoCtas ? 'grid-cols-2' : 'grid-cols-1'}`}
        >
          {hasTwoCtas && (
            <button
              onClick={onRelevant}
              className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 p-3 md:p-4 text-left transition-opacity hover:opacity-90 active:opacity-75"
              style={{ background: 'var(--lp-accent)', border: 'none', borderRadius: 20 }}
            >
              <div className="min-w-0">
                <p className="font-bold text-sm text-white leading-snug">Liệu trình phù hợp với bạn</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Dựa trên tình trạng da vừa phân tích
                </p>
              </div>
              <span className="text-white/70">{ARROW}</span>
            </button>
          )}

          <button
            onClick={onAll}
            className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 p-3 md:p-4 text-left transition-opacity hover:opacity-90 active:opacity-75"
            style={{ background: 'var(--lp-bg-card)', border: '1.5px solid var(--lp-border)', borderRadius: 20 }}
          >
            <div className="min-w-0">
              <p className="font-bold text-sm text-cta leading-snug">Xem tất cả liệu trình</p>
              <p className="text-xs mt-0.5 text-cta/45">Khám phá toàn bộ danh mục</p>
            </div>
            <span style={{ color: 'var(--lp-accent)' }}>{ARROW}</span>
          </button>
        </div>

        {/* Mascot — mobile only, grows from bottom */}
        <div className="md:hidden flex-1 flex items-end justify-center min-h-0 overflow-hidden">
          <img
            src="/mascots/nurse-review.png"
            alt=""
            aria-hidden="true"
            className="object-contain object-bottom"
            style={{
              width: '100%',
              maxHeight: 'clamp(260px, 52dvh, 460px)',
              animation: 'bc-nurse-float 3.5s ease-in-out infinite',
              filter: 'drop-shadow(0 8px 24px color-mix(in srgb, var(--lp-accent) 18%, transparent))',
            }}
          />
        </div>

        <style>{`
          @keyframes bc-nurse-float {
            0%, 100% { transform: translateY(0px); }
            50%       { transform: translateY(-16px); }
          }
        `}</style>
      </div>

      {/* ── Desktop nurse column ────────────────────────────────────────── */}
      <div
        className="hidden md:flex flex-1 relative overflow-hidden items-center justify-center"
        style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, var(--lp-bg-programs))' }}
      >
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', width: 300, height: 300, borderRadius: '50%',
          background: 'color-mix(in srgb, var(--lp-accent) 16%, transparent)',
          bottom: -90, right: -90,
        }} />
        <div style={{
          position: 'absolute', width: 150, height: 150, borderRadius: '50%',
          background: 'color-mix(in srgb, var(--lp-accent) 11%, transparent)',
          top: 50, left: 50,
        }} />
        <div style={{
          position: 'absolute', width: 64, height: 64, borderRadius: '50%',
          background: 'color-mix(in srgb, var(--lp-accent) 20%, transparent)',
          top: 110, right: 100,
        }} />

        <img
          src="/mascots/nurse-review.png"
          alt=""
          aria-hidden="true"
          style={{
            position: 'relative', zIndex: 1,
            width: '90%', maxWidth: 500,
            objectFit: 'contain',
            maxHeight: '88dvh',
            animation: 'bc-nurse-float 3.5s ease-in-out infinite',
            filter: 'drop-shadow(0 16px 48px color-mix(in srgb, var(--lp-accent) 22%, transparent))',
          }}
        />
      </div>
    </div>
  );
}
