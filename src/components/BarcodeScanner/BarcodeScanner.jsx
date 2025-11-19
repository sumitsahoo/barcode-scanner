import { useId } from "react";
import { getBasePath } from "../../config/env";
import { AUDIO_CONFIG } from "../../constants/scanner";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { isPhone } from "../../utils/barcodeHelpers";
import IconCameraClosed from "../icons/IconCameraClosed";
import ResultDialog from "./ResultDialog";
import ScannerControls from "./ScannerControls";

/**
 * BarcodeScanner Component
 * Main component for barcode scanning functionality
 * Displays camera feed and provides controls for scanning
 *
 * @returns {JSX.Element} BarcodeScanner component
 */
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
	const isPhoneDevice = isPhone();
	const shouldShowRotateButton = isScanning && isPhoneDevice;
	const shouldShowTorchButton =
		isScanning && isPhoneDevice && facingMode === "environment";

	return (
		<div className="relative w-full h-dvh flex justify-center items-center overflow-hidden backdrop-blur-none">
			{/* Camera Feed Background */}
			<div className="absolute inset-0 flex justify-center items-center">
				<IconCameraClosed className="absolute z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] text-primary" />
				<video
					title="Barcode Scanner"
					ref={videoRef}
					autoPlay
					muted
					playsInline
					className="w-full h-full object-cover drop-shadow-xl relative z-20"
				/>
			</div>

			{/* Hidden Canvas for Image Processing */}
			<canvas ref={canvasRef} hidden />

			{/* Scanning Animation Line */}
			{isScanning && (
				<div
					className="absolute w-[70%] h-1 bg-red-500 bg-opacity-70 z-40 animate-scan will-change-transform"
					style={{
						top: "20%",
						left: "15%",
					}}
				/>
			)}

			{/* Scanner Controls */}
			<ScannerControls
				isScanning={isScanning}
				isTorchOn={isTorchOn}
				shouldShowRotateButton={shouldShowRotateButton}
				shouldShowTorchButton={shouldShowTorchButton}
				onScan={handleScan}
				onStopScan={handleStopScan}
				onSwitchCamera={handleSwitchCamera}
				onToggleTorch={handleToggleTorch}
			/>

			{/* Result Dialog */}
			<ResultDialog
				isOpen={showDialog}
				data={data}
				dialogTitleId={dialogTitleId}
				onCopy={handleDataCopy}
				onClose={handleShowDialog}
			/>

			{/* Beep Sound */}
			{/* biome-ignore lint/a11y/useMediaCaption: This is only for beep sound */}
			<audio
				title="Beep Sound"
				ref={audioRef}
				src={`${getBasePath()}${AUDIO_CONFIG.BEEP_PATH}`}
				preload={AUDIO_CONFIG.PRELOAD}
			/>
		</div>
	);
};

export default BarcodeScanner;
