'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

export type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';
export type AcneType = 'inflamed' | 'blackhead' | 'whitehead' | 'sensitive' | 'pore' | 'none' | 'scar';

export type Severity = 'nhieu' | 'vua' | 'it' | 'khong';

export interface ConditionAssessment {
  acneType: AcneType;
  zones: Partial<Record<Zone, Severity>>;
}

const SEVERITY_WEIGHT: Record<Severity, number> = { nhieu: 2, vua: 1.5, it: 1, khong: 0 };
const SEV_RANK: Record<Severity, number> = { nhieu: 3, vua: 2, it: 1, khong: 0 };

function _totalScore(assessment: ConditionAssessment): number {
  return (Object.values(assessment.zones) as Severity[])
    .reduce((s, v) => s + SEVERITY_WEIGHT[v], 0);
}

function _getCombinedZoneSeverity(
  assessments: ConditionAssessment[]
): Partial<Record<Zone, Severity>> {
  const result: Partial<Record<Zone, Severity>> = {};
  for (const { zones } of assessments) {
    for (const [zone, sev] of Object.entries(zones) as [Zone, Severity][]) {
      const existing = result[zone];
      if (!existing || SEV_RANK[sev] > SEV_RANK[existing]) result[zone] = sev;
    }
  }
  return result;
}

export const ZONE_LABELS: Record<Zone, string> = {
  forehead:       'vùng trán',
  nose:           'vùng mũi / chữ T',
  'left-cheek':   'má trái',
  'right-cheek':  'má phải',
  'chin-jaw':     'cằm & quai hàm',
};

export type ZoneMap = Partial<Record<Zone, {
  conditions: string[];
  severity: Severity;
}>>;

export interface ConditionOption {
  id: string;
  label: string;
  image?: string;
  color: string;
}

export function zoneMapToAssessments(
  zoneMap: ZoneMap,
  idToAcneType: (id: string) => AcneType = id => id as AcneType
): ConditionAssessment[] {
  const byType = new Map<AcneType, Partial<Record<Zone, Severity>>>();
  for (const [zone, data] of Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]) {
    for (const condId of data.conditions) {
      const acneType = idToAcneType(condId);
      if (!byType.has(acneType)) byType.set(acneType, {});
      byType.get(acneType)![zone] = data.severity;
    }
  }
  return Array.from(byType.entries()).map(([acneType, zones]) => ({ acneType, zones }));
}

type ZoneDef = {
  id: Zone;
  label: string;
  cx: number; cy: number; rx: number; ry: number;
  dots: { x: number; y: number }[];
};

// ─── Face illustration scale ──────────────────────────────────────────────────
// To resize: change FACE_SCALE only. 1 = original, 2 = 2x zoom. Everything else is derived.
const FACE_SCALE = 2;
const FACE_BASE_W = 176;
const FACE_OFFSET_X = -((FACE_SCALE - 1) * FACE_BASE_W) / 2;

// Base zone definitions at scale=1.
// face-map-minigame.svg is 2209×1521 (landscape). With xMidYMin meet at 352×352,
// the image renders 352×242px. Hair fills y≈0–88; skin (forehead) starts at y≈88.
// Coords below are calibrated via DOM measurement of the rendered SVG at FACE_SCALE=2.
const BASE_ZONES: ZoneDef[] = [
  {
    id: 'forehead', label: 'Trán',
    cx: 88, cy: 54, rx: 14, ry: 5,
    dots: [ { x: 82, y: 57 }, { x: 94, y: 56 }, { x: 80, y: 54 }, { x: 92, y: 55 }],
  },
  {
    id: 'nose', label: 'Mũi / Chữ T',
    cx: 88, cy: 74, rx: 7, ry: 11,
    dots: [{ x: 85, y: 68 }, { x: 91, y: 73 }, { x: 86, y: 80 }],
  },
  {
    id: 'left-cheek', label: 'Má trái',
    cx: 75, cy: 78, rx: 6, ry: 6,
    dots: [ { x: 74, y: 75 }, { x: 75, y: 83 }, { x: 79, y: 82 }],
  },
  {
    id: 'right-cheek', label: 'Má phải',
    cx: 101, cy: 78, rx: 6, ry: 6,
    dots: [{ x: 97, y: 74 }, { x: 106, y: 74 }, { x: 97, y: 79 }],
  },
  {
    id: 'chin-jaw', label: 'Cằm & quai hàm',
    cx: 88, cy: 92, rx: 18, ry: 7,
    dots: [{ x: 74, y: 88 }, { x: 88, y: 86 }, { x: 98, y: 88 }, { x: 81, y: 96 }, { x: 95, y: 96 }, { x: 91, y: 85 }],
  },
];

// Derived zones — auto-scaled; edit BASE_ZONES above, not here
export const ZONES_SVG: ZoneDef[] = BASE_ZONES.map(z => ({
  ...z,
  cx: z.cx * FACE_SCALE + FACE_OFFSET_X,
  cy: z.cy * FACE_SCALE,
  rx: z.rx * FACE_SCALE,
  ry: z.ry * FACE_SCALE,
  dots: z.dots.map(d => ({
    x: d.x * FACE_SCALE + FACE_OFFSET_X,
    y: d.y * FACE_SCALE,
  })),
}));

// Clip ellipse at scale=1 — covers skin area (forehead to chin), excludes hair
const BASE_CLIP = { cx: 88, cy: 72, rx: 41, ry: 30 };
const FACE_CLIP = {
  cx: BASE_CLIP.cx * FACE_SCALE + FACE_OFFSET_X,
  cy: BASE_CLIP.cy * FACE_SCALE,
  rx: BASE_CLIP.rx * FACE_SCALE,
  ry: BASE_CLIP.ry * FACE_SCALE,
};

export const ACNE_TYPES: { id: AcneType; label: string; desc: string; color: string }[] = [
  { id: 'inflamed',  label: 'Mụn viêm đỏ',      desc: 'Đau, có mủ, đỏ sưng',                color: '#EF4444' },
  { id: 'blackhead', label: 'Mụn đầu đen',        desc: 'Nốt đen nhỏ trong lỗ chân lông',    color: '#374151' },
  { id: 'whitehead', label: 'Mụn đầu trắng',      desc: 'Nốt trắng kín, không viêm',          color: '#6b7280' },
  { id: 'sensitive', label: 'Mẩn đỏ kích ứng',   desc: 'Nổi khi đổi thời tiết, mỹ phẩm',    color: '#F472B6' },
  { id: 'pore',      label: 'Lỗ chân lông to',   desc: 'Ít mụn nhưng lỗ chân lông rõ',       color: '#8B5CF6' },
  { id: 'scar',      label: 'Sẹo rỗ',            desc: 'Lỗ nhỏ lõm sau mụn viêm',            color: '#9C7A5F' },
  { id: 'none',      label: 'Da ổn, ít mụn',      desc: 'Không có vấn đề rõ rệt',             color: '#10B981' },
];

