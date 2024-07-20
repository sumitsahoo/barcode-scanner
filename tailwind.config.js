const withMT = require("@material-tailwind/react/utils/withMT");

module.exports = withMT({
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#78909C",
          DEFAULT: "#78909C", // Default primary color
          dark: "#78909C",
        },
      },
    },
  },
  plugins: [],
});
