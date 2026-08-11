'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';
type AcneType = 'inflamed' | 'blackhead' | 'sensitive' | 'pore' | 'none' | 'scar';

const ZONE_LABELS: Record<Zone, string> = {
  forehead:      'Trán',
  nose:          'Mũi / Chữ T',
  'left-cheek':  'Má trái',
  'right-cheek': 'Má phải',
  'chin-jaw':    'Cằm & quai hàm',
};

// Face topology layout — positions for zone pills arranged like a face
const ZONE_ROWS: Zone[][] = [
  ['forehead'],
  ['nose'],
  ['left-cheek', 'right-cheek'],
  ['chin-jaw'],
];

const ACNE_CARDS: {
  id: AcneType;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
  accent: string;
}[] = [
  {
    id: 'inflamed',
    label: 'Mụn viêm',
    subtitle: 'Đỏ, đau, có mủ',
    accent: '#EF4444',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="22" fill="#EF4444" opacity="0.07" />
        <circle cx="26" cy="28" r="12" fill="#EF4444" opacity="0.16" />
        <circle cx="26" cy="26" r="9"  fill="#EF4444" opacity="0.88" />
        <circle cx="26" cy="22" r="3.2" fill="white" opacity="0.90" />
        <circle cx="13" cy="17" r="4.2" fill="#EF4444" opacity="0.48" />
        <circle cx="38" cy="34" r="3.3" fill="#EF4444" opacity="0.38" />
        <path d="M26 4 L26 8"   stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
        <path d="M38 8 L36 11"  stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.38" />
        <path d="M14 8 L16 11"  stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.38" />
        <path d="M44 20 L41 21.5" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.30" />
        <path d="M8 20 L11 21.5"  stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round" opacity="0.30" />
      </svg>
    ),
  },
  {
    id: 'blackhead',
    label: 'Đầu đen / trắng',
    subtitle: 'Nốt nhỏ, không đau',
    accent: '#374151',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#374151" opacity="0.06" />
        <circle cx="26" cy="26" r="6"   fill="#374151" opacity="0.88" />
        <circle cx="24.5" cy="24.5" r="1.8" fill="white" opacity="0.55" />
        <circle cx="14" cy="16" r="3.8" fill="#374151" opacity="0.72" />
        <circle cx="13.5" cy="15.5" r="1.2" fill="white" opacity="0.40" />
        <circle cx="38" cy="16" r="3"   fill="#374151" opacity="0.62" />
        <circle cx="16" cy="36" r="3.3" fill="#374151" opacity="0.65" />
        <circle cx="36" cy="36" r="2.5" fill="#374151" opacity="0.55" />
        <circle cx="40" cy="26" r="2"   fill="#374151" opacity="0.42" />
        <circle cx="12" cy="27" r="1.6" fill="#374151" opacity="0.35" />
        <circle cx="30" cy="12" r="1.5" fill="#374151" opacity="0.40" />
      </svg>
    ),
  },
  {
    id: 'sensitive',
    label: 'Mẩn đỏ',
    subtitle: 'Kích ứng, đổi thời tiết',
    accent: '#F472B6',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <ellipse cx="26" cy="26" rx="21" ry="17" fill="#F472B6" opacity="0.08" />
        <path d="M6 19 Q12 12 18 19 Q24 26 30 19 Q36 12 46 19"
          stroke="#F472B6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.88" />
        <path d="M6 26 Q12 19 18 26 Q24 33 30 26 Q36 19 46 26"
          stroke="#F472B6" strokeWidth="2.3" strokeLinecap="round" fill="none" opacity="0.58" />
        <path d="M6 33 Q12 26 18 33 Q24 40 30 33 Q36 26 46 33"
          stroke="#F472B6" strokeWidth="1.6" strokeLinecap="round" fill="none" opacity="0.32" />
        <circle cx="18" cy="19" r="3"   fill="#F472B6" opacity="0.55" />
        <circle cx="32" cy="26" r="2.3" fill="#F472B6" opacity="0.42" />
        <circle cx="12" cy="34" r="1.6" fill="#F472B6" opacity="0.30" />
      </svg>
    ),
  },
  {
    id: 'pore',
    label: 'Lỗ chân lông to',
    subtitle: 'Ít mụn, lỗ chân lông rõ',
    accent: '#8B5CF6',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#8B5CF6" opacity="0.07" />
        <circle cx="26" cy="26" r="14"  stroke="#8B5CF6" strokeWidth="1.4" opacity="0.30" fill="none" />
        <circle cx="26" cy="26" r="9.5" stroke="#8B5CF6" strokeWidth="2"   opacity="0.58" fill="none" />
        <circle cx="26" cy="26" r="5"   stroke="#8B5CF6" strokeWidth="2.8" opacity="0.85" fill="none" />
        <circle cx="26" cy="26" r="1.8" fill="#8B5CF6" opacity="0.95" />
        <circle cx="13" cy="14" r="5.5" stroke="#8B5CF6" strokeWidth="1.4" opacity="0.38" fill="none" />
        <circle cx="13" cy="14" r="2.5" stroke="#8B5CF6" strokeWidth="1.8" opacity="0.58" fill="none" />
        <circle cx="13" cy="14" r="0.8" fill="#8B5CF6" opacity="0.75" />
        <circle cx="39" cy="37" r="4.5" stroke="#8B5CF6" strokeWidth="1.4" opacity="0.32" fill="none" />
        <circle cx="39" cy="37" r="1.8" stroke="#8B5CF6" strokeWidth="1.8" opacity="0.50" fill="none" />
      </svg>
    ),
  },
  {
    id: 'none',
    label: 'Da ổn',
    subtitle: 'Không có vấn đề rõ',
    accent: '#10B981',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="21" fill="#10B981" opacity="0.10" />
        <circle cx="26" cy="26" r="15" fill="#10B981" opacity="0.18" />
        <path d="M15 26 L22 33 L37 17" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.92" />
        <circle cx="9"  cy="11" r="1.8" fill="#10B981" opacity="0.52" />
        <circle cx="42" cy="14" r="1.4" fill="#10B981" opacity="0.42" />
        <circle cx="40" cy="40" r="1.8" fill="#10B981" opacity="0.38" />
        <circle cx="11" cy="40" r="1.3" fill="#10B981" opacity="0.32" />
        <path d="M42 9 L44 7 M44 9 L42 7" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        <path d="M10 43 L12 41 M12 43 L10 41" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: 'scar',
    label: 'Sẹo rỗ',
    subtitle: 'Lỗ nhỏ lõm sau mụn',
    accent: '#9C7A5F',
    icon: (
      <svg width="44" height="44" viewBox="0 0 52 52" fill="none" aria-hidden="true">
        <circle cx="26" cy="26" r="20" fill="#9C7A5F" opacity="0.07" />
        <ellipse cx="26" cy="27"   rx="7.5"  ry="6"    stroke="#9C7A5F" strokeWidth="2"   opacity="0.85" fill="none" />
        <ellipse cx="26" cy="28"   rx="11.5" ry="9"    stroke="#9C7A5F" strokeWidth="1.2" opacity="0.48" fill="none" />
        <ellipse cx="26" cy="29"   rx="15"   ry="11.5" stroke="#9C7A5F" strokeWidth="0.8" opacity="0.25" fill="none" />
        <circle  cx="26" cy="26"   r="2"     fill="#9C7A5F" opacity="0.65" />
        <ellipse cx="13" cy="15"   rx="4.5"  ry="3.8"  stroke="#9C7A5F" strokeWidth="1.8" opacity="0.72" fill="none" />
        <ellipse cx="13" cy="15.8" rx="7"    ry="5.5"  stroke="#9C7A5F" strokeWidth="1"   opacity="0.36" fill="none" />
        <circle  cx="13" cy="15"   r="1.3"   fill="#9C7A5F" opacity="0.55" />
        <ellipse cx="38" cy="36"   rx="3.8"  ry="3.2"  stroke="#9C7A5F" strokeWidth="1.6" opacity="0.65" fill="none" />
        <ellipse cx="38" cy="36.5" rx="6"    ry="4.8"  stroke="#9C7A5F" strokeWidth="0.9" opacity="0.32" fill="none" />
        <circle  cx="38" cy="36"   r="1"     fill="#9C7A5F" opacity="0.50" />
      </svg>
    ),
  },
];

