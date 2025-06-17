import { useCallback, useEffect, useRef, useState } from "react";
import {
  convertToGrayscale,
  getMediaConstraints,
  isPhone,
  stopAllTracks,
} from "../utils/barcodeHelpers";

// Custom hook for scanning logic and camera state
const useBarcodeScanner = () => {
  const [scanState, setScanState] = useState({
    isScanning: false,
    facingMode: "environment",
    isTorchOn: false,
    showDialog: false,
    data: { typeName: "", scanData: "" },
  });
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationFrameId = useRef(null);
  const scanImageDataRef = useRef(null);
  const SCAN_INTERVAL = 150;
  const lastScanTimeRef = useRef(0);
  const isScanningRef = useRef(scanState.isScanning);

  useEffect(() => {
    isScanningRef.current = scanState.isScanning;
  }, [scanState.isScanning]);

  const handleError = (error) => {
    console.error("Error:", error);
    setScanState((prev) => ({ ...prev, isScanning: false, data: null }));
  };

  const handleScan = async () => {
    setScanState((prev) => ({ ...prev, data: null, isScanning: true }));
    try {
      if (!scanImageDataRef.current) {
        const zbar = await import("@undecaf/zbar-wasm");
        scanImageDataRef.current = zbar.scanImageData;
      }
      const scanImageData = scanImageDataRef.current;
      const mediaConstraints = await getMediaConstraints(scanState.facingMode);
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      videoRef.current.srcObject = stream;
      videoRef.current.onplay = async () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;
        canvas.width = width;
        canvas.height = height;
        const tick = async () => {
          if (!isScanningRef.current) {
            handleStopScan();
            return;
          }
          const now = Date.now();
          if (now - lastScanTimeRef.current < SCAN_INTERVAL) {
            animationFrameId.current = requestAnimationFrame(tick);
            return;
          }
          lastScanTimeRef.current = now;
          context.drawImage(videoRef.current, 0, 0, width, height);
          const imageData = context.getImageData(0, 0, width, height);
          const grayscaleImageData = convertToGrayscale(imageData);
          const results = await scanImageData(grayscaleImageData);
          if (results && results.length > 0) {
            setScanState((prev) => ({
              ...prev,
              isScanning: false,
              data: {
                typeName: results[0]?.typeName.replace("ZBAR_", ""),
                scanData: results[0]?.decode(),
              },
              showDialog: true,
            }));
            handleStopScan();
            window?.navigator?.vibrate?.(300);
            audioRef.current.play();
          } else {
            animationFrameId.current = requestAnimationFrame(tick);
          }
        };
        animationFrameId.current = requestAnimationFrame(tick);
      };
    } catch (error) {
      handleError(error);
    }
  };

  const handleStopScan = useCallback(() => {
    setScanState((prev) => ({ ...prev, isScanning: false }));
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current?.srcObject) {
      stopAllTracks(videoRef.current.srcObject);
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleSwitchCamera = async () => {
    if (!videoRef.current) return;
    if (videoRef.current.srcObject) {
      stopAllTracks(videoRef.current.srcObject);
    }
    const newFacingMode = scanState.facingMode === "user" ? "environment" : "user";
    try {
      const mediaConstraints = await getMediaConstraints(newFacingMode);
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      videoRef.current.srcObject = stream;
      setScanState((prev) => ({ ...prev, facingMode: newFacingMode }));
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  const handleToggleTorch = async () => {
    if (!videoRef.current) return;
    const tracks = videoRef.current.srcObject?.getVideoTracks();
    if (tracks && tracks.length > 0) {
      const track = tracks[0];
      const capabilities = track.getCapabilities();
      if (!capabilities.torch) return;
      try {
        await track.applyConstraints({
          advanced: [
            {
              fillLightMode: scanState.isTorchOn ? "flash" : "off",
              torch: !scanState.isTorchOn,
            },
          ],
        });
        setScanState((prev) => ({ ...prev, isTorchOn: !prev.isTorchOn }));
      } catch (error) {
        console.error("Error toggling flash:", error);
      }
    }
  };

  const handleDataCopy = () => {
    if (!scanState.data) return;
    navigator.clipboard.writeText(scanState.data.scanData || "").then(
      () => { },
      () => { }
    );
    setScanState((prev) => ({ ...prev, showDialog: false }));
  };

  const handleShowDialog = () => setScanState((prev) => ({ ...prev, showDialog: !prev.showDialog }));

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        stopAllTracks(videoRef.current.srcObject);
        videoRef.current.srcObject = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
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
}

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

  return (
    <div className="relative w-full h-dvh grid grid-cols-1 gap-6 place-items-center overflow-hidden backdrop-blur-none">
      <div className="flex justify-center items-center relative">
        <img
          src={`${process.env.VITE_APP_BASE_PATH}images/ic-camera-closed.svg`}
          alt="Camera Closed"
          className="absolute -mt-32 z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] object-cover text-primary filter-none mix-blend-multiply"
        />
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
            top: 0,
            left: "15%",
          }}
        />
      )}
      <div className="absolute bottom-8 flex justify-center items-center rounded-full border border-white bg-white/30 shadow-lg shadow-black/10 saturate-200 backdrop-blur-xl z-30 p-2">
        <button
          type="button"
          className={`btn btn-circle btn-outline btn-secondary mr-2 ${!isScanning || !isPhone() ? "hidden" : ""}`}
          onClick={handleSwitchCamera}
        >
          <img
            src={`${process.env.VITE_APP_BASE_PATH}images/ic-rotate-camera.svg`}
            alt="Switch Camera"
            className="w-8 h-8"
          />
        </button>
        <button
          type="button"
          className="btn btn-circle btn-primary"
          onClick={isScanning ? handleStopScan : handleScan}
        >
          <img
            src={
              isScanning
                ? `${process.env.VITE_APP_BASE_PATH}images/ic-camera-closed-white.svg`
                : `${process.env.VITE_APP_BASE_PATH}images/ic-camera-open-white.svg`
            }
            alt={isScanning ? "Stop Scan" : "Start Scan"}
            className="w-8 h-8"
          />
        </button>
        <button
          type="button"
          className={`btn btn-circle btn-outline btn-secondary ml-2 ${!isScanning || !isPhone() || facingMode !== "environment"
            ? "hidden"
            : ""
            }`}
          onClick={handleToggleTorch}
        >
          <img
            src={
              isTorchOn
                ? `${process.env.VITE_APP_BASE_PATH}images/ic-torch-off.svg`
                : `${process.env.VITE_APP_BASE_PATH}images/ic-torch-on.svg`
            }
            alt="Switch Camera"
            className="w-8 h-8"
          />
        </button>
      </div>
      {data && (
        <div className={`modal ${showDialog ? "modal-open" : ""}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">{data.typeName}</h3>
            <p className="py-4">{data.scanData}</p>
            <div className="modal-action">
              <button
                type="button"
                className="btn btn-outline mr-2"
                onClick={handleDataCopy}
              >
                COPY
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleShowDialog}
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
