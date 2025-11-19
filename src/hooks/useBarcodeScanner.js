import { useCallback, useEffect, useRef, useState } from "react";
import {
	CANVAS_CONTEXT_OPTIONS,
	SCAN_INTERVAL_MS,
	VIBRATION_DURATION_MS,
} from "../constants/scanner";
import { getMediaConstraints, stopAllTracks } from "../utils/barcodeHelpers";

/**
 * Custom hook for barcode scanning logic and camera state management
 * Handles video stream, barcode detection, and camera controls
 * Optimized for React 19 performance improvements
 *
 * @returns {Object} Scanner state and control functions
 * @property {Object} scanState - Current state of the scanner
 * @property {React.RefObject} videoRef - Reference to video element
 * @property {React.RefObject} canvasRef - Reference to canvas element
 * @property {React.RefObject} audioRef - Reference to audio element
 * @property {Function} handleScan - Start scanning function
 * @property {Function} handleStopScan - Stop scanning function
 * @property {Function} handleSwitchCamera - Switch camera facing mode
 * @property {Function} handleToggleTorch - Toggle camera torch/flash
 * @property {Function} handleDataCopy - Copy scanned data to clipboard
 * @property {Function} handleShowDialog - Toggle result dialog
 */
export const useBarcodeScanner = () => {
	const [scanState, setScanState] = useState({
		isScanning: false,
		facingMode: "environment",
		isTorchOn: false,
		showDialog: false,
		data: { typeName: "", scanData: "" },
	});

	// Refs for DOM elements and scanning state
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const audioRef = useRef(null);
	const contextRef = useRef(null);

	// Refs for scanning control
	const animationFrameId = useRef(null);
	const workerRef = useRef(null);
	const lastScanTimeRef = useRef(0);
	const isScanningRef = useRef(scanState.isScanning);

	// Keep ref in sync with state for scan loop optimization
	useEffect(() => {
		isScanningRef.current = scanState.isScanning;
	}, [scanState.isScanning]);

	/**
	 * Handle errors during scanning or camera operations
	 * @param {Error} error - The error that occurred
	 */
	const handleError = useCallback((error) => {
		console.error("Scanner Error:", error);
		setScanState((prev) => ({ ...prev, isScanning: false, data: null }));
	}, []);

	/**
	 * Stop scanning and cleanup resources
	 */
	const handleStopScan = useCallback(() => {
		isScanningRef.current = false;
		setScanState((prev) => ({ ...prev, isScanning: false, isTorchOn: false }));

		if (animationFrameId.current) {
			cancelAnimationFrame(animationFrameId.current);
			animationFrameId.current = null;
		}

		if (videoRef.current) {
			videoRef.current.pause();
			if (videoRef.current.srcObject) {
				stopAllTracks(videoRef.current.srcObject);
				videoRef.current.srcObject = null;
			}
		}
	}, []);

	// Initialize Web Worker
	useEffect(() => {
		workerRef.current = new Worker(
			new URL("../workers/scanner.worker.js", import.meta.url),
			{ type: "module" },
		);

		workerRef.current.onmessage = (e) => {
			const { found, data, error } = e.data;

			if (found) {
				isScanningRef.current = false;

				setScanState((prev) => ({
					...prev,
					isScanning: false,
					data: data,
					showDialog: true,
				}));

				handleStopScan();
				window?.navigator?.vibrate?.(VIBRATION_DURATION_MS);
				audioRef.current?.play().catch(() => {});
			} else if (error) {
				console.error("Worker error:", error);
			}
		};

		return () => {
			workerRef.current?.terminate();
		};
	}, [handleStopScan]);

	/**
	 * Initialize and start the barcode scanning process
	 */
	const handleScan = useCallback(async () => {
		setScanState((prev) => ({ ...prev, data: null, isScanning: true }));

		try {
			const mediaConstraints = await getMediaConstraints(scanState.facingMode);
			const stream =
				await navigator.mediaDevices.getUserMedia(mediaConstraints);

			if (!videoRef.current) return;
			videoRef.current.srcObject = stream;
			await videoRef.current.play();

			const canvas = canvasRef.current;
			if (!canvas) return;

			// Reuse context for better performance
			if (!contextRef.current) {
				contextRef.current = canvas.getContext("2d", CANVAS_CONTEXT_OPTIONS);
			}
			const context = contextRef.current;

			const width = videoRef.current.videoWidth;
			const height = videoRef.current.videoHeight;

			// Downscale for performance - limit max dimension to 1280px
			// This significantly reduces image processing time (grayscale + scanning)
			const MAX_SCAN_DIMENSION = 1280;
			const scale = Math.min(
				MAX_SCAN_DIMENSION / width,
				MAX_SCAN_DIMENSION / height,
				1,
			);
			const scanWidth = Math.floor(width * scale);
			const scanHeight = Math.floor(height * scale);

			canvas.width = scanWidth;
			canvas.height = scanHeight;

			/**
			 * Animation loop for continuous barcode scanning
			 */
			const scanTick = async () => {
				if (!isScanningRef.current) return;

				const now = Date.now();
				const timeSinceLastScan = now - lastScanTimeRef.current;

				if (timeSinceLastScan < SCAN_INTERVAL_MS) {
					animationFrameId.current = requestAnimationFrame(scanTick);
					return;
				}

				lastScanTimeRef.current = now;

				try {
					if (!videoRef.current || !context) return;

					// Draw video frame to canvas with scaling
					context.drawImage(videoRef.current, 0, 0, scanWidth, scanHeight);
					const imageData = context.getImageData(0, 0, scanWidth, scanHeight);

					// Offload processing to worker
					// Transfer buffer to avoid copying (zero-copy transfer)
					workerRef.current.postMessage({ imageData, type: "scan" }, [
						imageData.data.buffer,
					]);

					// Continue loop - worker will message back if found
					animationFrameId.current = requestAnimationFrame(scanTick);
				} catch (err) {
					console.error("Scan tick error:", err);
					animationFrameId.current = requestAnimationFrame(scanTick);
				}
			};

			animationFrameId.current = requestAnimationFrame(scanTick);
		} catch (error) {
			handleError(error);
		}
	}, [scanState.facingMode, handleError]);

	/**
	 * Switch between front and back cameras
	 */
	const handleSwitchCamera = useCallback(async () => {
		if (!videoRef.current || !isScanningRef.current) return;

		const newFacingMode =
			scanState.facingMode === "user" ? "environment" : "user";

		try {
			if (videoRef.current.srcObject) {
				stopAllTracks(videoRef.current.srcObject);
			}

			const mediaConstraints = await getMediaConstraints(newFacingMode);
			const stream =
				await navigator.mediaDevices.getUserMedia(mediaConstraints);
			videoRef.current.srcObject = stream;
			await videoRef.current.play();

			const canvas = canvasRef.current;
			if (canvas) {
				canvas.width = videoRef.current.videoWidth;
				canvas.height = videoRef.current.videoHeight;
			}

			setScanState((prev) => ({
				...prev,
				facingMode: newFacingMode,
				isTorchOn: false,
			}));
		} catch (error) {
			console.error("Camera switch error:", error);
			handleError(error);
		}
	}, [scanState.facingMode, handleError]);

	/**
	 * Toggle the camera torch/flashlight
	 */
	const handleToggleTorch = useCallback(async () => {
		if (!videoRef.current?.srcObject) return;

		const tracks = videoRef.current.srcObject.getVideoTracks();
		if (!tracks?.length) return;

		const track = tracks[0];
		const capabilities = track.getCapabilities();

		if (!capabilities.torch) {
			console.warn("Torch not supported on this device");
			return;
		}

		try {
			const newTorchState = !scanState.isTorchOn;
			await track.applyConstraints({
				advanced: [{ torch: newTorchState }],
			});
			setScanState((prev) => ({ ...prev, isTorchOn: newTorchState }));
		} catch (error) {
			console.error("Torch toggle error:", error);
		}
	}, [scanState.isTorchOn]);

	/**
	 * Copy scanned barcode data to clipboard
	 */
	const handleDataCopy = useCallback(async () => {
		if (!scanState.data?.scanData) return;

		try {
			await navigator.clipboard.writeText(scanState.data.scanData);
		} catch (error) {
			console.error("Clipboard copy error:", error);
		}

		setScanState((prev) => ({ ...prev, showDialog: false }));
	}, [scanState.data?.scanData]);

	/**
	 * Toggle the result dialog visibility
	 */
	const handleShowDialog = useCallback(() => {
		setScanState((prev) => ({ ...prev, showDialog: !prev.showDialog }));
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			isScanningRef.current = false;

			if (animationFrameId.current) {
				cancelAnimationFrame(animationFrameId.current);
				animationFrameId.current = null;
			}

			if (videoRef.current) {
				if (videoRef.current.srcObject) {
					stopAllTracks(videoRef.current.srcObject);
					videoRef.current.srcObject = null;
				}
				videoRef.current.pause();
			}

			// Clear context reference
			contextRef.current = null;
		};
	}, []);

	return {
		scanState,
		videoRef,
		canvasRef,
		audioRef,
		handleScan,
		handleStopScan,
		handleSwitchCamera,
		handleToggleTorch,
		handleDataCopy,
		handleShowDialog,
	};
};
