/**
 * Scanner configuration constants
 * Centralized configuration for barcode scanner behavior
 */

/**
 * Time interval between scan attempts in milliseconds
 * @constant {number}
 */
export const SCAN_INTERVAL_MS = 100;

/**
 * Duration of haptic feedback vibration in milliseconds
 * @constant {number}
 */
export const VIBRATION_DURATION_MS = 300;

/**
 * Canvas 2D context options optimized for frequent reading
 * @constant {Object}
 */
export const CANVAS_CONTEXT_OPTIONS = {
	willReadFrequently: true,
	alpha: false,
};

/**
 * Audio configuration
 * @constant {Object}
 */
export const AUDIO_CONFIG = {
	BEEP_PATH: "sounds/beep.mp3",
	PRELOAD: "auto",
};
