'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { ProgramId } from '../../../content/programs';
import type { ScoredProgram } from '../../../content/recommend';
import type { ConditionId } from '../../../content/quiz';
import { getPrograms } from '../../../content/catalog';
import { GridWithFaqPrograms } from './GridWithFaqPrograms';

// ─── Constants ────────────────────────────────────────────────────────────────

const CARD_STEP      = 240;   // px between card centers
const CARD_WIDTH     = 260;   // px card width
const CARD_HEIGHT    = 360;   // px card total height (40% image + 60% text)
const SPRING_K       = 0.22;  // spring stiffness (0–1, higher = snappier)
const SPRING_THRESH  = 0.4;   // px — stop spring below this
const SNAP_THRESHOLD = CARD_STEP * 0.3; // drag distance to trigger snap
const EDGE_DAMPING   = 0.22;  // resistance at first/last card

const PALETTE = [
  '#E11D48',  // rose — vivid hot rose
  '#9333EA',  // purple — electric violet
  '#2563EB',  // blue — bold clear blue
  '#0891B2',  // cyan — vivid teal
  '#D97706',  // amber — warm orange
  '#16A34A',  // green — fresh vivid green
  '#BE185D',  // pink — hot magenta-pink
  '#4F46E5',  // indigo — rich indigo
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cardColor(_program: ReturnType<typeof getPrograms>[number], idx: number): string {
  return PALETTE[idx % PALETTE.length];
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

// ─── CarouselPrograms ────────────────────────────────────────────────────────

export function CarouselPrograms({ suggestedPrograms, onContinue, onBack }: ProgramsSlotProps) {
  const allPrograms = getPrograms();
  const topId    = suggestedPrograms[0]?.program.id;
  const startIdx = Math.max(0, allPrograms.findIndex(p => p.id === topId));

  // ── React state (only triggers re-render for dots/counter/detail) ──
  const [activeIdx,       setActiveIdx]       = useState(startIdx);
  const [detailId,        setDetailId]        = useState<ProgramId | null>(null);
  const [detailLeaving,   setDetailLeaving]   = useState(false);

  // ── Gesture refs (no React re-render during drag) ──
  const containerRef    = useRef<HTMLDivElement>(null);
  const cardRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const activeIdxRef    = useRef(startIdx);
  const dragX           = useRef(0);
  const isDragging      = useRef(false);
  const pointerStartX   = useRef(0);
  const pointerStartDX  = useRef(0);
  const animFrameRef    = useRef<number | null>(null);

  // ── Imperative render — runs at 60fps, never re-renders React ──
  const renderFrame = useCallback(() => {
    allPrograms.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const baseX  = (i - activeIdxRef.current) * CARD_STEP + dragX.current;
      const absFrac = Math.abs(baseX) / CARD_STEP;

      // Hide cards too far off-screen
      if (absFrac > 2.8) { el.style.display = 'none'; return; }
      el.style.display = 'block';

      const scale   = Math.max(0.62, 1 - absFrac * 0.165);
      const opacity = Math.max(0.38, 1 - absFrac * 0.48);
      const shadow  = absFrac < 0.4
        ? `0 16px 48px ${cardColor(allPrograms[i], i)}50, 0 4px 16px rgba(0,0,0,0.10)`
        : '0 4px 16px rgba(0,0,0,0.07)';
      const zIdx    = Math.max(1, 20 - Math.round(absFrac * 4));

      el.style.transform = `translateX(calc(-50% + ${baseX}px)) translateY(-50%) scale(${scale})`;
      el.style.opacity   = `${opacity}`;
      el.style.zIndex    = `${zIdx}`;
      el.style.boxShadow = shadow;
    });
  }, [allPrograms]);

  // ── Spring snap to a target index ──
  const springTo = useCallback((targetIdx: number) => {
    // Compensate dragX so visual positions don't jump when activeIdx changes.
    // Formula: for any card i, visualX = (i - activeIdx)*STEP + dragX
    // To keep visualX constant after activeIdx changes: dragX += (newIdx - oldIdx)*STEP
    dragX.current += (targetIdx - activeIdxRef.current) * CARD_STEP;
    activeIdxRef.current = targetIdx;
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }

    function step() {
      dragX.current += (0 - dragX.current) * SPRING_K;
      renderFrame();
      if (Math.abs(dragX.current) < SPRING_THRESH) {
        dragX.current = 0;
        renderFrame();
        setActiveIdx(targetIdx); // triggers dot/counter re-render
        animFrameRef.current = null;
        return;
      }
      animFrameRef.current = requestAnimationFrame(step);
    }
    animFrameRef.current = requestAnimationFrame(step);
  }, [renderFrame]);

  // ── Release handler (shared between pointer and touch) ──
  const onRelease = useCallback(() => {
    isDragging.current = false;
    const delta = dragX.current;
    if (Math.abs(delta) > SNAP_THRESHOLD) {
      const dir    = delta < 0 ? 1 : -1;
      const newIdx = Math.max(0, Math.min(allPrograms.length - 1, activeIdxRef.current + dir));
      springTo(newIdx);
    } else {
      springTo(activeIdxRef.current);
    }
  }, [springTo, allPrograms.length]);

  // ── Pointer events (mouse / stylus — NOT touch) ──
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
    isDragging.current  = true;
    pointerStartX.current  = e.clientX;
    pointerStartDX.current = dragX.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !isDragging.current) return;
    const delta = e.clientX - pointerStartX.current;
    const raw   = pointerStartDX.current + delta;
    const atStart = activeIdxRef.current === 0 && raw > 0;
    const atEnd   = activeIdxRef.current === allPrograms.length - 1 && raw < 0;
    dragX.current = (atStart || atEnd) ? raw * EDGE_DAMPING : raw;
    renderFrame();
  }, [renderFrame, allPrograms.length]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch' || !isDragging.current) return;
    onRelease();
  }, [onRelease]);

  // ── Touch events — added imperatively so we can pass passive:false ──
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let touchStartX = 0;
    let touchStartDX = 0;

    function onTouchStart(e: TouchEvent) {
      if (animFrameRef.current) { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = null; }
      isDragging.current  = true;
      touchStartX  = e.touches[0].clientX;
      touchStartDX = dragX.current;
    }
    function onTouchMove(e: TouchEvent) {
      if (!isDragging.current) return;
      e.preventDefault();
      const delta = e.touches[0].clientX - touchStartX;
      const raw   = touchStartDX + delta;
      const atStart = activeIdxRef.current === 0 && raw > 0;
      const atEnd   = activeIdxRef.current === allPrograms.length - 1 && raw < 0;
      dragX.current = (atStart || atEnd) ? raw * EDGE_DAMPING : raw;
      renderFrame();
    }
    function onTouchEnd() {
      if (!isDragging.current) return;
      onRelease();
    }

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove',  onTouchMove,  { passive: false });
    container.addEventListener('touchend',   onTouchEnd,   { passive: true });
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove',  onTouchMove);
      container.removeEventListener('touchend',   onTouchEnd);
    };
  }, [renderFrame, onRelease, allPrograms.length]);

  // ── Initial render + resize ──
  useEffect(() => {
    renderFrame();
    const ro = new ResizeObserver(() => renderFrame());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [renderFrame]);

  // ── Arrow navigation ──
  const goTo = useCallback((idx: number) => {
    springTo(Math.max(0, Math.min(allPrograms.length - 1, idx)));
  }, [springTo, allPrograms.length]);

  // ── Detail slide-in/out ──
  function openDetail(id: ProgramId) {
    setDetailId(id);
    setDetailLeaving(false);
  }
  function closeDetail() {
    setDetailLeaving(true);
    setTimeout(() => { setDetailId(null); setDetailLeaving(false); }, 320);
  }

  // ── Detail data (computed regardless of whether overlay is visible) ──
  const detailProg = detailId ? allPrograms.find(p => p.id === detailId) : null;
  const detailSP: ScoredProgram[] = detailProg
    ? [{ program: detailProg, score: 1, matchedPrimary: detailProg.primaryConditionIds as ConditionId[], matchedSecondary: [] }]
    : suggestedPrograms;

  // ── Sheet-open state (true while overlay is entering OR present, false while leaving) ──
  const sheetOpen = !!detailId && !detailLeaving;

  // ─── Combined view (carousel + optional overlay) ───────────────────────────
  return (
    <div style={{ position: 'relative', height: '100dvh', overflow: 'hidden' }}>
      <style>{`
        @keyframes sheet-in {
          from { transform: translateY(100%); border-radius: 24px 24px 0 0; }
          to   { transform: translateY(0);    border-radius: 0 0 0 0; }
        }
        @keyframes sheet-out {
          from { transform: translateY(0);    border-radius: 0 0 0 0; }
          to   { transform: translateY(105%); border-radius: 24px 24px 0 0; }
        }
        @media (hover: hover) {
          .carousel-card {
            border-bottom: 3px solid transparent;
            transition: transform 200ms ease, border-bottom-color 200ms ease;
          }
          .carousel-card:hover {
            transform: translateY(-5px);
            border-bottom-color: var(--card-color);
          }
        }
      `}</style>

      {/* ── Carousel (scales back when sheet opens — iOS modal push) ── */}
      <div
        className="h-[100dvh] w-full flex flex-col items-center justify-center gap-5 select-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.58)),url('/background/nha-thuoc-3-new.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          cursor: 'grab',
          transition: 'transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 380ms ease',
          transform: sheetOpen ? 'scale(0.91) translateY(-18px)' : 'scale(1) translateY(0)',
          opacity: sheetOpen ? 0.42 : 1,
          transformOrigin: 'top center',
          pointerEvents: detailId ? 'none' : 'auto',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
      {/* Header */}
      <div className="text-center px-5 shrink-0 pointer-events-none">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
          Tất cả liệu trình
        </p>
        <h2 className="font-extrabold text-2xl leading-snug" style={{ color: 'white' }}>Chọn liệu trình phù hợp</h2>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Vuốt hoặc kéo để xem thêm</p>
      </div>

      {/* Card stage */}
      <div
        ref={containerRef}
        className="relative w-full shrink-0"
        style={{ height: `${CARD_HEIGHT + 20}px`, overflow: 'visible' }}
      >
        {allPrograms.map((prog, idx) => {
          const color = cardColor(prog, idx);
          return (
            <div
              key={prog.id}
              ref={el => { cardRefs.current[idx] = el; }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${CARD_WIDTH}px`,
                willChange: 'transform, opacity',
                transition: 'box-shadow 200ms ease',
                cursor: 'pointer',
              }}
              onClick={() => {
                if (!isDragging.current && Math.abs(dragX.current) < 8) {
                  const isActive = idx === activeIdxRef.current;
                  if (isActive) openDetail(prog.id as ProgramId);
                  else goTo(idx);
                }
              }}
            >
              <div className="rounded-2xl overflow-hidden">
                {/* Colored header */}
                <div className="px-5 pt-5 pb-4" style={{ background: color }}>
                  {prog.isVip && (
                    <span className="inline-block mb-2 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white/25 text-white">VIP</span>
                  )}
                  <h3 className="font-extrabold text-[17px] text-white leading-snug">{prog.name}</h3>
                  {prog.sessions && (
                    <p className="text-white/65 text-xs mt-0.5 font-semibold">{prog.sessions} buổi</p>
                  )}
                </div>

                {/* Bullet summary */}
                <div className="px-5 py-4 flex flex-col gap-2" style={{ background: 'var(--lp-bg-card)' }}>
                  {(prog.summary ?? []).slice(0, 3).map((s, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-cta/75">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0 mt-0.5" aria-hidden="true">
                        <path d="M2.5 7l3 3 6-6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="px-5 pb-5 pt-3" style={{ background: 'var(--lp-bg-card)' }}>
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => {
                      e.stopPropagation();
                      const isActive = idx === activeIdxRef.current;
                      if (isActive) openDetail(prog.id as ProgramId);
                      else goTo(idx);
                    }}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90 active:scale-[0.97]"
                    style={{ background: color }}
                  >
                    Xem chi tiết liệu trình
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5 items-center shrink-0">
        {allPrograms.map((_, idx) => (
          <button
            key={idx}
            onPointerDown={e => e.stopPropagation()}
            onClick={() => goTo(idx)}
            aria-label={`Liệu trình ${idx + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              width:      idx === activeIdx ? '20px' : '8px',
              height:     '8px',
              background: idx === activeIdx ? 'white' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>

      {/* Arrow navigation + counter */}
      <div className="flex gap-4 items-center shrink-0">
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={() => goTo(activeIdx - 1)}
          disabled={activeIdx === 0}
          aria-label="Trước"
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-opacity disabled:opacity-25"
          style={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.55)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="text-sm font-semibold tabular-nums min-w-[48px] text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {activeIdx + 1} / {allPrograms.length}
        </span>

        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={() => goTo(activeIdx + 1)}
          disabled={activeIdx === allPrograms.length - 1}
          aria-label="Tiếp"
          className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-opacity disabled:opacity-25"
          style={{ borderColor: 'rgba(255,255,255,0.55)', color: 'rgba(255,255,255,0.55)' }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Back button */}
      {onBack && (
        <button
          onPointerDown={e => e.stopPropagation()}
          onClick={onBack}
          className="shrink-0 flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Quay lại
        </button>
      )}
      </div>

      {/* ── Detail sheet overlay ── */}
      {detailId && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
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
