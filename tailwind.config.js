/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Sora", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      colors: {
        ink: "#0E2439",
        slate: {
          DEFAULT: "#5C6B7D",
          light: "#8B98A8",
        },
        surface: {
          DEFAULT: "#F5F8FC",
          card: "#FFFFFF",
          border: "#E1E8F0",
        },
        primary: {
          DEFAULT: "#1B6FB0",
          50: "#EAF3FA",
          100: "#D2E6F4",
          300: "#5FA9DA",
          500: "#1B6FB0",
          600: "#165A8E",
          700: "#123B63",
          deep: "#123B63",
        },
        spark: "#FF6B4D",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "pulse-node": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.15)" },
        },
        "drift": {
          "0%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(12px, -10px)" },
          "100%": { transform: "translate(0, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "pulse-node": "pulse-node 2.4s ease-in-out infinite",
        "drift": "drift 8s ease-in-out infinite",
      },
      boxShadow: {
        card: "0 1px 2px rgba(14, 36, 57, 0.04), 0 8px 24px -12px rgba(14, 36, 57, 0.12)",
        "card-hover": "0 4px 8px rgba(14, 36, 57, 0.06), 0 16px 32px -12px rgba(14, 36, 57, 0.18)",
        glow: "0 0 0 4px rgba(255, 107, 77, 0.12)",
      },
    },
  },
  plugins: [],
};
