import { memo } from "react";
import IconCameraClosed from "../icons/IconCameraClosed";
import IconCameraOpen from "../icons/IconCameraOpen";
import IconRotateCamera from "../icons/IconRotateCamera";
import IconTorchOff from "../icons/IconTorchOff";
import IconTorchOn from "../icons/IconTorchOn";

/**
 * Scanner control buttons component
 * Displays camera controls including start/stop, rotate camera, and torch toggle
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isScanning - Whether scanner is currently active
 * @param {boolean} props.isTorchOn - Whether torch is currently on
 * @param {boolean} props.shouldShowRotateButton - Whether to show camera rotation button
 * @param {boolean} props.shouldShowTorchButton - Whether to show torch toggle button
 * @param {Function} props.onScan - Callback when scan button is clicked
 * @param {Function} props.onStopScan - Callback when stop scan button is clicked
 * @param {Function} props.onSwitchCamera - Callback when switch camera button is clicked
 * @param {Function} props.onToggleTorch - Callback when torch button is clicked
 * @returns {JSX.Element} Scanner controls component
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
}) => {
	return (
		<div
			className={`absolute bottom-8 flex justify-center items-center z-30 transition-all duration-300 rounded-full ${isScanning
				? "bg-black/50 border border-white/10 shadow-lg backdrop-blur-md px-6 py-4 gap-8"
				: "bg-transparent border-transparent px-0 py-0 gap-0"
				}`}
		>
			{shouldShowRotateButton && (
				<button
					type="button"
					className="btn btn-circle w-10 h-10 bg-white/10 border-none text-white hover:bg-white/20 active:scale-90 transition-all duration-200"
					onClick={onSwitchCamera}
					aria-label="Switch camera"
				>
					<IconRotateCamera className="w-6 h-6" />
				</button>
			)}

			<button
				type="button"
				className={`btn btn-circle shadow-xl border-4 active:scale-95 transition-all duration-300 ${isScanning
					? "w-16 h-16 md:w-20 md:h-20 btn-error border-white/30 text-white"
					: "w-20 h-20 md:w-24 md:h-24 btn-primary border-white/20 text-primary-content shadow-primary/40 hover:scale-105 hover:shadow-primary/60"
					}`}
				onClick={isScanning ? onStopScan : onScan}
				aria-label={isScanning ? "Stop scanning" : "Start scanning"}
			>
				{isScanning ? (
					<IconCameraClosed className="w-8 h-8 md:w-10 md:h-10" />
				) : (
					<IconCameraOpen className="w-8 h-8 md:w-10 md:h-10" />
				)}
			</button>

			{shouldShowTorchButton && (
				<button
					type="button"
					className="btn btn-circle w-10 h-10 bg-white/10 border-none text-white hover:bg-white/20 active:scale-90 transition-all duration-200"
					onClick={onToggleTorch}
					aria-label={isTorchOn ? "Turn off torch" : "Turn on torch"}
				>
					{isTorchOn ? (
						<IconTorchOff className="w-6 h-6" />
					) : (
						<IconTorchOn className="w-6 h-6" />
					)}
				</button>
			)}
		</div>
	);
};

export default memo(ScannerControls);
