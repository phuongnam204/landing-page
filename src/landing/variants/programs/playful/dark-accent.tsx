'use client';
import React from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import { GridWithFaqPrograms } from '../GridWithFaqPrograms';

export function PlayfulDarkAccentPrograms(props: ProgramsSlotProps) {
  return (
    <div style={{ '--lp-bg-payoff': 'var(--lp-bg-programs)' } as React.CSSProperties}>
      <GridWithFaqPrograms {...props} />
    </div>
  );
}
