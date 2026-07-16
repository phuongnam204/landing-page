'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';
type AcneType = 'inflamed' | 'blackhead' | 'sensitive' | 'pore' | 'none' | 'scar';

const ZONE_LABELS: Record<Zone, string> = {
  forehead: 'Trán',
  nose: 'Mũi / Chữ T',
  'left-cheek': 'Má trái',
  'right-cheek': 'Má phải',
  'chin-jaw': 'Cằm & quai hàm',
};

// Dot position on mini face oval viewBox 40×52
const ZONE_DOTS: Record<Zone, { cx: number; cy: number }> = {
  forehead:      { cx: 20, cy: 13 },
  nose:          { cx: 20, cy: 28 },
  'left-cheek':  { cx:  8, cy: 33 },
  'right-cheek': { cx: 32, cy: 33 },
  'chin-jaw':    { cx: 20, cy: 42 },
};

const ZONES: Zone[] = ['forehead', 'nose', 'left-cheek', 'right-cheek', 'chin-jaw'];

const ACNE_TYPES: { id: AcneType; label: string; desc: string; color: string }[] = [
  { id: 'inflamed',  label: 'Mụn viêm đỏ',         desc: 'Đau, đỏ, có mủ',               color: '#EF4444' },
  { id: 'blackhead', label: 'Đầu đen / đầu trắng',  desc: 'Nốt nhỏ, không viêm',          color: '#374151' },
  { id: 'sensitive', label: 'Mẩn đỏ kích ứng',      desc: 'Nổi khi đổi thời tiết',        color: '#F472B6' },
  { id: 'pore',      label: 'Lỗ chân lông to',      desc: 'Ít mụn, lỗ chân lông rõ',      color: '#8B5CF6' },
  { id: 'none',      label: 'Da ổn, ít mụn',         desc: 'Không có vấn đề rõ rệt',       color: '#10B981' },
  { id: 'scar',      label: 'Sẹo rỗ',               desc: 'Lỗ nhỏ lõm sau mụn viêm',      color: '#9C7A5F' },
];

function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none') return ['clean-skin'];
  if (zones.length === 0) {
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

// Mini face indicator SVG
function ZoneDot({ zone, active }: { zone: Zone; active: boolean }) {
  const { cx, cy } = ZONE_DOTS[zone];
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" fill="none" aria-hidden="true">
      <ellipse cx="20" cy="28" rx="14" ry="19" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
      <circle cx="20" cy="12" rx="8" ry="6" stroke="currentColor" strokeWidth="1" opacity="0.15" />
      <circle
        cx={cx} cy={cy} r="5"
        fill={active ? 'var(--lp-accent)' : 'currentColor'}
        opacity={active ? 0.95 : 0.2}
      />
      {active && (
        <circle
          cx={cx} cy={cy} r="8"
          fill="var(--lp-accent)"
          opacity={0.18}
        />
      )}
    </svg>
  );
}

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      {[1, 2].map(s => (
        <div
          key={s}
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: s === step ? 24 : 8,
            background: s <= step ? 'var(--lp-accent)' : 'var(--lp-border)',
          }}
        />
      ))}
      <span className="text-xs text-cta/40 ml-1">{step}/2</span>
    </div>
  );
}

// ─── Step 1: Zone cards ───────────────────────────────────────────────────────

