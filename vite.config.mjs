import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("react-markdown") ||
            id.includes("rehype-highlight") ||
            id.includes("highlight.js")
          ) {
            return "markdown-renderer";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api/auth": {
        target: "https://ngw.devices.sberbank.ru:9443",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/auth/, "/api/v2/oauth"),
      },
      "/api/gigachat": {
        target: "https://gigachat.devices.sberbank.ru",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/gigachat/, "/api/v1"),
      },
    },
  },
});
