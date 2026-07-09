// scripts/build-tokens.mjs
// Reads tokens/themes/*.json → writes src/landing/themes.css
// No external dependencies — uses Node.js built-in fs only.
import { readFileSync, writeFileSync } from 'fs';

const THEMES = ['blossom', 'ocean', 'sage', 'golden', 'midnight'];

function resolveValue(val) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    console.warn(`[build-tokens] Unresolved alias: ${val} — replace with direct hex in theme file`);
    return val;
  }
  return val;
}

function buildThemeCSS(themeName) {
  const raw = readFileSync(`tokens/themes/${themeName}.json`, 'utf-8');
  const data = JSON.parse(raw);
  const vars = Object.entries(data.theme)
    .map(([key, token]) => `  --lp-${key}: ${resolveValue(token.$value)};`)
    .join('\n');
  return `.theme-${themeName} {\n${vars}\n}`;
}

const header = `/* AUTO-GENERATED — run \`npm run tokens\` to update.
   Edit tokens/themes/*.json, not this file. */\n\n`;
const body = THEMES.map(buildThemeCSS).join('\n\n');
writeFileSync('src/landing/themes.css', header + body + '\n', 'utf-8');
console.log('✓ src/landing/themes.css generated from tokens/themes/*.json');
