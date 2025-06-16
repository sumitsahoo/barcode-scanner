module.exports = {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", "node_modules/daisyui/dist/**/*.js"],
  // theme: {
  //   extend: {
  //     colors: {
  //       primary: {
  //         light: "#78909C",
  //         DEFAULT: "#78909C", // Default primary color
  //         dark: "#78909C",
  //       },
  //     },
  //   },
  // },
  plugins: [require("daisyui")],
};
