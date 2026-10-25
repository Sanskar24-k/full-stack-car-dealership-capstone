import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
const djangoTarget = process.env.DJANGO_SERVICE_URL || "http://127.0.0.1:8000";
export default defineConfig({
  plugins: [react()],
  resolve: { preserveSymlinks: true },
  server: {
    proxy: { "/djangoapp": { target: djangoTarget, changeOrigin: true } },
  },
});
