'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function PlayfulMinimalConversion(props: ConversionSlotProps) {
  return (
    <div className="min-h-[100dvh] bg-[var(--lp-bg-hero)] flex items-center justify-center py-12 px-5">
      <div className="max-w-md w-full">
        <ConversionOrganism {...props} />
      </div>
    </div>
  );
}
