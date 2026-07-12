'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function ClinicalCompactConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] w-full bg-[var(--lp-bg-hero)] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
