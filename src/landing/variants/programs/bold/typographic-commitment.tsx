'use client';
import { useState } from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import { getPrograms } from '../../../../content/catalog';
import type { ProgramId } from '../../../../content/programs';
import { trackEvent } from '../../../../lib/trackEvent';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const COMMITMENT_LEVELS = [
  { id: 'discover',   label: 'Khám phá',    desc: 'Tìm hiểu sơ bộ, chưa cam kết',       icon: 'search' },
  { id: 'serious',    label: 'Nghiêm túc',  desc: 'Sẵn sàng bắt đầu liệu trình',        icon: 'target' },
  { id: 'committed',  label: 'Cam kết',     desc: 'Đã xác định, muốn điều trị dứt điểm', icon: 'zap' },
];

export function BoldTypographicCommitmentPrograms({ suggestedPrograms, onContinue }: ProgramsSlotProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const program = suggestedPrograms[0]?.program ?? getPrograms()[0];
  const programId = program.id as ProgramId;

  function handleContinue() {
    trackEvent('programs_commitment', { programId, level: selected });
    onContinue(programId);
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="min-h-full flex items-center justify-center px-5 py-8">
        <div className="max-w-lg w-full flex flex-col gap-6">
          <div className="text-center">
            <h2 className="text-xl font-extrabold" style={{ color: 'var(--lp-primary)' }}>
              Bạn muốn đi bao xa?
            </h2>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
              Chọn mức độ cam kết để nhận gợi ý phù hợp
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {COMMITMENT_LEVELS.map(level => {
              const sel = selected === level.id;
              return (
                <button
                  key={level.id}
                  onClick={() => setSelected(level.id)}
                  className="rounded-soft px-5 py-4 text-left transition-all duration-200"
                  style={{
                    background: sel ? 'color-mix(in srgb, var(--lp-accent) 8%, white)' : 'transparent',
                    border: sel ? '2px solid var(--lp-accent)' : '2px solid color-mix(in srgb, var(--lp-accent) 12%, transparent)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                      style={{ background: sel ? 'var(--lp-accent)' : 'color-mix(in srgb, var(--lp-accent) 12%, white)' }}>
                      {level.icon === 'search' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sel ? 'white' : 'var(--lp-accent)'} strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>
                      )}
                      {level.icon === 'target' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sel ? 'white' : 'var(--lp-accent)'} strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg>
                      )}
                      {level.icon === 'zap' && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sel ? 'white' : 'var(--lp-accent)'} strokeWidth="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold uppercase tracking-wider" style={{ color: sel ? 'var(--lp-primary)' : 'color-mix(in srgb, var(--lp-primary) 65%, transparent)' }}>
                        {level.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'color-mix(in srgb, var(--lp-primary) 50%, transparent)' }}>
                        {level.desc}
                      </p>
                    </div>
                    {sel && (
                      <div className="ml-auto" style={{ color: 'var(--lp-accent)' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <CtaButton variant="golden" fullWidth onClick={handleContinue} disabled={!selected}>
            {selected ? 'Xem liệu trình phù hợp' : 'Hãy chọn một mức độ'}
          </CtaButton>
        </div>
      </div>
    </div>
  );
}
