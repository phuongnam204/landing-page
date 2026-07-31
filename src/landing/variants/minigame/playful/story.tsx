'use client';
import React, { useState } from 'react';
import type { MinigameSlotProps } from '../../../slots';
import { ACNE_TYPES, type Zone, type AcneType, mapToConditions } from '../face-map';

const ZONE_LABELS: Record<Zone, string> = {
  forehead:      'vùng trán',
  nose:          'vùng mũi / chữ T',
  'left-cheek':  'má trái',
  'right-cheek': 'má phải',
  'chin-jaw':    'cằm & quai hàm',
};
import { skinConditions } from '../../../../content/quiz';

// ─── Zone display config (no SVG face needed) ─────────────────────────────────

const STORY_ZONES: { id: Zone; icon: React.ReactNode; label: string }[] = [
  {
    id: 'forehead', label: 'Trán',
    icon: (
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden>
        <ellipse cx="14" cy="19" rx="10" ry="12" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
        <ellipse cx="14" cy="9" rx="7" ry="3.5" fill="#a78bfa" opacity="0.75" />
      </svg>
    ),
  },
  {
    id: 'nose', label: 'Mũi / Vùng T',
    icon: (
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden>
        <ellipse cx="14" cy="19" rx="10" ry="12" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
        <ellipse cx="14" cy="19" rx="3.5" ry="5.5" fill="#a78bfa" opacity="0.75" />
      </svg>
    ),
  },
  {
    id: 'left-cheek', label: 'Má trái',
    icon: (
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden>
        <ellipse cx="14" cy="19" rx="10" ry="12" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
        <ellipse cx="5.5" cy="21" rx="4" ry="4" fill="#a78bfa" opacity="0.75" />
      </svg>
    ),
  },
  {
    id: 'right-cheek', label: 'Má phải',
    icon: (
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden>
        <ellipse cx="14" cy="19" rx="10" ry="12" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
        <ellipse cx="22.5" cy="21" rx="4" ry="4" fill="#a78bfa" opacity="0.75" />
      </svg>
    ),
  },
  {
    id: 'chin-jaw', label: 'Cằm & quai hàm',
    icon: (
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none" aria-hidden>
        <ellipse cx="14" cy="19" rx="10" ry="12" stroke="rgba(196,181,253,0.3)" strokeWidth="1.5" />
        <ellipse cx="14" cy="30" rx="8" ry="3" fill="#a78bfa" opacity="0.75" />
      </svg>
    ),
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StoryAcneCard({ type, selected, onSelect }: {
  type: typeof ACNE_TYPES[number]; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '9px',
        padding: '14px 10px', borderRadius: '16px', cursor: 'pointer',
        background: selected
          ? `linear-gradient(135deg, ${type.color}28, ${type.color}10)`
          : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${selected ? type.color : 'rgba(255,255,255,0.1)'}`,
        backdropFilter: 'blur(8px)',
        boxShadow: selected ? `0 0 20px ${type.color}20` : 'none',
        transition: 'all 180ms ease',
        transform: selected ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      <div style={{
        width: '36px', height: '36px', borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${type.color}cc, ${type.color}66)`,
        boxShadow: selected ? `0 0 14px ${type.color}55` : 'none',
        transition: 'box-shadow 180ms ease',
      }} />
      <span style={{ fontSize: '11px', fontWeight: 700, color: '#e9d5ff', lineHeight: 1.2, textAlign: 'center' }}>
        {type.label}
      </span>
    </button>
  );
}

