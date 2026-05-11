import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Press Start 2P'", "monospace"],
      },
      colors: {
        mc: {
          dirt: "#8B6914",
          grass: "#5D8A29",
          stone: "#9B9B9B",
          wood: "#8B5E2C",
          diamond: "#5EDFFF",
          gold: "#FFD700",
          red: "#FF4444",
          green: "#44FF44",
          dark: "#0A0A0A",
          panel: "#1A1A1A",
          border: "#2A2A2A",
          text: "#E8E8E8",
          muted: "#888888",
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 3s linear infinite",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
