import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)", surface: "rgb(var(--surface) / <alpha-value>)", ink: "rgb(var(--ink) / <alpha-value>)", muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)", mango: "rgb(var(--mango) / <alpha-value>)", pink: "rgb(var(--pink) / <alpha-value>)", mint: "rgb(var(--mint) / <alpha-value>)",
      },
      fontFamily: { display: ["var(--font-display)", "sans-serif"], sans: ["var(--font-body)", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
