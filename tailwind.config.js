/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { 950: "#070b16", 900: "#0b1222", 800: "#111a2e", 700: "#1a2540", 600: "#26324f" },
        electric: { 400: "#5cc8ff", 500: "#2fa8ff", 600: "#1b86e0" },
        violet: { 400: "#b69bff", 500: "#9a7bff", 600: "#7c5cf0" },
        danger: "#ff7a8a",
        safe: "#5fe3a1",
        caution: "#ffd166",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["'Space Grotesk'", "Inter", "sans-serif"],
      },
      keyframes: {
        rise: { "0%": { opacity: "0", transform: "translateY(8px)" }, "100%": { opacity: "1", transform: "none" } },
      },
      animation: { rise: "rise .35s ease-out both" },
    },
  },
  plugins: [],
};
