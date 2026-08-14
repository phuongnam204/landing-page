import { describe, it, expect } from 'vitest';
import { programs } from './programs';
import type { ConditionId } from './quiz';

// These mappings drive what ConditionMatchRow shows in the program detail
// drawer, so a wrong entry is a clinical claim shown to the user. They were
// corrected once already; pin them.

const byId = (id: string) => {
  const program = programs.find(p => p.id === id);
  if (!program) throw new Error(`missing program: ${id}`);
  return program;
};

describe('program condition mapping', () => {
  it('treats extraction as covering every kind of acne, not one type', () => {
    const primary = byId('hormonal-acne-plan').primaryConditionIds;
    expect(primary).toContain('mun-trung-ca');
    expect(primary).toContain('mun-noi-tiet');
    expect(primary).toContain('da-nhon-mun-viem');
  });

  it.each(['peel-acne', 'ipl-oil-control'])(
    'gives %s the shared acne-treatment primaries',
    (id) => {
      const expected: ConditionId[] = ['mun-trung-ca', 'da-nhon-mun-viem', 'da-mun-tham-seo'];
      expect(byId(id).primaryConditionIds).toEqual(expect.arrayContaining(expected));
    },
  );

  it('has the brightening program treat post-acne marks', () => {
    expect(byId('maintenance-skin-health').primaryConditionIds).toContain('da-mun-tham-seo');
  });

  it('has the rejuvenation program treat wrinkles', () => {
    expect(byId('treatment-tighten-pores').primaryConditionIds).toContain('da-nep-nhan');
  });

  it('only references condition ids that exist', async () => {
    const { skinConditions } = await import('./quiz');
    const known = new Set(Object.keys(skinConditions));
    for (const program of programs) {
      for (const id of [...program.primaryConditionIds, ...(program.secondaryConditionIds ?? [])]) {
        expect(known, `${program.id} references unknown condition ${id}`).toContain(id);
      }
    }
  });
});