export const CONDITION_IMAGES: Partial<Record<AcneType, string>> = {
  inflamed:  '/condition/mun-viem-do.jpg',
  blackhead: '/condition/mun-dau-den.png',
  whitehead: '/condition/mun-dau-trang.jpg',
  sensitive: '/condition/man-do-kich-ung.jpg',
  pore:      '/condition/lo-chan-long.jpg',
  scar:      '/condition/seo-ro.jpg',
};

// Change this constant to switch the ConditionSelectStep UI layout:
// 'a' = Pill cloud with animated image preview
// 'b' = Row list with circle thumbnails
// 'c' = Card deck (one condition at a time, swipe-style)
// 'card' = Original 2x3 card grid (legacy)
const CONDITION_SELECT_VARIANT: 'a' | 'b' | 'c' | 'card' = 'a';

export function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none') return ['clean-skin'];
  if (zones.length === 0) {
    // User selected an acne type but skipped zone step — map type directly
    if (acneType === 'sensitive') return ['da-nhay-cam'];
    if (acneType === 'pore')      return ['lo-chan-long'];
    if (acneType === 'blackhead' || acneType === 'whitehead') return ['lo-chan-long'];
    if (acneType === 'inflamed')  return ['da-nhon-mun-viem'];
    if (acneType === 'scar')      return ['da-seo-ro'];
    return ['da-moi-bat-dau'];
  }
  const result = new Set<ConditionId>();
  if (zones.includes('chin-jaw')) result.add('mun-noi-tiet');
  if (acneType === 'sensitive') result.add('da-nhay-cam');
  if (acneType === 'pore') result.add('lo-chan-long');
  if (zones.includes('nose') && (acneType === 'blackhead' || acneType === 'whitehead')) result.add('lo-chan-long');
  if (zones.length > 0 && (acneType === 'inflamed' || acneType === 'blackhead' || acneType === 'whitehead')) result.add('da-nhon-mun-viem');
  if (acneType === 'scar') result.add('da-seo-ro');
  return result.size > 0 ? [...result] : ['da-moi-bat-dau'];
}

export function assessToConditions(assessments: ConditionAssessment[]): ConditionId[] {
  const ranked = assessments
    .map(a => ({ a, score: _totalScore(a) }))
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score);

  if (ranked.length === 0) return ['clean-skin'];

  const result = new Set<ConditionId>();
  for (const { a } of ranked) {
    const activeZones = (Object.entries(a.zones) as [Zone, Severity][])
      .filter(([, s]) => s !== 'khong')
      .map(([z]) => z);
    for (const id of mapToConditions(activeZones, a.acneType)) {
      result.add(id);
    }
  }
  return result.size > 0 ? [...result] : ['clean-skin'];
}

// ─── SVG keyframes (injected once) ───────────────────────────────────────────

const SVG_KEYFRAMES = `
  @keyframes acne-pop {
    0%   { opacity: 0; }
    60%  { opacity: 1; }
    100% { opacity: 0.9; }
  }
  @keyframes acne-pulse {
    0%, 100% { opacity: 0.9; }
    50%       { opacity: 0.28; }
  }
  @keyframes zone-ring {
    0%   { stroke-opacity: 0.55; stroke-width: 1.5; }
    100% { stroke-opacity: 0;    stroke-width: 10; }
  }
  @keyframes zone-hint {
    0%, 100% { opacity: 0.06; }
    50%       { opacity: 0.22; }
  }
  @keyframes scan-sweep {
    0%   { transform: translateY(0);      opacity: 0; }
    6%   { opacity: 0.85; }
    92%  { opacity: 0.85; }
    100% { transform: translateY(240px);  opacity: 0; }
  }
  @keyframes scan-glow {
    0%   { transform: translateY(-18px);  opacity: 0; }
    8%   { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(238px);  opacity: 0; }
  }
`;

const BUBBLE_KEYFRAMES = `
  @keyframes bubArc {
    0%   { opacity: 0; transform: translate(-50%, -50%) translateY(10px); }
    55%  { opacity: 1; transform: translate(-50%, -50%) scale(1.08) translateY(-4px); }
    100% { opacity: 1; transform: translate(-50%, -50%) scale(1)    translateY(0); }
  }
  @keyframes bubSelect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    40%  { transform: translate(-50%, -50%) scale(1.35); }
    70%  { transform: translate(-50%, -50%) scale(0.88); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }
  @keyframes bubCondSelect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    30%  { transform: translate(-50%, -50%) scale(1.4) rotate(-6deg); }
    65%  { transform: translate(-50%, -50%) scale(0.85) rotate(4deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes bubCondDeselect {
    0%   { transform: translate(-50%, -50%) scale(1); }
    50%  { transform: translate(-50%, -50%) scale(0.82) rotate(-4deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
  }
  @keyframes bubConfirmIn {
    from { transform: translateX(-50%) scale(0.7) translateY(8px); opacity: 0; }
    to   { transform: translateX(-50%) scale(1) translateY(0px); opacity: 1; }
  }
  @keyframes bubOverlay {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
`;

const ARC_CONFIG = [
  { severity: 'it'    as Severity, label: 'Ít\nmụn',     angleDeg: 225, bg: 'rgba(155,68,5,0.90)',   border: '#ea8c2a', color: '#fef3c7' },
  { severity: 'vua'   as Severity, label: 'Vừa\nphải',   angleDeg: 315, bg: 'rgba(155,100,5,0.85)',  border: '#f59e0b', color: '#fef9c3' },
  { severity: 'nhieu' as Severity, label: 'Nhiều\nmụn',  angleDeg:  30, bg: 'rgba(180,25,25,0.90)',  border: '#f87171', color: '#ffe4e4' },
] as const;

const BUBBLE_R = 60;
const COND_BUBBLE_R = 110;

function calcBubblePos(cx: number, cy: number, angleDeg: number, radius = BUBBLE_R) {
  const rad = angleDeg * Math.PI / 180;
  return {
    left: Math.max(37, Math.min(window.innerWidth  - 37, cx + radius * Math.sin(rad))),
    top:  Math.max(37, Math.min(window.innerHeight - 37, cy - radius * Math.cos(rad))),
  };
}

