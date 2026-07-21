'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

export type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';
export type AcneType = 'inflamed' | 'blackhead' | 'sensitive' | 'pore' | 'none' | 'scar';

const ZONE_LABELS: Record<Zone, string> = {
  forehead:      'vùng trán',
  nose:          'vùng mũi / chữ T',
  'left-cheek':  'má trái',
  'right-cheek': 'má phải',
  'chin-jaw':    'cằm & quai hàm',
};

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
const ZONES_SVG: ZoneDef[] = BASE_ZONES.map(z => ({
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
  { id: 'inflamed',  label: 'Mụn viêm đỏ',         desc: 'Đau, có mủ, đỏ',                    color: '#EF4444' },
  { id: 'blackhead', label: 'Đầu đen / đầu trắng',  desc: 'Nốt nhỏ, không viêm',              color: '#374151' },
  { id: 'sensitive', label: 'Mẩn đỏ kích ứng',      desc: 'Nổi khi đổi thời tiết, mỹ phẩm',  color: '#F472B6' },
  { id: 'pore',      label: 'Lỗ chân lông to',      desc: 'Ít mụn nhưng lỗ chân lông rõ',     color: '#8B5CF6' },
  { id: 'none',      label: 'Da ổn, ít mụn',         desc: 'Không có vấn đề rõ rệt',           color: '#10B981' },
  { id: 'scar',      label: 'Sẹo rỗ',               desc: 'Lỗ nhỏ lõm sau mụn viêm',          color: '#9C7A5F' },
];

export function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none') return ['clean-skin'];
  if (zones.length === 0) {
    // User selected an acne type but skipped zone step — map type directly
    if (acneType === 'sensitive') return ['da-nhay-cam'];
    if (acneType === 'pore')      return ['lo-chan-long'];
    if (acneType === 'blackhead') return ['lo-chan-long'];
    if (acneType === 'inflamed')  return ['da-nhon-mun-viem'];
    if (acneType === 'scar')      return ['da-seo-ro'];
    return ['da-moi-bat-dau'];
  }
  const result = new Set<ConditionId>();
  if (zones.includes('chin-jaw')) result.add('mun-noi-tiet');
  if (acneType === 'sensitive') result.add('da-nhay-cam');
  if (acneType === 'pore') result.add('lo-chan-long');
  if (zones.includes('nose') && acneType === 'blackhead') result.add('lo-chan-long');
  if (zones.length > 0 && (acneType === 'inflamed' || acneType === 'blackhead')) result.add('da-nhon-mun-viem');
  if (acneType === 'scar') result.add('da-seo-ro');
  return result.size > 0 ? [...result] : ['da-moi-bat-dau'];
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

// ─── Face diagram (fully SVG-based interaction) ───────────────────────────────

export function FaceDiagram({
  selectedZones,
  onToggle,
  isScanning,
}: {
  selectedZones: Zone[];
  onToggle: (z: Zone) => void;
  isScanning: boolean;
}) {
  const [hovered, setHovered] = useState<Zone | null>(null);
  const hasInteracted = selectedZones.length > 0;

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

        {/* Illustrated face base — zoomed by FACE_SCALE */}
        <image
          href="/face-map-minigame.svg"
          x={FACE_OFFSET_X} y="0"
          width={FACE_BASE_W * FACE_SCALE} height={FACE_BASE_W * FACE_SCALE}
          preserveAspectRatio="xMidYMin meet"
        />

        {/* Zone fills + acne dots (clipped to face silhouette) */}
        <g clipPath="url(#fc-clip)">
          {ZONES_SVG.map(z => {
            const active = selectedZones.includes(z.id);
            const isHov  = hovered === z.id && !isScanning;
            return (
              <g
                key={z.id}
                onClick={() => !isScanning && onToggle(z.id)}
                onMouseEnter={() => setHovered(z.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: isScanning ? 'default' : 'pointer' }}
                role="button"
                aria-label={z.label}
                aria-pressed={active}
              >
                {/* Zone fill + hint pulse when no zone selected yet */}
                <ellipse
                  cx={z.cx} cy={z.cy} rx={z.rx} ry={z.ry}
                  fill="var(--lp-accent)"
                  opacity={active ? 0.22 : isHov ? 0.14 : 0.06}
                  style={{
                    transition: 'opacity 0.15s ease',
                    animation: !hasInteracted && !active && !isScanning
                      ? 'zone-hint 1.1s ease-in-out 4'
                      : undefined,
                  }}
                />
                {/* Dashed border — always visible in idle, guides user to tap */}
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
                {/* Expanding ring on select */}
                {active && (
                  <ellipse
                    cx={z.cx} cy={z.cy} rx={z.rx + 3} ry={z.ry + 3}
                    stroke="var(--lp-accent)" fill="none"
                    style={{ animation: 'zone-ring 1.6s ease-out infinite' }}
                  />
                )}
                {/* Animated acne dots */}
                {active && z.dots.map((d, i) => (
                  <circle
                    key={i}
                    cx={d.x} cy={d.y} r="3.5"
                    fill="#EF4444"
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

          {/* Scan line inside clip — sweeps along face silhouette */}
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

export function StepProgress({ step }: { step: 1 | 2 }) {
  return (
    <div className="w-full max-w-sm mb-5 flex items-center gap-3">
      <div className="flex-1 h-1.5 rounded-full bg-cta/10 overflow-hidden">
        <div
          className="h-full bg-cta/50 rounded-full transition-all duration-500"
          style={{ width: step === 1 ? '50%' : '100%' }}
        />
      </div>
      <span className="text-xs text-cta/40 font-semibold shrink-0">{step} / 2</span>
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

// ─── Mobile scan screen ───────────────────────────────────────────────────────

export function ScanningScreen({ selectedZones }: { selectedZones: Zone[] }) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-5 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Đang phân tích da của bạn...</p>
        <p className="text-sm text-cta/50 mt-1">Chỉ mất vài giây</p>
      </div>
      <FaceDiagram selectedZones={selectedZones} onToggle={() => {}} isScanning={true} />
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
  selectedZones, onToggle, onNext, isScanning,
  heading, subtext,
}: {
  selectedZones: Zone[]; onToggle: (z: Zone) => void; onNext: () => void; isScanning: boolean;
  heading?: string; subtext?: string;
}) {
  const h = heading || 'Bạn hay bị mụn ở đâu?';
  const s = subtext  || 'Chạm vào vùng da bạn hay có mụn nhất';
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
      <FaceDiagram selectedZones={selectedZones} onToggle={onToggle} isScanning={isScanning} />
      <SelectedZoneTags selectedZones={selectedZones} />
      <button
        onClick={onNext}
        className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm hover:opacity-90 transition-opacity"
      >
        Tiếp theo &#8594;
      </button>
    </div>
  );
}

function Step2({
  acneType, onSelect, onBack, onSubmit, isScanning,
}: {
  acneType: AcneType | null; onSelect: (t: AcneType) => void;
  onBack: () => void; onSubmit: () => void; isScanning: boolean;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-3 animate-fade-in-up">
      <div className="text-center mb-1">
        <p className="font-extrabold text-xl text-cta">Mụn thường trông như thế nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {ACNE_TYPES.map(t => (
          <AcneCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => onSelect(t.id)} />
        ))}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={isScanning}
          className="px-5 py-3.5 rounded-soft border-2 border-cta/20 text-cta/60 text-sm font-semibold disabled:opacity-40"
        >
          &#8592; Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={!acneType || isScanning}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isScanning ? 'Đang phân tích...' : 'Xem kết quả của tôi'}
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FaceMapMinigame({ onComplete, copy }: MinigameSlotProps) {
  const hasIntro = !!(copy?.intro?.heading);
  const [showIntro, setShowIntro]     = useState(hasIntro);
  const [step, setStep]               = useState<1 | 2>(1);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [acneType, setAcneType]       = useState<AcneType | null>(null);
  const [isScanning, setIsScanning]   = useState(false);

  const faceH = copy?.faceMap?.heading;
  const faceS = copy?.faceMap?.subtext;

  function toggleZone(z: Zone) {
    setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  function handleSubmit() {
    if (isScanning) return;
    const type = acneType ?? 'none';
    const conditionIds = mapToConditions(selectedZones, type);
    const resolved = conditionIds.map(id => skinConditions[id]).filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']].filter((c): c is NonNullable<typeof c> => c != null);
    const condition = conditions[0];
    if (!condition) return;

    const zoneLabel = type !== 'none' && selectedZones.length > 0
      ? selectedZones.map(z => ZONE_LABELS[z]).join(', ')
      : '';
    const zoneIds = type !== 'none' ? [...selectedZones] : [];
    const typeInfo = ACNE_TYPES.find(t => t.id === type);

    setIsScanning(true);
    setTimeout(() => {
      onComplete({
        conditions,
        condition,
        zoneLabel,
        zoneIds,
        triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '',
      });
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

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">

      {/* Mobile: 2 bước tuần tự */}
      <div className="md:hidden w-full flex flex-col items-center gap-4">
        {isScanning
          ? <ScanningScreen selectedZones={selectedZones} />
          : (
            <>
              <StepProgress step={step} />
              {step === 1
                ? (
                  <Step1
                    selectedZones={selectedZones}
                    onToggle={toggleZone}
                    onNext={() => setStep(2)}
                    isScanning={false}
                    heading={faceH}
                    subtext={faceS}
                  />
                ) : (
                  <Step2
                    acneType={acneType}
                    onSelect={setAcneType}
                    onBack={() => setStep(1)}
                    onSubmit={handleSubmit}
                    isScanning={false}
                  />
                )
              }
            </>
          )
        }
      </div>

      {/* Desktop: 2 cột song song */}
      <div className="hidden md:flex md:items-start md:gap-10 w-full max-w-4xl">
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-extrabold text-2xl text-cta">{faceH || 'Bạn hay bị mụn ở đâu?'}</p>
            <p className="text-sm text-cta/50 mt-1">{faceS || 'Chạm vào vùng da bạn hay có mụn nhất'}</p>
          </div>
          <FaceDiagram selectedZones={selectedZones} onToggle={toggleZone} isScanning={isScanning} />
          <SelectedZoneTags selectedZones={selectedZones} />
        </div>
        <div className="w-px bg-cta/10 self-stretch" />
        <div className="flex-1 flex flex-col gap-3">
          <div className="text-center mb-1">
            <p className="font-extrabold text-2xl text-cta">Mụn thường trông như thế nào?</p>
            <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {ACNE_TYPES.map(t => (
              <AcneCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => setAcneType(t.id)} />
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!acneType || isScanning}
            className="mt-1 w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isScanning ? 'Đang phân tích...' : 'Xem kết quả của tôi'}
          </button>
        </div>
      </div>

    </div>
  );
}
