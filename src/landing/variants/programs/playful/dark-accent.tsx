'use client';
import React from 'react';
import type { ProgramsSlotProps } from '../../../slots';
import { GridWithFaqPrograms } from '../GridWithFaqPrograms';

export function PlayfulDarkAccentPrograms(props: ProgramsSlotProps) {
  return (
    <div style={{
      '--lp-bg-payoff': 'var(--lp-blob-3)',
      '--lp-accent': 'var(--lp-primary)',
    } as React.CSSProperties}>
      <GridWithFaqPrograms {...props} ctaVariant="dark" />
    </div>
  );
}
