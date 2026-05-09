/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
    "./src/data/**/*.{js,jsx}",
    "./src/pages/**/*.{js,jsx}",
    "./src/services/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          ink: "#172033",
          blue: "#2563eb",
          teal: "#0f766e",
          mint: "#dff8ef",
          gold: "#f59e0b",
          cloud: "#f6f8fb"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 51, 0.10)"
      }
    }
  },
  plugins: []
};
