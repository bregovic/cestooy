/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F5F5EA',
          100: '#E2E2D0',
          200: '#C5C5A1',
          300: '#A8A872',
          400: '#8B8B43',
          500: '#305555',
          600: '#1E3A3A',
          700: '#162B2B',
          800: '#0E1C1C',
          900: '#070E0E',
          950: '#030707',
        },
        secondary: '#475569',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
