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
        ink: "#102320",
        mist: "#eff6f2",
        pine: "#194d3d",
        moss: "#2f7a64",
        gold: "#e5b24f"
      },
      boxShadow: {
        panel: "0 30px 80px rgba(16, 35, 32, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
