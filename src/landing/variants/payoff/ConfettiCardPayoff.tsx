'use client';
import type { PayoffSlotProps } from '../../slots';
import { PayoffOrganism } from '../../organisms/PayoffOrganism';

export function ConfettiCardPayoff(props: PayoffSlotProps) {
  return <PayoffOrganism {...props} layout="confetti" />;
}
