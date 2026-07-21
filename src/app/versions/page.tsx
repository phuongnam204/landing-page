import Link from 'next/link';
import { allRecipes } from '../../landing/recipes';

type ThemeChip = { label: string; bg: string; text: string; accent: string };

// bg/text/accent values synced with src/landing/themes.css
const THEME_CHIPS: Record<string, ThemeChip> = {
  blossom:        { label: 'Blossom',      bg: '#FFEFF4', text: '#2D2640', accent: '#7C3AED' },
  ocean:          { label: 'Ocean',        bg: '#EFF8FF', text: '#0c4a6e', accent: '#0284c7' },
  sage:           { label: 'Sage',         bg: '#F0FDF4', text: '#14532d', accent: '#16a34a' },
  golden:         { label: 'Golden',       bg: '#FFFBEB', text: '#78350f', accent: '#d97706' },
  midnight:       { label: 'Midnight',     bg: '#0f0c1a', text: '#e2e8f0', accent: '#6D28D9' },
  // magenta: updated to light bg (#F5F0FF) — was dark, changed in themes.css
  magenta:        { label: 'Magenta',      bg: '#F5F0FF', text: '#6D28D9', accent: '#DB2777' },
  coral:          { label: 'Coral',        bg: '#FFF1EC', text: '#7A2C18', accent: '#EA580C' },
  lilac:          { label: 'Lilac',        bg: '#F5F0FF', text: '#3B1A78', accent: '#8B5CF6' },
  ice:            { label: 'Ice',          bg: '#F0F9FF', text: '#0C2B45', accent: '#0EA5E9' },
  'dusty-rose':   { label: 'Dusty Rose',   bg: '#FDF4F5', text: '#5E1A26', accent: '#E11D48' },
  matcha:         { label: 'Matcha',       bg: '#F6FAF0', text: '#1E3A08', accent: '#65A30D' },
  tropical:       { label: 'Tropical',     bg: '#F0FDFA', text: '#042F2E', accent: '#0D9488' },
  berry:          { label: 'Berry',        bg: '#FDF4FF', text: '#4A044E', accent: '#A21CAF' },
  periwinkle:     { label: 'Periwinkle',   bg: '#EEF2FF', text: '#1E1B4B', accent: '#6366F1' },
  'cherry-jp':    { label: 'Cherry JP',    bg: '#FFF5F7', text: '#1E3A2F', accent: '#E11D48' },
  charcoal:       { label: 'Charcoal',     bg: '#111827', text: '#e2e8f0', accent: '#818CF8' },
  forest:         { label: 'Forest',       bg: '#052E16', text: '#F0FDF4', accent: '#16A34A' },
  // crimson: updated to light bg (#FFF0F3) — was dark, changed in themes.css
  crimson:        { label: 'Crimson',      bg: '#FFF0F3', text: '#881337', accent: '#E11D48' },
  'cotton-candy': { label: 'Cotton Candy', bg: '#FDF4FF', text: '#1E1B4B', accent: '#EC4899' },
  opal:           { label: 'Opal',         bg: '#F8FAFF', text: '#312E81', accent: '#6366F1' },
  'rose-vivid':   { label: 'Rose Vivid',   bg: '#FFF0F3', text: '#881337', accent: '#E11D48' },
  jade:           { label: 'Jade',         bg: '#ECFDF5', text: '#064E3B', accent: '#059669' },
};

const SLOT_ORDER = [
  'hook', 'teaserPayoff', 'minigame', 'payoff',
  'programs', 'socialProof', 'conversion', 'done',
  'expertHandoff', 'pathChooser',
] as const;

const SLOT_LABEL: Record<string, string> = {
  hook: 'Hook', teaserPayoff: 'Teaser', minigame: 'Mini-game',
  payoff: 'Payoff', programs: 'Programs', socialProof: 'Social',
  conversion: 'Conversion', done: 'Done', expertHandoff: 'Expert', pathChooser: 'Path',
};

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function VersionsPage() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Landing page versions</h1>
        <p className="text-sm text-gray-500 mb-8">{allRecipes.length} version — bấm để xem</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allRecipes.map(recipe => {
            // chipColor recipes (e.g. v08 Navy×Mint): bg = dark, text = light accent
            // → topbar uses dark bg, body uses white
            // Named themes: topbar uses accent (darker), body uses theme bg (lighter)
            const isChipColor = !!recipe.chipColor;

            const topbarBg   = isChipColor ? recipe.chipColor!.bg    : (THEME_CHIPS[recipe.theme ?? ''] ?? THEME_CHIPS['blossom']).accent;
            const topbarText = isChipColor ? recipe.chipColor!.text   : '#ffffff';
            const bodyBg     = isChipColor ? '#ffffff'                : (THEME_CHIPS[recipe.theme ?? ''] ?? THEME_CHIPS['blossom']).bg;
            const bodyText   = isChipColor ? recipe.chipColor!.bg     : (THEME_CHIPS[recipe.theme ?? ''] ?? THEME_CHIPS['blossom']).text;
            const chipAccent = isChipColor ? recipe.chipColor!.bg     : (THEME_CHIPS[recipe.theme ?? ''] ?? THEME_CHIPS['blossom']).accent;
            const themeLabel = isChipColor ? recipe.chipColor!.label  : (THEME_CHIPS[recipe.theme ?? ''] ?? THEME_CHIPS['blossom']).label;
            const versionTag = recipe.id.split('-')[0];

            return (
              <Link
                key={recipe.id}
                href={`/v/${recipe.id}`}
                className="block rounded-2xl overflow-hidden border-2 hover:shadow-xl transition-all duration-150"
                style={{ borderColor: rgba(chipAccent, 0.25), textDecoration: 'none' }}
              >
                {/* Topbar */}
                <div style={{
                  background: topbarBg,
                  padding: '9px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}>
                  <span style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 800,
                    color: topbarText,
                    background: rgba(topbarText, 0.15),
                    padding: '1px 8px',
                    borderRadius: '99px',
                    flexShrink: 0,
                  }}>
                    {versionTag}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 700,
                    color: rgba(topbarText, 0.82),
                    letterSpacing: '0.2px',
                    textAlign: 'right',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {themeLabel}
                  </span>
                </div>

                {/* Body */}
                <div style={{ background: bodyBg, padding: '12px 14px 14px' }}>
                  <p style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: bodyText,
                    lineHeight: 1.4,
                    marginBottom: '10px',
                    minHeight: '38px',
                  }}>
                    {recipe.label}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {SLOT_ORDER
                      .filter(s => recipe.slots[s as keyof typeof recipe.slots])
                      .map(s => (
                        <span key={s} style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '99px',
                          background: rgba(chipAccent, 0.1),
                          color: chipAccent,
                          border: `1px solid ${rgba(chipAccent, 0.22)}`,
                          letterSpacing: '0.1px',
                        }}>
                          {SLOT_LABEL[s] ?? s}
                        </span>
                      ))
                    }
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
