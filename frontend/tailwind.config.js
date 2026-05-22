/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        primary: "#6366f1",
        primaryDark: "#4f46e5",
        card: "rgba(15, 23, 42, 0.85)", // slate-900 with glass
        borderGlass: "rgba(148, 163, 184, 0.35)", // slate-400
      },
      boxShadow: {
        glass: "0 10px 60px rgba(15, 23, 42, 0.85)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
