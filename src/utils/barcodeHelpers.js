/**
 * Utility functions for barcode scanning and camera management
 * @module barcodeHelpers
 */

import {
	CAMERA_DEFAULTS,
	DESKTOP_CAMERA_SETTINGS,
	FACING_MODE,
	MOBILE_CAMERA_SETTINGS,
	STORAGE_KEY_CAMERA_ID,
	ZOOM_LEVELS,
} from "../constants/camera";

/**
 * Detect if the current device is a mobile phone or tablet
 * @returns {boolean} True if device is a phone/tablet
 */
export const isPhone = () =>
	/Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

/**
 * Convert color image data to grayscale using luminosity method
 * Optimized for performance using bitwise operations
 * @param {ImageData} imageData - Canvas ImageData object to convert
 * @returns {ImageData} Modified ImageData with grayscale values
 */
export const convertToGrayscale = (imageData) => {
	const data = imageData.data;
	const len = data.length;

	// Optimized grayscale conversion using luminosity method
	// More accurate than simple average and uses bitwise operations for speed
	for (let i = 0; i < len; i += 4) {
		// Luminosity method: 0.299*R + 0.587*G + 0.114*B
		// Using bit shifts for faster multiplication approximation
		const gray = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
		data[i] = gray;
		data[i + 1] = gray;
		data[i + 2] = gray;
		// Alpha channel (data[i + 3]) remains unchanged
	}
	return imageData;
};

/**
 * Determine the best rear camera for scanning based on various criteria
 * Prioritizes: main/wide camera > torch support > highest resolution
 * Works across Android and iOS devices with multiple cameras
 * @returns {Promise<string|null>} Device ID of the best rear camera or null
 */
export const getBestRearCamera = async () => {
	const devices = await navigator.mediaDevices.enumerateDevices();
	const videoDevices = devices.filter((device) => device.kind === "videoinput");

	if (videoDevices.length === 0) return null;

	let bestCamera = null;
	let bestScore = -1;

	for (const device of videoDevices) {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: { deviceId: { exact: device.deviceId } },
			});

			const videoTrack = stream.getVideoTracks()[0];
			const capabilities = videoTrack.getCapabilities();
			const settings = videoTrack.getSettings();

			// Stop the stream immediately
			for (const track of stream.getTracks()) {
				track.stop();
			}

			// Skip front-facing cameras
			if (settings.facingMode === "user") continue;

			let score = 0;
			const label = device.label.toLowerCase();

			// Priority 1: Identify main/wide camera by label (highest priority)
			// iOS: "back camera" or "wide" or "camera 0"
			// Android: "camera 0" or "back camera" or "main camera"
			if (
				label.includes("back camera") &&
				!label.includes("ultra") &&
				!label.includes("telephoto")
			) {
				score += 100;
			} else if (label.includes("wide") && !label.includes("ultra")) {
				score += 100;
			} else if (label.match(/camera\s*0|main/i)) {
				score += 100;
			}

			// Priority 2: Torch/flash capability (strong indicator of main camera)
			if (capabilities.torch) {
				score += 50;
			}

			// Priority 3: Resolution (higher is better for scanning)
			if (capabilities.width?.max) {
				score += Math.min(capabilities.width.max / 100, 30); // Cap at 30 points
			}

			// Priority 4: Prefer environment facing mode
			if (settings.facingMode === "environment") {
				score += 20;
			}

			// Penalty: Avoid ultra-wide and telephoto cameras
			if (
				label.includes("ultra") ||
				label.includes("telephoto") ||
				label.includes("tele")
			) {
				score -= 50;
			}

			if (score > bestScore) {
				bestScore = score;
				bestCamera = device.deviceId;
			}
		} catch (error) {
			// Camera not accessible, skip it
			console.warn(`Could not access camera: ${device.label}`, error);
		}
	}

	return bestCamera;
};

/**
 * Legacy function - Find the camera device ID that supports torch/flash functionality
 * @deprecated Use getBestRearCamera() instead for better cross-platform support
 * @returns {Promise<string|null>} Device ID with flash support or null
 */
export const getCameraIdWithFlash = async () => {
	// Use the new improved method
	return getBestRearCamera();
};

/**
 * Get best rear camera ID from localStorage or detect it
 * Caches the result in localStorage for future use
 * @returns {Promise<string|null>} Cached or newly detected camera ID
 */
export const getAndSetCameraIdWithFlash = async () => {
	let cameraId = localStorage.getItem(STORAGE_KEY_CAMERA_ID);
	if (!cameraId) {
		cameraId = await getBestRearCamera();
		if (cameraId) {
			localStorage.setItem(STORAGE_KEY_CAMERA_ID, cameraId);
		}
	}
	return cameraId;
};

/**
 * Get optimized media constraints for camera access
 * Automatically adjusts settings based on device type and facing mode
 * @param {string} facingMode - Camera facing mode ('user' or 'environment')
 * @returns {Promise<MediaStreamConstraints>} Media constraints object
 */
export const getMediaConstraints = async (facingMode) => {
	const baseSettings = isPhone()
		? MOBILE_CAMERA_SETTINGS
		: DESKTOP_CAMERA_SETTINGS;

	const customConstraints = {
		audio: false,
		video: {
			...baseSettings,
			...CAMERA_DEFAULTS,
			facingMode,
			zoom:
				facingMode === FACING_MODE.USER ? ZOOM_LEVELS.FRONT : ZOOM_LEVELS.BACK,
		},
	};

	// For back camera on mobile, try to use camera with flash
	if (facingMode === FACING_MODE.ENVIRONMENT && isPhone()) {
		const cameraId = await getAndSetCameraIdWithFlash();
		if (cameraId) {
			customConstraints.video.deviceId = cameraId;
		}
	}

	return customConstraints;
};

/**
 * Stop all media tracks in a stream
 * Properly releases camera/microphone resources
 * @param {MediaStream} stream - MediaStream to stop
 */
export const stopAllTracks = (stream) => {
	if (stream) {
		const tracks = stream.getTracks();
		for (const track of tracks) {
			track.stop();
		}
	}
};
