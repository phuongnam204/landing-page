'use client';
import type { ConversionSlotProps } from '../../../slots';
import { ConversionOrganism } from '../../../organisms/ConversionOrganism';

export function BoldDiagonalConversion(props: ConversionSlotProps) {
  return (
    <div className="w-full">
      <div
        className="py-8 md:py-12 text-center"
        style={{ background: 'var(--lp-band-bg)', color: 'var(--lp-band-text)' }}
      >
        <h2 className="text-2xl md:text-4xl font-extrabold">DAT LICH NGAY</h2>
        <p className="text-sm mt-1 opacity-80">Tu van mien phi</p>
      </div>
      <div
        className="flex items-center justify-center px-5 py-12"
        style={{
          background: 'var(--lp-bg-hero)',
          clipPath: 'polygon(0 4%, 100% 0, 100% 100%, 0 100%)',
          marginTop: '-16px',
          paddingTop: '32px',
        }}
      >
        <div className="w-full max-w-2xl mx-auto">
          <ConversionOrganism {...props} />
        </div>
      </div>
    </div>
  );
}
