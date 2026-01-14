/**
 * Get current theme colors from CSS custom properties
 * @returns {Object} Theme color values
 */
export const getThemeColors = () => {
	const get = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
	return {
		primary: get("--color-primary"),
		secondary: get("--color-secondary"),
		background: get("--b1"),
	};
};
