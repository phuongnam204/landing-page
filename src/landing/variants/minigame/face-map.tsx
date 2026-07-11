'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';
type AcneType = 'inflamed' | 'blackhead' | 'sensitive' | 'pore' | 'none';

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

const ZONES_SVG: ZoneDef[] = [
  {
    id: 'forehead', label: 'Trán',
    cx: 88, cy: 46, rx: 42, ry: 22,
    dots: [{ x: 74, y: 38 }, { x: 88, y: 30 }, { x: 102, y: 38 }, { x: 80, y: 52 }, { x: 97, y: 50 }],
  },
  {
    id: 'nose', label: 'Mũi / Chữ T',
    cx: 88, cy: 110, rx: 18, ry: 28,
    dots: [{ x: 82, y: 98 }, { x: 94, y: 106 }, { x: 84, y: 120 }, { x: 92, y: 126 }],
  },
  {
    id: 'left-cheek', label: 'Má trái',
    cx: 47, cy: 124, rx: 26, ry: 24,
    dots: [{ x: 36, y: 116 }, { x: 50, y: 122 }, { x: 38, y: 132 }, { x: 58, y: 128 }],
  },
  {
    id: 'right-cheek', label: 'Má phải',
    cx: 129, cy: 124, rx: 26, ry: 24,
    dots: [{ x: 118, y: 116 }, { x: 132, y: 122 }, { x: 120, y: 132 }, { x: 140, y: 128 }],
  },
  {
    id: 'chin-jaw', label: 'Cằm & quai hàm',
    cx: 88, cy: 176, rx: 44, ry: 22,
    dots: [{ x: 74, y: 170 }, { x: 88, y: 166 }, { x: 102, y: 170 }, { x: 80, y: 182 }, { x: 97, y: 180 }],
  },
];

const ACNE_TYPES: { id: AcneType; label: string; desc: string; color: string }[] = [
  { id: 'inflamed',  label: 'Mụn viêm đỏ',         desc: 'Đau, có mủ, đỏ',                    color: '#EF4444' },
  { id: 'blackhead', label: 'Đầu đen / đầu trắng',  desc: 'Nốt nhỏ, không viêm',              color: '#374151' },
  { id: 'sensitive', label: 'Mẩn đỏ kích ứng',      desc: 'Nổi khi đổi thời tiết, mỹ phẩm',  color: '#F472B6' },
  { id: 'pore',      label: 'Lỗ chân lông to',      desc: 'Ít mụn nhưng lỗ chân lông rõ',     color: '#8B5CF6' },
  { id: 'none',      label: 'Da ổn, ít mụn',         desc: 'Không có vấn đề rõ rệt',           color: '#10B981' },
];

function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none' && zones.length === 0) return ['clean-skin'];
  const result = new Set<ConditionId>();
  if (zones.includes('chin-jaw')) result.add('mun-noi-tiet');
  if (acneType === 'sensitive') result.add('da-nhay-cam');
  if (acneType === 'pore') result.add('lo-chan-long');
  if (zones.includes('nose') && acneType === 'blackhead') result.add('lo-chan-long');
  if (zones.length > 0 && (acneType === 'inflamed' || acneType === 'blackhead')) result.add('da-nhon-mun-viem');
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

