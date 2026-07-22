import type { Config } from 'tailwindcss'
import daisyui from 'daisyui'

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Mint Green & White palette ─────────────────────────────
        'mint-bg':      '#F4FBF8',   // page background
        'mint-sidebar': '#E1F5EE',   // sidebar / soft sections
        'mint-accent':  '#1D9E75',   // primary buttons, active states
        'mint-light':   '#9FE1CB',   // hover highlights
        'mint-pale':    '#E1F5EE',   // tags, badges, chips
        'mint-surface': '#FFFFFF',   // cards, containers
        'mint-text':    '#2C2C2A',   // main text
        'mint-muted':   '#6B7B74',   // secondary text
        'mint-code':    '#1E2D28',   // code editor bg
        'mint-warn':    '#F59E0B',   // warnings
        'mint-error':   '#E24B4A',   // errors
        'mint-border':  '#C8E8DC',   // soft card borders
      },
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out forwards',
        'fade-in': 'fade-in 0.4s ease-out forwards',
      },
      fontFamily: {
        bengali: ['Hind Siliguri', 'Noto Sans Bengali', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'card':  '0 1px 6px rgba(29,158,117,0.07), 0 4px 16px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 20px rgba(29,158,117,0.12), 0 8px 32px rgba(0,0,0,0.06)',
        'btn':   '0 2px 8px rgba(29,158,117,0.20)',
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        alokbartika: {
          'primary':      '#1D9E75',
          'secondary':    '#9FE1CB',
          'accent':       '#9FE1CB',
          'neutral':      '#2C2C2A',
          'base-100':     '#F4FBF8',
          'base-200':     '#E1F5EE',
          'base-300':     '#C8E8DC',
          'base-content': '#2C2C2A',
          'info':         '#38bdf8',
          'success':      '#1D9E75',
          'warning':      '#F59E0B',
          'error':        '#E24B4A',
        },
      },
    ],
  },
} satisfies Config
