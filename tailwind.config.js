/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,tsx}"],
  theme: {
    extend: {
      animation: {
        "paper-wiggle": "paper-wiggle 5s ease-in-out infinite",
        "underline-draw": "underline-draw 650ms ease-out both",
      },
      boxShadow: {
        paper: "0 14px 26px rgba(36, 49, 42, 0.055), 0 2px 0 rgba(36, 49, 42, 0.08)",
        "paper-sm": "0 8px 16px rgba(36, 49, 42, 0.055), 0 2px 0 rgba(36, 49, 42, 0.08)",
        inset: "inset 0 1px 0 rgba(255, 255, 255, 0.78)",
      },
      colors: {
        brand: {
          paper: "#fbfaf2",
          "paper-deep": "#f1f4e9",
          ink: "#24312a",
          graphite: "#4b564f",
          grid: "#a8bfd6",
          line: "#cad8c8",
          green: "#2E5C37",
          "green-soft": "#dcead7",
          highlighter: "#c9ef6a",
          tan: "#4b564f",
          "tan-dark": "#24312a",
          "tan-light": "#cad8c8",
          cream: "#fbfaf2",
        },
      },
      keyframes: {
        "paper-wiggle": {
          "0%, 100%": { transform: "rotate(-1.5deg) translateY(0)" },
          "50%": { transform: "rotate(1deg) translateY(-4px)" },
        },
        "underline-draw": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
