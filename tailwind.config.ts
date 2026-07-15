import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Matte Olive palette — muted, desaturated greens paired with warm cream & charcoal
        olive: {
          50: "#f5f6f0",
          100: "#e8ead9",
          200: "#d3d8b8",
          300: "#b8c091",
          400: "#9daa6f",
          500: "#7f8f52", // primary accent
          600: "#657240",
          700: "#4f5a34",
          800: "#41492e",
          900: "#373d2a",
          950: "#1c2015",
        },
        cream: {
          50: "#fdfcf8",
          100: "#f8f5ec",
          200: "#f0ead9",
        },
        charcoal: {
          700: "#2b2b26",
          800: "#1f1f1b",
          900: "#161614",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
      boxShadow: {
        olive: "0 8px 30px -8px rgba(79, 90, 52, 0.35)",
      },
      backgroundImage: {
        "olive-grain":
          "radial-gradient(circle at 20% 20%, rgba(127,143,82,0.15), transparent 40%), radial-gradient(circle at 80% 60%, rgba(65,73,46,0.2), transparent 45%)",
      },
    },
  },
  plugins: [],
};

export default config;
