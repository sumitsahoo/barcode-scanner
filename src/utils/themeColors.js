// utils/themeColors.js
// Utility to get DaisyUI/Tailwind theme colors from CSS variables

export function getThemeColors() {
  const getVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return {
    primary: getVar("--color-primary"),
    secondary: getVar("--color-secondary"),
    background: getVar("--b1"),
  };
}
