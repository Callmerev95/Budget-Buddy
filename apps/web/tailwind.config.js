/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        text: "rgb(var(--text) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        accent: "rgb(var(--accent) / <alpha-value>)",
        "accent-fill": "rgb(var(--accent-fill) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
        "on-accent-fill": "rgb(var(--on-accent-fill) / <alpha-value>)",
        income: "rgb(var(--income) / <alpha-value>)",
        expense: "rgb(var(--expense) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
      },
      borderRadius: {
        control: "var(--radius-control)",
        card: "var(--radius-card)",
        sheet: "var(--radius-sheet)",
        hero: "var(--radius-hero)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
      },
      fontFamily: {
        sans: [
          '"Inter Variable"',
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"Segoe UI"',
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
