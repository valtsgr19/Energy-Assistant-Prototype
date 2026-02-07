/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'energy-green': '#10b981',
        'energy-yellow': '#fbbf24',
        'energy-red': '#ef4444',
      },
    },
  },
  plugins: [],
}
