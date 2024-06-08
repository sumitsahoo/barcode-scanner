import React, { useState, useEffect, useRef } from "react";
import { scanImageData } from "@undecaf/zbar-wasm";

import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";

import beepSound from "../assets/sound/beep.mp3"; // Import beep sound file
import BarcodeIcon from "../icons/BarcodeIcon";

const BarcodeScanner = () => {
  const [data, setData] = useState(null);

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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: "environment",
          height: { min: 1280, ideal: 1920, max: 1920 },
          width: { min: 1280, ideal: 1920, max: 1920 },
          resizeMode: false,
          focusMode: "continuous",
          focusDistance: 0,
          exposureMode: "continuous",
          zoom: 2,
          aspectRatio: { ideal: 1 },
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
            const isValid = /^[\w-]*$/.test(result); // Remove this check if you want to detect all characters

            if (isValid) {
              setIsScanning(false);
              handleStopScan();

              // `result` contains only alphanumeric characters and hyphens

              const data = (
                <>
                  Barcode Type: {results[0]?.typeName}
                  <br />
                  Scan Data: {results[0]?.decode()}
                </>
              );

              // Handle successful scan
              setData(data);
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

  useEffect(() => {
    // Cleanup function to release resources
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="p-6 w-full h-dvh grid grid-cols-1 gap-6 place-items-center bg-blue-gray-50">
      <div className="flex justify-center items-center relative">
        <img
          src="/images/ic-camera-closed.svg"
          alt="Camera Closed"
          className="absolute z-10 p-16"
        />
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-[80vmin] h-[80vmin] sm:w-[720px] sm:h-[720px] rounded-lg drop-shadow-xl relative z-20"
        />
      </div>
      <canvas ref={canvasRef} hidden />
      <Button
        key={isScanning ? "scanning" : "not-scanning"}
        variant="gradient"
        color="blue-gray"
        className="rounded-full"
        onClick={isScanning ? handleStopScan : handleScan}
      >
        <img
          src={
            isScanning
              ? "/images/ic-camera-closed-white.svg"
              : "/images/ic-camera-open-white.svg"
          }
          alt={isScanning ? "Stop Scan" : "Start Scan"}
          className="w-8 h-8"
        />
      </Button>
      <Dialog open={showDialog} handler={handleShowDialog}>
        <DialogHeader>Result</DialogHeader>
        {data && <DialogBody>{data}</DialogBody>}
        <DialogFooter>
          <Button
            variant="gradient"
            color="blue-gray"
            onClick={handleShowDialog}
          >
            <span>Okay</span>
          </Button>
        </DialogFooter>
      </Dialog>
      <audio ref={audioRef} src={beepSound} preload="auto" />
    </div>
  );
};

export default BarcodeScanner;
