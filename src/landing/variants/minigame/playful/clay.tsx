'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import {
  ACNE_TYPES, type Zone, type AcneType,
  FaceDiagram, mapToConditions,
  SelectedZoneTags, ScanningScreen,
} from '../face-map';

import { skinConditions } from '../../../../content/quiz';

const ZONE_LABELS: Record<Zone, string> = {
  forehead:      'vùng trán',
  nose:          'vùng mũi / chữ T',
  'left-cheek':  'má trái',
  'right-cheek': 'má phải',
  'chin-jaw':    'cằm & quai hàm',
};

const SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

// ─── Clay icons (48×48, bolder shapes) ───────────────────────────────────────

const CLAY_ICONS: Record<AcneType, React.ReactNode> = {
  inflamed: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="13" fill="#EF4444" opacity="0.14" />
      <circle cx="22" cy="22" r="7" fill="#EF4444" opacity="0.88" />
      <circle cx="13" cy="15" r="4" fill="#EF4444" opacity="0.55" />
      <circle cx="31" cy="29" r="3.5" fill="#EF4444" opacity="0.45" />
    </svg>
  ),
  blackhead: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="4.5" fill="#374151" opacity="0.92" />
      <circle cx="13" cy="15" r="3" fill="#374151" opacity="0.7" />
      <circle cx="31" cy="15" r="3" fill="#374151" opacity="0.7" />
      <circle cx="15" cy="30" r="2.5" fill="#374151" opacity="0.55" />
      <circle cx="29" cy="29" r="2.5" fill="#374151" opacity="0.55" />
    </svg>
  ),
  sensitive: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path d="M6 22 Q14 14 22 22 Q30 30 38 22" stroke="#F472B6" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.9" />
      <path d="M6 30 Q14 22 22 30 Q30 38 38 30" stroke="#F472B6" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M6 14 Q14 6 22 14 Q30 22 38 14" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.28" />
    </svg>
  ),
  pore: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="8" stroke="#8B5CF6" strokeWidth="2.8" opacity="0.88" />
      <circle cx="22" cy="22" r="2.8" stroke="#8B5CF6" strokeWidth="1.8" opacity="0.65" />
      <circle cx="13" cy="15" r="5" stroke="#8B5CF6" strokeWidth="2.2" opacity="0.5" />
      <circle cx="33" cy="30" r="4" stroke="#8B5CF6" strokeWidth="2" opacity="0.4" />
    </svg>
  ),
  none: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="14" fill="#10B981" opacity="0.12" />
      <path d="M13 22l6.5 6.5L31 16" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  scar: (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <circle cx="22" cy="22" r="4.5" stroke="#9C7A5F" strokeWidth="2" opacity="0.85" />
      <circle cx="13" cy="14" r="3.5" stroke="#9C7A5F" strokeWidth="1.8" opacity="0.65" />
      <circle cx="31" cy="14" r="3.5" stroke="#9C7A5F" strokeWidth="1.8" opacity="0.65" />
      <circle cx="15" cy="31" r="3" stroke="#9C7A5F" strokeWidth="1.8" opacity="0.5" />
      <circle cx="29" cy="30" r="3" stroke="#9C7A5F" strokeWidth="1.8" opacity="0.5" />
    </svg>
  ),
};

// ─── Clay sub-components ──────────────────────────────────────────────────────

function ClayCard({ type, selected, onSelect }: {
  type: typeof ACNE_TYPES[number]; selected: boolean; onSelect: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onSelect}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      aria-pressed={selected}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
        padding: '14px 10px', borderRadius: '20px', cursor: 'pointer', textAlign: 'center',
        border: `2.5px solid ${selected ? type.color : '#e8d5f5'}`,
        background: selected ? `color-mix(in srgb, ${type.color} 10%, #fff)` : '#fff',
        transform: pressed ? 'scale(0.95)' : selected ? 'scale(1.04)' : 'scale(1)',
        transition: `transform 220ms ${SPRING}, box-shadow 200ms ease, border-color 150ms ease`,
        boxShadow: selected
          ? `0 6px 24px ${type.color}2e, 0 1px 0 rgba(255,255,255,0.9) inset`
          : '0 4px 16px #c4b5fd14, 0 1px 0 rgba(255,255,255,0.9) inset',
      }}
    >
      {CLAY_ICONS[type.id]}
      <span style={{ fontSize: '11px', fontWeight: 800, color: '#3b0764', lineHeight: 1.2 }}>{type.label}</span>
      <span style={{ fontSize: '10px', fontWeight: 500, color: '#7c3aed', opacity: 0.65, lineHeight: 1.2 }}>{type.desc}</span>
    </button>
  );
}

function ClayBtn({ onClick, disabled, variant = 'primary', children }: {
  onClick: () => void; disabled?: boolean; variant?: 'primary' | 'ghost'; children: React.ReactNode;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        padding: '14px 20px', borderRadius: '99px', fontWeight: 800, fontSize: '14px',
        cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.45 : 1,
        transform: pressed && !disabled ? `scale(0.96)` : 'scale(1)',
        transition: `transform 200ms ${SPRING}`,
        ...(variant === 'primary' ? {
          background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
          color: '#fff', border: 'none',
          boxShadow: '0 6px 20px rgba(167,139,250,0.3), 0 1px 0 rgba(196,181,253,0.25) inset',
        } : {
          background: 'transparent', color: '#7c3aed', border: '2px solid #e8d5f5', boxShadow: 'none',
        }),
      }}
    >
      {children}
    </button>
  );
}

