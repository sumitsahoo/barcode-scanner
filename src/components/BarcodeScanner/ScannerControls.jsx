import { memo } from "react";
import IconCameraClosed from "../icons/IconCameraClosed";
import IconCameraOpen from "../icons/IconCameraOpen";
import IconRotateCamera from "../icons/IconRotateCamera";
import IconTorchOff from "../icons/IconTorchOff";
import IconTorchOn from "../icons/IconTorchOn";

const BTN_CLASS =
  "btn btn-circle w-10 h-10 bg-white/10 border-none text-white hover:bg-white/20 active:scale-90 transition-all duration-200";

const AnimatedButtonWrapper = ({ show, left, children }) => (
  <div
    className={`flex items-center justify-center overflow-hidden transition-all duration-300 ease-in-out ${show ? `w-12 h-12 opacity-100 scale-100 ${left ? "mr-2" : "ml-2"}` : "w-0 h-0 opacity-0 scale-0"}`}
  >
    {children}
  </div>
);

/**
 * Scanner control buttons component
 */
const ScannerControls = ({
  isScanning,
  isTorchOn,
  shouldShowRotateButton,
  shouldShowTorchButton,
  onScan,
  onStopScan,
  onSwitchCamera,
  onToggleTorch,
}) => (
  <div
    className={`absolute bottom-8 flex justify-center items-center z-30 transition-all duration-300 rounded-full ${isScanning ? "bg-black/50 border border-white/10 shadow-lg backdrop-blur-md px-4 py-2 md:p-2" : "bg-transparent border-transparent"}`}
  >
    {/* Rotate Camera Button */}
    <AnimatedButtonWrapper show={shouldShowRotateButton} left>
      <div className="md:tooltip md:tooltip-top" data-tip="Switch Camera">
        <button
          type="button"
          className={BTN_CLASS}
          onClick={onSwitchCamera}
          aria-label="Switch camera"
          disabled={!shouldShowRotateButton}
        >
          <IconRotateCamera className="w-6 h-6" />
        </button>
      </div>
    </AnimatedButtonWrapper>

    {/* Main Scan Button */}
    <div
      className="md:tooltip md:tooltip-top"
      data-tip={isScanning ? "Stop Scanning" : "Start Scanning"}
    >
      <button
        type="button"
        className={`btn btn-circle shadow-xl border-4 active:scale-95 transition-all duration-300 ${isScanning ? "w-14 h-14 md:w-16 md:h-16 btn-error border-white/30 text-white" : "w-16 h-16 md:w-20 md:h-20 btn-primary border-white/20 text-primary-content shadow-primary/40 hover:scale-105 hover:shadow-primary/60"}`}
        onClick={isScanning ? onStopScan : onScan}
        aria-label={isScanning ? "Stop scanning" : "Start scanning"}
      >
        {isScanning ? (
          <IconCameraClosed className="w-8 h-8" />
        ) : (
          <IconCameraOpen className="w-8 h-8" />
        )}
      </button>
    </div>

    {/* Torch Button */}
    <AnimatedButtonWrapper show={shouldShowTorchButton}>
      <div className="md:tooltip md:tooltip-top" data-tip={isTorchOn ? "Turn Off" : "Turn On"}>
        <button
          type="button"
          className={BTN_CLASS}
          onClick={onToggleTorch}
          aria-label={isTorchOn ? "Turn off torch" : "Turn on torch"}
          disabled={!shouldShowTorchButton}
        >
          {isTorchOn ? <IconTorchOff className="w-6 h-6" /> : <IconTorchOn className="w-6 h-6" />}
        </button>
      </div>
    </AnimatedButtonWrapper>
  </div>
);

export default memo(ScannerControls);
