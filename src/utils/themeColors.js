/**
 * Utility to get DaisyUI/Tailwind theme colors from CSS variables
 * @module themeColors
 */

/**
 * Get CSS variable value from document root
 * @param {string} name - CSS variable name
 * @returns {string} CSS variable value
 */
const getVar = (name) =>
	getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Get current theme colors from CSS custom properties
 * @returns {Object} Theme color values
 * @property {string} primary - Primary theme color
 * @property {string} secondary - Secondary theme color
 * @property {string} background - Background color
 */
export function getThemeColors() {
	return {
		primary: getVar("--color-primary"),
		secondary: getVar("--color-secondary"),
		background: getVar("--b1"),
	};
}