export function BubbleSeverityPicker({
  cx,
  cy,
  onSelect,
  onClose,
}: {
  cx: number;
  cy: number;
  onSelect: (s: Severity) => void;
  onClose: () => void;
}) {
  const [selecting, setSelecting] = useState<Severity | null>(null);

  function pick(s: Severity) {
    setSelecting(s);
    setTimeout(() => { onSelect(s); }, 280);
  }

  return (
    <>
      <style>{BUBBLE_KEYFRAMES}</style>
      {/* Backdrop — tap outside to close */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.45)', animation: 'bubOverlay 0.2s ease both' }}
        onClick={onClose}
      />
      {/* 3 arc-positioned bubbles */}
      {ARC_CONFIG.map((cfg, i) => {
        const pos = calcBubblePos(cx, cy, cfg.angleDeg);
        const isSelecting = selecting === cfg.severity;
        return (
          <button
            key={cfg.severity}
            className="fixed z-50 flex items-center justify-center rounded-full text-center"
            onClick={(e) => { e.stopPropagation(); pick(cfg.severity); }}
            aria-label={cfg.label.replace('\n', ' ')}
            style={{
              width: 54, height: 54,
              left: pos.left, top: pos.top,
              background: cfg.bg,
              border: `2.5px solid ${cfg.border}`,
              color: cfg.color,
              fontSize: 11, fontWeight: 800, lineHeight: 1.25,
              boxShadow: '0 5px 20px rgba(0,0,0,0.30)',
              whiteSpace: 'pre-line',
              animation: isSelecting
                ? 'bubSelect 0.22s ease both'
                : `bubArc 0.32s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.09}s both`,
            }}
          >
            {cfg.label}
          </button>
        );
      })}
    </>
  );
}

// ─── BubbleConditionPicker (Layer 1) ─────────────────────────────────────────

function conditionArcAngles(n: number): number[] {
  if (n === 0) return [];
  if (n === 1) return [280];
  const span = Math.min((n - 1) * 40, 150);
  const half = span / 2;
  return Array.from({ length: n }, (_, i) => 280 - half + (i / (n - 1)) * span);
}

export function BubbleConditionPicker({
  cx,
  cy,
  conditions,
  onConfirm,
  onClose,
}: {
  cx: number;
  cy: number;
  conditions: ConditionOption[];
  onConfirm: (selectedIds: string[]) => void;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [justToggled, setJustToggled] = useState<string | null>(null);

  const angles = conditionArcAngles(conditions.length);
  const canConfirm = selected.size > 0;

  function toggle(id: string) {
    const willSelect = !selected.has(id);
    setJustToggled(id);
    setTimeout(() => setJustToggled(null), 320);
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    void willSelect;
  }

  return (
    <>
      <style>{BUBBLE_KEYFRAMES}</style>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.45)', animation: 'bubOverlay 0.2s ease both' }} onClick={onClose} />
      {conditions.map((cond, i) => {
        const pos = calcBubblePos(cx, cy, angles[i] ?? 280, COND_BUBBLE_R);
        const isSel = selected.has(cond.id);
        const isToggling = justToggled === cond.id;
        return (
          <button
            key={cond.id}
            className="fixed z-50 flex flex-col items-center gap-1"
            onClick={(e) => { e.stopPropagation(); toggle(cond.id); }}
            aria-label={cond.label}
            aria-pressed={isSel}
            style={{
              left: pos.left, top: pos.top,
              transform: 'translate(-50%, -50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              animation: isToggling
                ? (isSel ? 'bubCondDeselect 0.30s ease both' : 'bubCondSelect 0.30s ease both')
                : `bubArc 0.32s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.08}s both`,
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
              border: isSel ? `3px solid ${cond.color}` : '2.5px dashed rgba(255,255,255,0.45)',
              boxShadow: isSel
                ? `0 0 0 3px rgba(255,255,255,0.9), 0 0 0 5px ${cond.color}`
                : '0 3px 12px rgba(0,0,0,0.28)',
              transition: 'border 0.18s ease, box-shadow 0.18s ease',
            }}>
              {cond.image ? (
                <img src={cond.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: cond.color }} />
              )}
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, lineHeight: 1.2, textAlign: 'center',
              color: isSel ? cond.color : 'rgba(255,255,255,0.85)',
              textShadow: '0 1px 4px rgba(0,0,0,0.55)',
              maxWidth: 64, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {cond.label}
            </span>
          </button>
        );
      })}
      <button
        className="fixed z-50"
        onClick={(e) => { e.stopPropagation(); if (canConfirm) onConfirm(Array.from(selected)); }}
        style={{
          left: cx, top: cy + COND_BUBBLE_R + 38,
          transform: 'translateX(-50%)',
          padding: '10px 22px', borderRadius: 999,
          fontWeight: 700, fontSize: 13,
          color: 'white',
          background: canConfirm ? 'var(--lp-accent)' : 'rgba(100,116,139,0.70)',
          border: 'none', cursor: canConfirm ? 'pointer' : 'default',
          boxShadow: canConfirm ? '0 4px 16px color-mix(in srgb, var(--lp-accent) 35%, transparent)' : 'none',
          transition: 'background 0.2s ease, box-shadow 0.2s ease',
          animation: 'bubConfirmIn 0.28s cubic-bezier(0.34,1.56,0.64,1) 0.18s both',
          whiteSpace: 'nowrap',
        }}
      >
        {canConfirm ? `Xác nhận (${selected.size})` : 'Chọn ít nhất 1'}
      </button>
    </>
  );
}

// ─── BubbleTwoLayerPicker (Layer 1 → Layer 2 orchestrator) ───────────────────

export function BubbleTwoLayerPicker({
  cx,
  cy,
  conditions,
  onComplete,
  onClose,
}: {
  cx: number;
  cy: number;
  conditions: ConditionOption[];
  onComplete: (conditionIds: string[], severity: Severity) => void;
  onClose: () => void;
}) {
  const singleCondition = conditions.length <= 1;
  const [layer, setLayer] = useState<1 | 2>(singleCondition ? 2 : 1);
  const [confirmedIds, setConfirmedIds] = useState<string[]>(
    singleCondition ? conditions.map(c => c.id) : []
  );

  function handleConditionsConfirmed(ids: string[]) {
    setConfirmedIds(ids);
    setLayer(2);
  }

  if (layer === 1) {
    return (
      <BubbleConditionPicker
        cx={cx} cy={cy}
        conditions={conditions}
        onConfirm={handleConditionsConfirmed}
        onClose={onClose}
      />
    );
  }

  return (
    <BubbleSeverityPicker
      cx={cx} cy={cy}
      onSelect={(severity) => onComplete(confirmedIds, severity)}
      onClose={onClose}
    />
  );
}

// ─── Face diagram (fully SVG-based interaction) ───────────────────────────────

