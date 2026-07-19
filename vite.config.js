import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// base: '/' działa na Netlify, Vercel i lokalnym podglądzie.
// Dla GitHub Pages (adres typu login.github.io/kapitan/) zmień na '/kapitan/'.
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon-192.png", "icon-512.png"],
      manifest: {
        name: "Dokersi-losowanie",
        short_name: "Dokersi",
        description: "Losowanie zbalansowanych drużyn na osiedlowe mecze.",
        lang: "pl",
        theme_color: "#171717",
        background_color: "#171717",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
});
