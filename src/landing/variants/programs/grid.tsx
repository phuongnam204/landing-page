'use client';
import React, { useState } from 'react';
import type { ProgramsSlotProps } from '../../slots';
import type { Program, ProgramId } from '../../../content/programs';
import { getPrograms, getConditionById } from '../../../content/catalog';

export function GridPrograms({ suggestedProgramId, onContinue }: ProgramsSlotProps) {
  const [selected, setSelected] = useState<ProgramId>(suggestedProgramId);
  const allPrograms = getPrograms();
  return (
    <div className="ps-fadeDown h-[100dvh] w-full bg-[var(--lp-bg-programs)] overflow-y-auto py-6">
      <div className="min-h-full flex flex-col items-center justify-center px-4">
        <div className="relative w-full max-w-5xl mb-5">
          <div className="flex items-center justify-center gap-3 md:gap-5">
            <img src="/mascots/nurse-cheer.png" alt="" className="ps-popCheer ps-floaty w-16 md:w-24 h-auto object-contain" style={{ zIndex: 20 }} />
            <h2 className="ps-fadeDown text-xl md:text-2xl font-extrabold text-cta text-center [animation-delay:0.1s]">Các gói dịch vụ tại O2Skin</h2>
            <img src="/mascots/nurse-review.png" alt="" className="ps-popCheer ps-floaty hidden sm:block w-16 md:w-24 h-auto object-contain" style={{ animationDelay: '0.2s', zIndex: 20 }} />
          </div>
        </div>
        <div className="w-full max-w-5xl grid gap-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))' }}>
          {allPrograms.map((program, idx) => (
            <ProgramCard key={program.id} program={program} selected={selected === program.id}
              isSuggested={program.id === suggestedProgramId} onSelect={() => setSelected(program.id)}
              style={{ animationDelay: `${0.15 + idx * 0.08}s` }} />
          ))}
        </div>
        <button onClick={() => onContinue(selected)} className="bg-[var(--lp-accent)] text-white font-bold text-sm py-3.5 px-9 rounded-soft hover:opacity-90 transition-opacity duration-200">
          {`Đăng ký chương trình ${allPrograms.find(p => p.id === selected)?.name ?? ''} →`}
        </button>
      </div>
    </div>
  );
}

function ProgramCard({ program, selected, isSuggested, onSelect, style }: {
  program: Program; selected: boolean; isSuggested: boolean; onSelect: () => void; style?: React.CSSProperties;
}) {
  const cond = getConditionById(program.treatsConditions[0]);
  const tint = cond?.color ?? '#A0AEC0';
  return (
    <button onClick={onSelect} style={style}
      className={['ps-cardUp text-left rounded-soft shadow-md shadow-cta/10 flex flex-col overflow-hidden border-2 transition-colors duration-[160ms]', selected ? 'border-[var(--lp-accent)]' : 'border-transparent'].join(' ')}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${tint}CC` }}>
        <div className="font-bold text-base text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.18)' }}>{program.name}</div>
        {selected && <span className="font-bold text-sm text-white">✓</span>}
      </div>
      <div className="px-4 py-3 flex flex-col gap-2 flex-1" style={{ background: selected ? `${tint}0A` : 'var(--lp-bg-card)' }}>
        {program.isVip && <span className="self-start inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">VIP</span>}
        <p className="text-sm text-cta/70 leading-relaxed">{program.description}</p>
        <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
          {program.treatsConditions.map(cid => {
            const c = getConditionById(cid);
            return (
              <span key={cid} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ background: c ? `${c.color}30` : '#e8e8e8', color: c ? c.color : '#555', filter: c ? 'brightness(0.82)' : 'none' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: c?.color ?? '#999' }} />
                {c?.label ?? cid}
              </span>
            );
          })}
        </div>
      </div>
    </button>
  );
}
