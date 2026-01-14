import { scanImageData } from "@undecaf/zbar-wasm";
import { convertToGrayscale } from "../utils/barcodeHelpers";

self.onmessage = async ({ data: { imageData, type, sessionId } }) => {
	if (type !== "scan") return;

	try {
		const results = await scanImageData(convertToGrayscale(imageData));
		if (results.length > 0) {
			const result = results[0];
			self.postMessage({
				found: true,
				sessionId,
				data: {
					typeName: result.typeName?.replace("ZBAR_", "") ?? "",
					scanData: result.decode() ?? "",
				},
			});
		} else {
			self.postMessage({ found: false, sessionId });
		}
	} catch (error) {
		self.postMessage({ found: false, sessionId, error: error.message });
	}
};
