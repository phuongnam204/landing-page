'use client';
import { useState } from 'react';
import type { PathChooserSlotProps } from '../../../slots';
import { trackEvent } from '../../../../lib/trackEvent';

export function BoldStackedPathChooser({ options, onChoose }: PathChooserSlotProps) {
  const [selected, setSelected] = useState<string | null>(null);

  function handleConfirm() {
    if (!selected) return;
    trackEvent('path_chosen', { option: selected });
    onChoose(selected);
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden items-center justify-center px-5"
      style={{ animation: 'fade-in 350ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes card-pop { from { opacity: 0; transform: scale(0.92) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .path-card { transition: all 220ms ease; }
        .path-card:hover { transform: translateY(-4px); }
        .path-card:active { transform: scale(0.97); }
      `}</style>

      <div className="w-full max-w-sm mx-auto text-center flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-extrabold" style={{ color: 'var(--lp-primary)' }}>
            Ban muon tiep theo?
          </h2>
          <p className="text-sm mt-2" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>
            Chon huong di phu hop nhat voi ban
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {options.map((opt, i) => {
            const sel = selected === opt.id;
            return (
              <button key={opt.id} onClick={() => setSelected(opt.id)}
                className="path-card rounded-soft px-5 py-5 text-left"
                style={{
                  background: sel ? 'color-mix(in srgb, var(--lp-accent) 8%, white)' : 'var(--lp-bg-card)',
                  border: sel ? '2px solid var(--lp-accent)' : '1px solid color-mix(in srgb, var(--lp-accent) 12%, transparent)',
                  boxShadow: sel ? '0 4px 20px color-mix(in srgb, var(--lp-accent) 18%, transparent)' : 'none',
                  animation: `card-pop 300ms cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 80}ms both`,
                }}
              >
                <div className="flex items-start gap-3">
                  {i === 0 ? (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 12%, white)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sel ? 'white' : 'var(--lp-accent)'} strokeWidth="2.5">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: sel ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 12%, white)' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sel ? 'white' : 'var(--lp-accent)'} strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-extrabold" style={{ color: sel ? 'var(--lp-primary)' : 'color-mix(in srgb, var(--lp-primary) 70%, transparent)' }}>
                      {opt.label}
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}>
                      {opt.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button onClick={handleConfirm} disabled={!selected}
          className="w-full rounded-full py-3.5 text-base font-bold text-white transition-all duration-200 disabled:opacity-40 active:scale-[0.98]"
          style={{ background: selected ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 30%, white)' }}>
          {selected ? 'Xac nhan' : 'Hay chon mot huong di'}
        </button>
      </div>
    </div>
  );
}