function ClayProgress({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '360px', marginBottom: '4px' }}>
      {[1, 2].map(s => (
        <div
          key={s}
          style={{
            height: '6px', flex: 1, borderRadius: '99px',
            background: s <= step ? 'linear-gradient(90deg, #a78bfa, #7c3aed)' : '#e8d5f5',
            transition: 'background 400ms ease',
            boxShadow: s <= step ? '0 2px 6px rgba(167,139,250,0.28)' : 'none',
          }}
        />
      ))}
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>{step} / 2</span>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PlayfulClayMinigame({ onComplete, copy }: MinigameSlotProps) {
  const [step, setStep]                   = useState<1 | 2>(1);
  const [acneType, setAcneType]           = useState<AcneType | null>(null);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [isScanning, setIsScanning]       = useState(false);

  const faceH = copy?.faceMap?.heading;
  const faceS = copy?.faceMap?.subtext;

  function toggleZone(z: Zone) {
    setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  function submit(type: AcneType, zones: Zone[]) {
    if (isScanning) return;
    const conditionIds = mapToConditions(zones, type);
    const resolved = conditionIds.map(id => skinConditions[id]).filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0 ? resolved : [skinConditions['da-moi-bat-dau']].filter((c): c is NonNullable<typeof c> => c != null);
    const condition = conditions[0];
    if (!condition) return;
    const typeInfo = ACNE_TYPES.find(t => t.id === type);
    setIsScanning(true);
    setTimeout(() => {
      onComplete({
        conditions, condition,
        zoneLabel: type !== 'none' && zones.length > 0 ? zones.map(z => ZONE_LABELS[z]).join(', ') : '',
        zoneIds: type !== 'none' ? [...zones] : [],
        triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '',
      });
    }, 1150);
  }

  function pickType(type: AcneType) {
    setAcneType(type);
    if (type === 'none') {
      submit('none', []);
    } else {
      setSelectedZones([]);
      setStep(2);
    }
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex items-center justify-center px-5 overflow-hidden"
      style={{ background: '#F4F1FA' }}
    >
      {isScanning ? (
        <ScanningScreen selectedZones={selectedZones} />
      ) : (
        <>
          {/* Mobile: sequential steps */}
          <div className="md:hidden w-full flex flex-col items-center gap-4">
            <ClayProgress step={step} />
            {step === 1 ? (
              <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
                <div className="text-center">
                  <p className="font-extrabold text-xl text-cta">Mụn của bạn trông như thế nào?</p>
                  <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACNE_TYPES.map(t => (
                    <ClayCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => pickType(t.id)} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in-up">
                <div className="text-center">
                  <p className="font-extrabold text-xl text-cta">{faceH || 'Mụn xuất hiện ở đâu?'}</p>
                  <p className="text-sm text-cta/50 mt-1">{faceS || 'Chạm vào vùng da bạn hay có mụn nhất'}</p>
                </div>
                <FaceDiagram selectedZones={selectedZones} onToggle={toggleZone} isScanning={false} />
                <SelectedZoneTags selectedZones={selectedZones} />
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                  <ClayBtn variant="ghost" onClick={() => { setStep(1); setAcneType(null); setSelectedZones([]); }}>
                    &#8592; Quay lại
                  </ClayBtn>
                  <div style={{ flex: 1 }}>
                    <ClayBtn onClick={() => submit(acneType!, selectedZones)}>
                      Xem kết quả &#8594;
                    </ClayBtn>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop: 2 columns always rendered */}
          <div className="hidden md:flex md:flex-col md:gap-5 w-full max-w-4xl">
            <div className="flex justify-center">
              <ClayProgress step={acneType && acneType !== 'none' ? 2 : 1} />
            </div>
            <div className="flex items-start gap-10">
              <div className="flex-1 flex flex-col gap-3">
                <div className="text-center mb-1">
                  <p className="font-extrabold text-2xl text-cta">Mụn của bạn trông như thế nào?</p>
                  <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất với da bạn</p>
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {ACNE_TYPES.map(t => (
                    <ClayCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => pickType(t.id)} />
                  ))}
                </div>
              </div>

              <div style={{ width: '1px', background: '#e8d5f5', alignSelf: 'stretch' }} />

              <div className="flex-1 flex flex-col items-center gap-4">
                {acneType && acneType !== 'none' ? (
                  <div className="w-full flex flex-col items-center gap-4 animate-fade-in-up">
                    <div className="text-center">
                      <p className="font-extrabold text-2xl text-cta">{faceH || 'Mụn xuất hiện ở đâu?'}</p>
                      <p className="text-sm text-cta/50 mt-1">{faceS || 'Chạm vào vùng da bạn hay có mụn nhất'}</p>
                    </div>
                    <FaceDiagram selectedZones={selectedZones} onToggle={toggleZone} isScanning={false} />
                    <SelectedZoneTags selectedZones={selectedZones} />
                    <ClayBtn onClick={() => submit(acneType, selectedZones)}>
                      Xem kết quả của tôi &#8594;
                    </ClayBtn>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center gap-4 opacity-30 pointer-events-none select-none">
                    <div className="text-center">
                      <p className="font-extrabold text-2xl text-cta">Mụn xuất hiện ở đâu?</p>
                      <p className="text-sm text-cta/50 mt-1">Chọn loại mụn bên trái để tiếp tục</p>
                    </div>
                    <FaceDiagram selectedZones={[]} onToggle={() => {}} isScanning={false} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
