import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        graphite: "#1f2937",
        violetink: "#4c1d95",
        peach: "#fff4eb",
        sunset: "#f97316",
        lime: "#16a34a",
        rust: "#dc2626",
        amberline: "#f59e0b"
      },
      boxShadow: {
        panel: "0 32px 80px rgba(31, 41, 55, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
