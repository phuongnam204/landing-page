'use client';
import React from 'react';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function PlayfulDarkAccentConversion(props: ConversionSlotProps) {
  return (
    <div style={{ '--lp-bg-payoff': 'var(--lp-bg-hero)' } as React.CSSProperties}>
      <ConversionOrganism {...props} />
    </div>
  );
}