export function FaceDiagram({
  zoneSeverity,
  onZoneTap,
  isScanning,
}: {
  zoneSeverity: Partial<Record<Zone, Severity>>;
  onZoneTap: (z: Zone, cx: number, cy: number) => void;
  isScanning: boolean;
}) {
  const [hovered, setHovered] = useState<Zone | null>(null);
  const hasInteracted = Object.keys(zoneSeverity).length > 0;

  return (
    <div className="select-none w-full max-w-[240px] md:max-w-[320px]" style={{ filter: 'drop-shadow(0 4px 16px color-mix(in srgb, var(--lp-accent) 28%, transparent))' }}>
      <svg
        viewBox="0 0 176 240"
        className="w-full h-auto"
        fill="none"
        aria-label="Sơ đồ khuôn mặt — chạm vào vùng có mụn"
        role="img"
      >
        <defs>
          <clipPath id="fc-clip">
            <ellipse cx={FACE_CLIP.cx} cy={FACE_CLIP.cy} rx={FACE_CLIP.rx} ry={FACE_CLIP.ry} />
          </clipPath>
          <style>{SVG_KEYFRAMES}</style>
        </defs>

        {/* Illustrated face base */}
        <image
          href="/face-map-minigame.svg"
          x={FACE_OFFSET_X} y="0"
          width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
          preserveAspectRatio="xMidYMin meet"
        />

        <g clipPath="url(#fc-clip)">
          {ZONES_SVG.map(z => {
            const severity = zoneSeverity[z.id];
            const active   = severity === 'nhieu' || severity === 'vua' || severity === 'it';
            const isHov    = hovered === z.id && !isScanning;
            const fillColor =
              severity === 'nhieu' ? '#EF4444'
              : severity === 'vua'  ? '#F59E0B'
              : severity === 'it'   ? '#F97316'
              : 'var(--lp-accent)';
            const dotColor =
              severity === 'nhieu' ? '#EF4444'
              : severity === 'vua'  ? '#F59E0B'
              : '#F97316';
            return (
              <g
                key={z.id}
                onClick={(e) => {
                  if (isScanning) return;
                  const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
                  const cx = rect.left + rect.width  / 2;
                  const cy = rect.top  + rect.height / 2;
                  onZoneTap(z.id, cx, cy);
                }}
                onMouseEnter={() => setHovered(z.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: isScanning ? 'default' : 'pointer' }}
                role="button"
                aria-label={z.label}
                aria-pressed={active}
              >
                {/* Zone fill */}
                <ellipse
                  cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                  fill={fillColor}
                  opacity={active ? 0.22 : isHov ? 0.14 : 0.06}
                  style={{
                    transition: 'opacity 0.15s ease',
                    animation: !hasInteracted && !active && !isScanning
                      ? 'zone-hint 1.1s ease-in-out 4'
                      : undefined,
                  }}
                />
                {/* Dashed border when idle */}
                {!active && (
                  <ellipse
                    cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                    fill="none"
                    stroke="var(--lp-accent)"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                    opacity={isHov ? 0.55 : 0.28}
                    style={{ transition: 'opacity 0.15s ease', pointerEvents: 'none' }}
                  />
                )}
                {/* Solid border + ring when active */}
                {active && (
                  <ellipse
                    cx={z.cx} cy={z.cy} rx={z.rx + 3} ry={z.ry + 3}
                    stroke={fillColor} fill="none" opacity={0.7}
                    style={{ animation: 'zone-ring 1.6s ease-out infinite' }}
                  />
                )}
                {/* Animated acne dots — colored by severity */}
                {active && z.dots.map((d, i) => (
                  <circle
                    key={i}
                    cx={d.x} cy={d.y} r="3.5"
                    fill={dotColor}
                    style={{
                      animation: [
                        `acne-pop 0.25s ease-out ${i * 0.07}s both`,
                        `acne-pulse 1.3s ease-in-out ${0.25 + i * 0.07}s infinite`,
                      ].join(', '),
                    }}
                  />
                ))}
              </g>
            );
          })}

          {/* Scan line */}
          {isScanning && (
            <>
              <rect
                x="0" y="0" width="176" height="18"
                fill="var(--lp-accent)" opacity="0.09"
                style={{ animation: 'scan-glow 1.2s ease-in-out forwards' }}
              />
              <rect
                x="0" y="0" width="176" height="3" rx="1"
                fill="var(--lp-accent)" opacity="0.85"
                style={{ animation: 'scan-sweep 1.2s ease-in-out forwards' }}
              />
            </>
          )}
        </g>
      </svg>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

export function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full max-w-sm mb-5 flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-cta/10 overflow-hidden">
        <div
          className="h-full bg-cta/50 rounded-full transition-all duration-500"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
      <span className="text-xs text-cta/40 font-semibold shrink-0">{current} / {total}</span>
    </div>
  );
}

export function SelectedZoneTags({ selectedZones }: { selectedZones: Zone[] }) {
  return (
    <div className="min-h-7 flex flex-wrap gap-1.5 justify-center">
      {selectedZones.length === 0
        // ? <span className="text-xs text-cta/30">Nhấn vào một vùng trên mặt</span>
        ? <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da bạn hay có mụn nhất</p>

        : selectedZones.map(z => (
          <span key={z} className="text-xs bg-cta/10 text-cta font-semibold rounded-full px-2.5 py-1">
            {ZONE_LABELS[z]}
          </span>
        ))
      }
    </div>
  );
}

