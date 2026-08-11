'use client';
import { useState } from 'react';
import type { ProgramId } from '../../../content/programs';
import type { ScoredProgram } from '../../../content/recommend';
import type { ConditionId } from '../../../content/quiz';
import { getPrograms, getConditionById } from '../../../content/catalog';
import { GridWithFaqPrograms } from './GridWithFaqPrograms';

const PALETTE = [
  '#E11D48', '#9333EA', '#2563EB', '#0891B2',
  '#D97706', '#16A34A', '#BE185D', '#4F46E5',
];

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function ConditionBadge({ id, variant }: { id: ConditionId; variant: 'primary' | 'secondary' }) {
  const condition = getConditionById(id);
  const bg    = variant === 'primary' ? '#D1FAE5' : '#FEF3C7';
  const color = variant === 'primary' ? '#059669' : '#D97706';
  return (
    <span
      className="inline-flex items-center gap-0.5 font-semibold rounded-full px-1.5 py-0.5"
      style={{ fontSize: 10, background: bg, color }}
    >
      <svg width="7" height="7" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 7l3.5 3.5 6.5-7" />
      </svg>
      {condition?.label ?? id}
    </span>
  );
}

function RelevantCard({ sp, idx, onDetail }: {
  sp: ScoredProgram;
  idx: number;
  onDetail: (id: ProgramId) => void;
}) {
  const { program, matchedPrimary, matchedSecondary } = sp;
  const color = PALETTE[idx % PALETTE.length];

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', background: 'var(--lp-bg-card)' }}>
      {/* Image */}
      <div
        style={{
          position: 'relative',
          height: 140,
          background: program.images?.[0]
            ? `linear-gradient(to bottom,rgba(0,0,0,0) 40%,rgba(0,0,0,0.52) 100%),url('${program.images[0]}') center/cover no-repeat`
            : color,
        }}
      >
        {(program.sessions || program.isVip) && (
          <span
            style={{
              position: 'absolute',
              bottom: 6,
              left: 6,
              background: `rgba(${hexToRgb(color)},0.78)`,
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 20,
              padding: '2px 8px',
              fontSize: 10,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.4,
            }}
          >
            {program.isVip && 'VIP'}
            {program.isVip && program.sessions ? ' · ' : ''}
            {program.sessions ? `${program.sessions} buổi` : ''}
          </span>
        )}
      </div>

      {/* Text */}
      <div style={{ padding: '10px 10px 9px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <h3
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--lp-primary)',
            lineHeight: 1.3,
            margin: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {program.name}
        </h3>

        {(matchedPrimary.length > 0 || matchedSecondary.length > 0) && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {matchedPrimary.map(id => (
              <ConditionBadge key={id} id={id as ConditionId} variant="primary" />
            ))}
            {matchedSecondary.map(id => (
              <ConditionBadge key={id} id={id as ConditionId} variant="secondary" />
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(program.summary ?? []).slice(0, 2).map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
              <svg
                width="10" height="10" viewBox="0 0 14 14" fill="none"
                style={{ flexShrink: 0, marginTop: 2 }}
                aria-hidden="true"
              >
                <path d="M2.5 7l3 3 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: 10, lineHeight: 1.4, color: 'var(--lp-primary)', opacity: 0.6 }}>{s}</span>
            </div>
          ))}
        </div>

        <button
          onClick={() => onDetail(program.id as ProgramId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: 11,
            fontWeight: 700,
            color,
            marginTop: 2,
          }}
        >
          Xem chi tiết liệu trình
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M5 3l5 4-5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function RelevantPrograms({ programs, onContinue, onBack }: {
  programs: ScoredProgram[];
  onContinue: (id: ProgramId) => void;
  onBack?: () => void;
}) {
  const [detailId,      setDetailId]      = useState<ProgramId | null>(null);
  const [detailLeaving, setDetailLeaving] = useState(false);

  const allPrograms = getPrograms();
  const detailProg  = detailId ? allPrograms.find(p => p.id === detailId) : null;
  const detailSP: ScoredProgram[] = (() => {
    if (!detailProg) return programs;
    const found = programs.find(sp => sp.program.id === detailId);
    return found ? [found] : [{ program: detailProg, score: 0, matchedPrimary: [], matchedSecondary: [] }];
  })();

  const sheetOpen = !!detailId && !detailLeaving;

  function openDetail(id: ProgramId) { setDetailId(id); setDetailLeaving(false); }
  function closeDetail() {
    setDetailLeaving(true);
    setTimeout(() => { setDetailId(null); setDetailLeaving(false); }, 320);
  }

  return (
    <div style={{ position: 'relative', minHeight: '100dvh', overflow: 'hidden' }}>
      <style>{`
        @keyframes sheet-in { from { transform: translateY(100%); border-radius: 24px 24px 0 0; } to { transform: translateY(0); border-radius: 0; } }
        @keyframes sheet-out { from { transform: translateY(0); border-radius: 0; } to { transform: translateY(105%); border-radius: 24px 24px 0 0; } }
      `}</style>

      <div
        style={{
          minHeight: '100dvh',
          overflowY: 'auto',
          background: 'var(--lp-bg-programs)',
          transition: 'transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 380ms ease',
          transform: sheetOpen ? 'scale(0.91) translateY(-18px)' : 'scale(1) translateY(0)',
          opacity: sheetOpen ? 0.42 : 1,
          transformOrigin: 'top center',
          pointerEvents: detailId ? 'none' : 'auto',
        }}
      >
        {/* Sticky header */}
        <div className="sticky top-0 z-10 px-5 pt-4 pb-3" style={{ background: 'var(--lp-bg-programs)' }}>
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-semibold mb-3 transition-opacity hover:opacity-70"
              style={{ color: 'var(--lp-accent)' }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Quay lại
            </button>
          )}
          <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--lp-accent)' }}>
            Phù hợp với da của bạn
          </p>
          <h2 className="font-extrabold text-xl text-cta">Liệu trình liên quan</h2>
        </div>

        <div className="px-4 pb-10">
          <div className="grid grid-cols-2 gap-3 md:max-w-sm md:mx-auto">
            {programs.map((sp, idx) => (
              <RelevantCard key={sp.program.id} sp={sp} idx={idx} onDetail={openDetail} />
            ))}
          </div>
        </div>
      </div>

      {detailId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            animation: detailLeaving
              ? 'sheet-out 340ms cubic-bezier(0.4, 0, 1, 1) forwards'
              : 'sheet-in  430ms cubic-bezier(0.32, 0.72, 0, 1) forwards',
            overflow: 'hidden',
            boxShadow: '0 -12px 48px rgba(0,0,0,0.20)',
          }}
        >
          <GridWithFaqPrograms suggestedPrograms={detailSP} onContinue={onContinue} onBrowse={closeDetail} />
        </div>
      )}
    </div>
  );
}
