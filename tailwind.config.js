/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        admin: {
          bg: "#F4F6F9",
          blue: "#2B6BFF",
          "blue-hover": "#1F56E0",
          "blue-dark": "#1E4A9E",
          "blue-mid": "#4F8CFF",
          "blue-light": "#B8D4FF",
          "blue-bar-donation": "#A8C8FF",
          "blue-bar-donors": "#2563EB",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 14px rgba(15, 23, 42, 0.04)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
}
