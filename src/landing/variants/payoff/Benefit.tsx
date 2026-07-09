'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';
import { O2SKIN_BENEFIT } from './constant/Benefit';

function BenefitContent() {
  return (
    <div className="flex flex-col gap-5 mb-4">
      {O2SKIN_BENEFIT.map((stat, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-cta text-white font-black text-base flex items-center justify-center shrink-0">
            {i + 1}
          </div>
          <div>
            <p className="font-black text-xl md:text-2xl text-cta leading-none">{stat.value}</p>
            <p className="text-sm text-cta/65 leading-snug mt-0.5">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Benefit(props: PayoffSlotProps) {
  return (
    <PayoffOrganism {...props} layout="benefit" bodySlot={<BenefitContent />} />
  );
}