function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none') return ['clean-skin'];
  if (zones.length === 0) return ['clean-skin'];
  const result = new Set<ConditionId>();
  if (zones.includes('chin-jaw')) result.add('mun-noi-tiet');
  if (acneType === 'sensitive') result.add('da-nhay-cam');
  if (acneType === 'pore') result.add('lo-chan-long');
  if (acneType === 'blackhead') result.add('lo-chan-long');
  if (zones.length > 0 && (acneType === 'inflamed' || acneType === 'blackhead')) result.add('da-nhon-mun-viem');
  if (acneType === 'scar') result.add('da-seo-ro');
  return result.size > 0 ? [...result] : ['da-moi-bat-dau'];
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total = 2 }: { step: number; total?: number }) {
  return (
    <div className="w-full max-w-xs">
      <div className="flex gap-1.5 mb-1">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-all duration-400"
            style={{ background: i < step ? 'var(--lp-accent)' : 'var(--lp-border)' }}
          />
        ))}
      </div>
      <p className="text-xs text-cta/35 text-center">Bước {step}/{total}</p>
    </div>
  );
}

// ─── Step 1: Large acne-type cards (2×2 + 1) ─────────────────────────────────

function AcneCard({
  card, selected, onSelect,
}: {
  card: typeof ACNE_CARDS[number];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl border-2 transition-all duration-150 text-center"
      style={{
        borderColor: selected ? card.accent : 'var(--lp-border)',
        background: selected
          ? `color-mix(in srgb, ${card.accent} 10%, var(--lp-bg-card))`
          : 'var(--lp-bg-card)',
        transform: selected ? 'scale(1.04)' : 'scale(1)',
        boxShadow: selected ? `0 4px 16px ${card.accent}28` : 'none',
      }}
    >
      <div>{card.icon}</div>
      <p className="text-xs font-bold text-cta leading-tight">{card.label}</p>
      <p className="text-[10px] text-cta/50 leading-tight">{card.subtitle}</p>
    </button>
  );
}

