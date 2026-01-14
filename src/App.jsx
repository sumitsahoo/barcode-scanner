import BarcodeScanner from "./components/BarcodeScanner";
import Particles from "./components/Particles";

const App = () => (
	<div className="App h-dvh w-full overflow-hidden">
		<Particles />
		<BarcodeScanner />
	</div>
);

export default App;
