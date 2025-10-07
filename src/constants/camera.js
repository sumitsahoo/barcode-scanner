/**
 * Camera configuration constants
 * Device-specific camera settings for optimal scanning
 */

/**
 * Camera facing modes
 * @constant {Object}
 */
export const FACING_MODE = {
	ENVIRONMENT: "environment",
	USER: "user",
};

/**
 * Camera resolution settings for mobile devices
 * @constant {Object}
 */
export const MOBILE_CAMERA_SETTINGS = {
	height: { ideal: 1080 },
	width: { ideal: 1920 },
};

/**
 * Camera resolution settings for desktop devices
 * @constant {Object}
 */
export const DESKTOP_CAMERA_SETTINGS = {
	height: { ideal: 720 },
	width: { ideal: 1280 },
};

/**
 * Camera constraint defaults
 * @constant {Object}
 */
export const CAMERA_DEFAULTS = {
	aspectRatio: undefined,
	resizeMode: false,
	focusMode: "continuous",
	focusDistance: 0,
	exposureMode: "continuous",
	frameRate: { ideal: 15, max: 30 },
};

/**
 * Zoom levels for different camera modes
 * @constant {Object}
 */
export const ZOOM_LEVELS = {
	FRONT: 1,
	BACK: 2,
};

/**
 * Local storage key for camera ID with flash capability
 * @constant {string}
 */
export const STORAGE_KEY_CAMERA_ID = "cameraIdWithFlash";
