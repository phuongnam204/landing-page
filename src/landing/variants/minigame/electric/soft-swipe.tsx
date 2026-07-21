'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import type { MinigameCopy } from '../../../copy';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';
import { FaceDiagram, type Zone } from '../face-map';

const ZONE_LABEL: Record<Zone, string> = {
  forehead:      'Trán',
  nose:          'Mũi',
  'left-cheek':  'Má trái',
  'right-cheek': 'Má phải',
  'chin-jaw':    'Cằm & quai hàm',
};

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'wheel' | 'face-map' | 'scanning' | 'done';

interface SwipeCard {
  id: string;
  label: string;
  description: string;
  conditionId: ConditionId;
  zones: Zone[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ARC_CY_OFFSET = 60;
const ARC_STEP = 22;
const DRAG_SENS = 6.5;
const SPRING_STIFFNESS = 0.2;
const SPRING_THRESHOLD = 0.04;
const DAMPING = 0.22;

const CARDS: SwipeCard[] = [
  { id: 'oily',    label: 'Da nhờn, bóng dầu',           description: 'Mặt hay bóng dầu, đặc biệt vùng trán và mũi', conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'] },
  { id: 'acne',    label: 'Mụn viêm, mụn bọc',            description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',   conditionId: 'mun-trung-ca',     zones: ['left-cheek', 'right-cheek'] },
  { id: 'dry-red', label: 'Da khô, đỏ, dễ kích ứng',      description: 'Da căng rát sau rửa mặt, dễ bong tróc',       conditionId: 'da-nhay-cam',      zones: ['left-cheek', 'right-cheek', 'forehead'] },
  { id: 'pores',   label: 'Lỗ chân lông to, ít mụn',      description: 'Lỗ chân lông nhìn thấy rõ, da xuất hiện đầu đen', conditionId: 'lo-chan-long', zones: ['nose', 'forehead'] },
  { id: 'clear',   label: 'Da khỏe, không vấn đề rõ rệt', description: 'Da khá ổn định, không có mụn hay kích ứng thường xuyên', conditionId: 'clean-skin', zones: [] },
];

const DEFAULT_COPY: Required<MinigameCopy> = {
  intro:    { heading: 'Chọn tình trạng da của bạn', subtext: 'Xoay bánh xe để duyệt qua các tình trạng da phổ biến, rồi chạm vào thẻ ở giữa để chọn.', cta: 'Bắt đầu →' },
  wheel:    { heading: 'Da của bạn dạo này thế nào?', subtext: 'Vuốt sang trái để chọn mô tả phù hợp nhất' },
  faceMap:  { heading: 'Vùng da nào bị ảnh hưởng?', subtext: 'Chạm để chọn hoặc bỏ chọn từng vùng' },
  scanning: { heading: 'Đang phân tích...' },
};

const MIN_ANGLE = 0;
const MAX_ANGLE = (CARDS.length - 1) * ARC_STEP;

// ─── Arc math ─────────────────────────────────────────────────────────────────

function arcPos(angleDeg: number, cx: number, cy: number, arcR: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + arcR * Math.sin(rad), y: cy - arcR * Math.cos(rad) };
}

interface CardVisual {
  x: number; y: number;
  w: number; h: number;
  opacity: number;
  tilt: number;
  zIndex: number;
  bgAlpha: number;
  hidden: boolean;
  isCenter: boolean;
  t: number;
}

function cardVisual(cardAngle: number, cx: number, cy: number, baseW: number, arcR: number): CardVisual {
  const abs = Math.abs(cardAngle);
  const t = abs / ARC_STEP;
  const baseH = Math.round(baseW * 1.26);
  const minW = Math.round(baseW * 0.56);
  const minH = Math.round(baseH * 0.56);
  const { x, y } = arcPos(cardAngle, cx, cy, arcR);
  return {
    x, y,
    w: Math.max(minW, Math.round(baseW - t * baseW * 0.18)),
    h: Math.max(minH, Math.round(baseH - t * baseH * 0.19)),
    opacity: Math.max(0.08, 1 - t * 0.55),
    tilt: -cardAngle * 0.55,
    zIndex: Math.max(1, Math.round(20 - abs)),
    bgAlpha: Math.max(0.06, 1 - t * 0.92),
    hidden: t > 2.7,
    isCenter: t < 0.4,
    t,
  };
}

function clampWithDamping(angle: number): number {
  if (angle < MIN_ANGLE) return MIN_ANGLE + (angle - MIN_ANGLE) * DAMPING;
  if (angle > MAX_ANGLE) return MAX_ANGLE + (angle - MAX_ANGLE) * DAMPING;
  return angle;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ElectricSoftSwipeMinigame({ onComplete, copy }: MinigameSlotProps) {
  // ─── State ──────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [checkCardIdx, setCheckCardIdx] = useState<number | null>(null);

  const c = {
    intro:    { ...DEFAULT_COPY.intro,    ...copy?.intro    },
    wheel:    { ...DEFAULT_COPY.wheel,    ...copy?.wheel    },
    faceMap:  { ...DEFAULT_COPY.faceMap,  ...copy?.faceMap  },
    scanning: { ...DEFAULT_COPY.scanning, ...copy?.scanning },
  };

  // ─── Wheel refs (no re-render during gesture) ────────────────────────────────
  const wheelAngle = useRef(0);
  const animFrame = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const isDragging = useRef(false);
  const wheelLocked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ─── Imperative render (60fps, no React re-render) ───────────────────────────
  const renderFrame = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    // Dynamic center — works on desktop and mobile
    const cx = container.offsetWidth / 2;
    const cy = container.offsetHeight + ARC_CY_OFFSET;
    const isWide = container.offsetWidth >= 600;
    // Arc radius: wider screens get a wider arc, tall screens get a deeper arc
    const arcR = isWide
      ? Math.max(350, Math.round(container.offsetWidth * 0.32))
      : Math.max(280, Math.round(container.offsetHeight * 0.72));
    // Card width: ~52% of width on mobile, ~36% on desktop, capped at 275px
    const baseW = Math.min(275, Math.max(200, Math.round(
      isWide ? container.offsetWidth * 0.36 : container.offsetWidth * 0.52
    )));
    const centerIdx = Math.round(wheelAngle.current / ARC_STEP);

    CARDS.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      // i * STEP - wheelAngle: positive = right of center, negative = left
      const angle = i * ARC_STEP - wheelAngle.current;
      const v = cardVisual(angle, cx, cy, baseW, arcR);

      if (v.hidden) { el.style.display = 'none'; return; }
      el.style.display = 'flex';
      el.style.left = `${v.x - v.w / 2}px`;
      el.style.top = `${v.y - v.h / 2}px`;
      el.style.width = `${v.w}px`;
      el.style.height = `${v.h}px`;
      el.style.opacity = `${v.opacity}`;
      el.style.zIndex = `${v.zIndex}`;
      el.style.transform = `rotate(${v.tilt}deg)`;

      if (v.isCenter) {
        el.style.background = 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))';
        el.style.boxShadow = '0 8px 28px color-mix(in srgb, var(--lp-accent) 22%, transparent)';
        el.style.border = '2px solid var(--lp-accent)';
        el.style.backdropFilter = 'none';
      } else {
        el.style.background = 'var(--lp-bg-card)';
        el.style.boxShadow = 'none';
        el.style.border = '2px solid var(--lp-border)';
        el.style.backdropFilter = 'none';
      }
    });

