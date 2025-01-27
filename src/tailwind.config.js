// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        primary: "#007bff",
        secondary: "#f8f9fa",
        "gray-50": "#f7fafc",
      },
    },
  },
  plugins: [],
};
