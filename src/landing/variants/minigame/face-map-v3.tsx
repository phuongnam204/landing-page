'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import {
  type Zone, type AcneType,
  ACNE_TYPES, mapToConditions,
  FaceDiagram, StepProgress, SelectedZoneTags, ScanningScreen, Step1,
} from './face-map';

// ─── Step 2: Editorial numbered panels ───────────────────────────────────────

function AcnePanel({
  type, index, selected, onSelect,
}: {
  type: typeof ACNE_TYPES[number];
  index: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className="w-full flex items-center gap-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 text-left"
      style={{
        borderColor: selected ? type.color : 'var(--lp-border)',
        background: selected
          ? `color-mix(in srgb, ${type.color} 8%, var(--lp-bg-card))`
          : 'var(--lp-bg-card)',
      }}
    >
      {/* Left accent bar + number */}
      <div
        className="flex flex-col items-center justify-center px-3 py-3 self-stretch shrink-0 transition-all duration-200"
        style={{
          background: selected ? type.color : `${type.color}22`,
          minWidth: selected ? 56 : 44,
        }}
      >
        <span
          className="font-black text-base leading-none transition-colors duration-200"
          style={{ color: selected ? '#fff' : type.color }}
        >
          {num}
        </span>
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 px-3 py-3">
        <p className="text-sm font-bold text-cta leading-tight">{type.label}</p>
        <p className="text-xs text-cta/50 leading-tight mt-0.5">{type.desc}</p>
      </div>

      {/* Selected indicator */}
      <div className="pr-3 shrink-0">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center transition-all duration-150"
          style={{
            background: selected ? type.color : 'transparent',
            border: selected ? 'none' : '2px solid var(--lp-border)',
          }}
        >
          {selected && (
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" aria-hidden="true">
              <path d="M2 5.5l2.5 2.5L9 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

function Step2Panels({
  acneType, onSelect, onBack, onSubmit, isScanning,
}: {
  acneType: AcneType | null;
  onSelect: (t: AcneType) => void;
  onBack: () => void;
  onSubmit: () => void;
  isScanning: boolean;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-2 animate-fade-in-up">
      <div className="text-center mb-2">
        <p className="font-extrabold text-xl text-cta">Mụn thường trông như thế nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
      </div>

      {ACNE_TYPES.map((t, i) => (
        <AcnePanel
          key={t.id}
          type={t}
          index={i}
          selected={acneType === t.id}
          onSelect={() => onSelect(t.id)}
        />
      ))}

      <div className="flex gap-2 mt-1">
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

export function FaceMapV3Minigame({ onComplete }: MinigameSlotProps) {
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
              <Step2Panels acneType={acneType} onSelect={setAcneType} onBack={() => setStep(1)} onSubmit={handleSubmit} isScanning={false} />
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
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-center mb-1">
            <p className="font-extrabold text-2xl text-cta">Mụn thường trông như thế nào?</p>
            <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
          </div>
          {ACNE_TYPES.map((t, i) => (
            <AcnePanel key={t.id} type={t} index={i} selected={acneType === t.id} onSelect={() => setAcneType(t.id)} />
          ))}
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
