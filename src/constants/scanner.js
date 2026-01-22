/**
 * Scanner configuration constants
 * Centralized configuration for barcode scanner behavior
 */

/**
 * Time interval between scan attempts in milliseconds
 * Lower = faster detection but more CPU usage
 * 100ms = 10 scans/sec (good balance)
 * @constant {number}
 */
export const SCAN_INTERVAL_MS = 100;

/**
 * Duration of haptic feedback vibration in milliseconds
 * @constant {number}
 */
export const VIBRATION_DURATION_MS = 200;

/**
 * Canvas 2D context options optimized for frequent reading
 * - willReadFrequently: Optimizes for getImageData calls
 * - alpha: false reduces memory and improves performance
 * - desynchronized: Allows canvas to bypass event loop for faster rendering
 * @constant {Object}
 */
export const CANVAS_CONTEXT_OPTIONS = {
	willReadFrequently: true,
	alpha: false,
	desynchronized: true,
};

