import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
import path from "path"

// Frontend-level Vite config to ensure alias resolution when running in /frontend
export default defineConfig({
  server: {
    host: "::",
    port: 5173,
  },
  plugins: [react()],
  resolve: {
    alias: {
      // Map "@" to the frontend src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})