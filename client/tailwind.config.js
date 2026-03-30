/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,tsx,ts}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#030303',
          card: '#0a0a0c',
          border: 'rgba(255, 255, 255, 0.05)',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
