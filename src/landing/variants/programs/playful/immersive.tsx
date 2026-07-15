'use client';
import type { ProgramsSlotProps } from '../../../slots';
import { GridWithFaqPrograms } from '../GridWithFaqPrograms';

export function PlayfulImmersivePrograms(props: ProgramsSlotProps) {
  return <GridWithFaqPrograms {...props} ctaVariant="dark" />;
}
