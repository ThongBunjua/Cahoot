import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kahoot: {
          red: "#E21B3C",
          "red-dark": "#B8142F",
          blue: "#1368CE",
          "blue-dark": "#0E4E9E",
          yellow: "#D89E00",
          "yellow-light": "#FFA602",
          "yellow-dark": "#B28200",
          green: "#26890C",
          "green-dark": "#1D6B09",
          purple: "#46178F",
          "purple-dark": "#33106A",
          "purple-light": "#864CBF",
          dark: "#121024",
          "dark-surface": "#1F1B3B",
          "dark-card": "#2C2652",
        },
      },
      fontFamily: {
        sans: ["var(--font-montserrat)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
      animation: {
        "bounce-subtle": "bounce-subtle 2s infinite ease-in-out",
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scale-up": "scaleUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "float": "float 3s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        scaleUp: {
          "0%": { transform: "scale(0.8)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-10px) rotate(3deg)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      boxShadow: {
        "3d-red": "0 6px 0 #B8142F, 0 10px 15px -3px rgba(0,0,0,0.3)",
        "3d-blue": "0 6px 0 #0E4E9E, 0 10px 15px -3px rgba(0,0,0,0.3)",
        "3d-yellow": "0 6px 0 #B28200, 0 10px 15px -3px rgba(0,0,0,0.3)",
        "3d-green": "0 6px 0 #1D6B09, 0 10px 15px -3px rgba(0,0,0,0.3)",
        "3d-purple": "0 6px 0 #33106A, 0 10px 15px -3px rgba(0,0,0,0.3)",
        "3d-white": "0 6px 0 #CBD5E1, 0 10px 15px -3px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
