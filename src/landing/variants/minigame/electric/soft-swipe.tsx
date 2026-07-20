'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';

// ─── Types ───────────────────────────────────────────────────────────────────

type Phase = 'intro' | 'wheel' | 'face-map' | 'scanning' | 'done';

interface SwipeCard {
  id: string;
  label: string;
  description: string;
  conditionId: ConditionId;
  zones: string[];
}

interface FaceZone {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ARC_CX = 160;
const ARC_R = 248;
const ARC_CY_OFFSET = 60;   // circle center is containerHeight + 60 below top
const ARC_STEP = 22;         // degrees between adjacent cards
const DRAG_SENS = 4.2;       // px of drag per 1° of rotation
const SPRING_STIFFNESS = 0.2;
const SPRING_THRESHOLD = 0.04;
const DAMPING = 0.22;

const CARDS: SwipeCard[] = [
  { id: 'oily',    label: 'Da nhờn, bóng dầu',           description: 'Mặt hay bóng dầu, đặc biệt vùng trán và mũi', conditionId: 'da-nhon-mun-viem', zones: ['forehead', 'nose'] },
  { id: 'acne',    label: 'Mụn viêm, mụn bọc',            description: 'Xuất hiện nốt đỏ, đau, có mủ hoặc sưng to',   conditionId: 'mun-trung-ca',     zones: ['cheeks'] },
  { id: 'dry-red', label: 'Da khô, đỏ, dễ kích ứng',      description: 'Da căng rát sau rửa mặt, dễ bong tróc',       conditionId: 'da-nhay-cam',      zones: ['cheeks', 'forehead'] },
  { id: 'pores',   label: 'Lỗ chân lông to, ít mụn',      description: 'Lỗ chân lông nhìn thấy rõ, da xuất hiện đầu đen', conditionId: 'lo-chan-long', zones: ['nose', 'forehead'] },
  { id: 'clear',   label: 'Da khỏe, không vấn đề rõ rệt', description: 'Da khá ổn định, không có mụn hay kích ứng thường xuyên', conditionId: 'clean-skin', zones: [] },
];

const MIN_ANGLE = 0;
const MAX_ANGLE = (CARDS.length - 1) * ARC_STEP; // 88°

const FACE_ZONES: FaceZone[] = [
  { id: 'forehead', label: 'Trán', x: 33, y: 12, w: 34, h: 14 },
  { id: 'nose',     label: 'Mũi',  x: 42, y: 32, w: 16, h: 16 },
  { id: 'cheeks',   label: 'Má',   x: 14, y: 30, w: 72, h: 26 },
  { id: 'chin',     label: 'Cằm',  x: 40, y: 58, w: 20, h: 14 },
];

// ─── Arc math ────────────────────────────────────────────────────────────────

function arcPos(angleDeg: number, cy: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: ARC_CX + ARC_R * Math.sin(rad), y: cy - ARC_R * Math.cos(rad) };
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

function cardVisual(cardAngle: number, cy: number): CardVisual {
  const abs = Math.abs(cardAngle);
  const t = abs / ARC_STEP;
  const { x, y } = arcPos(cardAngle, cy);
  return {
    x, y,
    w: Math.max(70, Math.round(118 - t * 21)),
    h: Math.max(88, Math.round(148 - t * 27)),
    opacity: Math.max(0.12, 1 - t * 0.42),
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

// ─── Component ──────────────────────────────────────────────────────────────

export function ElectricSoftSwipeMinigame({ onComplete }: MinigameSlotProps) {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());
  const [checkCardIdx, setCheckCardIdx] = useState<number | null>(null);
  const [litZones, setLitZones] = useState<Set<string>>(new Set());

  // ─── Wheel refs (no re-render during gesture) ───────────────────────────────
  const wheelAngle = useRef(0);
  const animFrame = useRef<number | null>(null);
  const dragStartX = useRef(0);
  const dragStartAngle = useRef(0);
  const isDragging = useRef(false);
  const wheelLocked = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  // ─── Imperative render (60fps, no React re-render) ────────────────────────
  const renderFrame = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cy = container.offsetHeight + ARC_CY_OFFSET;
    const centerIdx = Math.round(wheelAngle.current / ARC_STEP);

    CARDS.forEach((_, i) => {
      const el = cardRefs.current[i];
      if (!el) return;
      const angle = wheelAngle.current - i * ARC_STEP;
      const v = cardVisual(angle, cy);

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
        el.style.background = 'white';
        el.style.boxShadow = '0 10px 36px color-mix(in srgb, var(--lp-accent) 32%, transparent), 0 0 0 2px color-mix(in srgb, var(--lp-accent) 40%, transparent)';
        el.style.backdropFilter = 'none';
      } else {
        el.style.background = `rgba(255,255,255,${v.bgAlpha})`;
        el.style.boxShadow = 'none';
        el.style.backdropFilter = v.t < 1.5 ? 'blur(6px)' : 'none';
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

  useEffect(() => {
    if (phase === 'wheel') {
      requestAnimationFrame(renderFrame);
    }
  }, [phase, renderFrame]);

  // ─── Spring + snap ────────────────────────────────────────────────────────
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

  // ─── Pointer handlers ────────────────────────────────────────────────────
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

  const handlePointerUp = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const target = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, Math.round(wheelAngle.current / ARC_STEP) * ARC_STEP));
    springTo(target);
  }, [springTo]);