function StoryZoneBtn({ zone, selected, onToggle }: {
  zone: typeof STORY_ZONES[number]; selected: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      aria-pressed={selected}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '12px 16px', borderRadius: '14px', cursor: 'pointer', width: '100%', textAlign: 'left',
        background: selected ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.05)',
        border: `1.5px solid ${selected ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 180ms ease',
      }}
    >
      {zone.icon}
      <span style={{ fontSize: '13px', fontWeight: 600, color: selected ? '#e9d5ff' : '#c4b5fd', flex: 1 }}>
        {zone.label}
      </span>
      {selected && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden style={{ flexShrink: 0 }}>
          <circle cx="8" cy="8" r="7" fill="#a78bfa" />
          <path d="M5 8l2.5 2.5L11 5.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function StoryDots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: '4px', borderRadius: '99px',
            width: i === current ? '24px' : '6px',
            background: i === current ? '#a78bfa' : 'rgba(255,255,255,0.2)',
            transition: 'all 300ms ease',
          }}
        />
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PlayfulStoryMinigame({ onComplete, copy }: MinigameSlotProps) {
  const [slide, setSlide]                 = useState<1 | 2>(1);
  const [acneType, setAcneType]           = useState<AcneType | null>(null);
  const [selectedZones, setSelectedZones] = useState<Zone[]>([]);
  const [isScanning, setIsScanning]       = useState(false);

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
        triggerNote: type !== 'none' ? `Loại mụn: ${typeInfo?.label ?? ''}` : '',
      });
    }, 1150);
  }

  function pickType(type: AcneType) {
    setAcneType(type);
    if (type === 'none') {
      submit('none', []);
    } else {
      setSelectedZones([]);
      setTimeout(() => setSlide(2), 80);
    }
  }

  const BG = '#0f0a1e';

  if (isScanning) {
    return (
      <div
        className="min-h-[100dvh] w-full flex flex-col items-center justify-center gap-6"
        style={{ background: BG }}
      >
        <style>{`@keyframes s-pulse{0%,100%{opacity:0.9}50%{opacity:0.25}}`}</style>
        <div className="text-center">
          <p className="font-extrabold text-xl" style={{ color: '#e9d5ff' }}>Đang phân tích da của bạn...</p>
          <p className="text-sm mt-2" style={{ color: 'rgba(196,181,253,0.55)' }}>Chỉ mất vài giây</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: '10px', height: '10px', borderRadius: '50%', background: '#a78bfa',
              animation: `s-pulse 0.9s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] w-full flex flex-col items-center justify-center px-5 py-10"
      style={{ background: BG }}
    >
      <div className="w-full max-w-sm flex flex-col gap-6">

        {/* Slide counter badge */}
        <div className="text-center">
          <span style={{
            display: 'inline-block',
            border: '1.5px solid rgba(167,139,250,0.3)',
            borderRadius: '99px', padding: '3px 12px',
            fontSize: '11px', fontWeight: 700, color: '#a78bfa',
          }}>
            {slide} / 2
          </span>
        </div>

        {slide === 1 ? (
          <div key="slide-1" className="flex flex-col gap-5 animate-fade-in-up">
            <div className="text-center">
              <p className="font-extrabold text-2xl leading-snug [text-wrap:balance]" style={{ color: '#e9d5ff' }}>
                Mụn của bạn thường trông như thế nào?
              </p>
              <p className="text-sm mt-2" style={{ color: 'rgba(196,181,253,0.55)' }}>
                Chọn loại gần nhất với da bạn
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ACNE_TYPES.map(t => (
                <StoryAcneCard key={t.id} type={t} selected={acneType === t.id} onSelect={() => pickType(t.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div key="slide-2" className="flex flex-col gap-5 animate-fade-in-up">
            <div className="text-center">
              <p className="font-extrabold text-2xl leading-snug [text-wrap:balance]" style={{ color: '#e9d5ff' }}>
                Mụn xuất hiện ở vùng nào?
              </p>
              <p className="text-sm mt-2" style={{ color: 'rgba(196,181,253,0.55)' }}>
                Có thể chọn nhiều vùng
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {STORY_ZONES.map(z => (
                <StoryZoneBtn
                  key={z.id} zone={z}
                  selected={selectedZones.includes(z.id)}
                  onToggle={() => toggleZone(z.id)}
                />
              ))}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => { setSlide(1); setSelectedZones([]); setAcneType(null); }}
                style={{
                  padding: '14px 18px', borderRadius: '99px',
                  border: '1.5px solid rgba(167,139,250,0.25)',
                  background: 'transparent', color: '#a78bfa',
                  fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                }}
              >
                &#8592;
              </button>
              <button
                onClick={() => submit(acneType!, selectedZones)}
                style={{
                  flex: 1, padding: '14px 20px', borderRadius: '99px',
                  background: 'linear-gradient(135deg, #a78bfa, #7c3aed)',
                  color: '#fff', fontSize: '14px', fontWeight: 800,
                  cursor: 'pointer', border: 'none',
                  boxShadow: '0 6px 20px rgba(124,58,237,0.38)',
                }}
              >
                Xem kết quả &#8594;
              </button>
            </div>
          </div>
        )}

        <StoryDots current={slide - 1} total={2} />
      </div>
    </div>
  );
}
