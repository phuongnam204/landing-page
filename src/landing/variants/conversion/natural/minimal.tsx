'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function NaturalMinimalConversion(props: ConversionSlotProps) {
  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-5 overflow-hidden">
      <div className="w-full max-w-2xl mx-auto animate-fade-in-up">
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
