'use client';
import { useState } from 'react';

export type FaqItem = { q: string; a: string };

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 16 16" fill="none"
      aria-hidden="true"
      className="flex-shrink-0 transition-transform duration-200"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface FaqAccordionProps {
  items: FaqItem[];
  onOpen?: (index: number) => void;
}

export function FaqAccordion({ items, onOpen }: FaqAccordionProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="rounded-soft border border-[var(--lp-border)] overflow-hidden bg-[var(--lp-bg-card)]">
      {items.map((item, i) => (
        <div key={i} className={i < items.length - 1 ? 'border-b border-[var(--lp-border)]' : ''}>
          <button
            type="button"
            onClick={() => {
              const next = openIdx === i ? null : i;
              setOpenIdx(next);
              if (next !== null) onOpen?.(next);
            }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-cta hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span>{item.q}</span>
            <ChevronIcon open={openIdx === i} />
          </button>
          {openIdx === i && (
            <div className="px-4 pb-3.5 text-sm text-cta/70 leading-relaxed">
              {item.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
