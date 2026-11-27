import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)", surface: "var(--surface)", ink: "var(--ink)", muted: "var(--muted)",
        line: "var(--line)", mango: "var(--mango)", pink: "var(--pink)", mint: "var(--mint)",
      },
      fontFamily: { display: ["var(--font-display)", "sans-serif"], sans: ["var(--font-body)", "sans-serif"] },
    },
  },
  plugins: [],
};
export default config;
