import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ['"IBM Plex Sans Arabic"', "system-ui", "sans-serif"] },
      colors: {
        brand: { 50: "#eef4ff", 100: "#dbe7ff", 400: "#5b8cff", 500: "#3b6ef5", 600: "#2a56d6", 700: "#2245ad" },
      },
      boxShadow: { panel: "0 1px 2px rgb(0 0 0 / .04), 0 8px 24px -12px rgb(0 0 0 / .15)" },
    },
  },
  plugins: [],
} satisfies Config;
