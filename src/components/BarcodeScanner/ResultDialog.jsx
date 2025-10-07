import { memo } from "react";

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
	if (!data?.scanData) return null;

	return (
		<div
			className={`modal ${isOpen ? "modal-open" : ""}`}
			role="dialog"
			aria-labelledby={dialogTitleId}
		>
			<div className="modal-box">
				<h3 id={dialogTitleId} className="font-bold text-lg">
					{data.typeName}
				</h3>
				<p className="py-4 break-all">{data.scanData}</p>
				<div className="modal-action">
					<button
						type="button"
						className="btn btn-outline mr-2"
						onClick={onCopy}
						aria-label="Copy barcode data to clipboard"
					>
						COPY
					</button>
					<button
						type="button"
						className="btn btn-primary"
						onClick={onClose}
						aria-label="Close dialog"
					>
						CLOSE
					</button>
				</div>
			</div>
		</div>
	);
};

export default memo(ResultDialog);
