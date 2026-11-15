import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#141413",
          light: "#FAF9F5",
        },
        surface: {
          DEFAULT: "#1F1E1D",
          light: "#FFFFFF",
        },
        "surface-2": {
          DEFAULT: "#262624",
          light: "#F5F0E8",
        },
        "surface-3": {
          DEFAULT: "#30302E",
          light: "#EFE9DE",
        },
        text: {
          DEFAULT: "#FAF9F5",
          light: "#141413",
        },
        "text-2": {
          DEFAULT: "#B0AEA5",
          light: "#6C6A64",
        },
        "text-3": {
          DEFAULT: "#73726C",
          light: "#B0AEA5",
        },
        primary: {
          DEFAULT: "#D97757",
          hover: "#C96442",
        },
        green: {
          DEFAULT: "#22c55e",
          light: "#16a34a",
        },
        gold: {
          DEFAULT: "#E8A55A",
          light: "#D4A017",
        },
        danger: {
          DEFAULT: "#FF8A80", // رُفع التباين حسب طلبك
          light: "#B83232",
        },
        border: {
          DEFAULT: "#30302E",
          light: "#E6DFD8",
        },
        input: {
          DEFAULT: "#1A1918",
          light: "#F5F0E8",
        },
      },
      fontFamily: {
        arabic: ["Lemonada", "IBM Plex Sans Arabic", "sans-serif"],
        display: ["Playfair Display", "Amiri", "serif"],
        body: ["Lemonada", "Inter", "sans-serif"],
      },
      borderRadius: {
        glass: "28px",
        "glass-sm": "12px",
        pill: "999px",
      },
      boxShadow: {
        glass: "inset 0 1px 0 rgba(255,255,255,0.18), 0 12px 32px -14px rgba(0,0,0,0.45)",
        "glass-light":
          "inset 0 1px 0 rgba(255,255,255,0.8), 0 12px 32px -14px rgba(15,23,42,0.14)",
      },
      backgroundImage: {
        "glass-rim":
          "linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.06) 35%, rgba(255,255,255,0.06) 65%, rgba(255,255,255,0.6))",
        "glass-rim-light":
          "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.2) 35%, rgba(255,255,255,0.2) 65%, rgba(255,255,255,0.9))",
      },
      animation: {
        "liquid-float": "liquidFloat 8s ease-in-out infinite",
        "liquid-float-slow": "liquidFloat 14s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "digit-pop": "digitPop 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "fade-up": "fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both",
      },
      keyframes: {
        liquidFloat: {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(2%, -3%) scale(1.04)" },
          "66%": { transform: "translate(-2%, 2%) scale(0.97)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.4" },
        },
        digitPop: {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.85)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
