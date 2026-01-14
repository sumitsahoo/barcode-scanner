/**
 * Environment configuration and validation
 * Validates required environment variables at runtime
 */

/**
 * Required environment variables
 * @constant {string[]}
 */
const REQUIRED_ENV_VARS = ["VITE_APP_BASE_PATH"];

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
export const validateEnv = () => {
	const missing = REQUIRED_ENV_VARS.filter(
		(varName) => !import.meta.env[varName],
	);

	if (missing.length > 0) {
		throw new Error(
			`Missing required environment variables: ${missing.join(", ")}`,
		);
	}
};

/**
 * Get base path from environment
 * @returns {string} The base path for the application
 */
export const getBasePath = () => import.meta.env.VITE_APP_BASE_PATH || "/";

// Validate environment on module load
validateEnv();
