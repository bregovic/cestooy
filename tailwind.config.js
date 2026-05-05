/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f5ea',
          100: '#e2e2d0',
          200: '#c5c5a1',
          300: '#a8a872',
          400: '#8b8b43',
          500: '#305555',
          600: '#1e3a3a',
          700: '#162b2b',
          800: '#0e1c1c',
          900: '#070e0e',
          950: '#030707',
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '2rem',
        '4xl': '3rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
