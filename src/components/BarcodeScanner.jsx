import { useCallback, useEffect, useRef, useState } from "react";

// Memoize isPhone outside the component to avoid recreation
const isPhone = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

const BarcodeScanner = () => {
  const [data, setData] = useState({ typeName: "", scanData: "" });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [showDialog, setShowDialog] = useState(false);
  const handleShowDialog = () => setShowDialog(!showDialog);

  const [isScanning, setIsScanning] = useState(false);
  const isScanningRef = useRef(isScanning);
  const [facingMode, setFacingMode] = useState("environment");
  const [isTorchOn, setIsTorchOn] = useState(false);
  const animationFrameId = useRef(null); // Store animation frame id

  // Lazy-load zbar-wasm
  const scanImageDataRef = useRef(null);

  // Throttle interval for scanning (ms)
  const SCAN_INTERVAL = 150;
  const lastScanTimeRef = useRef(0);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  const handleError = (error) => {
    console.error("Error:", error);
    setIsScanning(false);
    setData(null);
  };

  // Memoize convertToGrayscale
  const convertToGrayscale = useCallback((imageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
    }
    return imageData;
  }, []);

  const getMediaConstraints = async (facingMode) => {
    const baseSettings = isPhone()
      ? {
        height: { ideal: 1080 },
        width: { ideal: 1920 },
      }
      : {
        height: { ideal: 720 },
        width: { ideal: 1280 },
      };

    // biome-ignore lint/style/useConst: <explanation>
    let customConstraints = {
      audio: false,
      video: {
        ...baseSettings,
        aspectRatio: undefined, // Allows video to cover the entire screen
        facingMode: facingMode,
        resizeMode: false,
        focusMode: "continuous",
        focusDistance: 0,
        exposureMode: "continuous",
        zoom: facingMode === "user" ? 1 : 2, // Set zoom based on facingMode
        frameRate: { ideal: 15, max: 30 },
      },
    };

    if (facingMode === "environment" && isPhone()) {
      const cameraId = await getAndSetCameraIdWithFlash();
      if (cameraId) {
        customConstraints.video.deviceId = cameraId;
      }
    }

    return customConstraints;
  };

  // Usually the camera with flash is the main rear camera

  const getCameraIdWithFlash = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    for (const device of devices) {
      const constraints = {
        video: {
          deviceId: device.deviceId,
          facingMode: "environment", // Prefer the rear camera
        },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        // Check if the torch (flash) capability is supported
        if (capabilities.torch) {
          console.log(`Device ${device.deviceId} supports torch.`);
          // biome-ignore lint/complexity/noForEach: List is not too long
          stream.getTracks().forEach((track) => track.stop()); // Stop using the camera
          return device.deviceId; // Return the ID of the camera that supports flash
        }

        // Stop using the camera
        // biome-ignore lint/complexity/noForEach: List is not too long
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error(`Error with device ${device.deviceId}:`, error);
      }
    }

    return null; // Return null if no camera with flash support is found
  };

  const _getHighestResolutionCameraId = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput",
    );

    let highestResolution = 0;
    let highestResolutionCameraId = null;

    for (const device of videoDevices) {
      const constraints = {
        video: {
          deviceId: device.deviceId,
          facingMode: "environment", // Prefer the rear camera
        },
      };

      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        const videoTrack = stream.getVideoTracks()[0];
        const capabilities = videoTrack.getCapabilities();

        console.log(`Device ${device.deviceId} capabilities:`);
        console.log(capabilities);

        // Assuming capabilities include width and height
        const maxResolution = capabilities.width.max * capabilities.height.max;

        if (maxResolution > highestResolution) {
          highestResolution = maxResolution;
          highestResolutionCameraId = device.deviceId;
        }

        // Stop using the camera
        // biome-ignore lint/complexity/noForEach: List is not too long
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.error(`Error with device ${device.deviceId}:`, error);
      }
    }

    return highestResolutionCameraId;
  };

  const getAndSetCameraIdWithFlash = async () => {
    let cameraId = localStorage.getItem("cameraIdWithFlash");

    // If no valid cameraId is stored, find one and store it
    if (!cameraId) {
      cameraId = await getCameraIdWithFlash();
      if (cameraId) {
        localStorage.setItem("cameraIdWithFlash", cameraId);
      }
    }

    return cameraId;
  };

  const handleScan = async () => {
    setData(null); // Clear previous data
    setIsScanning(true);
    try {
      // Lazy-load zbar-wasm
      if (!scanImageDataRef.current) {
        const zbar = await import("@undecaf/zbar-wasm");
        scanImageDataRef.current = zbar.scanImageData;
      }
      const scanImageData = scanImageDataRef.current;
      const mediaConstraints = await getMediaConstraints(facingMode);
      const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      videoRef.current.srcObject = stream;
      videoRef.current.onplay = async () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;
        canvas.width = width;
        canvas.height = height;

        // Store tick in ref to avoid closure issues
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
            setIsScanning(false);
            handleStopScan();
            setData((prev) => {
              const newData = {
                typeName: results[0]?.typeName.replace("ZBAR_", ""),
                scanData: results[0]?.decode(),
              };
              // Only update if changed
              if (!prev || prev.scanData !== newData.scanData) {
                return newData;
              }
              return prev;
            });
            window?.navigator?.vibrate?.(300);
            audioRef.current.play();
            setShowDialog(true);
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
    setIsScanning(false);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      for (const track of tracks) {
        track.stop();
      }
      videoRef.current.srcObject = null;
    }
  }, []);

  const handleSwitchCamera = async () => {
    if (!videoRef.current) {
      console.log("Video element not found.");
      return;
    }

    // Stop current tracks
    // biome-ignore lint/complexity/noForEach: List is not too long
    videoRef.current.srcObject?.getTracks().forEach((track) => track.stop());

    // Toggle the facing mode
    const newFacingMode = facingMode === "user" ? "environment" : "user";

    try {
      const mediaConstraints = await getMediaConstraints(newFacingMode);
      const stream =
        await navigator.mediaDevices.getUserMedia(mediaConstraints);

      // Update the video source and facing mode state
      videoRef.current.srcObject = stream;
      setFacingMode(newFacingMode); // Update the state to reflect the new facing mode
      console.log(`Switched camera to ${newFacingMode}.`);
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  const handleToggleTorch = async () => {
    if (!videoRef.current) {
      console.log("Video element not found.");
      return;
    }

    const tracks = videoRef.current.srcObject?.getVideoTracks();
    if (tracks && tracks.length > 0) {
      const track = tracks[0];
      const capabilities = track.getCapabilities();
      // const settings = track.getSettings();

      // Check if flash is supported
      if (!capabilities.torch) {
        console.log("Flash not supported by this device.");
        return;
      }

      try {
        // Toggle flash
        await track.applyConstraints({
          advanced: [
            {
              fillLightMode: isTorchOn ? "flash" : "off",
              torch: !isTorchOn,
            },
          ],
        });
        console.log(`Flash ${!isTorchOn ? "enabled" : "disabled"}.`);

        // Update the isTorchOn state
        setIsTorchOn(!isTorchOn);
      } catch (error) {
        console.error("Error toggling flash:", error);
      }
    } else {
      console.log("No video track found.");
    }
  };

  const handleDataCopy = () => {
    const copyText = `${data.scanData}`;
    navigator.clipboard.writeText(copyText).then(
      () => {
        // Optionally, show a notification or alert that the text was copied.
        console.log("Copied to clipboard successfully!");
      },
      (err) => {
        console.error("Failed to copy text to clipboard", err);
      },
    );

    setShowDialog(!showDialog);
  };

  useEffect(() => {
    // Cleanup function to release resources and cancel animation frame
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        for (const track of tracks) {
          track.stop();
        }
        videoRef.current.srcObject = null;
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
        animationFrameId.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-dvh grid grid-cols-1 gap-6 place-items-center overflow-hidden backdrop-blur-none">
      <div className="flex justify-center items-center relative">
        <img
          src={`${process.env.VITE_APP_BASE_PATH}images/ic-camera-closed.svg`}
          alt="Camera Closed"
          className="absolute -mt-32 z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] object-cover"
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
        {/* DaisyUI IconButton replacement: Camera Switch */}
        <button
          type="button"
          className={`btn btn-circle btn-outline btn-secondary mr-2 ${!isScanning || !isPhone() ? "hidden" : ""
            }`}
          onClick={handleSwitchCamera}
        >
          <img
            src={`${process.env.VITE_APP_BASE_PATH}images/ic-rotate-camera.svg`}
            alt="Switch Camera"
            className="w-8 h-8"
          />
        </button>

        {/* DaisyUI IconButton replacement: Start/Stop Scan */}
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

        {/* DaisyUI IconButton replacement: Torch */}
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