function Step1({ acneType, onSelect, onNext }: {
  acneType: AcneType | null;
  onSelect: (t: AcneType) => void;
  onNext: () => void;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Da bạn đang gặp phải điều gì?</p>
        <p className="text-sm text-cta/50 mt-1">Chọn loại gần nhất</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {ACNE_CARDS.slice(0, 4).map(card => (
          <AcneCard key={card.id} card={card} selected={acneType === card.id} onSelect={() => onSelect(card.id)} />
        ))}
      </div>

      {/* last card (none) full width */}
      <AcneCard
        card={ACNE_CARDS[4]}
        selected={acneType === 'none'}
        onSelect={() => onSelect('none')}
      />

      <button
        onClick={onNext}
        disabled={!acneType}
        className="w-full font-bold py-3.5 rounded-soft text-sm text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        style={{ background: 'var(--lp-primary)' }}
      >
        Tiếp theo &#8594;
      </button>
    </div>
  );
}

// ─── Step 2: Face topology zone picker ───────────────────────────────────────

function ZonePill({ zone, selected, onToggle }: { zone: Zone; selected: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      className="px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all duration-150 text-cta"
      style={{
        borderColor: selected ? 'var(--lp-accent)' : 'var(--lp-border)',
        background: selected
          ? 'color-mix(in srgb, var(--lp-accent) 14%, var(--lp-bg-card))'
          : 'var(--lp-bg-card)',
        color: selected ? 'var(--lp-accent)' : undefined,
        transform: selected ? 'scale(1.06)' : 'scale(1)',
      }}
    >
      {ZONE_LABELS[zone]}
    </button>
  );
}

