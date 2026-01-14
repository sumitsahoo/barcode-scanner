import { useId } from "react";
import { getBasePath } from "../../config/env";
import { AUDIO_CONFIG } from "../../constants/scanner";
import { useBarcodeScanner } from "../../hooks/useBarcodeScanner";
import { isPhone } from "../../utils/barcodeHelpers";
import IconCameraClosed from "../icons/IconCameraClosed";
import ResultDialog from "./ResultDialog";
import ScannerControls from "./ScannerControls";

const BarcodeScanner = () => {
	const {
		scanState: { isScanning, facingMode, isTorchOn, showDialog, data },
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

	const dialogTitleId = useId();
	const isPhoneDevice = isPhone();

	return (
		<div className="relative w-full h-dvh flex justify-center items-center overflow-hidden backdrop-blur-none">
			{/* Camera Feed */}
			<div className="absolute inset-0 flex justify-center items-center">
				<IconCameraClosed className="absolute z-10 w-[40vw] h-[40vw] md:w-[30vw] md:h-[30vw] text-primary" />
				<video title="Barcode Scanner" ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover drop-shadow-xl relative z-20" />
			</div>

			<canvas ref={canvasRef} hidden />

			{/* Scanning Animation Line */}
			{isScanning && (
				<div className="absolute w-[80%] z-40 animate-scan will-change-transform pointer-events-none" style={{ top: "20%", left: "10%" }}>
					<div className="absolute bottom-0 w-full h-24 bg-linear-to-b from-transparent to-red-500 animate-trail-down" />
					<div className="w-full h-0.5 bg-red-500 shadow-[0_0_15px_2px_rgba(239,68,68,0.8)]" />
					<div className="absolute top-0 w-full h-24 bg-linear-to-b from-red-500 to-transparent animate-trail-up" />
				</div>
			)}

			<ScannerControls
				isScanning={isScanning}
				isTorchOn={isTorchOn}
				shouldShowRotateButton={isScanning && isPhoneDevice}
				shouldShowTorchButton={isScanning && isPhoneDevice && facingMode === "environment"}
				onScan={handleScan}
				onStopScan={handleStopScan}
				onSwitchCamera={handleSwitchCamera}
				onToggleTorch={handleToggleTorch}
			/>

			<ResultDialog isOpen={showDialog} data={data} dialogTitleId={dialogTitleId} onCopy={handleDataCopy} onClose={handleShowDialog} />

			{/* biome-ignore lint/a11y/useMediaCaption: Beep sound only */}
			<audio title="Beep Sound" ref={audioRef} src={`${getBasePath()}${AUDIO_CONFIG.BEEP_PATH}`} preload={AUDIO_CONFIG.PRELOAD} />
		</div>
	);
};

export default BarcodeScanner;
