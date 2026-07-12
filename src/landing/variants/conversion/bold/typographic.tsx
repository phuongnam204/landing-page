'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function BoldTypographicConversion(props: ConversionSlotProps) {
  return (
    <div className="w-full">
      <div
        className="py-10 md:py-14 text-center"
        style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
      >
        <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight">DAT LICH</h2>
        <p className="text-sm mt-2 opacity-80">Tu van mien phi voi chuyen gia da lieu</p>
      </div>
      <div
        className="flex items-center justify-center px-5 py-12"
        style={{ background: 'var(--lp-bg-hero)' }}
      >
        <div className="w-full max-w-2xl mx-auto">
          <ConversionOrganism {...props} />
        </div>
      </div>
    </div>
  );
}
