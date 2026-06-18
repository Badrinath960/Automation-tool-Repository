/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F0F6FC',
          100: '#E1EDFC',
          200: '#BCD7FA',
          300: '#86B7F6',
          400: '#4791F1',
          500: '#0057B8',
          600: '#004CB3',
          700: '#003D99',
          800: '#002D7A',
          900: '#0C1E36',
        },
        accent: {
          50: '#F0F6FC',
          100: '#E1EDFC',
          200: '#BCD7FA',
          300: '#86B7F6',
          400: '#4791F1',
          500: '#0057B8',
          600: '#004CB3',
          700: '#003D99',
          800: '#002D7A',
          900: '#0C1E36',
        },
        surface: '#f8fafc',
        card: '#ffffff',
        border: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
