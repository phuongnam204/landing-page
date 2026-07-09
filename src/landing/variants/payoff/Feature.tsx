'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';
import { O2SKIN_FEATURES } from './constant/Features';

function FeatureContent() {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {O2SKIN_FEATURES.map((f, i) => (
        <div key={i} className="bg-cta/5 rounded-soft p-4 md:p-5 flex flex-col gap-1.5">
          <p className="font-extrabold text-xs md:text-sm text-cta uppercase tracking-wider leading-snug">
            {f.title}
          </p>
          <p className="text-sm text-cta/70 leading-relaxed">{f.body}</p>
        </div>
      ))}
    </div>
  );
}

export function Feature(props: PayoffSlotProps) {
  return (
    <PayoffOrganism {...props} layout="feature" bodySlot={<FeatureContent />} />
  );
}
