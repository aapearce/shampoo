/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        graphite: '#111827',
        'g800': '#1f2937',
        'g700': '#374151',
        'g600': '#4b5563',
        oxford: '#1F3A5F',
        gold: '#D4AF37',
        'gold-light': '#E8CC6A',
        silver: '#E5E7EB',
        'silver-dim': '#9ca3af',
      },
      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
