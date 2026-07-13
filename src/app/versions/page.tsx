import Link from 'next/link';
import { allRecipes } from '../../landing/recipes';

const THEME_CHIPS: Record<string, { label: string; bg: string; text: string }> = {
  // existing 6
  blossom:        { label: 'Blossom',      bg: '#FFEFF4', text: '#2D2640' },
  ocean:          { label: 'Ocean',        bg: '#EFF8FF', text: '#0c4a6e' },
  sage:           { label: 'Sage',         bg: '#F0FDF4', text: '#14532d' },
  golden:         { label: 'Golden',       bg: '#FFFBEB', text: '#78350f' },
  midnight:       { label: 'Midnight',     bg: '#0f0c1a', text: '#a78bfa' },
  magenta:        { label: 'Magenta',      bg: '#1a0533', text: '#f0e6ff' },
  // 14 new
  coral:          { label: 'Coral',        bg: '#FFF1EC', text: '#7A2C18' },
  lilac:          { label: 'Lilac',        bg: '#F5F0FF', text: '#3B1A78' },
  ice:            { label: 'Ice',          bg: '#F0F9FF', text: '#0C2B45' },
  'dusty-rose':   { label: 'Dusty Rose',   bg: '#FDF4F5', text: '#5E1A26' },
  matcha:         { label: 'Matcha',       bg: '#F6FAF0', text: '#1E3A08' },
  tropical:       { label: 'Tropical',     bg: '#F0FDFA', text: '#042F2E' },
  berry:          { label: 'Berry',        bg: '#FDF4FF', text: '#4A044E' },
  periwinkle:     { label: 'Periwinkle',   bg: '#EEF2FF', text: '#1E1B4B' },
  'cherry-jp':    { label: 'Cherry JP',    bg: '#FFF5F7', text: '#1E3A2F' },
  charcoal:       { label: 'Charcoal',     bg: '#111827', text: '#E2E8F0' },
  forest:         { label: 'Forest',       bg: '#052E16', text: '#F0FDF4' },
  crimson:        { label: 'Crimson',      bg: '#0F0005', text: '#FFE4E6' },
  'cotton-candy': { label: 'Cotton Candy', bg: '#FDF4FF', text: '#1E1B4B' },
  opal:           { label: 'Opal',         bg: '#F8FAFF', text: '#312E81' },
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
            const chip = recipe.chipColor ?? THEME_CHIPS[recipe.theme ?? 'blossom'];
            const cardBg   = chip?.bg   ?? '#ffffff';
            const cardText = chip?.text ?? '#1f2937';
            return (
              <Link
                key={recipe.id}
                href={`/v/${recipe.id}`}
                className="block rounded-2xl border-2 p-5 hover:shadow-lg transition-all duration-150"
                style={{
                  background:   cardBg,
                  borderColor:  rgba(cardText, 0.18),
                  color:        cardText,
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs" style={{ color: rgba(cardText, 0.5) }}>
                    {recipe.id}
                  </span>
                  {chip && (
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: rgba(cardText, 0.12), color: cardText }}
                    >
                      {chip.label}
                    </span>
                  )}
                </div>
                <p className="font-semibold leading-snug mb-3" style={{ color: cardText }}>
                  {recipe.label}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(recipe.slots).filter(([, v]) => v).map(([slot, variant]) => (
                    <span
                      key={slot}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: rgba(cardText, 0.08), color: rgba(cardText, 0.7) }}
                    >
                      {slot}: {variant}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
