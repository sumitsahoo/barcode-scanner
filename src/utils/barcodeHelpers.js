// Utility functions for barcode scanning and camera management

export const isPhone = () =>
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const convertToGrayscale = (imageData) => {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  return imageData;
};

export const getCameraIdWithFlash = async () => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  for (const device of devices) {
    const constraints = {
      video: {
        deviceId: device.deviceId,
        facingMode: "environment",
      },
    };
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = stream.getVideoTracks()[0];
      const capabilities = videoTrack.getCapabilities();
      if (capabilities.torch) {
        stream.getTracks().forEach((track) => track.stop());
        return device.deviceId;
      }
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      // Ignore errors for unavailable devices
    }
  }
  return null;
};

export const getAndSetCameraIdWithFlash = async () => {
  let cameraId = localStorage.getItem("cameraIdWithFlash");
  if (!cameraId) {
    cameraId = await getCameraIdWithFlash();
    if (cameraId) {
      localStorage.setItem("cameraIdWithFlash", cameraId);
    }
  }
  return cameraId;
};

export const getMediaConstraints = async (facingMode) => {
  const baseSettings = isPhone()
    ? { height: { ideal: 1080 }, width: { ideal: 1920 } }
    : { height: { ideal: 720 }, width: { ideal: 1280 } };
  const customConstraints = {
    audio: false,
    video: {
      ...baseSettings,
      aspectRatio: undefined,
      facingMode: facingMode,
      resizeMode: false,
      focusMode: "continuous",
      focusDistance: 0,
      exposureMode: "continuous",
      zoom: facingMode === "user" ? 1 : 2,
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

export const stopAllTracks = (stream) => {
  if (stream) {
    const tracks = stream.getTracks();
    for (const track of tracks) {
      track.stop();
    }
  }
};
