'use client';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import { skinConditions } from '../../../../content/quiz';
import type { ConditionId } from '../../../../content/quiz';
import { FaceDiagram, SelectedZoneTags, ZONES_SVG } from '../face-map';
import type { Zone, Severity } from '../face-map';

// ─── Constants (face image layout mirrors face-map.tsx) ────────────────────────
const FACE_SCALE = 2;
const FACE_BASE_W = 176;
const FACE_OFFSET_X = -((FACE_SCALE - 1) * FACE_BASE_W) / 2; // -88

type RevealZone = {
  id: string;
  faceZone: Zone;
  label: string;
  cx: number; cy: number; rx: number; ry: number;
};

// Zones in 176×240 viewBox, calibrated to face-map.tsx ZONES_SVG scaled coordinates
const REVEAL_ZONES: RevealZone[] = [
  { id: 'forehead',    faceZone: 'forehead',    label: 'Trán',           cx: 88,  cy: 108, rx: 28, ry: 10 },
  { id: 'nose',        faceZone: 'nose',        label: 'Mũi',            cx: 88,  cy: 148, rx: 14, ry: 22 },
  { id: 'left-cheek',  faceZone: 'left-cheek',  label: 'Má',             cx: 62,  cy: 156, rx: 12, ry: 12 },
  { id: 'right-cheek', faceZone: 'right-cheek', label: 'Má',             cx: 114, cy: 156, rx: 12, ry: 12 },
  { id: 'chin-jaw',    faceZone: 'chin-jaw',    label: 'Cằm & quai hàm', cx: 88,  cy: 184, rx: 28, ry: 12 },
];

type ZoneGroup = 'forehead' | 'nose' | 'cheeks' | 'chin-jaw';

const ZONE_GROUP_TO_IDS: Record<ZoneGroup, string[]> = {
  'forehead':   ['forehead'],
  'nose':       ['nose'],
  'cheeks':     ['left-cheek', 'right-cheek'],
  'chin-jaw':   ['chin-jaw'],
};

const CONDITION_ZONE_WEIGHTS: Record<string, Record<ZoneGroup, number>> = {
  'da-seo-ro':        { forehead: 0.35, nose: 0.25, cheeks: 0.40, 'chin-jaw': 0.35 },
  'lo-chan-long':     { forehead: 0.05, nose: 0.55, cheeks: 0.45, 'chin-jaw': 0.55 },
  'da-nhon-mun-viem': { forehead: 0.60, nose: 0.60, cheeks: 0.40, 'chin-jaw': 0.60 },
  'mun-trung-ca':     { forehead: 0.20, nose: 0.30, cheeks: 0.70, 'chin-jaw': 0.40 },
  'mun-noi-tiet':     { forehead: 0.20, nose: 0.20, cheeks: 0.40, 'chin-jaw': 0.70 },
};

const SCRATCH_STROKE_WIDTH = 16;
const COMPLETION_DELAY_MS  = 500;

// Conditions that skip zone-selection and go directly to payoff
const DIRECT_PAYOFF: Set<ConditionId> = new Set(['clean-skin', 'da-moi-bat-dau']);

// Only these 4 appear in the scratch random draw; da-nhay-cam routes to its own quiz screen
const SCRATCH_CONDITIONS: ConditionId[] = ['da-nhon-mun-viem', 'lo-chan-long', 'mun-trung-ca', 'mun-noi-tiet'];

const SENSITIVE_SYMPTOMS = [
  { id: 'flushed',  label: 'Da ửng đỏ',                        desc: 'Khi tiếp xúc ánh nắng gắt hoặc nhiệt độ cao',             img: '/vectors/flushed.jpg'  },
  { id: 'rashness', label: 'Phát ban và sưng đỏ',               desc: 'Sau khi dùng mỹ phẩm, kem dưỡng hoặc kem chống nắng',     img: '/vectors/rashness.jpg' },
  { id: 'itching',  label: 'Ngứa rát, nóng bừng hoặc căng da', desc: 'Khi tiếp xúc hóa chất, bụi bẩn hoặc thời tiết',           img: '/vectors/itching.jpg'  },
  { id: 'dry',      label: 'Bong tróc và khô da',               desc: 'Hàng rào bảo vệ da suy yếu, dễ mất nước',                 img: '/vectors/Dry.jpg'      },
] as const;

const ALTERNATIVE_CONDITIONS: { id: ConditionId; label: string; color: string }[] = [
  { id: 'da-nhon-mun-viem', label: 'Da nhờn + mụn viêm',   color: '#FFCD78' },
  { id: 'da-nhay-cam',      label: 'Da nhạy cảm',           color: '#7DD9C0' },
  { id: 'lo-chan-long',     label: 'Lỗ chân lông to',       color: '#8B6BFF' },
  { id: 'mun-trung-ca',    label: 'Mụn trứng cá',          color: '#FF6B35' },
  { id: 'da-seo-ro',       label: 'Sẹo rỗ',                color: '#9C7A5F' },
  { id: 'clean-skin',      label: 'Da ổn định, ít vấn đề', color: '#B39DFF' },
  { id: 'da-moi-bat-dau',  label: 'Tôi cũng không rõ',     color: '#A0AEC0' },
];

// Mirrors face-map.tsx ZONE_LABELS (not exported from that file)
const FACE_ZONE_LABELS: Record<Zone, string> = {
  forehead:      'vùng trán',
  nose:          'vùng mũi / chữ T',
  'left-cheek':  'má trái',
  'right-cheek': 'má phải',
  'chin-jaw':    'cằm & quai hàm',
};

const MIN_DRAG_UNITS = 8; // viewBox units of movement required before zone detection

