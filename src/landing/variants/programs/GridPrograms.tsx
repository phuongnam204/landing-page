'use client';
import type { ProgramsSlotProps } from '../../slots';
import { ProgramsOrganism } from '../../organisms/ProgramsOrganism';

export function GridPrograms(props: ProgramsSlotProps) {
  return <ProgramsOrganism {...props} layout="grid" />;
}
