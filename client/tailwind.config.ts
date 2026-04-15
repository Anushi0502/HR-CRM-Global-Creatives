import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#003d73",
          900: "#005aa8",
          800: "#0078db",
          700: "#0095ff",
          600: "#2ba8ff",
          500: "#67c4ff",
          200: "#cfeeff",
          100: "#e9f7ff",
          50: "#f7fcff",
        },
        accent: {
          600: "#0078db",
          500: "#0095ff",
          200: "#cfeeff",
          100: "#e9f7ff",
          50: "#f7fcff",
        },
        secondary: {
          600: "#0078db",
          500: "#0095ff",
          200: "#cfeeff",
          100: "#e9f7ff",
          50: "#f7fcff",
        },
        ink: "#0f172a",
        base: "#f7fcff",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Sora", "Manrope", "sans-serif"],
      },
      boxShadow: {
        soft: "0 18px 40px -24px rgba(0, 149, 255, 0.28)",
        panel: "0 26px 80px -36px rgba(0, 149, 255, 0.3)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      screens: {
        short: { raw: "(max-height: 800px)" },
        xshort: { raw: "(max-height: 700px)" },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(138deg, #ffffff 0%, #cfeeff 42%, #0095ff 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
