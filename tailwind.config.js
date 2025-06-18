module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
    "node_modules/daisyui/dist/**/*.js",
  ],
  plugins: [require("daisyui")],
};
