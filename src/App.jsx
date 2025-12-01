import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import { isPhone } from "./utils/barcodeHelpers";
import { getThemeColors } from "./utils/themeColors";

// Lazy load particles for faster initial render
const Particles = lazy(() => import("@tsparticles/react").then(mod => ({ default: mod.default })));

/**
 * Main Application Component
 * Initializes particle background and renders the barcode scanner
 *
 * @returns {JSX.Element} App component
 */
const App = () => {
	const [particlesReady, setParticlesReady] = useState(false);

	// Get DaisyUI theme colors - memoize to avoid re-computation
	const { background, primary } = useMemo(() => getThemeColors(), []);
	const particlesColor = primary;
	const backgroundColor = background;
	const isMobile = useMemo(() => isPhone(), []);

	// Initialize particles engine after a delay to prioritize main content
	useEffect(() => {
		// Defer particle loading to after main content renders
		const timeoutId = setTimeout(() => {
			import("@tsparticles/react").then(({ initParticlesEngine }) => {
				import("@tsparticles/slim").then(({ loadSlim }) => {
					initParticlesEngine(async (engine) => {
						await loadSlim(engine);
					}).then(() => {
						setParticlesReady(true);
					});
				});
			});
		}, 100); // Small delay to let main content render first

		return () => clearTimeout(timeoutId);
	}, []);

	// Memoize particle options to prevent recreation on every render
	const options = useMemo(
		() => ({
			background: {
				color: backgroundColor,
			},
			particles: {
				number: {
					value: isMobile ? 30 : 80,
					density: {
						enable: true,
						area: 800,
					},
				},
				color: {
					value: [particlesColor],
				},
				shape: {
					type: "circle",
				},
				opacity: {
					value: 1,
				},
				size: {
					value: { min: 1, max: 8 },
				},
				links: {
					enable: true,
					distance: 150,
					color: particlesColor,
					opacity: 0.4,
					width: 1,
				},
				move: {
					enable: true,
					speed: isMobile ? 0.5 : 1,
					direction: "none",
					random: false,
					straight: false,
					outModes: "out",
				},
			},
			interactivity: {
				events: {
					onHover: {
						enable: !isMobile,
						mode: "grab",
					},
					onClick: {
						enable: false,
						mode: "push",
					},
				},
				modes: {
					grab: {
						distance: 140,
						links: {
							opacity: 1,
						},
					},
					push: {
						quantity: 4,
					},
				},
			},
		}),
		[backgroundColor, particlesColor, isMobile],
	);

	return (
		<div className="App h-dvh w-full overflow-hidden">
			{particlesReady && (
				<Suspense fallback={null}>
					<Particles options={options} />
				</Suspense>
			)}
			<BarcodeScanner />
		</div>
	);
};

export default App;
