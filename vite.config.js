// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // If the module comes from node_modules, assign it to a vendor chunk.
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          // Optionally, you could customize splitting for specific modules or directories.
        },
      },
    },
    // Optionally, raise the chunk size warning limit if you’re aware of the tradeoffs.
    // chunkSizeWarningLimit: 600, // size in kB
  },
});
