import React, { useState, useEffect, useRef } from "react";
import { scanImageData } from "@undecaf/zbar-wasm";

import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

const BarcodeScanner = () => {
  const [data, setData] = useState({ typeName: "", scanData: "" });

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const [showDialog, setShowDialog] = useState(false);
  const handleShowDialog = () => setShowDialog(!showDialog);

  const [isScanning, setIsScanning] = useState(false);
  const isScanningRef = useRef(isScanning);

  useEffect(() => {
    isScanningRef.current = isScanning;
  }, [isScanning]);

  const handleError = (error) => {
    console.error("Error:", error);
    setIsScanning(false);
    setData(null);
  };

  const convertToGrayscale = (imageData) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
      data[i] = avg; // Red
      data[i + 1] = avg; // Green
      data[i + 2] = avg; // Blue
    }
    return imageData;
  };

  const handleScan = async () => {
    setData(null); // Clear previous data
    setIsScanning(true);

    try {
      const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

      const videoSettings = isPhone
        ? {
            height: { ideal: 1080 },
            width: { ideal: 1920 },
            aspectRatio: undefined, // Allows video to cover the entire screen
          }
        : {
            height: { ideal: 720 },
            width: { ideal: 1280 },
            aspectRatio: undefined, // Allows video to cover the entire screen
          };

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          ...videoSettings,
          facingMode: "environment",
          resizeMode: false,
          focusMode: "continuous",
          focusDistance: 0,
          exposureMode: "continuous",
          zoom: 2,
          frameRate: { ideal: 15, max: 30 },
        },
      });

      videoRef.current.srcObject = stream;

      videoRef.current.onplay = async () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;
        canvas.width = width;
        canvas.height = height;

        const tick = async () => {
          // Tick function always refers to current value of isScanning so isScanningRef is used to store the updated value at run time
          if (!isScanningRef.current) {
            // Stop stream and scanning

            console.log("Stopping scan...");
            handleStopScan();
            return;
          }

          context.drawImage(videoRef.current, 0, 0, width, height);

          const imageData = context.getImageData(0, 0, width, height); // Get image data
          const grayscaleImageData = convertToGrayscale(imageData);

          const results = await scanImageData(grayscaleImageData);

          if (results && results.length > 0) {
            const result = results[0]?.decode();

            // Remove this check if you want to detect all special characters
            // Allowed values:
            // Lowercase letters (a-z)
            // Uppercase letters (A-Z)
            // Numerical digits (0-9)
            // Hyphens (-)
            // Spaces ( )

            const isValid = /^[a-zA-Z0-9- ]*$/.test(result);

            if (isValid) {
              setIsScanning(false);
              handleStopScan();

              // `result` contains only alphanumeric characters and hyphens

              setData({
                typeName: results[0]?.typeName,
                scanData: results[0]?.decode(),
              });

              window?.navigator?.vibrate?.(300); // Vibrate device on successful scan (works only on Android devices)
              audioRef.current.play(); // Play beep sound on successful scan
              setShowDialog(true);
            } else {
              // `result` contains other characters
              requestAnimationFrame(tick); // Continue scanning
            }
          } else {
            requestAnimationFrame(tick); // Continue scanning
          }
        };

        requestAnimationFrame(tick);
      };
    } catch (error) {
      handleError(error);
    }
  };

  const handleStopScan = () => {
    console.log("Stopping scan...");
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      let tracks = videoRef.current.srcObject.getTracks();
      console.log("Stopping tracks:", tracks);
      tracks.forEach((track) => {
        track.stop();
      });
      videoRef.current.srcObject = null;
    }
  };

  const handleDataCopy = () => {
    const copyText = `Barcode Type: ${data.typeName}\nScan Data: ${data.scanData}`;
    navigator.clipboard.writeText(copyText).then(
      () => {
        // Optionally, show a notification or change the button's appearance temporarily
        console.log("Copied to clipboard successfully!");
      },
      (err) => {
        console.error("Failed to copy text to clipboard", err);
      }
    );

    setShowDialog(!showDialog);
  };

  useEffect(() => {
    // Cleanup function to release resources
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="w-full h-dvh grid grid-cols-1 gap-6 place-items-center overflow-hidden bg-blue-gray-50">
      <div className="flex justify-center items-center relative">
        <img
          src={`${process.env.VITE_APP_BASE_PATH}images/ic-camera-closed.svg`}
          alt="Camera Closed"
          className="absolute -mt-32 z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] object-cover"
        />
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-screen h-screen object-cover drop-shadow-xl relative z-20"
        />
      </div>
      <canvas ref={canvasRef} hidden />
      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 justify-center rounded-full border border-white bg-white/30 shadow-lg shadow-black/10 saturate-200 backdrop-blur-xl z-30 p-2">
        <Button
          key={isScanning ? "scanning" : "not-scanning"}
          variant="gradient"
          color="blue-gray"
          className="rounded-full h-14"
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
        </Button>
      </div>
      <Dialog open={showDialog} handler={handleShowDialog}>
        <DialogHeader>Result</DialogHeader>
        {data && (
          <DialogBody>
            {data && (
              <>
                <p>Barcode Type: {data.typeName}</p>
                <p>Scan Data: {data.scanData}</p>
              </>
            )}
          </DialogBody>
        )}
        <DialogFooter>
          <Button
            variant="text"
            color="blue-gray"
            onClick={handleDataCopy}
            className="mr-1"
          >
            <span>COPY</span>
          </Button>
          <Button
            variant="gradient"
            color="blue-gray"
            onClick={handleShowDialog}
          >
            <span>CLOSE</span>
          </Button>
        </DialogFooter>
      </Dialog>
      <audio
        ref={audioRef}
        src={`${process.env.VITE_APP_BASE_PATH}sounds/beep.mp3`}
        preload="auto"
      />
    </div>
  );
};

export default BarcodeScanner;
