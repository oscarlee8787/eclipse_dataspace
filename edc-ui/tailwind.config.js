/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'edc-blue': '#0066CC',
        'edc-dark': '#003366',
      }
    },
  },
  plugins: [],
}