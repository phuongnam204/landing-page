'use client';
import type { ProgramsSlotProps } from '../../../slots';
import { GridWithFaqPrograms } from '../GridWithFaqPrograms';

export function ClinicalClassicPrograms(props: ProgramsSlotProps) {
  return <GridWithFaqPrograms {...props} ctaVariant="dark" />;
}
