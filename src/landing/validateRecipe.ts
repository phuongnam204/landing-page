export type RecipeSlots = {
  hook: string;
  minigame: string;
  payoff: string;
  programs?: string;
  conversion: string;
  socialProof?: string;
  done?: string;
};

export type Recipe = {
  id: string;
  label: string;
  theme?: string;
  slots: RecipeSlots;
};

export type ValidationResult =
  | { valid: true }
  | { valid: false; errors: string[] };

const REQUIRED = ['hook', 'minigame', 'payoff', 'conversion'] as const;
const OPTIONAL = ['programs', 'socialProof', 'done'] as const;

export function validateRecipe(
  recipe: Recipe,
  registry: Record<string, Record<string, unknown>>,
): ValidationResult {
  const errors: string[] = [];
  for (const slot of REQUIRED) {
    const id = recipe.slots[slot];
    if (!id) errors.push(`Missing required slot: "${slot}"`);
    else if (!registry[slot]?.[id]) errors.push(`Unknown variant for slot "${slot}": "${id}"`);
  }
  for (const slot of OPTIONAL) {
    const id = recipe.slots[slot];
    if (id && !registry[slot]?.[id]) errors.push(`Unknown variant for slot "${slot}": "${id}"`);
  }
  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}
