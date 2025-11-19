import { scanImageData } from "@undecaf/zbar-wasm";
import { convertToGrayscale } from "../utils/barcodeHelpers";

self.onmessage = async (e) => {
	const { imageData, type } = e.data;

	if (type === "scan") {
		try {
			const grayscaleImageData = convertToGrayscale(imageData);
			const results = await scanImageData(grayscaleImageData);

			if (results.length > 0) {
				const result = results[0];
				self.postMessage({
					found: true,
					data: {
						typeName: result.typeName?.replace("ZBAR_", "") ?? "",
						scanData: result.decode() ?? "",
					},
				});
			} else {
				self.postMessage({ found: false });
			}
		} catch (error) {
			console.error("Worker scan error:", error);
			self.postMessage({ found: false, error: error.message });
		}
	}
};
