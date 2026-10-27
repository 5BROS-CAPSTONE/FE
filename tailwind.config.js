/** @type {import('tailwindcss').Config} */
// Design tokens from the Stitch design system "AgroFlight Precision"
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          50: '#F0FDF4', 100: '#DCFCE7', 200: '#BBF7D0', 300: '#86EFAC', 400: '#4ADE80',
          500: '#22C55E', 600: '#16A34A', 700: '#15803D', 800: '#166534', 900: '#14532D',
        },
        secondary: { DEFAULT: '#0F172A' },
        tertiary: { DEFAULT: '#0284C7' },
        neutral: { DEFAULT: '#64748B' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
