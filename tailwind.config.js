/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        navy:    '#0B1628',   // page background
        'n800':  '#112040',   // card / raised surface
        'n700':  '#1A3358',   // border / divider
        'n600':  '#2A4A6B',   // lifted border (hover states)
        oxford:  '#1F3A5F',   // accent surface
        // Text
        cream:   '#F5ECD7',   // primary text
        sand:    '#C8B99A',   // secondary text
        taupe:   '#8A7A68',   // tertiary / hint text
        // Accent
        gold:       '#D4AF37',
        'gold-light': '#E8CC6A',
        // Legacy aliases kept so old classes still work
        graphite:    '#0B1628',
        'g800':      '#112040',
        'g700':      '#1A3358',
        'g600':      '#8A7A68',
        silver:      '#F5ECD7',
        'silver-dim':'#C8B99A',
      },
      fontFamily: {
        serif: ['"Libre Baskerville"', 'Georgia', 'serif'],
        sans:  ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