function ZoneCard({ zone, selected, onToggle }: { zone: Zone; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-150 text-cta"
      style={{
        borderColor: selected ? 'var(--lp-accent)' : 'var(--lp-border)',
        background: selected
          ? 'color-mix(in srgb, var(--lp-accent) 10%, var(--lp-bg-card))'
          : 'var(--lp-bg-card)',
        transform: selected ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      <ZoneDot zone={zone} active={selected} />
      <span className="text-xs font-semibold text-center leading-tight">{ZONE_LABELS[zone]}</span>
    </button>
  );
}

function Step1({ zones, onToggle, onNext }: {
  zones: Zone[];
  onToggle: (z: Zone) => void;
  onNext: () => void;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Bạn hay bị mụn ở đâu?</p>
        <p className="text-sm text-cta/50 mt-1">Có thể chọn nhiều vùng</p>
      </div>

      {/* 2×2 + 1 grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {ZONES.slice(0, 4).map(z => (
          <ZoneCard key={z} zone={z} selected={zones.includes(z)} onToggle={() => onToggle(z)} />
        ))}
      </div>
      <ZoneCard
        zone="chin-jaw"
        selected={zones.includes('chin-jaw')}
        onToggle={() => onToggle('chin-jaw')}
      />

      {zones.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {zones.map(z => (
            <span key={z} className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: 'color-mix(in srgb, var(--lp-accent) 15%, transparent)', color: 'var(--lp-accent)' }}>
              {ZONE_LABELS[z]}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onNext}
        className="w-full font-bold py-3.5 rounded-soft text-sm text-white transition-opacity hover:opacity-90"
        style={{ background: 'var(--lp-primary)' }}
      >
        Tiếp theo &#8594;
      </button>
    </div>
  );
}

// ─── Step 2: Acne type chips ──────────────────────────────────────────────────

function AcneChip({ type, selected, onSelect }: {
  type: typeof ACNE_TYPES[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-left transition-all duration-150 w-full"
      style={{
        borderColor: selected ? type.color : 'var(--lp-border)',
        background: selected ? `${type.color}14` : 'var(--lp-bg-card)',
      }}
    >
      <span
        className="w-4 h-4 rounded-full shrink-0"
        style={{ background: type.color, boxShadow: selected ? `0 0 0 3px ${type.color}30` : 'none' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-cta leading-tight">{type.label}</p>
        <p className="text-xs text-cta/50 leading-tight">{type.desc}</p>
      </div>
      {selected && (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M2.5 7l3 3 6-6" stroke={type.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function Step2({ acneType, onSelect, onBack, onSubmit, isScanning }: {
  acneType: AcneType | null;
  onSelect: (t: AcneType) => void;
  onBack: () => void;
  onSubmit: () => void;
  isScanning: boolean;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-2.5 animate-fade-in-up">
      <div className="text-center mb-1">
        <p className="font-extrabold text-xl text-cta">Mụn thường trông thế nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
      </div>

      {ACNE_TYPES.map(t => (
        <AcneChip
          key={t.id}
          type={t}
          selected={acneType === t.id}
          onSelect={() => onSelect(t.id)}
        />
      ))}

      <div className="flex gap-2 mt-2">
        <button
          onClick={onBack}
          disabled={isScanning}
          className="px-4 py-3.5 rounded-soft border-2 border-[var(--lp-border)] text-cta/60 text-sm font-semibold disabled:opacity-40"
        >
          &#8592; Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={!acneType || isScanning}
          className="flex-1 font-bold py-3.5 rounded-soft text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          style={{ background: 'var(--lp-primary)' }}
        >
          {isScanning ? 'Đang phân tích...' : 'Xem kết quả'}
        </button>
      </div>
    </div>
  );
}

// ─── Scanning overlay ─────────────────────────────────────────────────────────

function ScanningState() {
  return (
    <div className="flex flex-col items-center gap-5 animate-fade-in-up">
      <p className="font-extrabold text-xl text-cta">Đang phân tích da của bạn...</p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {['Đọc vùng da', 'Phân tích loại mụn', 'Chọn liệu trình phù hợp'].map((label, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className="w-2 h-2 rounded-full bg-[var(--lp-accent)]"
              style={{ animation: `acne-pulse 0.9s ease-in-out ${i * 0.3}s infinite` }}
            />
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden bg-[var(--lp-border)]"
            >
              <div
                className="h-full rounded-full bg-[var(--lp-accent)]"
                style={{
                  width: '0%',
                  animation: `progress-fill 1.1s ${i * 0.2}s ease-out forwards`,
                }}
              />
            </div>
            <span className="text-xs text-cta/50 w-20 text-right">{label}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes acne-pulse { 0%,100%{opacity:.9}50%{opacity:.28} }
        @keyframes progress-fill { 0%{width:0%} 100%{width:100%} }
      `}</style>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FaceMapCardsMinigame({ onComplete }: MinigameSlotProps) {
  const [step, setStep]           = useState<1 | 2>(1);
  const [zones, setZones]         = useState<Zone[]>([]);
  const [acneType, setAcneType]   = useState<AcneType | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  function toggleZone(z: Zone) {
    setZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  function handleSubmit() {
    if (isScanning) return;
    const type = acneType ?? 'none';
    const conditionIds = mapToConditions(zones, type);
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']].filter(Boolean) as NonNullable<typeof skinConditions[keyof typeof skinConditions]>[];
    const condition = conditions[0];
    if (!condition) return;

    const typeInfo = ACNE_TYPES.find(t => t.id === type);
    const zoneLabel = type !== 'none' && zones.length > 0
      ? zones.map(z => ZONE_LABELS[z]).join(', ')
      : '';
    const zoneIds = type !== 'none' ? [...zones] : [];

    setIsScanning(true);
    setTimeout(() => {
      onComplete({
        conditions,
        condition,
        zoneLabel,
        zoneIds,
        triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '',
      });
    }, 1300);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      <div className="w-full flex flex-col items-center gap-3">
        {isScanning ? (
          <ScanningState />
        ) : (
          <>
            <StepDots step={step} />
            {step === 1 ? (
              <Step1 zones={zones} onToggle={toggleZone} onNext={() => setStep(2)} />
            ) : (
              <Step2
                acneType={acneType}
                onSelect={setAcneType}
                onBack={() => setStep(1)}
                onSubmit={handleSubmit}
                isScanning={false}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