const CARD_ICONS: Record<AcneType, React.ReactNode> = {
  inflamed: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="13" fill="#EF4444" opacity="0.12" />
      <circle cx="22" cy="22" r="6"   fill="#EF4444" opacity="0.9" />
      <circle cx="14" cy="16" r="3.5" fill="#EF4444" opacity="0.6" />
      <circle cx="30" cy="28" r="3"   fill="#EF4444" opacity="0.5" />
      <circle cx="32" cy="16" r="2"   fill="#EF4444" opacity="0.4" />
    </svg>
  ),
  blackhead: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="4"   fill="#374151" opacity="0.95" />
      <circle cx="14" cy="16" r="2.5" fill="#374151" opacity="0.75" />
      <circle cx="30" cy="16" r="2.5" fill="#374151" opacity="0.75" />
      <circle cx="16" cy="29" r="2"   fill="#374151" opacity="0.6" />
      <circle cx="28" cy="27" r="2"   fill="#374151" opacity="0.6" />
      <circle cx="22" cy="32" r="1.5" fill="#374151" opacity="0.5" />
    </svg>
  ),
  whitehead: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="4"   fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.5" opacity="0.95" />
      <circle cx="14" cy="16" r="2.5" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.2" opacity="0.75" />
      <circle cx="30" cy="16" r="2.5" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.2" opacity="0.75" />
      <circle cx="16" cy="29" r="2"   fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.1" opacity="0.6" />
      <circle cx="28" cy="27" r="2"   fill="#e5e7eb" stroke="#6b7280" strokeWidth="1.1" opacity="0.6" />
      <circle cx="22" cy="32" r="1.5" fill="#e5e7eb" stroke="#6b7280" strokeWidth="1"   opacity="0.5" />
    </svg>
  ),
  sensitive: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <path d="M8 22 Q14 15 22 22 Q30 29 36 22" stroke="#F472B6" strokeWidth="3"   strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M8 29 Q14 22 22 29 Q30 36 36 29" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M8 15 Q14 8  22 15 Q30 22 36 15" stroke="#F472B6" strokeWidth="2"   strokeLinecap="round" fill="none" opacity="0.3" />
    </svg>
  ),
  pore: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="7"   stroke="#8B5CF6" strokeWidth="2.5" opacity="0.9" />
      <circle cx="22" cy="22" r="2.5" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.7" />
      <circle cx="13" cy="15" r="4"   stroke="#8B5CF6" strokeWidth="2"   opacity="0.55" />
      <circle cx="31" cy="28" r="3.5" stroke="#8B5CF6" strokeWidth="2"   opacity="0.45" />
    </svg>
  ),
  none: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="14" fill="#10B981" opacity="0.12" />
      <path d="M14 22l5.5 5.5L30 16" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  scar: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="4"   stroke="#9C7A5F" strokeWidth="1.8" opacity="0.85" />
      <circle cx="13" cy="15" r="3"   stroke="#9C7A5F" strokeWidth="1.5" opacity="0.65" />
      <circle cx="31" cy="15" r="3"   stroke="#9C7A5F" strokeWidth="1.5" opacity="0.65" />
      <circle cx="15" cy="30" r="2.5" stroke="#9C7A5F" strokeWidth="1.5" opacity="0.5"  />
      <circle cx="29" cy="29" r="2.5" stroke="#9C7A5F" strokeWidth="1.5" opacity="0.5"  />
    </svg>
  ),
};

function AcneCard({ type, selected, onSelect }: {
  type: typeof ACNE_TYPES[number]; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-150 text-center"
      style={{
        borderColor: selected ? type.color : 'var(--lp-border)',
        background: selected ? `color-mix(in srgb, ${type.color} 10%, var(--lp-bg-card))` : 'var(--lp-bg-card)',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        boxShadow: selected ? `0 4px 16px ${type.color}28` : 'none',
      }}
    >
      {CARD_ICONS[type.id]}
      <p className="text-xs font-bold text-cta leading-tight">{type.label}</p>
      <p className="text-[10px] text-cta/50 leading-tight">{type.desc}</p>
    </button>
  );
}

// ─── Condition Select — Variant A (Pill cloud + animated image preview) ──────

const CS_TILE_KEYFRAMES = `
  @keyframes csTileIn {
    from { opacity: 0; transform: scale(.82) translateY(6px); }
    to   { opacity: 1; transform: scale(1)   translateY(0);   }
  }
`;

