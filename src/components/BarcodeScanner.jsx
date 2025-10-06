import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  convertToGrayscale,
  getMediaConstraints,
  isPhone,
  stopAllTracks,
} from "../utils/barcodeHelpers";
import IconCameraClosed from "./icons/IconCameraClosed";
import IconCameraOpen from "./icons/IconCameraOpen";
import IconRotateCamera from "./icons/IconRotateCamera";
import IconTorchOff from "./icons/IconTorchOff";
import IconTorchOn from "./icons/IconTorchOn";

// Constants
const SCAN_INTERVAL_MS = 100;
const VIBRATION_DURATION_MS = 300;
const CANVAS_CONTEXT_OPTIONS = {
  willReadFrequently: true,
  alpha: false,
};

/**
 * Custom hook for barcode scanning logic and camera state management
 * Handles video stream, barcode detection, and camera controls
 */
const useBarcodeScanner = () => {
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
  const scanImageDataRef = useRef(null);
  const lastScanTimeRef = useRef(0);
  const isScanningRef = useRef(scanState.isScanning);

  useEffect(() => {
    isScanningRef.current = scanState.isScanning;
  }, [scanState.isScanning]);

  /**
   * Handle errors during scanning or camera operations
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

  /**
   * Initialize and start the barcode scanning process
   */
  const handleScan = useCallback(async () => {
    setScanState((prev) => ({ ...prev, data: null, isScanning: true }));

    try {
      // Lazy load zbar library
      if (!scanImageDataRef.current) {
        const zbar = await import("@undecaf/zbar-wasm");
        scanImageDataRef.current = zbar.scanImageData;
      }

      const scanImageData = scanImageDataRef.current;
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
      canvas.width = width;
      canvas.height = height;

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

          context.drawImage(videoRef.current, 0, 0, width, height);
          const imageData = context.getImageData(0, 0, width, height);
          const grayscaleImageData = convertToGrayscale(imageData);
          const results = await scanImageData(grayscaleImageData);

          if (results?.length > 0) {
            isScanningRef.current = false;

            const barcodeData = {
              typeName: results[0]?.typeName?.replace("ZBAR_", "") ?? "",
              scanData: results[0]?.decode() ?? "",
            };

            setScanState((prev) => ({
              ...prev,
              isScanning: false,
              data: barcodeData,
              showDialog: true,
            }));

            handleStopScan();
            window?.navigator?.vibrate?.(VIBRATION_DURATION_MS);
            audioRef.current?.play().catch(() => { });
          } else {
            animationFrameId.current = requestAnimationFrame(scanTick);
          }
        } catch (err) {
          console.error("Scan tick error:", err);
          animationFrameId.current = requestAnimationFrame(scanTick);
        }
      };

      animationFrameId.current = requestAnimationFrame(scanTick);
    } catch (error) {
      handleError(error);
    }
  }, [scanState.facingMode, handleError, handleStopScan]);

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

  useEffect(() => {
    return () => {
      // Cleanup on unmount
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

const BarcodeScanner = () => {
  const {
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
  } = useBarcodeScanner();

  const { isScanning, facingMode, isTorchOn, showDialog, data } = scanState;
  const dialogTitleId = useId();

  // Computed values for conditional rendering
  const isPhoneDevice = useMemo(() => isPhone(), []);
  const shouldShowRotateButton = useMemo(
    () => isScanning && isPhoneDevice,
    [isScanning, isPhoneDevice],
  );
  const shouldShowTorchButton = useMemo(
    () => isScanning && isPhoneDevice && facingMode === "environment",
    [isScanning, isPhoneDevice, facingMode],
  );

  return (
    <div className="relative w-full h-dvh grid grid-cols-1 gap-6 place-items-center overflow-hidden backdrop-blur-none">
      <div className="flex justify-center items-center relative">
        <IconCameraClosed className="absolute -mt-32 z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] text-primary" />
        <video
          title="Barcode Scanner"
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-screen h-screen object-cover drop-shadow-xl relative z-20"
        />
      </div>
      <canvas ref={canvasRef} hidden />
      {isScanning && (
        <div
          className="absolute w-[70%] h-1 bg-red-500 bg-opacity-70 z-40 animate-scan"
          style={{
            top: "20%",
            left: "15%",
          }}
        />
      )}
      <div className="absolute bottom-8 flex justify-center items-center rounded-full border border-secondary bg-white/30 shadow-lg shadow-black/10 saturate-200 backdrop-blur-xl z-30 p-2">
        {shouldShowRotateButton && (
          <button
            type="button"
            className="btn btn-circle btn-outline btn-secondary mr-2"
            onClick={handleSwitchCamera}
            aria-label="Switch camera"
          >
            <IconRotateCamera className="w-8 h-8 text-secondary" />
          </button>
        )}

        <button
          type="button"
          className="btn btn-circle btn-primary"
          onClick={isScanning ? handleStopScan : handleScan}
          aria-label={isScanning ? "Stop scanning" : "Start scanning"}
        >
          {isScanning ? (
            <IconCameraClosed className="w-8 h-8 text-primary-content" />
          ) : (
            <IconCameraOpen className="w-8 h-8 text-primary-content" />
          )}
        </button>

        {shouldShowTorchButton && (
          <button
            type="button"
            className="btn btn-circle btn-outline btn-secondary ml-2"
            onClick={handleToggleTorch}
            aria-label={isTorchOn ? "Turn off torch" : "Turn on torch"}
          >
            {isTorchOn ? (
              <IconTorchOff className="w-8 h-8 text-secondary" />
            ) : (
              <IconTorchOn className="w-8 h-8 text-secondary" />
            )}
          </button>
        )}
      </div>
      {data?.scanData && (
        <div
          className={`modal ${showDialog ? "modal-open" : ""}`}
          role="dialog"
          aria-labelledby={dialogTitleId}
        >
          <div className="modal-box">
            <h3 id={dialogTitleId} className="font-bold text-lg">
              {data.typeName}
            </h3>
            <p className="py-4 break-all">{data.scanData}</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline mr-2"
                onClick={handleDataCopy}
                aria-label="Copy barcode data to clipboard"
              >
                COPY
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleShowDialog}
                aria-label="Close dialog"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
      {/* biome-ignore lint/a11y/useMediaCaption: This is only for beep sound */}
      <audio
        title="Beep Sound"
        ref={audioRef}
        src={`${process.env.VITE_APP_BASE_PATH}sounds/beep.mp3`}
        preload="auto"
      />
    </div>
  );
};

export default BarcodeScanner;
