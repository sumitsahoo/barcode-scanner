import { useCallback, useEffect, useRef, useState } from "react";
import { CANVAS_CONTEXT_OPTIONS, SCAN_INTERVAL_MS, VIBRATION_DURATION_MS } from "../constants/scanner";
import { getMediaConstraints, stopAllTracks } from "../utils/barcodeHelpers";
import { playScanSound } from "../utils/sound";

/**
 * Custom hook for barcode scanning logic and camera state management
 * Handles video stream, barcode detection, and camera controls
 *
 * @returns {Object} Scanner state and control functions
 */
export const useBarcodeScanner = () => {
	const [scanState, setScanState] = useState({
		isScanning: false,
		facingMode: "environment",
		isTorchOn: false,
		showDialog: false,
		data: { typeName: "", scanData: "" },
	});

	// Refs for DOM elements
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const contextRef = useRef(null);

	// Refs for scanning control - using a single session ID to track scan sessions
	const animationFrameId = useRef(null);
	const workerRef = useRef(null);
	const lastScanTimeRef = useRef(0);

	// Session-based tracking: each scan gets a unique session ID
	// This prevents stale results from previous sessions being processed
	const scanSessionRef = useRef(0);
	const isWorkerBusy = useRef(false);

	/**
	 * Stop scanning and cleanup resources
	 */
	const handleStopScan = useCallback(() => {
		scanSessionRef.current += 1;

		if (animationFrameId.current) {
			cancelAnimationFrame(animationFrameId.current);
			animationFrameId.current = null;
		}

		if (videoRef.current) {
			videoRef.current.pause();
			stopAllTracks(videoRef.current.srcObject);
			videoRef.current.srcObject = null;
		}

		setScanState((prev) => ({ ...prev, isScanning: false, isTorchOn: false }));
	}, []);

	const handleDetectionRef = useRef(null);
	handleDetectionRef.current = (data) => {
		handleStopScan();
		setScanState((prev) => ({ ...prev, data, showDialog: true }));
		window?.navigator?.vibrate?.(VIBRATION_DURATION_MS);
		playScanSound();
	};

	// Initialize Web Worker - only once on mount
	useEffect(() => {
		workerRef.current = new Worker(new URL("../workers/scanner.worker.js", import.meta.url), { type: "module" });

		workerRef.current.onmessage = (e) => {
			const { found, data, sessionId } = e.data;
			isWorkerBusy.current = false;

			// Only process if this result belongs to current session
			if (sessionId === scanSessionRef.current && found && data) {
				handleDetectionRef.current?.(data);
			}
		};

		workerRef.current.onerror = () => {
			isWorkerBusy.current = false;
		};

		return () => {
			if (workerRef.current) {
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, []); // Empty deps - worker should only be created once

	/**
	 * Initialize and start the barcode scanning process
	 */
	const handleScan = useCallback(async () => {
		scanSessionRef.current += 1;
		const currentSession = scanSessionRef.current;
		isWorkerBusy.current = false;
		lastScanTimeRef.current = 0;

		setScanState((prev) => ({ ...prev, data: null, isScanning: true, showDialog: false }));

		try {
			const mediaConstraints = await getMediaConstraints(scanState.facingMode);
			const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

			// Check if session is still valid (user might have stopped before camera loaded)
			if (currentSession !== scanSessionRef.current) {
				stopAllTracks(stream);
				return;
			}

			if (!videoRef.current) {
				stopAllTracks(stream);
				return;
			}

			videoRef.current.srcObject = stream;
			await videoRef.current.play();

			// Double-check session is still valid after video starts
			if (currentSession !== scanSessionRef.current) {
				handleStopScan();
				return;
			}

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
			const MAX_SCAN_DIMENSION = 1280;
			const scale = Math.min(MAX_SCAN_DIMENSION / width, MAX_SCAN_DIMENSION / height, 1);
			const scanWidth = Math.floor(width * scale);
			const scanHeight = Math.floor(height * scale);

			canvas.width = scanWidth;
			canvas.height = scanHeight;

			/**
			 * Animation loop for continuous barcode scanning
			 */
			const scanTick = () => {
				// Stop if session changed (scan was stopped or restarted)
				if (currentSession !== scanSessionRef.current) {
					return;
				}

				const now = Date.now();
				const timeSinceLastScan = now - lastScanTimeRef.current;

				// Throttle scan rate and don't send if worker is still processing
				if (timeSinceLastScan < SCAN_INTERVAL_MS || isWorkerBusy.current) {
					animationFrameId.current = requestAnimationFrame(scanTick);
					return;
				}

				lastScanTimeRef.current = now;

				try {
					if (!videoRef.current || !context || !workerRef.current) {
						animationFrameId.current = requestAnimationFrame(scanTick);
						return;
					}

					// Draw video frame to canvas with scaling
					context.drawImage(videoRef.current, 0, 0, scanWidth, scanHeight);
					const imageData = context.getImageData(0, 0, scanWidth, scanHeight);

					// Mark worker as busy before sending
					isWorkerBusy.current = true;

					// Send to worker with session ID for tracking
					workerRef.current.postMessage({ imageData, type: "scan", sessionId: currentSession }, [
						imageData.data.buffer,
					]);

					animationFrameId.current = requestAnimationFrame(scanTick);
				} catch {
					isWorkerBusy.current = false;
					animationFrameId.current = requestAnimationFrame(scanTick);
				}
			};

			animationFrameId.current = requestAnimationFrame(scanTick);
		} catch {
			handleStopScan();
		}
	}, [scanState.facingMode, handleStopScan]);

	/**
	 * Switch between front and back cameras
	 */
	const handleSwitchCamera = useCallback(async () => {
		if (!videoRef.current || !scanState.isScanning) return;

		const newFacingMode = scanState.facingMode === "user" ? "environment" : "user";
		const currentSession = scanSessionRef.current;

		try {
			if (videoRef.current.srcObject) {
				stopAllTracks(videoRef.current.srcObject);
			}

			const mediaConstraints = await getMediaConstraints(newFacingMode);

			// Check if session is still valid after async operation
			if (currentSession !== scanSessionRef.current) {
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

			// Check again after getting stream
			if (currentSession !== scanSessionRef.current) {
				stopAllTracks(stream);
				return;
			}

			if (!videoRef.current) {
				stopAllTracks(stream);
				return;
			}

			videoRef.current.srcObject = stream;
			await videoRef.current.play();

			// Final check after video starts
			if (currentSession !== scanSessionRef.current) {
				handleStopScan();
				return;
			}

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
		} catch {
			handleStopScan();
		}
	}, [scanState.facingMode, scanState.isScanning, handleStopScan]);

	const handleToggleTorch = useCallback(async () => {
		const track = videoRef.current?.srcObject?.getVideoTracks()?.[0];
		if (!track?.getCapabilities()?.torch) return;

		const newTorchState = !scanState.isTorchOn;
		await track.applyConstraints({ advanced: [{ torch: newTorchState }] }).catch(() => { });
		setScanState((prev) => ({ ...prev, isTorchOn: newTorchState }));
	}, [scanState.isTorchOn]);

	const handleDataCopy = useCallback(async () => {
		if (scanState.data?.scanData) {
			await navigator.clipboard.writeText(scanState.data.scanData).catch(() => { });
		}
		setScanState((prev) => ({ ...prev, showDialog: false }));
	}, [scanState.data?.scanData]);

	const handleShowDialog = useCallback(() => setScanState((prev) => ({ ...prev, showDialog: !prev.showDialog })), []);

	// Cleanup on unmount - store handleStopScan ref for cleanup
	const handleStopScanRef = useRef(handleStopScan);
	handleStopScanRef.current = handleStopScan;

	useEffect(() => () => handleStopScanRef.current(), []);

	return {
		scanState,
		videoRef,
		canvasRef,
		handleScan,
		handleStopScan,
		handleSwitchCamera,
		handleToggleTorch,
		handleDataCopy,
		handleShowDialog,
	};
};