function FaceDiagram({
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
    <div className="select-none w-full max-w-[320px]">
      <svg
        viewBox="0 0 176 240"
        className="w-full h-auto"
        fill="none"
        aria-label="Sơ đồ khuôn mặt — chạm vào vùng có mụn"
        role="img"
      >
        <defs>
          <clipPath id="fc-clip">
            <ellipse cx="88" cy="120" rx="71" ry="95" />
          </clipPath>
          <style>{SVG_KEYFRAMES}</style>
        </defs>

        {/* Base face */}
        <ellipse
          cx="88" cy="120" rx="72" ry="96"
          fill="var(--lp-bg-card)" stroke="currentColor"
          strokeWidth="1.8" className="text-cta/20"
        />
        {/* Ears */}
        <ellipse cx="16"  cy="120" rx="7" ry="13" fill="var(--lp-bg-card)" stroke="currentColor" strokeWidth="1.5" className="text-cta/18" />
        <ellipse cx="160" cy="120" rx="7" ry="13" fill="var(--lp-bg-card)" stroke="currentColor" strokeWidth="1.5" className="text-cta/18" />

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

        {/* Face features — rendered above zone fills */}
        <path d="M62 84 Q76 78 90 84"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/25" />
        <path d="M86 84 Q100 78 114 84" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/25" />
        <ellipse cx="76"  cy="96" rx="11" ry="7" stroke="currentColor" strokeWidth="1.5" className="text-cta/28" />
        <ellipse cx="100" cy="96" rx="11" ry="7" stroke="currentColor" strokeWidth="1.5" className="text-cta/28" />
        <path d="M82 116 Q88 126 94 116" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/22" />
        <path d="M72 148 Q88 160 104 148" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/25" />

      </svg>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepProgress({ step }: { step: 1 | 2 }) {
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

function SelectedZoneTags({ selectedZones }: { selectedZones: Zone[] }) {
  return (
    <div className="min-h-7 flex flex-wrap gap-1.5 justify-center">
      {selectedZones.length === 0
        ? <span className="text-xs text-cta/30">Chưa chọn — nhấn vào vùng trên mặt</span>
        : selectedZones.map(z => (
          <span key={z} className="text-xs bg-cta/10 text-cta font-semibold rounded-full px-2.5 py-1">
            {ZONE_LABELS[z]}
          </span>
        ))
      }
    </div>
  );
}

function AcneTypeOption({ type, isSelected, onSelect }: {
  type: typeof ACNE_TYPES[number]; isSelected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={[
        'w-full text-left flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all duration-150',
        isSelected
          ? 'border-cta/60 bg-cta/10 scale-[1.01]'
          : 'border-cta/15 bg-[var(--lp-bg-card)] hover:border-cta/35',
      ].join(' ')}
    >
      <span
        className="w-5 h-5 rounded-full shrink-0 shadow-sm"
        style={{ background: type.color, boxShadow: isSelected ? `0 0 0 3px ${type.color}33` : undefined }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-cta">{type.label}</p>
        <p className="text-xs text-cta/50">{type.desc}</p>
      </div>
      {isSelected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 text-cta">
          <path d="M3 8l4 4 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─── Mobile scan screen ───────────────────────────────────────────────────────

function ScanningScreen({ selectedZones }: { selectedZones: Zone[] }) {
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

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({
  selectedZones, onToggle, onNext, isScanning,
}: {
  selectedZones: Zone[]; onToggle: (z: Zone) => void; onNext: () => void; isScanning: boolean;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Bạn hay bị mụn ở đâu?</p>
        <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da bạn hay có mụn nhất</p>
      </div>
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
    <div className="w-full max-w-sm flex flex-col gap-2.5 animate-fade-in-up">
      <div className="text-center mb-1">
        <p className="font-extrabold text-xl text-cta">Mụn thường trông như thế nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
      </div>
      {ACNE_TYPES.map(t => (
        <AcneTypeOption key={t.id} type={t} isSelected={acneType === t.id} onSelect={() => onSelect(t.id)} />
      ))}
      <div className="flex gap-2 mt-1">
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
          {isScanning ? 'Đang phân tích...' : 'Xem kết quả của tôi &#8594;'}
        </button>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FaceMapMinigame({ onComplete }: MinigameSlotProps) {
  const [step, setStep]               = useState<1 | 2>(1);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [acneType, setAcneType]       = useState<AcneType | null>(null);
  const [isScanning, setIsScanning]   = useState(false);

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

    const zoneLabel = selectedZones.length > 0
      ? selectedZones.map(z => ZONE_LABELS[z]).join(', ')
      : 'không có vùng cụ thể';
    const typeInfo = ACNE_TYPES.find(t => t.id === type);

    setIsScanning(true);
    setTimeout(() => {
      onComplete({
        conditions,
        condition,
        zoneLabel,
        zoneIds: [...selectedZones],
        triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '',
      });
    }, 1150);
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
            <p className="font-extrabold text-2xl text-cta">Bạn hay bị mụn ở đâu?</p>
            <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da bạn hay có mụn nhất</p>
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
          {ACNE_TYPES.map(t => (
            <AcneTypeOption key={t.id} type={t} isSelected={acneType === t.id} onSelect={() => setAcneType(t.id)} />
          ))}
          <button
            onClick={handleSubmit}
            disabled={!acneType || isScanning}
            className="mt-1 w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            {isScanning ? 'Đang phân tích...' : 'Xem kết quả của tôi →'}
          </button>
        </div>
      </div>

    </div>
  );
}
