import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(async ({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log(env);

  const pwaOptions = {
    registerType: "autoUpdate",
    devOptions: {
      enabled: true,
    },
    includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
    manifest: {
      id: env.VITE_APP_BASE_PATH,
      start_url: env.VITE_APP_BASE_PATH, // Dynamically set start_url
      name: "Barcode Scanner",
      description:
        "A fast and efficient barcode scanner app designed for all devices.",
      short_name: "Barcode Scanner",
      theme_color: "#78909C",
      background_color: "#78909c",
      display: "standalone",
      display_override: ["standalone"],
      orientation: "portrait",
      categories: ["productivity", "utilities"],
      dir: "ltr",
      icons: [
        {
          src: "images/pwa-64x64.png",
          sizes: "64x64",
          type: "image/png",
        },
        {
          src: "images/pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "images/pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "images/maskable-icon-512x512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
      screenshots: [
        // Screenshots taken from Chrome Dev Tools. Actual resolution may vary.
        // iPhone 15 Pro (1290 × 2796)
        {
          src: "screenshots/screenshot-1290x2796.png",
          sizes: "1290x2796",
          type: "image/png",
          form_factor: "narrow",
          label: "Barcode Scanner App on iPhone 15 Pro",
        },
        // iPad Pro Landscape (2732x2048)
        {
          src: "screenshots/screenshot-2732x2048.png",
          sizes: "2732x2048",
          type: "image/png",
          form_factor: "wide",
          label: "Barcode Scanner App on iPad Pro Landscape",
        },
      ],
    },
  };
  return {
    base: env.VITE_APP_BASE_PATH, // Use the base path from environment variable
    plugins: [react(), tailwindcss(), VitePWA(pwaOptions)],
    define: {
      "process.env": env,
    },
    optimizeDeps: {
      exclude: ["@undecaf/barcode-detector-polyfill", "@undecaf/zbar-wasm"],
    },
    preview: {
      port: 8080,
      strictPort: true,
    },
    server: {
      port: 8080,
      strictPort: true,
      host: true,
      cors: true,
      allowedHosts: true, // To allow any host to access your server
    },
  };
});
