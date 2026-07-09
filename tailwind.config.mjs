/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cta:               'var(--lp-primary)',
        accent:            'var(--lp-accent)',
        'lp-border':       'var(--lp-border)',
        'pastel-pink':     'var(--lp-pastel-pink)',
        'pastel-lavender': 'var(--lp-pastel-lavender)',
        'pastel-mint':     'var(--lp-pastel-mint)',
        'border-pink':     'var(--lp-border-pink)',
        'border-mint':     'var(--lp-border-mint)',
        'border-lavender': 'var(--lp-border-lavender)',
        'label-purple':    'var(--lp-label-purple)',
      },
      fontFamily: { sans: ['var(--font-be-vietnam-pro)', 'Inter', 'sans-serif'] },
      borderRadius: { soft: 'var(--lp-radius-card)' },
    },
  },
  plugins: [],
};
