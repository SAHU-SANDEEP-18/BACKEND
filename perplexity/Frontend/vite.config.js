import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: { enabled: false },
      includeAssets: ["nexus_favicon.svg"],
      manifest: {
        name: "Nexus AI", // apna actual app-name daalna
        short_name: "Nexus",
        description: "AI chat, image aur presentation generator",
        theme_color: "#161616",
        background_color: "#161616",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/nexus_favicon.svg", sizes: "any", type: "image/svg+xml" },
          { src: "/nexus_favicon.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any" },
          { src: "/nexus_favicon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/,
            handler: "NetworkOnly",
          },
        ],
        navigateFallback: "/offline.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
})
