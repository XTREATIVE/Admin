// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  // this lets Vite’s dev server accept external hosts (if you’re using `vite` or `vite dev`)
  server: {
    host: true,              // listen on all addresses (0.0.0.0)
    // allowedHosts: ['your-custom-host.com'] // (optional) more fine‑grained control
  },

  // this is what `vite preview` uses — whitelist your Render URL here
  preview: {
    host: '0.0.0.0',         // bind to all interfaces
    port: 4173,              // or whatever port you prefer
    allowedHosts: [
      'admin-xtreative-wb.onrender.com',
      // 'another-domain-you-might-use.com'
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
    },
    // chunkSizeWarningLimit: 600, // if you want to bump up warnings
  }
})
