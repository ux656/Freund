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
          DEFAULT: "rgb(var(--theme-bg) / <alpha-value>)",
          light: "#F9F9F7",
        },
        surface: {
          DEFAULT: "rgb(var(--theme-surface) / <alpha-value>)",
          light: "#F0F0EB",
        },
        "surface-2": {
          DEFAULT: "rgb(var(--theme-surface-2) / <alpha-value>)",
          light: "#E7E7E0",
        },
        "surface-3": {
          DEFAULT: "rgb(var(--theme-surface-3) / <alpha-value>)",
          light: "#DDDDD5",
        },
        text: {
          DEFAULT: "rgb(var(--theme-text) / <alpha-value>)",
          light: "#181816",
        },
        "text-2": {
          DEFAULT: "rgb(var(--theme-text-2) / <alpha-value>)",
          light: "#55534D",
        },
        "text-3": {
          DEFAULT: "rgb(var(--theme-text-3) / <alpha-value>)",
          light: "#5D5B54",
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
          DEFAULT: "rgb(var(--theme-border) / <alpha-value>)",
          light: "#C5C5BA",
        },
        input: {
          DEFAULT: "rgb(var(--theme-input) / <alpha-value>)",
          light: "#F0EFE8",
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
          "inset 0 1px 0 rgba(255,255,255,0.55), 0 12px 32px -14px rgba(15,23,42,0.18)",
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
