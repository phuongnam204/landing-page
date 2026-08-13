'use client';
import React, { useCallback, useMemo, useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import {
  type Zone, type AcneType, type Severity, type ZoneMap, type ConditionOption,
  ACNE_TYPES, CONDITION_IMAGES, CARD_ICONS, ZONE_LABELS,
  assessToConditions, zoneMapToAssessments,
  FaceDiagram, StepProgress, ZoneSeverityTags, ScanningScreen,
  BubbleTwoLayerPicker,
} from './face-map';

// ─── Step 1: editorial condition panels (illustrated) ────────────────────────

function AcnePanel({
  type, selected, onSelect,
}: {
  type: typeof ACNE_TYPES[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const img = CONDITION_IMAGES[type.id];
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
      {/* Illustration — the visual anchor for what this condition looks like */}
      <div
        className="relative self-stretch shrink-0 flex items-center justify-center transition-all duration-200"
        style={{
          width: 64,
          minHeight: 64,
          background: `color-mix(in srgb, ${type.color} ${selected ? 22 : 12}%, var(--lp-bg-card))`,
        }}
      >
        {img
          ? <img src={img} alt="" aria-hidden="true" loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          : CARD_ICONS[type.id]
        }
        {selected && (
          <span aria-hidden="true"
            style={{
              position: 'absolute', inset: 0,
              boxShadow: `inset 0 0 0 3px ${type.color}`,
            }} />
        )}
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

function ConditionPanels({
  acneTypes, onToggle, onNext, isScanning,
}: {
  acneTypes: AcneType[];
  onToggle: (t: AcneType) => void;
  onNext: () => void;
  isScanning: boolean;
}) {
  const onlyNone = acneTypes.length === 1 && acneTypes[0] === 'none';
  return (
    <div className="w-full max-w-sm flex flex-col gap-2 animate-fade-in-up">
      <div className="text-center mb-2">
        <p className="font-extrabold text-xl text-cta">Da bạn đang gặp tình trạng nào?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn tất cả loại đang có — có thể chọn nhiều</p>
      </div>

      {ACNE_TYPES.map(t => (
        <AcnePanel
          key={t.id}
          type={t}
          selected={acneTypes.includes(t.id)}
          onSelect={() => onToggle(t.id)}
        />
      ))}

      <button
        onClick={onNext}
        disabled={acneTypes.length === 0 || isScanning}
        className="mt-1 w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isScanning ? 'Đang phân tích...' : onlyNone ? 'Xem kết quả của tôi' : 'Tiếp theo →'}
      </button>
    </div>
  );
}

// ─── Step 2: face map — one bubble picker per zone ───────────────────────────

function FaceMapStep({
  zoneMap, onZoneTap, onBack, onSubmit, isMulti, singleLabel,
}: {
  zoneMap: ZoneMap;
  onZoneTap: (z: Zone, cx: number, cy: number) => void;
  onBack: () => void;
  onSubmit: () => void;
  isMulti: boolean;
  singleLabel: string;
}) {
  const zoneSeverity = useMemo(
    () => Object.fromEntries(
      (Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]).map(([z, d]) => [z, d.severity]),
    ) as Partial<Record<Zone, Severity>>,
    [zoneMap],
  );

  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-3 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta leading-snug">
          {isMulti ? 'Da bạn có nhiều tuýp — hãy làm rõ từng vùng' : `${singleLabel} xuất hiện ở đâu?`}
        </p>
        <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da để chọn tình trạng và mức độ</p>
      </div>

      <FaceDiagram zoneSeverity={zoneSeverity} onZoneTap={onZoneTap} isScanning={false} />
      <ZoneSeverityTags zoneMap={zoneMap} emptyHint="Chạm vào vùng da để chọn mức độ" />

      <div className="flex gap-2 w-full">
        <button
          onClick={onBack}
          className="px-5 py-3.5 rounded-soft border-2 border-[var(--lp-border)] text-cta/60 text-sm font-semibold"
        >
          &#8592; Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={Object.keys(zoneMap).length === 0}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          Xem kết quả của tôi
        </button>
      </div>
    </div>
  );
}

export function FaceMapV3Minigame({ onComplete }: MinigameSlotProps) {
  // Step 1 picks the conditions, step 2 maps each of them onto the face
  const [step, setStep]             = useState<1 | 2>(1);
  const [acneTypes, setAcneTypes]   = useState<AcneType[]>([]);
  const [zoneMap, setZoneMap]       = useState<ZoneMap>({});
  const [isScanning, setIsScanning] = useState(false);
  const [activeBubble, setActiveBubble] = useState<{
    zone: Zone; cx: number; cy: number; conditions: ConditionOption[];
  } | null>(null);

  const pickedTypes = useMemo(() => acneTypes.filter(t => t !== 'none'), [acneTypes]);

  const bubbleConditions = useMemo<ConditionOption[]>(
    () => pickedTypes
      .map(t => ACNE_TYPES.find(a => a.id === t))
      .filter((def): def is typeof ACNE_TYPES[number] => def != null)
      .map(def => ({ id: def.id, label: def.label, image: CONDITION_IMAGES[def.id], color: def.color })),
    [pickedTypes],
  );

  const toggleAcneType = useCallback((t: AcneType) => {
    if (t === 'none') { setAcneTypes(['none']); return; }
    setAcneTypes(prev => {
      const without = prev.filter(x => x !== 'none');
      return without.includes(t) ? without.filter(x => x !== t) : [...without, t];
    });
  }, []);

  const submit = useCallback((finalZoneMap: ZoneMap, types: AcneType[]) => {
    if (isScanning) return;
    const zoneAssessments = zoneMapToAssessments(finalZoneMap);
    const assessments = zoneAssessments.length > 0
      ? zoneAssessments
      : (types.length > 0 ? types : ['none' as AcneType])
          .map(acneType => ({ acneType, zones: {} as Partial<Record<Zone, Severity>> }));

    const resolved = assessToConditions(assessments)
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0
      ? resolved
      : [skinConditions['da-moi-bat-dau']].filter((c): c is NonNullable<typeof c> => c != null);
    const condition = conditions[0];
    if (!condition) return;

    const activeZones = [...new Set(
      assessments.flatMap(a => (Object.entries(a.zones) as [Zone, Severity][])
        .filter(([, s]) => s !== 'khong')
        .map(([z]) => z)),
    )];
    const triggerNote = types
      .filter(t => t !== 'none')
      .map(t => ACNE_TYPES.find(a => a.id === t)?.label)
      .filter(Boolean).join(', ');

    setIsScanning(true);
    setTimeout(() => {
      onComplete({
        conditions,
        condition,
        zoneLabel: activeZones.map(z => ZONE_LABELS[z]).join(', '),
        zoneIds: activeZones,
        triggerNote,
      });
    }, 1150);
  }, [isScanning, onComplete]);

  // "Da ổn" ends the game right away — there is no zone to map
  const handleConditionsNext = useCallback(() => {
    if (acneTypes.length === 0) return;
    if (acneTypes.includes('none')) { submit({}, acneTypes); return; }
    setZoneMap({});
    setStep(2);
  }, [acneTypes, submit]);

  const handleZoneTap = useCallback((zone: Zone, cx: number, cy: number) => {
    if (bubbleConditions.length === 0) return;
    setActiveBubble({ zone, cx, cy, conditions: bubbleConditions });
  }, [bubbleConditions]);

  const handleBubbleComplete = useCallback((conditionIds: string[], severity: Severity) => {
    if (!activeBubble) return;
    setZoneMap(prev => ({ ...prev, [activeBubble.zone]: { conditions: conditionIds, severity } }));
    setActiveBubble(null);
  }, [activeBubble]);

  const zoneSeverity = useMemo(
    () => Object.fromEntries(
      (Object.entries(zoneMap) as [Zone, NonNullable<ZoneMap[Zone]>][]).map(([z, d]) => [z, d.severity]),
    ) as Partial<Record<Zone, Severity>>,
    [zoneMap],
  );

  const singleLabel = bubbleConditions[0]?.label ?? 'Tình trạng này';
  const isMulti     = bubbleConditions.length > 1;

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      {/* Mobile — conditions first, then the face map */}
      <div className="md:hidden w-full flex flex-col items-center gap-4">
        {isScanning ? (
          <ScanningScreen zoneSeverity={zoneSeverity} />
        ) : (
          <>
            <StepProgress current={step} total={2} />
            {step === 1 ? (
              <ConditionPanels
                acneTypes={acneTypes}
                onToggle={toggleAcneType}
                onNext={handleConditionsNext}
                isScanning={false}
              />
            ) : (
              <FaceMapStep
                zoneMap={zoneMap}
                onZoneTap={handleZoneTap}
                onBack={() => { setActiveBubble(null); setStep(1); }}
                onSubmit={() => submit(zoneMap, acneTypes)}
                isMulti={isMulti}
                singleLabel={singleLabel}
              />
            )}
          </>
        )}
      </div>

      {/* Desktop — same order left to right: conditions, then face map */}
      <div className="hidden md:flex md:items-start md:gap-10 w-full max-w-4xl">
        <div className="flex-1 flex flex-col gap-2">
          <div className="text-center mb-1">
            <p className="font-extrabold text-2xl text-cta">Da bạn đang gặp tình trạng nào?</p>
            <p className="text-sm text-cta/50 mt-1">Chọn tất cả loại đang có — có thể chọn nhiều</p>
          </div>
          {ACNE_TYPES.map(t => (
            <AcnePanel key={t.id} type={t} selected={acneTypes.includes(t.id)} onSelect={() => toggleAcneType(t.id)} />
          ))}
          {acneTypes.includes('none') && (
            <button
              onClick={() => submit({}, acneTypes)}
              disabled={isScanning}
              className="mt-1 w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {isScanning ? 'Đang phân tích...' : 'Xem kết quả của tôi'}
            </button>
          )}
        </div>

        <div className="w-px bg-cta/10 self-stretch" />

        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-extrabold text-2xl text-cta leading-snug">
              {bubbleConditions.length === 0
                ? 'Rồi chỉ ra vị trí trên khuôn mặt'
                : isMulti
                  ? 'Da bạn có nhiều tuýp — hãy làm rõ từng vùng'
                  : `${singleLabel} xuất hiện ở đâu?`}
            </p>
            <p className="text-sm text-cta/50 mt-1">
              {bubbleConditions.length === 0
                ? 'Chọn tình trạng bên trái trước, rồi chạm vào vùng da'
                : 'Chạm vào vùng da để chọn tình trạng và mức độ'}
            </p>
          </div>

          <div style={{ opacity: bubbleConditions.length === 0 ? 0.45 : 1, transition: 'opacity 0.2s ease' }}>
            <FaceDiagram zoneSeverity={zoneSeverity} onZoneTap={handleZoneTap} isScanning={isScanning} />
          </div>
          <ZoneSeverityTags zoneMap={zoneMap} emptyHint="Chạm vào vùng da để chọn mức độ" />

          {!acneTypes.includes('none') && (
            <button
              onClick={() => submit(zoneMap, acneTypes)}
              disabled={Object.keys(zoneMap).length === 0 || isScanning}
              className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isScanning ? 'Đang phân tích...' : 'Xem kết quả của tôi'}
            </button>
          )}
        </div>
      </div>

      {activeBubble && (
        <BubbleTwoLayerPicker
          cx={activeBubble.cx}
          cy={activeBubble.cy}
          conditions={activeBubble.conditions}
          onComplete={handleBubbleComplete}
          onClose={() => setActiveBubble(null)}
        />
      )}
    </div>
  );
}