  // ─── Card tap → select center / spring to flanking ───────────────────────
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
      setSelectedZones(new Set(CARDS[cardIdx].zones));
      setPhase('face-map');
    }, 900);
  }, [springTo]);

  // ─── Face-map zone toggle ────────────────────────────────────────────────
  const toggleZone = useCallback((zoneId: string) => {
    setSelectedZones(prev => {
      const next = new Set(prev);
      if (next.has(zoneId)) next.delete(zoneId);
      else next.add(zoneId);
      return next;
    });
  }, []);

  // ─── Scanning animation → onComplete ─────────────────────────────────────
  useEffect(() => {
    if (phase !== 'scanning') return;
    setLitZones(new Set());

    const SCAN_DURATION = 800;

    const sortedZones = Array.from(selectedZones)
      .map(id => FACE_ZONES.find(z => z.id === id)!)
      .filter(Boolean)
      .sort((a, b) => a.y - b.y);

    const timeouts: ReturnType<typeof setTimeout>[] = [];

    sortedZones.forEach(zone => {
      const delay = (zone.y / 100) * SCAN_DURATION + 80;
      timeouts.push(setTimeout(() => {
        setLitZones(prev => new Set([...prev, zone.id]));
      }, delay));
    });

    const doneDelay = SCAN_DURATION + 300 + 400;
    timeouts.push(setTimeout(() => {
      if (selectedCardIdx === null) return;
      const card = CARDS[selectedCardIdx];
      const condition = skinConditions[card.conditionId]!;
      onComplete({
        condition,
        conditions: [condition],
        zoneIds: Array.from(selectedZones),
        zoneLabel: Array.from(selectedZones).join(', ') || 'Không có vùng cụ thể',
        triggerNote: card.label,
      });
    }, doneDelay));

    return () => timeouts.forEach(clearTimeout);
  }, [phase, selectedCardIdx, selectedZones, onComplete]);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-[100dvh] flex flex-col overflow-hidden"
      style={{ background: 'var(--lp-bg-hero)', animation: 'fade-in 350ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes check-draw { to { stroke-dashoffset: 0 } }
        @keyframes scan-sweep { from { top:-4px } to { top:100% } }
        @keyframes zone-glow { to { filter: brightness(1.6) drop-shadow(0 0 6px var(--lp-accent)) } }
      `}</style>

      {/* Header bar */}
      <div
        className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}
      >
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--lp-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Skin Check</div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
            {phase === 'intro' && 'Hướng dẫn'}
            {phase === 'wheel' && `Thẻ ${selectedCardIdx !== null ? selectedCardIdx + 1 : Math.round(wheelAngle.current / ARC_STEP) + 1} / ${CARDS.length}`}
            {(phase === 'face-map' || phase === 'scanning') && 'Bước 2/2'}
          </div>
        </div>
      </div>

      {/* Intro phase */}
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
              Chọn tình trạng da của bạn
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
              Xoay bánh xe để duyệt qua các tình trạng da phổ biến, rồi chạm vào thẻ ở giữa để chọn.
            </p>
          </div>

          <button
            onClick={() => setPhase('wheel')}
            className="px-8 py-3.5 rounded-full font-bold text-base text-white transition-all active:scale-[0.97]"
            style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)' }}
          >
            Bắt đầu →
          </button>
        </div>
      )}

      {/* Wheel phase */}
      {phase === 'wheel' && (
        <div className="flex-1 flex flex-col" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Question header */}
          <div className="pt-6 pb-2 px-5 text-center">
            <h2 className="font-extrabold text-xl leading-snug" style={{ color: 'var(--lp-primary)' }}>
              Da của bạn dạo này thế nào?
            </h2>
            <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              Chọn mô tả phù hợp nhất
            </p>
          </div>

          {/* Arc canvas — fills remaining vertical space */}
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
                onClick={() => handleCardTap(i)}
                style={{
                  position: 'absolute',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 8px',
                  borderRadius: 16,
                  cursor: 'pointer',
                  userSelect: 'none',
                  textAlign: 'center',
                  border: '1px solid color-mix(in srgb, var(--lp-accent) 18%, transparent)',
                  willChange: 'transform, opacity',
                  transition: 'none',
                }}
              >
                <div
                  style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'color-mix(in srgb, var(--lp-accent) 10%, white)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--lp-accent)" strokeWidth="2">
                    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
                  </svg>
                </div>
                <div
                  style={{ fontWeight: 800, fontSize: 10, lineHeight: 1.25, color: 'var(--lp-primary)' }}
                >
                  {card.label}
                </div>
                {checkCardIdx === i && (
                  <div
                    style={{
                      position: 'absolute', inset: 0, borderRadius: 16,
                      background: 'color-mix(in srgb, var(--lp-accent) 12%, white)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      zIndex: 30,
                    }}
                  >
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'var(--lp-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 24px color-mix(in srgb, var(--lp-accent) 55%, transparent)',
                    }}>
                      <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                        <path
                          d="M 5 13 L 11 19 L 21 8"
                          stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                          strokeDasharray="40"
                          strokeDashoffset="40"
                          style={{ animation: 'check-draw 500ms ease forwards 80ms' }}
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
              <div
                key={i}
                data-dot={i}
                style={{
                  height: 5, borderRadius: 3,
                  background: i === 0 ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 22%, transparent)',
                  width: i === 0 ? 18 : 6,
                  transition: 'all 0.3s ease',
                }}
              />
            ))}
          </div>

          {/* Arrow controls */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, paddingBottom: 20 }}>
            <button
              onClick={() => snapBy(-1)}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--lp-primary) 8%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => snapBy(1)}
              style={{
                width: 44, height: 44, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--lp-primary) 8%, transparent)',
                border: '1.5px solid color-mix(in srgb, var(--lp-accent) 25%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'color-mix(in srgb, var(--lp-accent) 80%, transparent)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Face-map phase */}
      {phase === 'face-map' && (
        <div
          className="flex-1 flex flex-col items-center px-5 pt-6 pb-4 gap-4"
          style={{ animation: 'fade-in 350ms ease-out both' }}
        >
          <div className="text-center">
            <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
              Vùng da nào bị ảnh hưởng?
            </h2>
            <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              Chạm để chọn hoặc bỏ chọn từng vùng
            </p>
          </div>

          {/* Face SVG */}
          <div style={{ width: '100%', maxWidth: 240, position: 'relative' }}>
            <svg viewBox="0 0 100 100" width="100%" style={{ display: 'block' }}>
              {/* Simple face outline */}
              <ellipse cx="50" cy="45" rx="32" ry="38" fill="color-mix(in srgb, var(--lp-primary) 5%, white)"
                stroke="color-mix(in srgb, var(--lp-primary) 15%, transparent)" strokeWidth="1" />
              {/* Eyes */}
              <ellipse cx="39" cy="40" rx="4" ry="3" fill="color-mix(in srgb, var(--lp-primary) 12%, transparent)" />
              <ellipse cx="61" cy="40" rx="4" ry="3" fill="color-mix(in srgb, var(--lp-primary) 12%, transparent)" />
              {/* Nose bridge */}
              <path d="M50 43 L47 52 L53 52" fill="none" stroke="color-mix(in srgb, var(--lp-primary) 15%, transparent)" strokeWidth="0.8" />
              {/* Lips */}
              <path d="M44 60 Q50 64 56 60" fill="none" stroke="color-mix(in srgb, var(--lp-primary) 20%, transparent)" strokeWidth="1" />

              {/* Tappable zones */}
              {FACE_ZONES.map(zone => {
                const selected = selectedZones.has(zone.id);
                return (
                  <g key={zone.id} onClick={() => toggleZone(zone.id)} style={{ cursor: 'pointer' }}>
                    <rect
                      x={zone.x} y={zone.y} width={zone.w} height={zone.h}
                      rx={4}
                      fill={selected ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 10%, transparent)'}
                      fillOpacity={selected ? 0.28 : 0.18}
                      stroke={selected ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 35%, transparent)'}
                      strokeWidth={selected ? 1.2 : 0.8}
                      style={{ transition: 'fill 200ms, fill-opacity 200ms, stroke 200ms' }}
                    />
                    <text
                      x={zone.x + zone.w / 2} y={zone.y + zone.h / 2}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize={selected ? 5.5 : 4.5}
                      fontWeight={selected ? 700 : 500}
                      fill={selected ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-primary) 45%, transparent)'}
                      style={{ pointerEvents: 'none', transition: 'font-size 150ms, fill 200ms' }}
                    >
                      {zone.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Zone label chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 28 }}>
            {Array.from(selectedZones).map(zoneId => {
              const zone = FACE_ZONES.find(z => z.id === zoneId);
              return zone ? (
                <div key={zoneId}
                  style={{
                    padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                    background: 'color-mix(in srgb, var(--lp-accent) 12%, white)',
                    color: 'var(--lp-accent)',
                    border: '1px solid color-mix(in srgb, var(--lp-accent) 30%, transparent)',
                  }}
                >
                  {zone.label}
                </div>
              ) : null;
            })}
          </div>

          {/* Continue button — appears after ≥1 zone selected */}
          <div style={{
            position: 'fixed', bottom: 24, left: 0, right: 0,
            display: 'flex', justifyContent: 'center',
            transform: selectedZones.size >= 1 ? 'translateY(0)' : 'translateY(80px)',
            opacity: selectedZones.size >= 1 ? 1 : 0,
            transition: 'transform 350ms cubic-bezier(0.34,1.56,0.64,1), opacity 250ms ease',
            pointerEvents: selectedZones.size >= 1 ? 'auto' : 'none',
          }}>
            <button
              onClick={() => setPhase('scanning')}
              style={{
                padding: '14px 36px', borderRadius: 999, fontWeight: 700, fontSize: 16,
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

      {/* Scanning phase */}
      {phase === 'scanning' && (
        <div
          className="flex-1 flex flex-col items-center justify-center px-5 gap-4"
          style={{ animation: 'fade-in 350ms ease-out both' }}
        >
          <div className="text-center mb-2">
            <h2 className="font-extrabold text-lg" style={{ color: 'var(--lp-primary)' }}>
              Đang phân tích...
            </h2>
          </div>

          {/* Face SVG with scan line */}
          <div style={{ width: '100%', maxWidth: 240, position: 'relative' }}>
            <svg viewBox="0 0 100 100" width="100%" style={{ display: 'block' }}>
              {/* Face outline */}
              <ellipse cx="50" cy="45" rx="32" ry="38" fill="color-mix(in srgb, var(--lp-primary) 5%, white)"
                stroke="color-mix(in srgb, var(--lp-primary) 15%, transparent)" strokeWidth="1" />
              <ellipse cx="39" cy="40" rx="4" ry="3" fill="color-mix(in srgb, var(--lp-primary) 12%, transparent)" />
              <ellipse cx="61" cy="40" rx="4" ry="3" fill="color-mix(in srgb, var(--lp-primary) 12%, transparent)" />
              <path d="M50 43 L47 52 L53 52" fill="none" stroke="color-mix(in srgb, var(--lp-primary) 15%, transparent)" strokeWidth="0.8" />
              <path d="M44 60 Q50 64 56 60" fill="none" stroke="color-mix(in srgb, var(--lp-primary) 20%, transparent)" strokeWidth="1" />

              {/* Zones: lit if scanned, dim otherwise */}
              {FACE_ZONES.map(zone => {
                const wasSelected = selectedZones.has(zone.id);
                const isLit = litZones.has(zone.id);
                if (!wasSelected) return null;
                return (
                  <rect
                    key={zone.id}
                    x={zone.x} y={zone.y} width={zone.w} height={zone.h} rx={4}
                    fill="var(--lp-accent)"
                    fillOpacity={isLit ? 0.55 : 0.15}
                    stroke="var(--lp-accent)"
                    strokeWidth={isLit ? 1.5 : 0.8}
                    strokeOpacity={isLit ? 1 : 0.4}
                    style={{
                      filter: isLit ? 'drop-shadow(0 0 4px var(--lp-accent))' : 'none',
                      transition: 'fill-opacity 300ms ease, stroke-opacity 300ms ease, filter 300ms ease',
                    }}
                  />
                );
              })}
            </svg>

            {/* Scan line — CSS animation */}
            <div
              style={{
                position: 'absolute', left: '10%', right: '10%', height: 2,
                background: 'linear-gradient(90deg, transparent, var(--lp-accent), transparent)',
                boxShadow: '0 0 8px var(--lp-accent)',
                animation: 'scan-sweep 800ms ease-in-out forwards',
                top: 0,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
