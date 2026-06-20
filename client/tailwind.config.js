/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ct: {
          black:    '#0A0A0A',
          surface:  '#141414',
          elevated: '#1F1F1F',
          border:   '#2A2A2A',
          hover:    '#333333',
          red:      '#E11D48',
          'red-dim':'#3D0A1A',
          text:     '#FFFFFF',
          muted:    '#A8A8A8',
          subtle:   '#5A5A5A',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-700px 0' },
          '100%': { backgroundPosition: '700px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite linear',
      },
    },
  },
  plugins: [],
}
