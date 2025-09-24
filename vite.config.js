// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: true,   // so dev server listens on all addresses (useful if testing externally)
  },

  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'admin-xtreative.vercel.app',
      'admin-xtreative-wb.onrender.com'
    ]
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  }
})
