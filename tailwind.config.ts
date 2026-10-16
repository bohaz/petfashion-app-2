import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pf: {
          bg: '#0f0e0c',
          bg2: '#1a1916',
          bg3: '#242320',
          gold: '#c9922a',
          'gold-l': '#e8b84b',
          cream: '#f5f0e8',
        },
      },
      fontFamily: {
        sans: ['var(--font-jost)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
