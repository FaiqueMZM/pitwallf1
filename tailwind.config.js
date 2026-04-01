/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Core F1 palette
        f1: {
          red: '#E8002D',
          'red-dark': '#B0001F',
          'red-light': '#FF1744',
          black: '#0a0a0a',
          'black-2': '#111111',
          'black-3': '#1a1a1a',
          'black-4': '#222222',
          gray: '#2a2a2a',
          'gray-2': '#3a3a3a',
          'gray-3': '#555555',
          'gray-4': '#888888',
          white: '#f5f5f5',
          'white-2': '#cccccc',
        },
        // Team colors (handy for driver cards)
        team: {
          redbull: '#3671C6',
          ferrari: '#E8002D',
          mercedes: '#27F4D2',
          mclaren: '#FF8000',
          aston: '#229971',
          alpine: '#0093CC',
          williams: '#64C4FF',
          rb: '#6692FF',
          haas: '#B6BABD',
          sauber: '#52E252',
        },
      },
      fontFamily: {
        display: ['"Formula1"', '"Barlow Condensed"', 'sans-serif'],
        body: ['"Titillium Web"', '"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E\")",
        'grid-dark': "linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
      animation: {
        'pulse-red': 'pulseRed 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        pulseRed: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(232,0,45,0)' },
          '50%': { boxShadow: '0 0 0 6px rgba(232,0,45,0.15)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
