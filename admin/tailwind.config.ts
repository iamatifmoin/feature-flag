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
        slatebase: "#0f172a",
        tide: "#14365d",
        azure: "#2d72d9",
        skyglass: "#edf4ff",
        mint: "#16a34a",
        ember: "#dc2626",
        sun: "#f59e0b"
      },
      boxShadow: {
        panel: "0 32px 80px rgba(15, 23, 42, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
