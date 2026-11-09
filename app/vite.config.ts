import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// BASE_PATH lets the same build run at a domain root or under a sub-path
// (e.g. a hospital server at /anc-learn/). Defaults to "/".
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/*.png"],
      manifest: {
        name: "PMH Smart ANC Learn เรียนรู้คู่สมุดสีชมพู",
        short_name: "ANC Learn",
        description: "บทเรียนจากสมุดบันทึกสุขภาพแม่และเด็ก โรงพยาบาลพิมาย",
        lang: "th",
        theme_color: "#b0175a",
        background_color: "#fff7f9",
        display: "standalone",
        start_url: base,
        scope: base,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        // App shell, fonts, lesson data and captions are precached so lessons
        // work offline. Videos are large: they are cached only after a user
        // plays them (runtime cache), so nobody downloads video they don't watch.
        globPatterns: ["**/*.{js,css,html,svg,png,woff2,vtt,jpg}"],
        navigateFallback: `${base}index.html`,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.endsWith(".mp4"),
            handler: "CacheFirst",
            options: {
              cacheName: "lesson-videos",
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
              expiration: { maxEntries: 20 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    fs: { allow: [".."] }, // content/ lives at the repo root
  },
});
