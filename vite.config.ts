import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Root-level Vite config to drive the frontend app
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // Point "@" to the frontend source directory
      "@": path.resolve(__dirname, "./frontend/src"),
    },
  },
}))