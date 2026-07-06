import Link from 'next/link';
import { allRecipes } from '../../landing/recipes';

const THEME_CHIPS: Record<string, { label: string; bg: string; text: string }> = {
  blossom:  { label: 'Blossom',  bg: '#FFD3E0', text: '#2D2640' },
  ocean:    { label: 'Ocean',    bg: '#BAE6FD', text: '#0c4a6e' },
  sage:     { label: 'Sage',     bg: '#BBF7D0', text: '#14532d' },
  golden:   { label: 'Golden',   bg: '#FDE68A', text: '#78350f' },
  midnight: { label: 'Midnight', bg: '#1e1a2e', text: '#a78bfa' },
};

export default function VersionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Landing page versions</h1>
        <p className="text-sm text-gray-500 mb-8">{allRecipes.length} version — bấm để xem</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allRecipes.map(recipe => {
            const chip = THEME_CHIPS[recipe.theme ?? 'blossom'];
            return (
              <Link key={recipe.id} href={`/v/${recipe.id}`}
                className="block rounded-2xl border-2 border-gray-200 bg-white p-5 hover:border-gray-400 hover:shadow-md transition-all duration-150">
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs text-gray-400">{recipe.id}</span>
                  {chip && <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: chip.bg, color: chip.text }}>{chip.label}</span>}
                </div>
                <p className="font-semibold text-gray-800 leading-snug mb-3">{recipe.label}</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(recipe.slots).filter(([,v]) => v).map(([slot, variant]) => (
                    <span key={slot} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{slot}: {variant}</span>
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
