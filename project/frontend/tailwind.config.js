/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0F172A",
        surface: "#1E293B",
        primary: "#3B82F6",
        toxic: "#EF4444",
        safe: "#10B981"
      }
    },
  },
  plugins: [],
}
