'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../slots';
import { skinConditions } from '../../../content/quiz';
import type { ConditionId } from '../../../content/quiz';

type Zone = 'forehead' | 'left-cheek' | 'right-cheek' | 'nose' | 'chin-jaw';
type AcneType = 'inflamed' | 'blackhead' | 'sensitive' | 'pore' | 'none';

const ZONES: { id: Zone; label: string; style: React.CSSProperties }[] = [
  { id: 'forehead',    label: 'Trán',           style: { top: '5%',  left: '22%', width: '56%', height: '17%' } },
  { id: 'nose',        label: 'Mũi / Chữ T',   style: { top: '32%', left: '33%', width: '34%', height: '22%' } },
  { id: 'left-cheek',  label: 'Má trái',        style: { top: '40%', left: '4%',  width: '27%', height: '22%' } },
  { id: 'right-cheek', label: 'Má phải',        style: { top: '40%', right: '4%', width: '27%', height: '22%' } },
  { id: 'chin-jaw',    label: 'Cằm & quai hàm', style: { top: '65%', left: '12%', width: '76%', height: '22%' } },
];

const ZONE_LABELS: Record<Zone, string> = {
  forehead:     'vùng trán',
  nose:         'vùng mũi / chữ T',
  'left-cheek': 'má trái',
  'right-cheek':'má phải',
  'chin-jaw':   'cằm & quai hàm',
};

const ACNE_TYPES: { id: AcneType; label: string; desc: string; color: string }[] = [
  { id: 'inflamed',   label: 'Mụn viêm đỏ',        desc: 'Đau, có mủ, đỏ',                   color: '#EF4444' },
  { id: 'blackhead',  label: 'Đầu đen / đầu trắng', desc: 'Nốt nhỏ, không viêm',             color: '#374151' },
  { id: 'sensitive',  label: 'Mẩn đỏ kích ứng',     desc: 'Nổi khi đổi thời tiết, mỹ phẩm', color: '#F472B6' },
  { id: 'pore',       label: 'Lỗ chân lông to',     desc: 'Ít mụn nhưng lỗ chân lông rõ',    color: '#8B5CF6' },
  { id: 'none',       label: 'Da ổn, ít mụn',        desc: 'Không có vấn đề rõ rệt',          color: '#10B981' },
];

function mapToConditions(zones: Zone[], acneType: AcneType): ConditionId[] {
  if (acneType === 'none' && zones.length === 0) return ['clean-skin'];

  const result = new Set<ConditionId>();

  if (zones.includes('chin-jaw')) result.add('mun-noi-tiet');
  if (acneType === 'sensitive') result.add('da-nhay-cam');
  if (acneType === 'pore') result.add('lo-chan-long');
  if (zones.includes('nose') && acneType === 'blackhead') result.add('lo-chan-long');
  if (zones.length > 0 && (acneType === 'inflamed' || acneType === 'blackhead')) {
    result.add('da-nhon-mun-viem');
  }

  return result.size > 0 ? [...result] : ['da-moi-bat-dau'];
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

function FaceDiagram({ selectedZones, onToggle }: {
  selectedZones: Zone[]; onToggle: (z: Zone) => void;
}) {
  return (
    <div className="relative w-44 h-60 select-none">
      <svg viewBox="0 0 176 240" className="absolute inset-0 w-full h-full" fill="none">
        <ellipse cx="88" cy="120" rx="72" ry="96" stroke="currentColor" strokeWidth="2" className="text-cta/20" />
        <ellipse cx="16" cy="120" rx="7" ry="13" stroke="currentColor" strokeWidth="1.5" className="text-cta/15" />
        <ellipse cx="160" cy="120" rx="7" ry="13" stroke="currentColor" strokeWidth="1.5" className="text-cta/15" />
        <path d="M62 84 Q76 78 90 84" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/20" />
        <path d="M86 84 Q100 78 114 84" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/20" />
        <ellipse cx="76" cy="96" rx="11" ry="7" stroke="currentColor" strokeWidth="1.5" className="text-cta/25" />
        <ellipse cx="100" cy="96" rx="11" ry="7" stroke="currentColor" strokeWidth="1.5" className="text-cta/25" />
        <path d="M82 116 Q88 126 94 116" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/20" />
        <path d="M72 148 Q88 160 104 148" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-cta/20" />
      </svg>
      {ZONES.map(z => {
        const active = selectedZones.includes(z.id);
        return (
          <button
            key={z.id}
            onClick={() => onToggle(z.id)}
            style={{ position: 'absolute', ...z.style }}
            className={[
              'rounded-xl border-2 transition-all duration-150 flex items-center justify-center',
              active
                ? 'bg-cta/20 border-cta/60 scale-105 shadow-sm'
                : 'bg-transparent border-transparent hover:bg-cta/10 hover:border-cta/25',
            ].join(' ')}
          >
            {active && (
              <span className="text-[9px] font-bold text-cta leading-tight text-center px-0.5 pointer-events-none">
                {z.label}
              </span>
            )}
          </button>
        );
      })}
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
          ? 'border-cta/60 bg-cta/10'
          : 'border-cta/15 bg-[var(--lp-bg-card)] hover:border-cta/35',
      ].join(' ')}
    >
      <span className="w-5 h-5 rounded-full shrink-0 border-2 border-white/50 shadow-sm" style={{ background: type.color }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-cta">{type.label}</p>
        <p className="text-xs text-cta/50">{type.desc}</p>
      </div>
      {isSelected && <span className="text-cta font-bold shrink-0">✓</span>}
    </button>
  );
}

