'use client';
import type { ProgramsSlotProps } from '../../../slots';
import { GridWithFaqPrograms } from '../GridWithFaqPrograms';

export function PlayfulClassicPrograms(props: ProgramsSlotProps) {
  return <GridWithFaqPrograms {...props} ctaVariant="dark" />;
}