// ─── Helpers ──────────────────────────────────────────────────────────────────
function pickActiveZones(conditionId: string): string[] {
  const weights = CONDITION_ZONE_WEIGHTS[conditionId] ?? CONDITION_ZONE_WEIGHTS['da-nhon-mun-viem'];
  let selected = (Object.entries(weights) as [ZoneGroup, number][])
    .filter(([, w]) => Math.random() < w)
    .map(([g]) => g);

  // Always ensure at least 2 zone groups so user must scratch multiple face areas
  const sorted = (Object.entries(weights) as [ZoneGroup, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([g]) => g);
  while (selected.length < 2) {
    const next = sorted.find(g => !selected.includes(g));
    if (!next) break;
    selected.push(next);
  }

  return selected
    .sort((a, b) => weights[b] - weights[a])
    .slice(0, 3)
    .flatMap(g => ZONE_GROUP_TO_IDS[g]);
}

// ─── Mini face for confirm/alternative screens (non-interactive) ───────────────
function ConfirmFaceMini({ zones, color }: { zones: RevealZone[]; color: string }) {
  return (
    <svg viewBox="0 0 176 240" style={{ width: '100%', display: 'block' }} aria-hidden="true">
      <image href="/face-map-minigame.svg" x={FACE_OFFSET_X} y="0"
        width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
        preserveAspectRatio="xMidYMin meet" />
      {zones.map(zone => (
        <g key={zone.id}>
          <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx + 7} ry={zone.ry + 7} fill={color} opacity="0.10" />
          <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} fill={color} opacity="0.48" />
          <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} fill="none" stroke={color} strokeWidth="2" opacity="0.85" />
        </g>
      ))}
    </svg>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export function ElectricGlowScratchMinigame({ onComplete, copy }: MinigameSlotProps) {
  type Phase = 'intro' | 'scratch' | 'confirm' | 'relocate' | 'alternative' | 'sensitive-quiz' | 'done';
  const [phase, setPhase] = useState<Phase>('intro');

  // Condition-first zone selection
  const [activeZoneIds, setActiveZoneIds] = useState<string[]>([]);
  const [activeConditionId, setActiveConditionId] = useState<ConditionId>('da-nhon-mun-viem');

  // Scratch
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [revealedAnimating, setRevealedAnimating] = useState<Set<string>>(new Set());
  const [hasStartedScratch, setHasStartedScratch] = useState(false);
  const [scratchMode, setScratchMode] = useState<'draw' | 'manual'>('draw');
  const [progress, setProgress] = useState(0);
  const [scratchedDots, setScratchedDots] = useState<Set<string>>(new Set());
  const [toastZoneId, setToastZoneId] = useState<string | null>(null);

  // Refs
  const svgRef = useRef<SVGSVGElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const isDrawing = useRef(false);
  const pathPointCount = useRef(0);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const firstRevealedZone = useRef<RevealZone | null>(null);
  const completionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Post-scratch flow
  const [scratchedZoneId, setScratchedZoneId] = useState<string>('nose');
  const [relocatingConditionId, setRelocatingConditionId] = useState<ConditionId>('da-nhon-mun-viem');
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);

  // Derived
  const scratchedZone = REVEAL_ZONES.find(z => z.id === scratchedZoneId) ?? REVEAL_ZONES[1];
  const scratchedCondition = (activeConditionId ? skinConditions[activeConditionId] : null) ?? skinConditions['da-nhon-mun-viem']!;
  const scratchedConditionColor = scratchedCondition.color;
  const relocatingCondition = skinConditions[relocatingConditionId]!;

  // All active REVEAL_ZONES (used in confirm screen to show every found zone)
  const activeRevealZones = useMemo(
    () => REVEAL_ZONES.filter(z => activeZoneIds.includes(z.id)),
    [activeZoneIds],
  );

  // ─── Intro auto-transition (1.5s) ──────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'intro') return;
    const t = setTimeout(() => setPhase('scratch'), 1500);
    return () => clearTimeout(t);
  }, [phase]);

  // ─── Initialize active zones when entering scratch phase ──────────────────
  useEffect(() => {
    if (phase !== 'scratch') return;
    const condId = SCRATCH_CONDITIONS[Math.floor(Math.random() * SCRATCH_CONDITIONS.length)];
    setActiveConditionId(condId);
    setActiveZoneIds(pickActiveZones(condId));
    setScratchedDots(new Set());
  }, [phase]);

  // ─── iOS Safari: block page scroll while scratching ────────────────────────
  useEffect(() => {
    if (phase !== 'scratch' || scratchMode !== 'draw') return;
    const svg = svgRef.current;
    if (!svg) return;
    const prevent = (e: TouchEvent) => e.preventDefault();
    svg.addEventListener('touchmove', prevent, { passive: false });
    return () => svg.removeEventListener('touchmove', prevent);
  }, [phase, scratchMode]);

  // ─── Schedule confirm phase ─────────────────────────────────────────────
  const scheduleConfirm = useCallback(() => {
    if (completionTimerRef.current) return;
    completionTimerRef.current = setTimeout(() => {
      completionTimerRef.current = null;
      const zone = firstRevealedZone.current ?? REVEAL_ZONES[1];
      setScratchedZoneId(zone.id);
      if (activeConditionId) setRelocatingConditionId(activeConditionId);
      setPhase('confirm');
    }, COMPLETION_DELAY_MS);
  }, [activeConditionId]);

  // ─── Pointer handlers ──────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    isDrawing.current = true;
    setHasStartedScratch(true);
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 176;
      const y = ((e.clientY - rect.top) / rect.height) * 240;
      dragStartPos.current = { x, y };
      if (maskPathRef.current) {
        const existing = maskPathRef.current.getAttribute('d') || '';
        maskPathRef.current.setAttribute('d', existing ? `${existing} M ${x} ${y}` : `M ${x} ${y}`);
      }
    }
  }, []);

  const handlePointerUp = useCallback(() => { isDrawing.current = false; }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing.current || !svgRef.current || !maskPathRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 176;
    const y = ((e.clientY - rect.top) / rect.height) * 240;

    // Update mask path — continuous line (visual coat removal)
    pathPointCount.current++;
    const d = maskPathRef.current.getAttribute('d') || '';
    maskPathRef.current.setAttribute('d', `${d} L ${x} ${y}`);

    // Drag gate — skip dot detection until pointer moves enough from touch-down point
    const start = dragStartPos.current;
    if (start && Math.sqrt((x - start.x) ** 2 + (y - start.y) ** 2) < MIN_DRAG_UNITS) return;

    // Dot-based zone detection: a zone reveals when all its dots are scratched
    const strokeR = SCRATCH_STROKE_WIDTH / 2;
    const newScratchedDots = new Set(scratchedDots);
    let anyNewDot = false;
    let anyNewReveal = false;
    const nextRevealed = new Set(revealed);

    for (const zoneId of activeZoneIds) {
      if (nextRevealed.has(zoneId)) continue;
      const zoneData = ZONES_SVG.find(z => z.id === zoneId);
      if (!zoneData) continue;

      let addedNewDot = false;
      zoneData.dots.forEach((dot, i) => {
        const key = `${zoneId}-${i}`;
        if (newScratchedDots.has(key)) return;
        if (Math.sqrt((x - dot.x) ** 2 + (y - dot.y) ** 2) <= strokeR) {
          newScratchedDots.add(key);
          addedNewDot = true;
          anyNewDot = true;
        }
      });

      if (addedNewDot) {
        const allScratched = zoneData.dots.every((_, i) => newScratchedDots.has(`${zoneId}-${i}`));
        if (allScratched) {
          nextRevealed.add(zoneId);
          if (!firstRevealedZone.current) {
            firstRevealedZone.current = REVEAL_ZONES.find(z => z.id === zoneId) ?? null;
          }
          setRevealedAnimating(prev => new Set([...prev, zoneId]));
          setTimeout(() => {
            setRevealedAnimating(prev => { const s = new Set(prev); s.delete(zoneId); return s; });
          }, 900);
          // Toast notification
          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          setToastZoneId(zoneId);
          toastTimerRef.current = setTimeout(() => setToastZoneId(null), 1500);
          anyNewReveal = true;
        }
      }
    }

    if (anyNewDot) setScratchedDots(newScratchedDots);
    if (anyNewReveal) {
      setRevealed(nextRevealed);
      setProgress(nextRevealed.size / Math.max(activeZoneIds.length, 1));
      if (nextRevealed.size >= activeZoneIds.length) scheduleConfirm();
    }
  }, [revealed, activeZoneIds, scheduleConfirm, scratchedDots]);

  // ─── Manual mode zone click ─────────────────────────────────────────────────
  const handleZoneClick = useCallback((zone: RevealZone) => {
    if (revealed.has(zone.id)) return;
    const next = new Set(revealed);
    next.add(zone.id);
    if (!firstRevealedZone.current) firstRevealedZone.current = zone;
    setRevealed(next);
    setProgress(next.size / Math.max(activeZoneIds.length, 1));
  }, [revealed, activeZoneIds]);

  const completeManual = useCallback(() => {
    const zone = firstRevealedZone.current ?? REVEAL_ZONES[1];
    setScratchedZoneId(zone.id);
    if (activeConditionId) setRelocatingConditionId(activeConditionId);
    setPhase('confirm');
  }, [activeConditionId]);

  // ─── Confirm handlers ───────────────────────────────────────────────────────
  const handleConfirmYes = useCallback(() => {
    const zones = REVEAL_ZONES.filter(z => activeZoneIds.includes(z.id));
    const condition = activeConditionId ? skinConditions[activeConditionId] : null;
    if (!condition) return;
    const zoneLabel = zones.map(z => z.label).join(', ');
    setPhase('done');
    setTimeout(() => onComplete({
      conditions: [condition],
      condition,
      zoneLabel,
      zoneIds: zones.map(z => z.faceZone),
      triggerNote: zoneLabel,
    } as MinigameResult), 400);
  }, [activeZoneIds, activeConditionId, onComplete]);

  const handleConfirmRelocate = useCallback(() => {
    if (!activeConditionId) return;
    setRelocatingConditionId(activeConditionId);
    setSelectedZones(REVEAL_ZONES.filter(z => activeZoneIds.includes(z.id)).map(z => z.faceZone));
    setPhase('relocate');
  }, [activeConditionId, activeZoneIds]);

  // ─── Relocate confirm ───────────────────────────────────────────────────────
  const handleRelocateConfirm = useCallback(() => {
    if (selectedZones.length === 0) return;
    const condition = skinConditions[relocatingConditionId]!;
    const zoneLabel = selectedZones.map(z => FACE_ZONE_LABELS[z]).join(', ');
    setPhase('done');
    setTimeout(() => onComplete({
      conditions: [condition],
      condition,
      zoneLabel,
      zoneIds: [...selectedZones],
      triggerNote: zoneLabel,
    } as MinigameResult), 400);
  }, [selectedZones, relocatingConditionId, onComplete]);

  // ─── Alternative condition select ──────────────────────────────────────────
  const handleAlternativeSelect = useCallback((condId: ConditionId) => {
    if (DIRECT_PAYOFF.has(condId)) {
      const condition = skinConditions[condId]!;
      setPhase('done');
      setTimeout(() => onComplete({
        conditions: [condition],
        condition,
        zoneLabel: '',
        zoneIds: [],
        triggerNote: '',
      } as MinigameResult), 400);
    } else if (condId === 'da-nhay-cam') {
      setPhase('sensitive-quiz');
    } else {
      setRelocatingConditionId(condId);
      setSelectedZones([]);
      setPhase('relocate');
    }
  }, [onComplete]);

  // ─── Sensitive-skin symptom select ─────────────────────────────────────────
  const handleSensitiveSymptomSelect = useCallback((triggerNote: string) => {
    const condition = skinConditions['da-nhay-cam']!;
    setPhase('done');
    setTimeout(() => onComplete({
      conditions: [condition],
      condition,
      zoneLabel: '',
      zoneIds: [],
      triggerNote,
    } as MinigameResult), 400);
  }, [onComplete]);

  // ─── Reset to intro ─────────────────────────────────────────────────────────
  const resetScratch = useCallback(() => {
    if (completionTimerRef.current) {
      clearTimeout(completionTimerRef.current);
      completionTimerRef.current = null;
    }
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setPhase('intro');
    setRevealed(new Set());
    setRevealedAnimating(new Set());
    setProgress(0);
    setHasStartedScratch(false);
    setScratchMode('draw');
    setActiveZoneIds([]);
    setScratchedDots(new Set());
    setToastZoneId(null);
    firstRevealedZone.current = null;
    pathPointCount.current = 0;
    dragStartPos.current = null;
    if (maskPathRef.current) maskPathRef.current.setAttribute('d', '');
  }, []);

  // ─── Zone toggle for Screen 2a ──────────────────────────────────────────────
  const toggleZone = useCallback((z: Zone) => {
    setSelectedZones(prev => prev.includes(z) ? prev.filter(p => p !== z) : [...prev, z]);
  }, []);

  // ─── Header subtitle ────────────────────────────────────────────────────────
  const headerLabel =
    phase === 'intro'           ? 'Hướng dẫn' :
    phase === 'scratch'         ? (scratchMode === 'manual' ? 'Chọn vùng bằng tay' : 'Quét để khám phá') :
    phase === 'confirm'         ? 'Xác nhận tình trạng' :
    phase === 'relocate'        ? 'Chọn vùng chính xác' :
    phase === 'alternative'     ? 'Tình trạng da thực tế' :
    phase === 'sensitive-quiz'  ? 'Da nhạy cảm' :
    'Đang phân tích...';

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden"
      style={{ animation: 'fade-in 350ms ease-out both' }}>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hint-scratch {
          0%   { transform: translate(-22px, 4px) rotate(-18deg); opacity: 0; }
          12%  { opacity: 1; }
          48%  { transform: translate(22px, -4px) rotate(-12deg); opacity: 1; }
          60%  { transform: translate(22px, -4px) rotate(-12deg); opacity: 0; }
          100% { transform: translate(22px, -4px) rotate(-12deg); opacity: 0; }
        }
        @keyframes coat-shimmer { 0%, 100% { opacity: 0.92; } 50% { opacity: 0.78; } }
        @keyframes zone-reveal-ring {
          0%   { transform: scale(0.75); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        @keyframes zone-reveal-fill {
          from { opacity: 0; }
          to   { opacity: 0.32; }
        }
        @keyframes toast-reveal {
          0%   { transform: translateX(-50%) translateY(-14px); opacity: 0; }
          13%  { transform: translateX(-50%) translateY(0); opacity: 1; }
          78%  { transform: translateX(-50%) translateY(0); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-10px); opacity: 0; }
        }
        @keyframes card-enter {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .symptom-card {
          transition: border-color 0.14s, box-shadow 0.14s, transform 0.12s;
        }
        .symptom-card:hover {
          border-color: #7DD9C0 !important;
          box-shadow: 0 6px 20px rgba(125,217,192,0.28) !important;
          transform: translateY(-3px);
        }
        .symptom-card:active { transform: scale(0.96); }
        .scratch-hint { animation: hint-scratch 1.8s ease-in-out 0.6s infinite; }
        .scan-hint    { animation: hint-scratch 1.8s ease-in-out 0.6s infinite; }
        #girl-shape-mask { mask-type: alpha; }
      `}</style>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--lp-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
            <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2 Skin Glow Scan</div>
          <div className="text-xs truncate" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>{headerLabel}</div>
        </div>
        {phase === 'scratch' && (
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-xs font-bold" style={{ color: 'var(--lp-primary)' }}>{Math.round(progress * 100)}%</div>
            <button onClick={resetScratch}
              className="text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-80"
              style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-primary) 18%, transparent)' }}>
              Làm lại
            </button>
          </div>
        )}
        {(phase === 'confirm' || phase === 'alternative') && (
          <button onClick={resetScratch}
            className="flex-shrink-0 text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-80"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-primary) 18%, transparent)' }}>
            Làm lại
          </button>
        )}
        {(phase === 'relocate' || phase === 'sensitive-quiz') && (
          <button
            onClick={() => setPhase(
              phase === 'sensitive-quiz' ? 'alternative' :
              relocatingConditionId !== activeConditionId ? 'alternative' : 'confirm'
            )}
            className="flex-shrink-0 text-xs px-2 py-1 rounded-md transition-opacity hover:opacity-80"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)', border: '1px solid color-mix(in srgb, var(--lp-primary) 18%, transparent)' }}>
            Quay lại
          </button>
        )}
      </div>

      {/* ── Intro ───────────────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6"
          style={{ animation: 'fade-in 350ms ease-out both' }}>
          <div className="relative w-40 h-48 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
              <ellipse cx="50" cy="45" rx="30" ry="36"
                fill="color-mix(in srgb, var(--lp-accent) 6%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 35%, transparent)" strokeWidth="2" />
              <rect x="30" y="22" width="40" height="12" rx="5"
                fill="color-mix(in srgb, var(--lp-accent) 18%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.2" />
              <rect x="42" y="38" width="16" height="16" rx="4"
                fill="color-mix(in srgb, var(--lp-accent) 18%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.2" />
              <rect x="42" y="58" width="16" height="12" rx="4"
                fill="color-mix(in srgb, var(--lp-accent) 18%, white)"
                stroke="color-mix(in srgb, var(--lp-accent) 30%, transparent)" strokeWidth="1.2" />
            </svg>
            <div className="scan-hint absolute top-4 left-1/2 -translate-x-1/2 pointer-events-none" aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round">
                <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" />
                <path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M6 14a4 4 0 0 0 4 4h4a6 6 0 0 0 6-6v-2a2 2 0 0 0-4 0" />
              </svg>
            </div>
          </div>
          <div className="text-center max-w-xs">
            <h2 className="font-extrabold text-xl mb-2" style={{ color: 'var(--lp-primary)' }}>
              {copy?.intro?.heading ?? 'Quét để khám phá da của bạn'}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 60%, transparent)' }}>
              {copy?.intro?.subtext ?? 'Dùng ngón tay quét lên khuôn mặt — hệ thống sẽ phát hiện vùng da cần chú ý.'}
            </p>
          </div>
        </div>
      )}

      {/* ── Scratch — draw mode ──────────────────────────────────────────────── */}
      {phase === 'scratch' && scratchMode === 'draw' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto"
          style={{ animation: 'fade-in 300ms ease-out both' }}>

          {/* Large prompt text — shown until user starts scratching */}
          <p className="text-center font-bold mb-3 leading-tight"
            style={{
              fontSize: 'clamp(15px, 3.5vw, 18px)',
              color: 'var(--lp-primary)',
              opacity: hasStartedScratch ? 0 : 1,
              transition: 'opacity 500ms ease',
              minHeight: '1.5em',
            }}>
            {copy?.scratch?.hint ?? 'Vuốt qua để cào và biết được tình trạng da hiện tại'}
          </p>

          <div className="relative w-full max-w-[260px] md:max-w-[360px] mx-auto">
            <svg
              ref={svgRef}
              viewBox="0 0 176 240"
              className="w-full h-auto"
              role="img"
              aria-label="Khuôn mặt — quét để khám phá"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerUp}
              style={{ touchAction: 'none', cursor: 'crosshair', maxHeight: 'calc(100dvh - 160px)' }}
            >
              <defs>
                <mask id="scratch-coat-mask">
                  <rect x="0" y="0" width="176" height="240" fill="white" />
                  <path ref={maskPathRef} fill="none" stroke="black"
                    strokeWidth={SCRATCH_STROKE_WIDTH} strokeLinecap="round" strokeLinejoin="round" />
                </mask>
                {/* Girl-shape mask: alpha channel of the SVG image defines coat boundary */}
                <mask id="girl-shape-mask">
                  <image href="/face-map-minigame.svg" x={FACE_OFFSET_X} y="0"
                    width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
                    preserveAspectRatio="xMidYMin meet" />
                </mask>
                <pattern id="scratch-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8"/>
                </pattern>
              </defs>

              {/* Layer 1: Full girl image — base, revealed as coat is scratched */}
              <image href="/face-map-minigame.svg" x={FACE_OFFSET_X} y="0"
                width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
                preserveAspectRatio="xMidYMin meet" />

              {/* Layer 2: Acne dots — hidden by coat, revealed when coat is scratched over them */}
              {ZONES_SVG.filter(z => activeZoneIds.includes(z.id)).flatMap(z =>
                z.dots.map((dot, i) => (
                  <circle key={`dot-${z.id}-${i}`}
                    cx={dot.x} cy={dot.y} r="2.8"
                    fill={scratchedConditionColor}
                    opacity="0.88" />
                ))
              )}

              {/* Layer 3: Scratch coat — clipped to girl's silhouette, removed by scratch strokes */}
              <g mask="url(#scratch-coat-mask)" style={{ pointerEvents: 'none' }}>
                <g mask="url(#girl-shape-mask)">
                  <rect x="0" y="0" width="176" height="240" fill="var(--lp-accent)"
                    style={{ animation: 'coat-shimmer 2s ease-in-out infinite' }} />
                  <rect x="0" y="0" width="176" height="240" fill="url(#scratch-hatch)" />
                </g>
              </g>

              {/* Layer 4: Zone highlights — appear when all dots in a zone are scratched */}
              {REVEAL_ZONES.filter(z => activeZoneIds.includes(z.id) && revealed.has(z.id)).map(zone => {
                const isAnimating = revealedAnimating.has(zone.id);
                return (
                  <g key={`zone-hl-${zone.id}`} style={{ pointerEvents: 'none' }}>
                    {isAnimating && (
                      <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx + 5} ry={zone.ry + 5}
                        fill="none" stroke={scratchedConditionColor} strokeWidth="2.5"
                        style={{
                          transformOrigin: `${zone.cx}px ${zone.cy}px`,
                          animation: 'zone-reveal-ring 0.7s ease-out forwards',
                        }} />
                    )}
                    <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry}
                      fill={scratchedConditionColor}
                      style={{
                        opacity: isAnimating ? undefined : 0.22,
                        animation: isAnimating ? 'zone-reveal-fill 0.4s ease-out both' : undefined,
                      }} />
                    <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry}
                      fill="none" stroke={scratchedConditionColor} strokeWidth="1.5" opacity="0.80" />
                  </g>
                );
              })}

            </svg>

            {/* Toast — appears when a zone is fully scratched */}
            {toastZoneId && (
              <div key={toastZoneId}
                className="absolute top-3 left-1/2 z-10 pointer-events-none"
                style={{ animation: 'toast-reveal 1.5s ease-out both' }}>
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-full shadow-md"
                  style={{ background: scratchedConditionColor, color: 'white', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  Đã tìm thấy: {REVEAL_ZONES.find(z => z.id === toastZoneId)?.label ?? 'vùng mụn'}
                </div>
              </div>
            )}

            {/* Scratch-motion finger hint — fades once user starts */}
            <div aria-hidden="true"
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              style={{ opacity: hasStartedScratch ? 0 : 1, transition: 'opacity 400ms ease', paddingTop: '10%' }}>
              <div className="scratch-hint">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }}>
                  <path d="M18 11V6a2 2 0 0 0-4 0v5" /><path d="M14 10V4a2 2 0 0 0-4 0v6" />
                  <path d="M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M6 14a4 4 0 0 0 4 4h4a6 6 0 0 0 6-6v-2a2 2 0 0 0-4 0" />
                </svg>
              </div>
            </div>
          </div>

          <button onClick={() => setScratchMode('manual')}
            className="mt-4 text-xs underline underline-offset-2 transition-opacity hover:opacity-100"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}>
            Gặp khó khăn? Chọn vùng bằng tay
          </button>
        </div>
      )}

      {/* ── Scratch — manual mode ────────────────────────────────────────────── */}
      {phase === 'scratch' && scratchMode === 'manual' && (
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5"
          style={{ animation: 'fade-in 280ms ease-out both' }}>
          <div className="text-center">
            <p className="text-sm font-semibold" style={{ color: 'var(--lp-primary)' }}>
              Nhấn vào từng vùng da để phân tích
            </p>
            <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}>
              {revealed.size}/{REVEAL_ZONES.length} vùng đã chọn
            </p>
          </div>

          <div className="w-full max-w-[260px] flex flex-col gap-2" role="group" aria-label="Chọn vùng da">
            {/* Trán — top */}
            <button onClick={() => handleZoneClick(REVEAL_ZONES[0])}
              aria-pressed={revealed.has(REVEAL_ZONES[0].id)}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
              style={{
                background: revealed.has(REVEAL_ZONES[0].id) ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 9%, white)',
                color: revealed.has(REVEAL_ZONES[0].id) ? 'white' : 'var(--lp-primary)',
                border: revealed.has(REVEAL_ZONES[0].id) ? '2px solid var(--lp-primary)' : '2px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
              }}>
              {REVEAL_ZONES[0].label}{revealed.has(REVEAL_ZONES[0].id) ? ' — ok' : ''}
            </button>

            {/* Má trái | Mũi */}
            <div className="flex gap-2">
              {[REVEAL_ZONES[2], REVEAL_ZONES[1]].map(zone => (
                <button key={zone.id} onClick={() => handleZoneClick(zone)}
                  aria-pressed={revealed.has(zone.id)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: revealed.has(zone.id) ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 9%, white)',
                    color: revealed.has(zone.id) ? 'white' : 'var(--lp-primary)',
                    border: revealed.has(zone.id) ? '2px solid var(--lp-primary)' : '2px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
                  }}>
                  {zone.label}{revealed.has(zone.id) ? ' — ok' : ''}
                </button>
              ))}
            </div>

            {/* Má phải | Cằm & quai hàm */}
            <div className="flex gap-2">
              {[REVEAL_ZONES[3], REVEAL_ZONES[4]].map(zone => (
                <button key={zone.id} onClick={() => handleZoneClick(zone)}
                  aria-pressed={revealed.has(zone.id)}
                  className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all duration-150 active:scale-[0.97]"
                  style={{
                    background: revealed.has(zone.id) ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 9%, white)',
                    color: revealed.has(zone.id) ? 'white' : 'var(--lp-primary)',
                    border: revealed.has(zone.id) ? '2px solid var(--lp-primary)' : '2px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
                  }}>
                  {zone.id === 'chin-jaw' ? 'Cằm' : zone.label}{revealed.has(zone.id) ? ' — ok' : ''}
                </button>
              ))}
            </div>
          </div>

          {revealed.size >= 1 && (
            <button onClick={completeManual}
              className="w-full max-w-[260px] py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-[0.97]"
              style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 14px color-mix(in srgb, var(--lp-accent) 30%, transparent)' }}>
              Phân tích ngay ({revealed.size} vùng)
            </button>
          )}

          <button onClick={() => setScratchMode('draw')}
            className="text-xs underline underline-offset-2 transition-opacity hover:opacity-100"
            style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}>
            Quay lại quét tay
          </button>
        </div>
      )}

      {/* ── Screen 1: Confirm ────────────────────────────────────────────────── */}
      {phase === 'confirm' && (
        <>
          {/* Mobile */}
          <div className="md:hidden flex-1 flex flex-col items-center justify-center px-5 py-6 gap-4 overflow-y-auto"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            <div style={{ width: '120px' }}>
              <ConfirmFaceMini zones={activeRevealZones} color={scratchedCondition.color} />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: `color-mix(in srgb, ${scratchedCondition.color} 12%, white)` }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: scratchedCondition.color }} />
              <span className="text-sm font-semibold" style={{ color: scratchedCondition.color }}>
                {scratchedCondition.label}
              </span>
            </div>

            <p className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
              {activeRevealZones.length > 1
                ? `${activeRevealZones.length} vùng: ${activeRevealZones.map(z => z.label).join(', ')}`
                : `Vùng: ${activeRevealZones[0]?.label ?? ''}`}
            </p>

            <p className="text-sm font-semibold text-center leading-snug" style={{ color: 'var(--lp-primary)' }}>
              Đây có phải tình trạng da hiện tại của bạn?
            </p>

            <div className="w-full flex flex-col gap-2">
              <button onClick={handleConfirmYes}
                className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all active:scale-[0.97]"
                style={{ background: scratchedCondition.color, boxShadow: `0 4px 14px ${scratchedCondition.color}44` }}>
                Có, chính xác như vậy
              </button>
              <button onClick={handleConfirmRelocate}
                className="w-full py-3 rounded-2xl font-semibold text-sm transition-all active:scale-[0.97]"
                style={{ border: `1.5px solid ${scratchedCondition.color}`, color: scratchedCondition.color, background: `color-mix(in srgb, ${scratchedCondition.color} 5%, white)` }}>
                Có nhưng {scratchedCondition.label} nằm ở chỗ khác
              </button>
              <button onClick={() => setPhase('alternative')}
                className="w-full py-3 rounded-2xl font-medium text-sm transition-all active:scale-[0.97]"
                style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
                Không phải
              </button>
            </div>
          </div>

          {/* Desktop — 60/40 split: ghost face (left 60%) | badge + body + buttons (right 40%) */}
          <div className="hidden md:flex flex-1 overflow-hidden"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            {/* Left 60% — ghost face + zone highlight */}
            <div className="flex flex-col items-center justify-center gap-5 p-8"
              style={{ width: '60%', flexShrink: 0, background: `color-mix(in srgb, ${scratchedCondition.color} 8%, var(--lp-bg-hero))` }}>
              <div style={{ width: 'min(100%, 320px)' }}>
                <ConfirmFaceMini zones={activeRevealZones} color={scratchedCondition.color} />
              </div>
            </div>

            {/* Right 40% — badge + condition info + buttons */}
            <div className="flex flex-col justify-center gap-3 px-10 py-8 overflow-y-auto"
              style={{ width: '40%', background: 'var(--lp-bg-card, var(--lp-bg-hero))' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: scratchedCondition.color }} />
                <span className="text-sm font-bold" style={{ color: scratchedCondition.color }}>
                  {scratchedCondition.label}
                </span>
              </div>
              <p style={{ fontSize: '11px', color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                {activeRevealZones.length > 1
                  ? `${activeRevealZones.length} vùng: ${activeRevealZones.map(z => z.label).join(', ')}`
                  : `Vùng: ${activeRevealZones[0]?.label ?? ''}`}
              </p>
              {activeConditionId !== 'da-seo-ro' && scratchedCondition.body && (
                <p style={{ fontSize: '12px', lineHeight: 1.55, color: 'color-mix(in srgb, var(--lp-primary) 70%, transparent)' }}
                  dangerouslySetInnerHTML={{ __html: scratchedCondition.body }} />
              )}
              {activeConditionId !== 'da-seo-ro' && scratchedCondition.bridge && (
                <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}
                  dangerouslySetInnerHTML={{ __html: scratchedCondition.bridge }} />
              )}
              <div style={{ height: '0.5px', background: `${scratchedCondition.color}33`, margin: '4px 0' }} />
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--lp-primary)', lineHeight: 1.4 }}>
                Đây có phải tình trạng da hiện tại của bạn?
              </p>
              <div className="flex flex-col gap-2">
                <button onClick={handleConfirmYes}
                  className="w-full rounded-xl font-semibold transition-all active:scale-[0.97]"
                  style={{ padding: '10px 16px', fontSize: '12px', color: 'white', background: scratchedCondition.color, boxShadow: `0 3px 10px ${scratchedCondition.color}44` }}>
                  Có, chính xác như vậy
                </button>
                <button onClick={handleConfirmRelocate}
                  className="w-full rounded-xl font-semibold transition-all active:scale-[0.97]"
                  style={{ padding: '10px 16px', fontSize: '11px', border: `1.5px solid ${scratchedCondition.color}`, color: scratchedCondition.color, background: `color-mix(in srgb, ${scratchedCondition.color} 5%, white)` }}>
                  Có nhưng {scratchedCondition.label} nằm ở chỗ khác
                </button>
                <button onClick={() => setPhase('alternative')}
                  className="w-full rounded-xl font-medium transition-all active:scale-[0.97]"
                  style={{ padding: '10px 16px', fontSize: '11px', color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
                  Không phải
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Screen 2a: Relocate ──────────────────────────────────────────────── */}
      {phase === 'relocate' && (
        <>
          {/* Mobile */}
          <div className="md:hidden flex-1 flex flex-col items-center px-5 py-6 gap-4 overflow-y-auto"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: `color-mix(in srgb, ${relocatingCondition.color} 12%, white)` }}>
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: relocatingCondition.color }} />
              <span className="text-sm font-semibold" style={{ color: relocatingCondition.color }}>
                {relocatingCondition.label}
              </span>
            </div>
            <h2 className="text-base font-bold text-center" style={{ color: 'var(--lp-primary)' }}>
              {relocatingCondition.label} nằm ở vùng nào?
            </h2>
            <FaceDiagram zoneSeverity={Object.fromEntries(selectedZones.map(z => [z, 'nhieu' as Severity])) as Partial<Record<Zone, Severity>>} onZoneTap={(z) => toggleZone(z)} isScanning={false} />
            <SelectedZoneTags selectedZones={selectedZones} />
            {selectedZones.length > 0 && (
              <button onClick={handleRelocateConfirm}
                className="w-full max-w-xs py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-[0.97]"
                style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 14px color-mix(in srgb, var(--lp-accent) 30%, transparent)' }}>
                Tiếp tục
              </button>
            )}
          </div>

          {/* Desktop — tinted left panel + FaceDiagram at 400px */}
          <div className="hidden md:flex flex-1 overflow-hidden"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            {/* Left — face diagram on tinted bg */}
            <div className="flex-1 flex flex-col items-center justify-center p-8"
              style={{ background: `color-mix(in srgb, ${relocatingCondition.color} 6%, var(--lp-bg-hero))` }}>
              <h2 className="text-lg font-bold mb-5 text-center" style={{ color: 'var(--lp-primary)' }}>
                {relocatingCondition.label} nằm ở vùng nào?
              </h2>
              <div className="md:max-w-[400px]">
                <FaceDiagram zoneSeverity={Object.fromEntries(selectedZones.map(z => [z, 'nhieu' as Severity])) as Partial<Record<Zone, Severity>>} onZoneTap={(z) => toggleZone(z)} isScanning={false} />
              </div>
            </div>

            {/* Divider */}
            <div className="self-stretch w-px bg-cta/10 flex-shrink-0" />

            {/* Right — condition badge + zone tags + CTA */}
            <div className="flex-1 flex flex-col justify-center gap-4 p-8">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: relocatingCondition.color }} />
                <span className="font-semibold" style={{ color: relocatingCondition.color }}>
                  {relocatingCondition.label}
                </span>
              </div>
              <SelectedZoneTags selectedZones={selectedZones} />
              {selectedZones.length === 0 && (
                <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                  Chạm vào vùng da bên trái để chọn vị trí
                </p>
              )}
              {selectedZones.length > 0 && (
                <button onClick={handleRelocateConfirm}
                  className="w-full py-3.5 rounded-full font-bold text-sm text-white transition-all active:scale-[0.97]"
                  style={{ background: 'var(--lp-accent)', boxShadow: '0 4px 14px color-mix(in srgb, var(--lp-accent) 30%, transparent)' }}>
                  Tiếp tục
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Screen 2b: Alternative condition ────────────────────────────────── */}
      {phase === 'alternative' && (
        <>
          {/* Mobile */}
          <div className="md:hidden flex-1 flex flex-col px-5 py-6 gap-4 overflow-y-auto"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            <p className="text-sm font-semibold text-center" style={{ color: 'var(--lp-primary)' }}>
              Chọn tình trạng gần nhất với da bạn:
            </p>
            <div className="flex flex-col gap-2">
              {ALTERNATIVE_CONDITIONS.filter(c => c.id !== activeConditionId).map(cond => (
                <button key={cond.id} onClick={() => handleAlternativeSelect(cond.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all active:scale-[0.98]"
                  style={{
                    background: `color-mix(in srgb, ${cond.color} 7%, white)`,
                    border: `1px solid color-mix(in srgb, ${cond.color} 25%, transparent)`,
                  }}>
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cond.color }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--lp-primary)' }}>{cond.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop — single column centered list */}
          <div className="hidden md:flex flex-1 items-center justify-center p-8 overflow-y-auto"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            <div className="flex flex-col items-center gap-5" style={{ maxWidth: '420px' }}>
              <p className="text-base font-bold text-center" style={{ color: 'var(--lp-primary)' }}>
                Chọn tình trạng gần nhất với da bạn:
              </p>
              <div className="flex flex-col gap-2 w-full">
                {ALTERNATIVE_CONDITIONS.filter(c => c.id !== activeConditionId).map(cond => (
                  <button key={cond.id} onClick={() => handleAlternativeSelect(cond.id)}
                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: `color-mix(in srgb, ${cond.color} 7%, white)`,
                      border: `1px solid color-mix(in srgb, ${cond.color} 25%, transparent)`,
                    }}>
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: cond.color }} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--lp-primary)' }}>{cond.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Screen: Sensitive-skin symptom quiz ────────────────────────────── */}
      {phase === 'sensitive-quiz' && (
        <>
          {/* Mobile — 2×2 grid */}
          <div className="md:hidden flex-1 flex flex-col px-4 py-5 overflow-y-auto"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            <p className="text-xs font-bold mb-1" style={{ color: '#7DD9C0', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Da nhạy cảm
            </p>
            <p className="text-sm font-extrabold mb-4 leading-snug" style={{ color: 'var(--lp-primary)' }}>
              Bạn thường gặp triệu chứng nào nhất?
            </p>
            <div className="grid grid-cols-2 gap-3">
              {SENSITIVE_SYMPTOMS.map((s, i) => (
                <button key={s.id}
                  className="symptom-card text-left rounded-2xl overflow-hidden"
                  style={{
                    border: '1.5px solid color-mix(in srgb, var(--lp-primary) 10%, transparent)',
                    background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                    animation: `card-enter 280ms ease-out ${i * 55}ms both`,
                  }}
                  onClick={() => handleSensitiveSymptomSelect(s.label)}>
                  <img src={s.img} alt="" aria-hidden="true"
                    className="w-full object-cover"
                    style={{ aspectRatio: '4/3', display: 'block' }} />
                  <div className="p-2.5">
                    <p className="font-bold leading-snug" style={{ fontSize: '11px', color: 'var(--lp-primary)' }}>{s.label}</p>
                    <p className="mt-1 leading-relaxed" style={{ fontSize: '9.5px', color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Desktop — full-width 4-column grid */}
          <div className="hidden md:flex flex-1 flex-col justify-center px-10 py-8 overflow-y-auto"
            style={{ animation: 'fade-in 300ms ease-out both' }}>
            <p className="text-xs font-bold mb-2" style={{ color: '#7DD9C0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Da nhạy cảm
            </p>
            <p className="text-2xl font-black mb-8" style={{ color: 'var(--lp-primary)' }}>
              Bạn thường gặp triệu chứng nào nhất?
            </p>
            <div className="grid grid-cols-4 gap-5">
              {SENSITIVE_SYMPTOMS.map((s, i) => (
                <button key={s.id}
                  className="symptom-card text-left rounded-2xl overflow-hidden"
                  style={{
                    border: '1.5px solid color-mix(in srgb, var(--lp-primary) 10%, transparent)',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
                    animation: `card-enter 300ms ease-out ${i * 60}ms both`,
                  }}
                  onClick={() => handleSensitiveSymptomSelect(s.label)}>
                  <img src={s.img} alt="" aria-hidden="true"
                    className="w-full object-cover"
                    style={{ aspectRatio: '4/3', display: 'block' }} />
                  <div className="p-4">
                    <p className="font-extrabold leading-snug" style={{ fontSize: '14px', color: 'var(--lp-primary)' }}>{s.label}</p>
                    <p className="mt-1.5 leading-relaxed" style={{ fontSize: '11.5px', color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Done ─────────────────────────────────────────────────────────────── */}
      {phase === 'done' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3"
          style={{ animation: 'fade-in 300ms ease-out both' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'var(--lp-accent)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" aria-hidden="true">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <p className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>
            {copy?.analyzing?.label ?? 'Đang phân tích...'}
          </p>
        </div>
      )}
    </div>
  );
}
