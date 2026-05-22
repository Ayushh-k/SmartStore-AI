/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Inter'", "sans-serif"],
        montserrat: ["'Montserrat'", "sans-serif"],
      },
      colors: {
        background: "#0a0a0a",
        primary: "#ffffff", // Pure white for primary accent
        primaryDark: "#e5e5e5",
        gold: "#D4AF37",    // Champagne gold for special accents
        card: "#121212",
        borderGlass: "rgba(255, 255, 255, 0.1)",
      },
      boxShadow: {
        glass: "none",
        luxury: "0 10px 40px rgba(0, 0, 0, 0.5)",
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
