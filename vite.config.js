import path from "path";

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "react-is": path.resolve(__dirname, "node_modules/react-is"),
    },
  },

  // === Development server (vite / npm run dev) ===
  // Allows access from outside localhost (very useful on Render preview, codespaces, local network, etc.)
  server: {
    host: true, // = '0.0.0.0' — listen on all interfaces
    // allowedHosts: ['.onrender.com'],   // ← uncomment & customize only if you get "host not allowed" errors
    // port: 5173,             // optional: you can force a port here
  },

  // === Production preview server (vite preview / npm run preview) ===
  // Most important for Render.com static site "preview" checks or when testing the built dist/
  preview: {
    host: true, // listen on all interfaces (0.0.0.0)
    port: 4173, // default anyway, but explicit is fine
    // IMPORTANT: allowedHosts is now the correct place for Render.com custom domains
    allowedHosts: [
      "admin-xtreative-wb.onrender.com",
      ".onrender.com", // allows all *.onrender.com subdomains (safer & more flexible)
      // 'localhost',        // usually already allowed, but can add explicitly
    ],
  },

  // === Build optimizations ===
  build: {
    rollupOptions: {
      output: {
        // Group all node_modules into one big vendor chunk → better caching
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    // Optional: raise this if you get chunky warning (common with many deps + React)
    // chunkSizeWarningLimit: 800,
  },

  // Optional: if you're deploying to a sub-path later (e.g. https://example.com/myapp/)
  // base: '/myapp/',
});
