import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0a1f3d",
        police: "#1a3a6b",
        action: "#2563eb",
        paper: "#f8fafc",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(10, 31, 61, 0.12)",
      },
      fontFamily: {
        sans: ["Inter", "Segoe UI", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
