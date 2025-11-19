import { memo, useEffect, useState } from "react";

/**
 * Result dialog component
 * Displays scanned barcode data in a modal dialog
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether dialog is open
 * @param {Object} props.data - Scanned barcode data
 * @param {string} props.data.typeName - Type of barcode scanned
 * @param {string} props.data.scanData - Decoded barcode data
 * @param {string} props.dialogTitleId - ID for dialog title (accessibility)
 * @param {Function} props.onCopy - Callback when copy button is clicked
 * @param {Function} props.onClose - Callback when close button is clicked
 * @returns {JSX.Element} Result dialog component
 */
const ResultDialog = ({ isOpen, data, dialogTitleId, onCopy, onClose }) => {
	const [shouldRender, setShouldRender] = useState(false);

	// Handle render delay for exit animation
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
		} else {
			const timer = setTimeout(() => setShouldRender(false), 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!data?.scanData && !shouldRender) return null;

	return (
		<div
			className={`modal modal-bottom sm:modal-middle transition-all duration-300 ${
				isOpen ? "modal-open backdrop-blur-sm" : "pointer-events-none"
			}`}
			role="dialog"
			aria-labelledby={dialogTitleId}
		>
			<div
				className={`modal-box bg-base-100/90 backdrop-blur-md shadow-2xl border border-white/10 transform transition-all duration-300 ease-out ${
					isOpen
						? "scale-100 opacity-100 translate-y-0"
						: "scale-95 opacity-0 translate-y-4"
				}`}
			>
				<div className="flex flex-col items-center gap-4">
					{/* Success Icon */}
					<div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-2">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-8 w-8 text-success"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 13l4 4L19 7"
							/>
						</svg>
					</div>

					<h3 id={dialogTitleId} className="font-bold text-xl text-center">
						{data?.typeName || "Barcode Detected"}
					</h3>

					<div className="w-full p-4 bg-base-200/50 rounded-xl border border-base-300 break-all text-center font-mono text-sm">
						{data?.scanData}
					</div>

					<div className="modal-action w-full flex justify-center gap-3 mt-4">
						<button
							type="button"
							className="btn btn-outline flex-1 max-w-[140px] hover:bg-base-content hover:text-base-100"
							onClick={onCopy}
							aria-label="Copy barcode data to clipboard"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 mr-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
								/>
							</svg>
							COPY
						</button>
						<button
							type="button"
							className="btn btn-primary flex-1 max-w-[140px] shadow-lg shadow-primary/20"
							onClick={onClose}
							aria-label="Close dialog"
						>
							CLOSE
						</button>
					</div>
				</div>
			</div>
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose} className="cursor-default">
					close
				</button>
			</form>
		</div>
	);
};

export default memo(ResultDialog);
