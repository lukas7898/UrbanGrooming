import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#F2D44B",
        dark: "#2D2D2D",
        background: "#F8F8F8",
        text: "#222222",
      },
      boxShadow: {
        soft: "0 18px 60px rgba(34, 34, 34, 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
