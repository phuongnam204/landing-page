'use client';
import { useState, useEffect, useRef } from 'react';
import type { MinigameSlotProps, MinigameResult } from '../../../slots';
import type { ConditionId } from '../../../../content/quiz';
import { skinConditions } from '../../../../content/quiz';

type ZoneKey = 'forehead' | 'nose' | 'chin' | 'left-cheek' | 'right-cheek';
type Severity = 'mild' | 'moderate' | 'severe';

const ZONE_LABEL_MAP: Record<ZoneKey, string> = {
  forehead: 'Tran',
  nose: 'Mui',
  chin: 'Cam',
  'left-cheek': 'Ma trai',
  'right-cheek': 'Ma phai',
};

const SEVERITY_OPTIONS: Array<{ label: string; value: Severity }> = [
  { label: 'Nhe, vai cai',       value: 'mild' },
  { label: 'Vua phai, nhieu cai', value: 'moderate' },
  { label: 'Nhieu, dam / viem',   value: 'severe' },
];

function resolveCondition(zones: ZoneKey[], severity: Severity): ConditionId {
  if (severity === 'severe' || zones.length >= 3) return 'mun-trung-ca';
  if (zones.includes('chin')) return 'mun-noi-tiet';
  if (zones.includes('forehead') || zones.includes('nose')) return 'da-nhon-mun-viem';
  if (zones.length === 0) return 'clean-skin';
  return 'lo-chan-long';
}

export function ElectricClassicChainedMinigame({ onComplete }: MinigameSlotProps) {
  const [phase, setPhase] = useState<'zone' | 'severity' | 'done'>('zone');
  const [selectedZones, setSelectedZones] = useState<ZoneKey[]>([]);
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | null>(null);
  const [showSeverity, setShowSeverity] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [phase, showSeverity]);

  function toggleZone(z: ZoneKey) {
    setSelectedZones(prev =>
      prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]
    );
  }

  function confirmZone() {
    setShowSeverity(true);
    setPhase('severity');
  }

  function confirmSeverity(s: Severity) {
    setSelectedSeverity(s);
    setPhase('done');
    setTimeout(() => {
      const cid = resolveCondition(selectedZones, s);
      const condition = skinConditions[cid]!;
      const result: MinigameResult = {
        conditions: [condition],
        condition,
        zoneLabel: selectedZones.map(z => ZONE_LABEL_MAP[z]).join(', '),
        zoneIds: selectedZones,
        triggerNote: s === 'severe' ? 'tinh trang viem nang' : 'tinh trang nhe-den-vua',
      };
      onComplete(result);
    }, 400);
  }

  return (
    <div
      className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden"
      style={{ animation: 'fade-in 350ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zone-pop { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
        .zone-btn { transition: all 180ms ease; }
        .zone-btn.selected { transform: scale(1.04); }
        .zone-btn:active { transform: scale(0.95); }
      `}</style>

      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-primary)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>O2skin Skin Scan</div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>{phase === 'zone' ? 'Cham vao vung da co mun' : phase === 'severity' ? 'Danh gia muc do' : 'Dang phan tich...'}</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        {phase === 'zone' && (
          <div className="flex flex-col gap-4" style={{ animation: 'fade-in 300ms ease-out both' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>Cham vao cac vung da co mun:</p>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(ZONE_LABEL_MAP) as [ZoneKey, string][]).map(([key, label]) => {
                const sel = selectedZones.includes(key);
                return (
                  <button key={key} onClick={() => toggleZone(key)}
                    className={`zone-btn rounded-soft px-4 py-5 text-sm font-semibold text-center leading-snug ${sel ? 'selected' : ''}`}
                    style={{
                      background: sel ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 8%, white)',
                      color: sel ? 'white' : 'var(--lp-primary)',
                      border: sel ? '2px solid var(--lp-accent)' : '2px solid color-mix(in srgb, var(--lp-accent) 20%, transparent)',
                      animation: 'zone-pop 250ms cubic-bezier(0.34, 1.56, 0.64, 1) both',
                    }}>
                    {label}
                  </button>
                );
              })}
            </div>
            <div className="h-2" />
            <button onClick={confirmZone} disabled={selectedZones.length === 0}
              className="w-full rounded-full py-3.5 text-base font-bold text-white transition-all duration-200 disabled:opacity-40"
              style={{ background: selectedZones.length > 0 ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 30%, white)' }}>
              Tiep theo ({selectedZones.length} vung)
            </button>
          </div>
        )}

        {phase === 'severity' && showSeverity && (
          <div className="flex flex-col gap-4" style={{ animation: 'fade-in 300ms ease-out both' }}>
            <p className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>Muc do tren tung vung:</p>
            {SEVERITY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => confirmSeverity(opt.value)}
                className="rounded-soft px-5 py-4 text-left text-sm font-semibold transition-all"
                style={{
                  background: 'color-mix(in srgb, var(--lp-accent) 6%, white)',
                  color: 'var(--lp-primary)',
                  border: '1px solid color-mix(in srgb, var(--lp-accent) 16%, transparent)',
                }}>
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {phase === 'done' && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'var(--lp-accent)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
            </div>
            <p className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>Dang phan tich...</p>
          </div>
        )}
      </div>
      <div ref={bottomRef} />
    </div>
  );
}