function ConditionSelectVariantA({ selected, onToggle, onNext }: {
  selected: AcneType[];
  onToggle: (t: AcneType) => void;
  onNext: (types: AcneType[]) => void;
}) {
  const DECK = ACNE_TYPES.filter(t => t.id !== 'none');
  const noneType = ACNE_TYPES.find(t => t.id === 'none')!;

  const imgItems = selected
    .filter(id => !!CONDITION_IMAGES[id])
    .map(id => ({
      id,
      img: CONDITION_IMAGES[id]!,
      label: ACNE_TYPES.find(t => t.id === id)?.label ?? id,
    }));

  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <style>{CS_TILE_KEYFRAMES}</style>
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Da bạn đang gặp tình trạng nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn tất cả những gì bạn đang có</p>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {DECK.map(t => {
          const isOn = selected.includes(t.id);
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              aria-pressed={isOn}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border-[1.5px] transition-all duration-150"
              style={{
                borderColor: isOn ? t.color : 'var(--lp-border)',
                background:  isOn ? `color-mix(in srgb, ${t.color} 12%, var(--lp-bg-card))` : 'var(--lp-bg-card)',
                color:       isOn ? t.color : 'color-mix(in srgb, var(--lp-accent) 55%, transparent)',
              }}
            >
              {isOn && (
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
                  <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {t.label}
            </button>
          );
        })}
        {/* "Da ổn" — togglable, mutually exclusive with other conditions */}
        <button
          onClick={() => onToggle('none')}
          aria-pressed={selected.includes('none')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border-[1.5px] transition-all duration-150"
          style={{
            borderColor: noneType.color,
            borderStyle: selected.includes('none') ? 'solid' : 'dashed',
            background:  selected.includes('none') ? `color-mix(in srgb, ${noneType.color} 12%, var(--lp-bg-card))` : 'var(--lp-bg-card)',
            color:       noneType.color,
          }}
        >
          {selected.includes('none') && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {noneType.label}
        </button>
      </div>

      {/* Image preview — animates in when chips are selected */}
      <div
        style={{
          maxHeight: imgItems.length > 0 ? '200px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.38s cubic-bezier(.25,.8,.25,1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(68px, 1fr))',
            gridAutoRows: '68px',
            gap: '6px',
            paddingTop: imgItems.length > 0 ? '4px' : '0',
          }}
        >
          {imgItems.map(({ id, img, label }) => (
            <div
              key={id}
              style={{
                borderRadius: '10px',
                overflow: 'hidden',
                position: 'relative',
                animation: 'csTileIn 0.28s cubic-bezier(.25,.8,.25,1)',
              }}
            >
              <img src={img} alt={label} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                padding: '12px 3px 3px',
                background: 'linear-gradient(transparent, rgba(0,0,0,.6))',
                color: '#fff', fontSize: '8.5px', fontWeight: 600, textAlign: 'center',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => onNext(selected)}
        disabled={selected.length === 0}
        className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        Tiếp theo &rarr;
      </button>
    </div>
  );
}

// ─── Condition Select — Variant B (Row list + circle thumbnails) ──────────────

function ConditionSelectVariantB({ selected, onToggle, onNext }: {
  selected: AcneType[];
  onToggle: (t: AcneType) => void;
  onNext: (types: AcneType[]) => void;
}) {
  const DECK = ACNE_TYPES.filter(t => t.id !== 'none');
  const noneType = ACNE_TYPES.find(t => t.id === 'none')!;

  return (
    <div className="w-full max-w-sm flex flex-col gap-3 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Da bạn đang gặp tình trạng nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn tất cả những gì bạn đang có</p>
      </div>

      <div className="flex flex-col gap-0.5">
        {DECK.map(t => {
          const isOn = selected.includes(t.id);
          const img  = CONDITION_IMAGES[t.id];
          return (
            <button
              key={t.id}
              onClick={() => onToggle(t.id)}
              aria-pressed={isOn}
              className="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors duration-100 w-full text-left"
              style={{ background: isOn ? `color-mix(in srgb, ${t.color} 8%, var(--lp-bg-card))` : 'transparent' }}
            >
              {/* Circle thumbnail */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                background: `color-mix(in srgb, ${t.color} 15%, var(--lp-bg-card))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {img
                  ? <img src={img} alt={t.label} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  : CARD_ICONS[t.id]
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-cta leading-tight">{t.label}</p>
                <p className="text-xs text-cta/45 mt-0.5 leading-tight">{t.desc}</p>
              </div>
              {/* Square checkbox */}
              <div
                className="w-5 h-5 flex-shrink-0 flex items-center justify-center"
                style={{
                  borderRadius: '4px',
                  border: `1.5px solid ${isOn ? t.color : 'color-mix(in srgb, var(--lp-accent) 25%, transparent)'}`,
                  background: isOn ? t.color : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {isOn && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M1.5 5L4 7.5L8.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </button>
          );
        })}

        {/* Separator */}
        <div className="flex items-center gap-2 my-1.5 px-1">
          <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'color-mix(in srgb, var(--lp-accent) 30%, transparent)' }}>hoặc</span>
          <div className="flex-1 h-px" style={{ background: 'color-mix(in srgb, var(--lp-accent) 12%, transparent)' }} />
        </div>

        {/* "Da ổn" — toggles like other conditions (mutually exclusive) */}
        <button
          onClick={() => onToggle('none')}
          aria-pressed={selected.includes('none')}
          className="flex items-center gap-3 px-2 py-2 rounded-xl transition-colors duration-100 w-full text-left"
          style={{ background: selected.includes('none') ? `color-mix(in srgb, ${noneType.color} 8%, var(--lp-bg-card))` : 'transparent' }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: `color-mix(in srgb, ${noneType.color} 15%, var(--lp-bg-card))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M4 10l4 4L16 6" stroke={noneType.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-cta leading-tight">{noneType.label}</p>
            <p className="text-xs text-cta/45 mt-0.5 leading-tight">{noneType.desc}</p>
          </div>
          <div style={{
            width: 20, height: 20, flexShrink: 0, borderRadius: 4,
            border: `1.5px solid ${selected.includes('none') ? noneType.color : 'color-mix(in srgb, var(--lp-accent) 25%, transparent)'}`,
            background: selected.includes('none') ? noneType.color : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}>
            {selected.includes('none') && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                <path d="M1.5 5L4 7.5L8.5 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        </button>
      </div>

      <button
        onClick={() => onNext(selected)}
        disabled={selected.length === 0}
        className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        Tiếp theo &rarr;
      </button>
    </div>
  );
}

// ─── Condition Select — Variant C (Card deck, one condition at a time) ────────

function ConditionSelectVariantC({ onNext }: { onNext: (types: AcneType[]) => void }) {
  const DECK = ACNE_TYPES.filter(t => t.id !== 'none');
  const [deckIdx, setDeckIdx] = useState(0);
  const [picked,  setPicked]  = useState<AcneType[]>([]);

  function rate(yes: boolean) {
    if (deckIdx >= DECK.length) return;
    const current    = DECK[deckIdx];
    const nextPicked = yes ? [...picked, current.id] : picked;
    const nextIdx    = deckIdx + 1;

    if (nextIdx >= DECK.length) {
      setPicked(nextPicked);
      setDeckIdx(nextIdx);
      setTimeout(() => onNext(nextPicked.length > 0 ? nextPicked : ['none']), 200);
      return;
    }
    setPicked(nextPicked);
    setDeckIdx(nextIdx);
  }

  const isDone   = deckIdx >= DECK.length;
  const current  = DECK[Math.min(deckIdx, DECK.length - 1)];
  const img      = CONDITION_IMAGES[current.id];

  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {DECK.map((t, i) => (
          <div
            key={t.id}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{
              background: i < deckIdx
                ? (picked.includes(DECK[i].id)
                    ? 'var(--lp-accent)'
                    : 'color-mix(in srgb, var(--lp-accent) 28%, transparent)')
                : 'color-mix(in srgb, var(--lp-accent) 10%, transparent)',
            }}
          />
        ))}
      </div>

      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Da bạn có bị vậy không?</p>
        <p className="text-sm text-cta/50 mt-1">
          {isDone ? 'Đang tổng hợp kết quả...' : `${deckIdx + 1} / ${DECK.length}`}
        </p>
      </div>

      {/* Deck card */}
      {!isDone && (
        <div
          key={deckIdx}
          className="rounded-2xl overflow-hidden animate-fade-in-up"
          style={{
            background: 'var(--lp-bg-card)',
            border: '1px solid color-mix(in srgb, var(--lp-accent) 12%, transparent)',
          }}
        >
          {img && (
            <img
              src={img}
              alt={current.label}
              loading="lazy"
              style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
            />
          )}
          <div className="flex flex-col items-center gap-2 px-4 py-5 text-center">
            <p className="font-extrabold text-base text-cta">{current.label}</p>
            <p className="text-xs text-cta/50 leading-relaxed">{current.desc}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!isDone && (
        <div className="flex gap-2">
          <button
            onClick={() => rate(false)}
            className="flex-1 py-3.5 rounded-soft text-sm font-semibold transition-colors"
            style={{
              border: '2px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
              color: 'color-mix(in srgb, var(--lp-accent) 55%, transparent)',
              background: 'transparent',
            }}
          >
            Không có
          </button>
          <button
            onClick={() => rate(true)}
            className="flex-1 text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
            style={{ background: current.color }}
          >
            Tôi bị vậy
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Condition Select (dispatcher) ───────────────────────────────────────────

function ConditionSelectStep({
  selected,
  onToggle,
  onNext,
  variant = CONDITION_SELECT_VARIANT,
}: {
  selected: AcneType[];
  onToggle: (t: AcneType) => void;
  onNext: (types: AcneType[]) => void;
  variant?: 'a' | 'b' | 'c' | 'card';
}) {
  if (variant === 'a') {
    return <ConditionSelectVariantA selected={selected} onToggle={onToggle} onNext={onNext} />;
  }
  if (variant === 'b') {
    return <ConditionSelectVariantB selected={selected} onToggle={onToggle} onNext={onNext} />;
  }
  if (variant === 'c') {
    return <ConditionSelectVariantC onNext={onNext} />;
  }

  // 'card' — original 2×3 grid (legacy fallback)
  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Da bạn đang gặp tình trạng nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn tất cả những gì bạn đang có</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {ACNE_TYPES.map(t => (
          <AcneCard
            key={t.id}
            type={t}
            selected={selected.includes(t.id)}
            onSelect={() => onToggle(t.id)}
          />
        ))}
      </div>
      <button
        onClick={() => onNext(selected)}
        disabled={selected.length === 0}
        className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
      >
        Tiếp theo &rarr;
      </button>
    </div>
  );
}

// ─── Mobile scan screen ───────────────────────────────────────────────────────

export function ScanningScreen({ zoneSeverity }: { zoneSeverity: Partial<Record<Zone, Severity>> }) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Đang phân tích da của bạn...</p>
        <p className="text-sm text-cta/50 mt-1">Chỉ mất vài giây</p>
      </div>
      <FaceDiagram zoneSeverity={zoneSeverity} onZoneTap={() => {}} isScanning={true} />
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-cta/40"
            style={{ animation: `acne-pulse 0.9s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
    </div>
  );
}

function ConditionFaceMapStep({
  acneType,
  assessment,
  currentStep,
  totalSteps,
  onZoneTap,
  onNext,
  onBack,
  isLast,
}: {
  acneType: AcneType;
  assessment: ConditionAssessment;
  currentStep: number;
  totalSteps: number;
  onZoneTap: (zone: Zone, cx: number, cy: number) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}) {
  const typeInfo = ACNE_TYPES.find(t => t.id === acneType)!;
  const severityEntries = (Object.entries(assessment.zones) as [Zone, Severity][])
    .filter(([, s]) => s !== 'khong');
  const hasAnyZone = severityEntries.length > 0;

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3 animate-fade-in-up">
      <div className="text-center">
        <p className="text-xs text-cta/40 font-semibold mb-1">
          Tình trạng {currentStep} / {totalSteps}
        </p>
        <p className="font-extrabold text-xl text-cta">
          {typeInfo.label} xuất hiện ở đâu?
        </p>
        <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da để chọn mức độ</p>
      </div>
      <FaceDiagram
        zoneSeverity={assessment.zones}
        onZoneTap={onZoneTap}
        isScanning={false}
      />
      {/* Severity summary tags */}
      <div className="min-h-7 flex flex-wrap gap-1.5 justify-center">
        {hasAnyZone
          ? severityEntries.map(([z, s]) => (
              <span
                key={z}
                className="text-xs rounded-full px-2.5 py-1 font-semibold"
                style={{
                  background: s === 'nhieu' ? '#EF444420' : '#F9731620',
                  color: s === 'nhieu' ? '#EF4444' : '#F97316',
                }}
              >
                {ZONE_LABELS[z]} &mdash; {s === 'nhieu' ? 'nhiều' : 'ít'}
              </span>
            ))
          : <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da để chọn mức độ</p>
        }
      </div>
      <div className="flex gap-2 w-full">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-soft border-2 border-cta/20 text-cta/60 text-sm font-semibold"
        >
          &#8592; Quay lại
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
        >
          {isLast ? 'Xem kết quả' : 'Tiếp theo →'}
        </button>
      </div>
    </div>
  );
}

// ─── Intro screen (shown when copy.intro is present) ─────────────────────────

function IntroScreen({ heading, subtext, cta, onStart }: {
  heading: string; subtext?: string; cta: string; onStart: () => void;
}) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5">
      <div className="w-full max-w-sm flex flex-col items-center gap-5 text-center animate-fade-in-up">
        <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-snug [text-wrap:balance]">{heading}</h2>
        {subtext && <p className="text-base text-cta/60">{subtext}</p>}
        <button
          onClick={onStart}
          className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
        >
          {cta}
        </button>
      </div>
    </div>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

export function Step1({
  selectedZones, onToggle, onNext, isScanning, onBack,
  heading, subtext,
}: {
  selectedZones: Zone[]; onToggle: (z: Zone) => void; onNext: () => void; isScanning: boolean;
  onBack?: () => void;
  heading?: string; subtext?: string;
}) {
  const h = heading || 'Bạn hay bị mụn ở đâu?';
  const s = subtext  || 'Chạm vào vùng da bạn hay có mụn nhất';

  // Bridge: selectedZones → zoneSeverity (all selected zones = 'nhieu')
  const zoneSeverity: Partial<Record<Zone, Severity>> = Object.fromEntries(
    selectedZones.map(z => [z, 'nhieu' as Severity])
  );

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3 md:gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">{h}</p>
      </div>
      {selectedZones.length === 0 && (
        <div className="flex flex-col items-center gap-1 -mb-2" aria-hidden="true">
          <style>{`@keyframes arrow-bounce{0%,100%{transform:translateY(0);opacity:.45}50%{transform:translateY(7px);opacity:.85}}`}</style>
          <p className="text-xs text-cta/45 font-semibold">{s}</p>
          <svg width="18" height="26" viewBox="0 0 18 26" fill="none" className="text-cta/50" style={{ animation: 'arrow-bounce 1.3s ease-in-out infinite' }}>
            <path d="M9 2 L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M3 15 L9 23 L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <FaceDiagram
        zoneSeverity={zoneSeverity}
        onZoneTap={(z) => !isScanning && onToggle(z)}
        isScanning={isScanning}
      />
      <SelectedZoneTags selectedZones={selectedZones} />
      <div className="flex gap-2 w-full">
        {onBack && (
          <button
            onClick={onBack}
            disabled={isScanning}
            className="px-5 py-3.5 rounded-soft border-2 border-cta/20 text-cta/60 text-sm font-semibold disabled:opacity-40"
          >
            &#8592; Quay lại
          </button>
        )}
        <button
          onClick={onNext}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
        >
          Tiếp theo &#8594;
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FaceMapMinigame({ onComplete, copy }: MinigameSlotProps) {
  const hasIntro = !!(copy?.intro?.heading);
  const [showIntro, setShowIntro]               = useState(hasIntro);
  const [pendingTypes, setPendingTypes]          = useState<AcneType[]>([]);
  const [selectedAcneTypes, setSelectedAcneTypes] = useState<AcneType[]>([]);
  const [wizardStep, setWizardStep]              = useState(0); // 0=condition select, 1=face-map
  const [zoneMap, setZoneMap]                    = useState<ZoneMap>({});
  const [activeBubble, setActiveBubble]          = useState<{
    zone: Zone; cx: number; cy: number; conditions: ConditionOption[];
  } | null>(null);
  const [isScanning, setIsScanning]              = useState(false);

  function handleConditionsSelected(types: AcneType[]) {
    if (types.includes('none') || types.length === 0) {
      triggerSubmit(zoneMapToAssessments({}));
      return;
    }
    const ordered = types.filter(t => t !== 'none');
    setSelectedAcneTypes(ordered);
    setZoneMap({});
    setWizardStep(1);
  }

  function handleZoneTap(zone: Zone, cx: number, cy: number) {
    const conditionOptions: ConditionOption[] = selectedAcneTypes.map(t => {
      const def = ACNE_TYPES.find(a => a.id === t)!;
      return { id: t, label: def.label, image: CONDITION_IMAGES[t], color: def.color };
    });
    setActiveBubble({ zone, cx, cy, conditions: conditionOptions });
  }

  function handleTwoLayerComplete(conditionIds: string[], severity: Severity) {
    if (!activeBubble) return;
    setZoneMap(prev => ({
      ...prev,
      [activeBubble.zone]: { conditions: conditionIds, severity },
    }));
    setActiveBubble(null);
  }

  function handleWizardNext() {
    setActiveBubble(null);
    triggerSubmit(zoneMapToAssessments(zoneMap));
  }

  function handleWizardBack() {
    setActiveBubble(null);
    setWizardStep(0);
    setZoneMap({});
  }

  function triggerSubmit(finalAssessments: ConditionAssessment[]) {
    if (isScanning) return;
    const conditionIds = assessToConditions(finalAssessments);
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0
      ? resolved
      : [skinConditions['da-moi-bat-dau']].filter((c): c is NonNullable<typeof c> => c != null);
    const condition = conditions[0];
    if (!condition) return;

    const allPairs = finalAssessments.flatMap(
      a => (Object.entries(a.zones) as [Zone, Severity][])
    );
    const activeZones = [...new Set(
      allPairs.filter(([, s]) => s !== 'khong').map(([z]) => z)
    )];
    const zoneLabel = activeZones.map(z => ZONE_LABELS[z]).join(', ');
    const triggerNote = finalAssessments
      .filter(a => _totalScore(a) > 0)
      .map(a => ACNE_TYPES.find(t => t.id === a.acneType)?.label)
      .filter(Boolean)
      .join(', ');

    setIsScanning(true);
    setTimeout(() => {
      onComplete({ conditions, condition, zoneLabel, zoneIds: activeZones, triggerNote });
    }, 1150);
  }

  if (showIntro && copy?.intro) {
    return (
      <IntroScreen
        heading={copy.intro.heading!}
        subtext={copy.intro.subtext}
        cta={copy.intro.cta || 'Bắt đầu'}
        onStart={() => setShowIntro(false)}
      />
    );
  }

  function renderContent() {
    if (isScanning) {
      return <ScanningScreen zoneSeverity={_getCombinedZoneSeverity(zoneMapToAssessments(zoneMap))} />;
    }
    if (wizardStep === 0) {
      return (
        <ConditionSelectStep
          selected={pendingTypes}
          onToggle={(t) => setPendingTypes(prev => {
            if (prev.includes(t)) return prev.filter(x => x !== t);
            if (t === 'none') return ['none'];
            return [...prev.filter(x => x !== 'none'), t];
          })}
          onNext={handleConditionsSelected}
          variant={copy?.conditionVariant}
        />
      );
    }
    // wizardStep === 1 — single face-map for all conditions
    const isMultiCondition = selectedAcneTypes.length > 1;
    const zoneSeverity: Partial<Record<Zone, Severity>> = Object.fromEntries(
      Object.entries(zoneMap).map(([z, v]) => [z, v!.severity])
    ) as Partial<Record<Zone, Severity>>;
    return (
      <div className="w-full flex flex-col items-center gap-3" style={{ animation: 'fm-fade-in 350ms ease-out both' }}>
        <style>{`@keyframes fm-fade-in { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }`}</style>
        <div className="text-center px-4">
          {isMultiCondition ? (
            <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
              Da bạn có nhiều tuýp — hãy đánh dấu từng vùng!
            </h2>
          ) : (
            <h2 className="font-extrabold text-lg leading-snug" style={{ color: 'var(--lp-primary)' }}>
              {ACNE_TYPES.find(a => a.id === selectedAcneTypes[0])?.label ?? ''} xuất hiện ở đâu?
            </h2>
          )}
          <p className="text-base mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
            Chạm vào vùng da để chọn mức độ
          </p>
        </div>
        <FaceDiagram zoneSeverity={zoneSeverity} onZoneTap={handleZoneTap} isScanning={false} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', minHeight: 28 }}>
          {Object.entries(zoneMap).length > 0
            ? (Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]).map(([z, data]) => (
                <div key={z} style={{
                  padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: data.severity === 'nhieu' ? '#EF444420' : data.severity === 'vua' ? '#F59E0B20' : '#F9731620',
                  color:      data.severity === 'nhieu' ? '#EF4444'   : data.severity === 'vua' ? '#F59E0B'   : '#F97316',
                  border: `1px solid ${data.severity === 'nhieu' ? '#EF444440' : data.severity === 'vua' ? '#F59E0B40' : '#F9731640'}`,
                }}>
                  {ZONE_LABELS[z]} — {data.severity === 'nhieu' ? 'nhiều' : data.severity === 'vua' ? 'vừa' : 'ít'}
                </div>
              ))
            : <p className="text-sm" style={{ color: 'color-mix(in srgb, var(--lp-primary) 40%, transparent)' }}>Chạm vào vùng da để bắt đầu</p>
          }
        </div>
        <div style={{ position: 'fixed', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12, padding: '0 20px', zIndex: 30 }}>
          <button
            onClick={handleWizardBack}
            style={{ padding: '14px 24px', borderRadius: 999, fontWeight: 600, fontSize: 14, color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)', background: 'color-mix(in srgb, var(--lp-primary) 8%, var(--lp-bg-hero))', border: '1.5px solid color-mix(in srgb, var(--lp-primary) 15%, transparent)', cursor: 'pointer' }}
          >
            ← Quay lại
          </button>
          <button
            onClick={handleWizardNext}
            style={{ flex: 1, maxWidth: 240, padding: '14px 32px', borderRadius: 999, fontWeight: 700, fontSize: 16, color: 'white', background: 'var(--lp-accent)', boxShadow: '0 4px 18px color-mix(in srgb, var(--lp-accent) 35%, transparent)', border: 'none', cursor: 'pointer' }}
          >
            Xem kết quả
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      <div className="w-full flex flex-col items-center gap-4">
        {renderContent()}
      </div>

      {activeBubble && (
        <BubbleTwoLayerPicker
          cx={activeBubble.cx}
          cy={activeBubble.cy}
          conditions={activeBubble.conditions}
          onComplete={handleTwoLayerComplete}
          onClose={() => setActiveBubble(null)}
        />
      )}
    </div>
  );
}
