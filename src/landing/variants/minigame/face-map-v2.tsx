'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import {
  type Zone, type AcneType,
  ACNE_TYPES, mapToConditions,
  FaceDiagram, StepProgress, SelectedZoneTags, ScanningScreen, Step1,
} from './face-map';

// ─── Step 2: Visual card grid (2×2 + 1) ──────────────────────────────────────

const CARD_ICONS: Record<AcneType, React.ReactNode> = {
  inflamed: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="22" r="13" fill="#EF4444" opacity="0.12" />
      <circle cx="22" cy="22" r="6"  fill="#EF4444" opacity="0.9" />
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
};

function AcneCard({
  type, selected, onSelect,
}: {
  type: typeof ACNE_TYPES[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className="flex flex-col items-center justify-center gap-2 py-4 px-3 rounded-2xl border-2 transition-all duration-150 text-center"
      style={{
        borderColor: selected ? type.color : 'var(--lp-border)',
        background: selected
          ? `color-mix(in srgb, ${type.color} 10%, var(--lp-bg-card))`
          : 'var(--lp-bg-card)',
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

function Step2Cards({
  acneType, onSelect, onBack, onSubmit, isScanning,
}: {
  acneType: AcneType | null;
  onSelect: (t: AcneType) => void;
  onBack: () => void;
  onSubmit: () => void;
  isScanning: boolean;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-3 animate-fade-in-up">
      <div className="text-center mb-1">
        <p className="font-extrabold text-xl text-cta">Mụn thường trông như thế nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ACNE_TYPES.slice(0, 4).map(t => (
          <AcneCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => onSelect(t.id)} />
        ))}
      </div>
      <AcneCard
        type={ACNE_TYPES[4]}
        selected={acneType === ACNE_TYPES[4].id}
        onSelect={() => onSelect(ACNE_TYPES[4].id)}
      />

      <div className="flex gap-2">
        <button
          onClick={onBack}
          disabled={isScanning}
          className="px-5 py-3.5 rounded-soft border-2 border-[var(--lp-border)] text-cta/60 text-sm font-semibold disabled:opacity-40"
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

export function FaceMapV2Minigame({ onComplete }: MinigameSlotProps) {
  const [step, setStep]           = useState<1 | 2>(1);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [acneType, setAcneType]   = useState<AcneType | null>(null);
  const [isScanning, setIsScanning] = useState(false);

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
    const zoneLabel = type !== 'none' && selectedZones.length > 0 ? selectedZones.map(z => z).join(', ') : '';
    const zoneIds = type !== 'none' ? [...selectedZones] : [];
    const typeInfo = ACNE_TYPES.find(t => t.id === type);
    setIsScanning(true);
    setTimeout(() => {
      onComplete({ conditions, condition, zoneLabel, zoneIds, triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '' });
    }, 1150);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      <div className="md:hidden w-full flex flex-col items-center gap-4">
        {isScanning ? (
          <ScanningScreen selectedZones={selectedZones} />
        ) : (
          <>
            <StepProgress step={step} />
            {step === 1 ? (
              <Step1 selectedZones={selectedZones} onToggle={toggleZone} onNext={() => setStep(2)} isScanning={false} />
            ) : (
              <Step2Cards acneType={acneType} onSelect={setAcneType} onBack={() => setStep(1)} onSubmit={handleSubmit} isScanning={false} />
            )}
          </>
        )}
      </div>

      {/* Desktop: 2 columns */}
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
          <div className="grid grid-cols-2 gap-2.5">
            {ACNE_TYPES.slice(0, 4).map(t => (
              <AcneCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => setAcneType(t.id)} />
            ))}
          </div>
          <AcneCard type={ACNE_TYPES[4]} selected={acneType === ACNE_TYPES[4].id} onSelect={() => setAcneType(ACNE_TYPES[4].id)} />
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
