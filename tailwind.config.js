/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        arabic: ["'IBM Plex Sans Arabic'", "Tahoma", "sans-serif"],
        latin: ["'IBM Plex Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          DEFAULT: "#0B1F1B",
          soft: "#33453F",
        },
        primary: {
          50: "#EAF4F0",
          100: "#CFE6DC",
          200: "#9FCDB9",
          300: "#6FB396",
          400: "#3F9A73",
          500: "#1F7D57",
          600: "#125C40",
          700: "#0E4A34",
          800: "#0B3B29",
          900: "#082B1E",
          950: "#051A13",
        },
        sand: {
          50: "#FBF8F1",
          100: "#F5EEDC",
          200: "#E9D9B3",
          300: "#DCC488",
          400: "#CFAE60",
          500: "#C09A43",
          600: "#9C7B32",
        },
        surface: {
          DEFAULT: "#FBFAF7",
          alt: "#F3F1EA",
        },
      },
      boxShadow: {
        soft: "0 20px 60px -20px rgba(11, 31, 27, 0.25)",
      },
    },
  },
  plugins: [],
};