// ─── Steps ────────────────────────────────────────────────────────────────────

function Step1({ selectedZones, onToggle, onNext }: {
  selectedZones: Zone[]; onToggle: (z: Zone) => void; onNext: () => void;
}) {
  return (
    <div className="w-full max-w-sm flex flex-col items-center gap-4 animate-fade-in-up">
      <div className="text-center">
        <p className="font-extrabold text-xl text-cta">Bạn hay bị mụn ở đâu?</p>
        <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da bạn hay có mụn nhất</p>
      </div>
      <FaceDiagram selectedZones={selectedZones} onToggle={onToggle} />
      <SelectedZoneTags selectedZones={selectedZones} />
      <button onClick={onNext} className="w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm">
        Tiếp theo →
      </button>
    </div>
  );
}

function Step2({ acneType, onSelect, onBack, onSubmit }: {
  acneType: AcneType | null; onSelect: (t: AcneType) => void; onBack: () => void; onSubmit: () => void;
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
        <button onClick={onBack} className="px-5 py-3.5 rounded-soft border-2 border-cta/20 text-cta/60 text-sm font-semibold">
          ← Quay lại
        </button>
        <button
          onClick={onSubmit}
          disabled={!acneType}
          className="flex-1 bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Xem kết quả của tôi →
        </button>
      </div>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function FaceMapMinigame({ onComplete }: MinigameSlotProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [acneType, setAcneType] = useState<AcneType | null>(null);

  function toggleZone(z: Zone) {
    setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  }

  function handleSubmit() {
    const type = acneType ?? 'none';
    const conditionIds = mapToConditions(selectedZones, type);
    const conditions = conditionIds.map(id => skinConditions[id]).filter((c): c is NonNullable<typeof c> => c != null);
    const condition = conditions[0];
    const zoneLabel = selectedZones.length > 0
      ? selectedZones.map(z => ZONE_LABELS[z]).join(', ')
      : 'không có vùng cụ thể';
    const typeInfo = ACNE_TYPES.find(t => t.id === type);
    onComplete({
      conditions,
      condition,
      zoneLabel,
      triggerNote: type !== 'none' ? `Loại mụn chủ yếu: ${typeInfo?.label ?? ''}` : '',
    });
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-minigame)] flex items-center justify-center px-5 overflow-hidden">
      {/* Mobile: sequential 2 bước */}
      <div className="md:hidden w-full flex flex-col items-center gap-4">
        <StepProgress step={step} />
        {step === 1
          ? <Step1 selectedZones={selectedZones} onToggle={toggleZone} onNext={() => setStep(2)} />
          : <Step2 acneType={acneType} onSelect={setAcneType} onBack={() => setStep(1)} onSubmit={handleSubmit} />
        }
      </div>

      {/* Desktop: 2 cột song song */}
      <div className="hidden md:flex md:items-start md:gap-10 w-full max-w-4xl">
        <div className="flex-1 flex flex-col items-center gap-4">
          <div className="text-center">
            <p className="font-extrabold text-2xl text-cta">Bạn hay bị mụn ở đâu?</p>
            <p className="text-sm text-cta/50 mt-1">Chạm vào vùng da bạn hay có mụn nhất</p>
          </div>
          <FaceDiagram selectedZones={selectedZones} onToggle={toggleZone} />
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
            disabled={!acneType}
            className="mt-1 w-full bg-cta text-white font-bold py-3.5 rounded-soft text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Xem kết quả của tôi →
          </button>
        </div>
      </div>
    </div>
  );
}