function Step2({ zones, acneType, onToggle, onBack, onSubmit, isScanning }: {
  zones: Zone[];
  acneType: AcneType;
  onToggle: (z: Zone) => void;
  onBack: () => void;
  onSubmit: () => void;
  isScanning: boolean;
}) {
  const selectedCard = ACNE_CARDS.find(c => c.id === acneType);

  if (acneType === 'none') {
    return (
      <div className="w-full max-w-sm flex flex-col gap-5 animate-fade-in-up items-center text-center">
        <div className="p-5 rounded-2xl border-2" style={{ borderColor: '#10B981', background: '#10B98112' }}>
          {selectedCard?.icon}
          <p className="font-bold text-cta mt-2">Da ổn, ít mụn</p>
          <p className="text-sm text-cta/55 mt-1">Không có vùng đặc biệt cần chọn.</p>
        </div>
        <p className="text-sm text-cta/60 max-w-xs">
          Phân tích sẽ tập trung vào duy trì sức khỏe da và phòng ngừa.
        </p>
        <div className="flex gap-2 w-full">
          <button onClick={onBack} className="px-4 py-3.5 rounded-soft border-2 border-[var(--lp-border)] text-cta/60 text-sm font-semibold">
            &#8592; Quay lại
          </button>
          <button
            onClick={onSubmit}
            disabled={isScanning}
            className="flex-1 font-bold py-3.5 rounded-soft text-sm text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
            style={{ background: 'var(--lp-primary)' }}
          >
            {isScanning ? 'Đang phân tích...' : 'Xem kết quả'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm flex flex-col gap-4 animate-fade-in-up">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-2"
          style={{ background: `${selectedCard?.accent}18`, color: selectedCard?.accent }}>
          {selectedCard?.icon}
          <span>{selectedCard?.label}</span>
        </div>
        <p className="font-extrabold text-xl text-cta">Mụn xuất hiện ở đâu?</p>
        <p className="text-sm text-cta/50 mt-1">Có thể chọn nhiều vùng</p>
      </div>

      {/* Face topology: zones arranged in rows matching face anatomy */}
      <div className="flex flex-col items-center gap-2.5 py-2">
        {ZONE_ROWS.map((row, ri) => (
          <div key={ri} className="flex gap-2.5 justify-center">
            {row.map(z => (
              <ZonePill key={z} zone={z} selected={zones.includes(z)} onToggle={() => onToggle(z)} />
            ))}
          </div>
        ))}
      </div>

      {zones.length > 0 && (
        <p className="text-xs text-cta/45 text-center">
          Đã chọn: {zones.map(z => ZONE_LABELS[z]).join(', ')}
        </p>
      )}

      <div className="flex gap-2">
        <button onClick={onBack} disabled={isScanning}
          className="px-4 py-3.5 rounded-soft border-2 border-[var(--lp-border)] text-cta/60 text-sm font-semibold disabled:opacity-40">
          &#8592; Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={zones.length === 0 || isScanning}
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
    <div className="flex flex-col items-center gap-6 animate-fade-in-up text-center max-w-xs">
      {/* Pulsing circles */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="absolute rounded-full border-2 border-[var(--lp-accent)]"
            style={{
              inset: 0,
              opacity: 0,
              animation: `wizard-ripple 1.6s ${i * 0.48}s ease-out infinite`,
            }}
          />
        ))}
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'color-mix(in srgb, var(--lp-accent) 18%, transparent)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="var(--lp-accent)" strokeWidth="2" />
            <path d="M8 12l2.5 2.5L16 9" stroke="var(--lp-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div>
        <p className="font-extrabold text-xl text-cta">Đang phân tích da của bạn...</p>
        <p className="text-sm text-cta/50 mt-2">Chờ một chút, đang chọn liệu trình phù hợp.</p>
      </div>
      <style>{`
        @keyframes wizard-ripple {
          0%   { transform: scale(0.4); opacity: 0; }
          30%  { opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function FaceMapWizardMinigame({ onComplete }: MinigameSlotProps) {
  const [step, setStep]             = useState<1 | 2>(1);
  const [acneType, setAcneType]     = useState<AcneType | null>(null);
  const [zones, setZones]           = useState<Zone[]>([]);
  const [isScanning, setIsScanning] = useState(false);

  function toggleZone(z: Zone) {
    setZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  function handleSubmitWithType(type: AcneType, zoneList: Zone[]) {
    if (isScanning) return;
    const conditionIds = mapToConditions(zoneList, type);
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0
      ? resolved
      : ([skinConditions['da-moi-bat-dau']].filter(Boolean) as NonNullable<typeof skinConditions[keyof typeof skinConditions]>[]);
    const condition = conditions[0];
    if (!condition) return;
    const cardInfo = ACNE_CARDS.find(c => c.id === type);
    const zoneLabel = type !== 'none' && zoneList.length > 0
      ? zoneList.map(z => ZONE_LABELS[z]).join(', ')
      : '';
    const zoneIds = type !== 'none' ? [...zoneList] : [];
    setIsScanning(true);
    setTimeout(() => {
      onComplete({ conditions, condition, zoneLabel, zoneIds, triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${cardInfo?.label ?? ''}` : '' });
    }, 1500);
  }

  function goToStep2OrSubmit(type: AcneType) {
    setAcneType(type);
    if (type === 'none') {
      handleSubmitWithType('none', []);
    } else {
      setZones([]);
      setStep(2);
    }
  }

  function handleSubmit() {
    if (isScanning) return;
    const type = acneType ?? 'none';
    const conditionIds = mapToConditions(zones, type);
    const resolved = conditionIds
      .map(id => skinConditions[id])
      .filter((c): c is NonNullable<typeof c> => c != null);
    const conditions = resolved.length > 0
      ? resolved
      : ([skinConditions['da-moi-bat-dau']].filter(Boolean) as NonNullable<typeof skinConditions[keyof typeof skinConditions]>[]);
    const condition = conditions[0];
    if (!condition) return;

    handleSubmitWithType(type, zones);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      <div className="w-full flex flex-col items-center gap-4">
        {isScanning ? (
          <ScanningState />
        ) : (
          <>
            <ProgressBar step={step} total={2} />
            {step === 1 ? (
              <Step1 acneType={acneType} onSelect={setAcneType} onNext={() => goToStep2OrSubmit(acneType ?? 'none')} />
            ) : (
              <Step2
                zones={zones}
                acneType={acneType ?? 'none'}
                onToggle={toggleZone}
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
