import type { Config } from "tailwindcss";

export default {
  darkMode: "selector",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgba(var(--background))",
        primary: "rgba(var(--primary))",
        heading: "rgba(var(--heading))",
        link: "rgba(var(--link))",
        visited: "rgba(var(--visited))",
        underline: "rgba(var(--underline))",
        hover: "rgba(var(--hover))",

        light: "rgba(255, 255, 255)",
        dark: "rgba(1, 36, 46)",
        yellow: "rgba(241, 231, 208)",
      },
    },
  },
  plugins: [],
} satisfies Config;
