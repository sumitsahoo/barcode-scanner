import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useEffect, useMemo, useState } from "react";
import BarcodeScanner from "./components/BarcodeScanner";
import { getThemeColors } from "./utils/themeColors";

const App = () => {
  const [_init, setInit] = useState(false);

  // Get DaisyUI theme colors - memoize to avoid re-computation
  const { background, primary } = useMemo(() => getThemeColors(), []);
  const particlesColor = primary;
  const backgroundColor = background;

  // this should be run only once per application lifetime
  useEffect(() => {
    initParticlesEngine(async (engine) => {
      // you can initiate the tsParticles instance (engine) here, adding custom shapes or presets
      // this loads the tsparticles package bundle, it's the easiest method for getting everything ready
      // starting from v2 you can add only the features you need reducing the bundle size
      //await loadAll(engine);
      //await loadFull(engine);
      //await loadBasic(engine);

      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = (container) => {
    console.log(container);
  };

  // Memoize particle options to prevent recreation on every render
  const options = useMemo(
    () => ({
      background: {
        color: backgroundColor,
      },
      particles: {
        number: {
          value: 80,
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
          speed: 1,
          direction: "none",
          random: false,
          straight: false,
          outModes: "out",
        },
      },
      interactivity: {
        events: {
          onHover: {
            enable: true,
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
    [backgroundColor, particlesColor],
  );

  return (
    <div className="App">
      <Particles options={options} init={particlesLoaded} />
      <BarcodeScanner />
    </div>
  );
};

export default App;
