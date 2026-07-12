'use client';
import type { PayoffSlotProps } from '../../../slots';
import { ConfettiCardWhyPayoff } from '../ConfettiCardWhyPayoff';

export function ElectricLightPopPayoff(props: PayoffSlotProps) {
  return (
    <div>
      <ConfettiCardWhyPayoff {...props} />
    </div>
  );
}
