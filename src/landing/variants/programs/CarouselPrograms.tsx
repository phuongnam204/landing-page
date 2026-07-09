'use client';
import type { ProgramsSlotProps } from '../../slots';
import { ProgramsOrganism } from '../../organisms/ProgramsOrganism';

export function CarouselPrograms(props: ProgramsSlotProps) {
  return <ProgramsOrganism {...props} layout="carousel" />;
}
