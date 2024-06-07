import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

const pwaOptions = {
  registerType: "autoUpdate",
  devOptions: {
    enabled: true,
  },
  includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
  manifest: {
    name: "Barcode Scanner",
    short_name: "Barcode Scanner",
    theme_color: "#78909C",
    background_color: "#ffffff",
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
  },
};

// https://vitejs.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react(), VitePWA(pwaOptions)],
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
    //origin: "http://0.0.0.0:8080",
  },
});