    const dotsEl = document.getElementById('wh-dots');
    if (dotsEl) {
      dotsEl.querySelectorAll<HTMLDivElement>('[data-dot]').forEach((dot, i) => {
        const active = i === centerIdx;
        dot.style.background = active ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 22%, transparent)';
        dot.style.width = active ? '18px' : '6px';
      });
    }
  }, []);

  // Trigger initial render when wheel mounts. ResizeObserver re-fires if
  // container size changes (resize, orientation), keeping cards centered.
  useEffect(() => {
    if (phase !== 'wheel') return;
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver(() => renderFrame());
    ro.observe(container);
    renderFrame();
    return () => ro.disconnect();
  }, [phase, renderFrame]);

  // ─── Spring + snap ─────────────────────────────────────────────────────────
  const springTo = useCallback((target: number) => {
    if (animFrame.current !== null) cancelAnimationFrame(animFrame.current);
    function step() {
      wheelAngle.current += (target - wheelAngle.current) * SPRING_STIFFNESS;
      renderFrame();
      if (Math.abs(target - wheelAngle.current) < SPRING_THRESHOLD) {
        wheelAngle.current = target;
        renderFrame();
        animFrame.current = null;
        return;
      }
      animFrame.current = requestAnimationFrame(step);
    }
    animFrame.current = requestAnimationFrame(step);
  }, [renderFrame]);

  const snapBy = useCallback((dir: -1 | 1) => {
    if (wheelLocked.current) return;
    const current = Math.round(wheelAngle.current / ARC_STEP);
    const next = Math.max(0, Math.min(CARDS.length - 1, current + dir));
    springTo(next * ARC_STEP);
  }, [springTo]);

  // ─── Pointer handlers ───────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (wheelLocked.current) return;
    if (animFrame.current !== null) { cancelAnimationFrame(animFrame.current); animFrame.current = null; }
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragStartAngle.current = wheelAngle.current;
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || wheelLocked.current) return;
    const raw = dragStartAngle.current - (e.clientX - dragStartX.current) / DRAG_SENS;
    wheelAngle.current = clampWithDamping(raw);
    renderFrame();
  }, [renderFrame]);

  // ─── Card tap → select center / spring to flanking ──────────────────────────
  const handleCardTap = useCallback((cardIdx: number) => {
    if (wheelLocked.current) return;
    const centerIdx = Math.round(wheelAngle.current / ARC_STEP);
    if (cardIdx !== centerIdx) {
      springTo(cardIdx * ARC_STEP);
      return;
    }
    wheelLocked.current = true;
    if (animFrame.current !== null) { cancelAnimationFrame(animFrame.current); animFrame.current = null; }
    setSelectedCardIdx(cardIdx);
    setCheckCardIdx(cardIdx);
    setTimeout(() => {
      setCheckCardIdx(null);
      setSelectedZones(CARDS[cardIdx].zones);
      setPhase('face-map');
    }, 900);
  }, [springTo]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    const dragDelta = Math.abs(e.clientX - dragStartX.current);
    isDragging.current = false;
    const target = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, Math.round(wheelAngle.current / ARC_STEP) * ARC_STEP));
    springTo(target);

    // Tap detection (setPointerCapture redirects pointerup to container, so onClick on
    // card children doesn't fire reliably on desktop — we hit-test manually instead).
    if (e.type === 'pointerup' && dragDelta < 8) {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const tapX = e.clientX - rect.left;
      const tapY = e.clientY - rect.top;
      let tappedIdx = -1;
      let highestZ = -1;
      CARDS.forEach((_, i) => {
        const el = cardRefs.current[i];
        if (!el || el.style.display === 'none') return;
        const l = parseFloat(el.style.left);
        const t = parseFloat(el.style.top);
        const w = parseFloat(el.style.width);
        const h = parseFloat(el.style.height);
        const z = parseInt(el.style.zIndex) || 0;
        if (tapX >= l && tapX <= l + w && tapY >= t && tapY <= t + h && z > highestZ) {
          tappedIdx = i;
          highestZ = z;
        }
      });
      if (tappedIdx >= 0) handleCardTap(tappedIdx);
    }
  }, [springTo, handleCardTap]);

  // ─── Face-map zone toggle ───────────────────────────────────────────────────
  const toggleZone = useCallback((zoneId: Zone) => {
    setSelectedZones(prev =>
      prev.includes(zoneId) ? prev.filter(z => z !== zoneId) : [...prev, zoneId]
    );
  }, []);

  // ─── Scanning → onComplete ──────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'scanning') return;
    // FaceDiagram handles the 1.2s scan animation internally via isScanning prop
    const timeout = setTimeout(() => {
      if (selectedCardIdx === null) return;
      const card = CARDS[selectedCardIdx];
      const condition = skinConditions[card.conditionId]!;
      onComplete({
        condition,
        conditions: [condition],
        zoneIds: selectedZones,
        zoneLabel: selectedZones.map(z => ZONE_LABEL[z]).join(', ') || 'Không có vùng cụ thể',
        triggerNote: card.label,
      });
    }, 1800);
    return () => clearTimeout(timeout);
  }, [phase, selectedCardIdx, selectedZones, onComplete]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden" style={{ background: 'var(--lp-bg-hero)' }}>
      {/* Phone-width constraint on desktop */}
      <div
        className="flex-1 flex flex-col overflow-hidden w-full md:max-w-[480px] md:mx-auto"
        style={{ animation: 'fade-in 350ms ease-out both' }}
      >
        <style>{`
          @keyframes fade-in { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
          @keyframes check-draw { to { stroke-dashoffset: 0 } }
          @keyframes check-pop { 0% { transform:scale(0.3); opacity:0; } 65% { transform:scale(1.18); opacity:1; } 100% { transform:scale(1); opacity:1; } }
          @keyframes check-glow-pulse { 0%,100% { box-shadow: 0 0 18px #22c55e55, 0 6px 24px #22c55e33; } 50% { box-shadow: 0 0 40px #22c55eaa, 0 8px 40px #22c55e55; } }
        `}</style>

        {/* Header bar */}
        <div
          className="sticky top-0 z-20 flex items-center justify-between px-5 md:px-10 py-3 md:py-4 border-b"
          style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--lp-primary)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>
            <div className="text-sm md:text-base font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin · Kiểm tra da</div>
          </div>
          <div className="text-xs md:text-sm font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
            {phase === 'intro' && 'Hướng dẫn'}
            {phase === 'wheel' && `Thẻ ${Math.round(wheelAngle.current / ARC_STEP) + 1} / ${CARDS.length}`}
            {(phase === 'face-map' || phase === 'scanning') && 'Bước 2 / 2'}
          </div>
        </div>

        {/* ── Intro ── */}
        {phase === 'intro' && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 gap-7"
            style={{ animation: 'fade-in 350ms ease-out both' }}>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                  style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 25%, transparent)', background: 'color-mix(in srgb, var(--lp-primary) 6%, white)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>Trước</span>
              </div>

              <div className="w-24 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-md"
                style={{ background: 'var(--lp-bg-card)', border: '1.5px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, white)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--lp-accent)" strokeWidth="2">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                  </svg>
                </div>
                <div className="text-[10px] font-bold text-center leading-tight px-1" style={{ color: 'var(--lp-primary)' }}>
                  Tình trạng da
                </div>
              </div>

              <div className="flex flex-col items-center gap-1.5">
                <div className="w-14 h-14 rounded-2xl border-2 flex items-center justify-center"
                  style={{ borderColor: 'var(--lp-accent)', background: 'color-mix(in srgb, var(--lp-accent) 10%, white)' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ color: 'var(--lp-accent)' }}>
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold" style={{ color: 'var(--lp-accent)' }}>Sau</span>
              </div>
            </div>

            <div className="text-center max-w-xs">
              <h2 className="font-extrabold text-xl mb-2" style={{ color: 'var(--lp-primary)' }}>
                {c.intro.heading}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
                {c.intro.subtext}
              </p>
            </div>

            <button
              onClick={() => setPhase('wheel')}
              className="px-8 py-3.5 rounded-full font-bold text-base text-white transition-all active:scale-[0.97]"
              style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)' }}
            >
              {c.intro.cta}
            </button>
          </div>
        )}

        {/* ── Wheel ── */}
        {phase === 'wheel' && (
          <div className="flex-1 flex flex-col" style={{ position: 'relative', overflow: 'hidden' }}>
            <div className="pt-6 pb-2 px-5 text-center">
              <h2 className="font-extrabold text-2xl md:text-4xl leading-snug" style={{ color: 'var(--lp-primary)' }}>
                {c.wheel.heading}
              </h2>
              <p className="text-sm md:text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                {c.wheel.subtext}
              </p>
            </div>

            {/* Arc canvas */}
            <div
              ref={containerRef}
              style={{ flex: 1, position: 'relative', touchAction: 'none', cursor: 'grab' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
            >
              {CARDS.map((card, i) => (
                <div
                  key={card.id}
                  ref={el => { cardRefs.current[i] = el; }}
                    style={{
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 10px',
                      borderRadius: 16,
                      cursor: 'pointer',
                      userSelect: 'none',
                      textAlign: 'center',
                      border: '2px solid var(--lp-border)',
                      background: 'var(--lp-bg-card)',
                      willChange: 'transform, opacity',
                      transition: 'none',
                    } as React.CSSProperties}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--lp-accent) 10%, white)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--lp-accent)" strokeWidth="2">
                      <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                    </svg>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.3, color: 'var(--lp-primary)' }}>
                    {card.label}
                  </div>

                  {/* Check overlay on selection */}
                  {checkCardIdx === i && (
                    <div style={{
                      position: 'absolute', inset: 0, borderRadius: 16,
                      background: 'rgba(34,197,94,0.10)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 30,
                    }}>
                      <div style={{
                        width: 68, height: 68, borderRadius: '50%',
                        background: '#22c55e',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: 'check-pop 420ms cubic-bezier(0.34,1.56,0.64,1) both, check-glow-pulse 1.4s ease-in-out 420ms infinite',
                      }}>
                        <svg width="34" height="34" viewBox="0 0 28 28" fill="none">
                          <path
                            d="M 5 14 L 12 21 L 23 9"
                            stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
                            strokeDasharray="40" strokeDashoffset="40"
                            style={{ animation: 'check-draw 450ms ease forwards 300ms' }}
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Dot indicators */}
            <div id="wh-dots" style={{ display: 'flex', justifyContent: 'center', gap: 5, paddingBottom: 8 }}>
              {CARDS.map((_, i) => (
                <div key={i} data-dot={i} style={{
                  height: 5, borderRadius: 3,
                  background: i === 0 ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 22%, transparent)',
                  width: i === 0 ? 18 : 6,
                  transition: 'all 0.3s ease',
                }} />
              ))}
            </div>

            {/* Arrow controls */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingBottom: 20 }}>
              <button onClick={() => snapBy(-1)} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--lp-primary) 8%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={() => snapBy(1)} style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--lp-primary) 8%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Face-map ── */}
        {phase === 'face-map' && (
          <div
            className="flex-1 flex flex-col items-center px-5 pt-5 pb-24 gap-3 overflow-y-auto"
            style={{ animation: 'fade-in 350ms ease-out both' }}
          >
            <div className="text-center">
              <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
                {c.faceMap.heading}
              </h2>
              <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                {c.faceMap.subtext}
              </p>
            </div>

            <FaceDiagram
              selectedZones={selectedZones}
              onToggle={toggleZone}
              isScanning={false}
            />

            {/* Selected zone chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 28 }}>
              {selectedZones.length === 0
                ? <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>
                    Chạm vào vùng da bạn hay có mụn nhất
                  </p>
                : selectedZones.map(zoneId => (
                  <div key={zoneId} style={{
                    padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: 'color-mix(in srgb, var(--lp-accent) 12%, white)',
                    color: 'var(--lp-accent)',
                    border: '1px solid color-mix(in srgb, var(--lp-accent) 30%, transparent)',
                  }}>
                    {ZONE_LABEL[zoneId]}
                  </div>
                ))
              }
            </div>

            {/* Continue button — slides up after ≥1 zone */}
            <div style={{
              position: 'fixed', bottom: 24, left: 0, right: 0,
              display: 'flex', justifyContent: 'center',
              transform: selectedZones.length >= 1 ? 'translateY(0)' : 'translateY(80px)',
              opacity: selectedZones.length >= 1 ? 1 : 0,
              transition: 'transform 350ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease',
              pointerEvents: selectedZones.length >= 1 ? 'auto' : 'none',
              zIndex: 30,
            }}>
              <button
                onClick={() => setPhase('scanning')}
                style={{
                  padding: '14px 40px', borderRadius: 999, fontWeight: 700, fontSize: 16,
                  color: 'white', background: 'var(--lp-accent)',
                  boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Tiếp tục →
              </button>
            </div>
          </div>
        )}

        {/* ── Scanning ── */}
        {phase === 'scanning' && (
          <div
            className="flex-1 flex flex-col items-center justify-center px-5 gap-4"
            style={{ animation: 'fade-in 350ms ease-out both' }}
          >
            <div className="text-center mb-1">
              <h2 className="font-extrabold text-lg" style={{ color: 'var(--lp-primary)' }}>
                {c.scanning.heading}
              </h2>
            </div>

            <FaceDiagram
              selectedZones={selectedZones}
              onToggle={() => {}}
              isScanning={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
