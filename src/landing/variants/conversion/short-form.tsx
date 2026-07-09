'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';

export function ShortFormConversion(props: ConversionSlotProps) {
  return <ConversionOrganism {...props} />;
}
