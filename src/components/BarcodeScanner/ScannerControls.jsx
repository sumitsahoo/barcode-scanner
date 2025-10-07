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
		<div className="absolute bottom-8 flex justify-center items-center rounded-full border border-secondary bg-white/30 shadow-lg shadow-black/10 saturate-200 backdrop-blur-xl z-30 p-2">
			{shouldShowRotateButton && (
				<button
					type="button"
					className="btn btn-circle btn-outline btn-secondary mr-2"
					onClick={onSwitchCamera}
					aria-label="Switch camera"
				>
					<IconRotateCamera className="w-8 h-8 text-secondary" />
				</button>
			)}

			<button
				type="button"
				className="btn btn-circle btn-primary"
				onClick={isScanning ? onStopScan : onScan}
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
					onClick={onToggleTorch}
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
	);
};

export default memo(ScannerControls);
