/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#effcfa",
          100: "#c9f5ef",
          200: "#94ebe0",
          300: "#5cd9cc",
          400: "#2fc0b3",
          500: "#149c92",
          600: "#0f7d76",
          700: "#0d6560",
          800: "#0e514e",
          900: "#0d4441",
          950: "#042625",
        },
        steel: {
          50: "#f8f9fb",
          100: "#eef0f3",
          200: "#dfe3e8",
          300: "#c3c9d2",
          400: "#a0a8b4",
          500: "#818a97",
          600: "#6b7380",
          700: "#565d68",
          800: "#3d434c",
          900: "#23272d",
          950: "#15171b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Manrope", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.03)",
        card: "0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.03)",
        "card-hover": "0 4px 12px -2px rgba(15, 23, 42, 0.08), 0 2px 4px -1px rgba(15, 23, 42, 0.03)",
        popover: "0 12px 32px -6px rgba(15, 23, 42, 0.12), 0 4px 12px -4px rgba(15, 23, 42, 0.05)",
        "inner-ring": "inset 0 0 0 1px rgba(15, 23, 42, 0.06)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
