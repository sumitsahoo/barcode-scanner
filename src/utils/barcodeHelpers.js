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
 * Find the camera device ID that supports torch/flash functionality
 * @returns {Promise<string|null>} Device ID with flash support or null
 */
export const getCameraIdWithFlash = async () => {
	const devices = await navigator.mediaDevices.enumerateDevices();
	for (const device of devices) {
		const constraints = {
			video: {
				deviceId: device.deviceId,
				facingMode: FACING_MODE.ENVIRONMENT,
			},
		};
		try {
			const stream = await navigator.mediaDevices.getUserMedia(constraints);
			const videoTrack = stream.getVideoTracks()[0];
			const capabilities = videoTrack.getCapabilities();
			if (capabilities.torch) {
				stream.getTracks().forEach((track) => {
					track.stop();
				});
				return device.deviceId;
			}
			stream.getTracks().forEach((track) => {
				track.stop();
			});
		} catch {
			// Ignore errors for unavailable devices
		}
	}
	return null;
};

/**
 * Get camera ID with flash support from localStorage or detect it
 * Caches the result in localStorage for future use
 * @returns {Promise<string|null>} Cached or newly detected camera ID with flash
 */
export const getAndSetCameraIdWithFlash = async () => {
	let cameraId = localStorage.getItem(STORAGE_KEY_CAMERA_ID);
	if (!cameraId) {
		cameraId = await getCameraIdWithFlash();
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
