import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  publicDir: "static",
  resolve: { preserveSymlinks: true },
  server: {
    port: 5173,
    proxy: {
      "/djangoapp": {
        target: process.env.DJANGO_PROXY_TARGET || "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
