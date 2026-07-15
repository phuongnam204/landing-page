# OpenCode Prompt — Map unique theme to each recipe

## Task

In `src/landing/recipes/`, each `.ts` file has one field:

```ts
theme: 'some-theme-name',
```

Your job: update the `theme:` field in the 19 files listed below.
4 files are kept unchanged (v01, v09, v13, v17).

Do NOT touch any other field, any other file, or any other line.

---

## Exact changes — one per file

Each entry below shows the file path and the new value for the `theme:` field.

```
src/landing/recipes/v03-facemap.ts          → theme: 'opal'
src/landing/recipes/v04-combined.ts         → theme: 'coral'
src/landing/recipes/v05-playful-classic.ts  → theme: 'cotton-candy'
src/landing/recipes/v06-playful-minimal.ts  → theme: 'lilac'
src/landing/recipes/v07-playful-immersive.ts → theme: 'berry'
src/landing/recipes/v08-navy-mint.ts        → theme: 'nebula'
src/landing/recipes/v10-clinical-compact.ts → theme: 'ice'
src/landing/recipes/v11-clinical-dashboard.ts → theme: 'charcoal'
src/landing/recipes/v12-clinical-editorial.ts → theme: 'periwinkle'
src/landing/recipes/v14-natural-spa.ts      → theme: 'dusty-rose'
src/landing/recipes/v15-natural-editorial.ts → theme: 'cherry-jp'
src/landing/recipes/v16-natural-minimal.ts  → theme: 'matcha'
src/landing/recipes/v18-bold-stacked.ts     → theme: 'rose-vivid'
src/landing/recipes/v19-bold-diagonal.ts    → theme: 'tropical'
src/landing/recipes/v20-bold-typographic.ts → theme: 'midnight'
src/landing/recipes/v22-electric-glow-heavy.ts → theme: 'crimson'
src/landing/recipes/v23-electric-soft-dark.ts  → theme: 'forest'
src/landing/recipes/v24-electric-light-pop.ts  → theme: 'jade'
```

---

## How to edit each file

Each file has exactly one `theme:` line. Replace the value. Example:

Before:
```ts
  theme: 'blossom',
```

After (for v05):
```ts
  theme: 'cotton-candy',
```

---

## Verify after editing

Run this command and confirm it exits 0 and prints 19 unique theme values:

```bash
node -e "
const fs = require('fs');
const files = [
  ['v03-facemap','opal'],
  ['v04-combined','coral'],
  ['v05-playful-classic','cotton-candy'],
  ['v06-playful-minimal','lilac'],
  ['v07-playful-immersive','berry'],
  ['v08-navy-mint','nebula'],
  ['v10-clinical-compact','ice'],
  ['v11-clinical-dashboard','charcoal'],
  ['v12-clinical-editorial','periwinkle'],
  ['v14-natural-spa','dusty-rose'],
  ['v15-natural-editorial','cherry-jp'],
  ['v16-natural-minimal','matcha'],
  ['v18-bold-stacked','rose-vivid'],
  ['v19-bold-diagonal','tropical'],
  ['v20-bold-typographic','midnight'],
  ['v22-electric-glow-heavy','crimson'],
  ['v23-electric-soft-dark','forest'],
  ['v24-electric-light-pop','jade'],
];
let pass = 0, fail = 0;
for (const [slug, expected] of files) {
  const src = fs.readFileSync('src/landing/recipes/'+slug+'.ts','utf8');
  const m = src.match(/theme:\s*'([^']+)'/);
  const got = m ? m[1] : '(not found)';
  if (got === expected) { console.log('PASS', slug, '->', got); pass++; }
  else { console.log('FAIL', slug, '- expected', expected, 'got', got); fail++; }
}
console.log(pass+'/'+files.length+' passed');
process.exit(fail > 0 ? 1 : 0);
"
```

---

## Commit after all checks pass

```bash
git add src/landing/recipes/
git commit -m "feat(recipes): assign unique theme to each of the 23 versions

Each version now has a distinct visual identity via its own CSS theme.
4 anchors kept (v01→blossom, v09→ocean, v13→sage, v17→golden);
19 versions updated to new themes."
```

---

## Do NOT

- Do not modify any file outside `src/landing/recipes/`
- Do not change any field other than `theme:`
- Do not add imports, remove exports, or reformat files
- Do not commit if the verify script shows any FAIL
