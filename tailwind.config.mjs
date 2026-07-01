/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        cta: '#2D2640',
        'pastel-pink': '#FFD3E0',
        'pastel-lavender': '#C7CEEA',
        'pastel-mint': '#A8E6CF',
        'border-pink': '#FFB8CE',
        'border-mint': '#9FE6BD',
        'border-lavender': '#B6BCEE',
        'label-purple': '#9b8fc4',
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        soft: '20px',
      },
    },
  },
  plugins: [],
};
