// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

<<<<<<< HEAD
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
=======
  // dev server settings
  server: {
    host: true,
  },

  // preview build settings
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: [
      'admin-xtreative-wb.onrender.com',
      'admin-xtreative.vercel.app'
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
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
<<<<<<< HEAD
    },
    // chunkSizeWarningLimit: 600, // if you want to bump up warnings
=======
    }
  },

  // ✅ Fix for your error
  optimizeDeps: {
    exclude: [
      'recharts',
      'framer-motion',
      'react-bootstrap-icons',
      '@mui/material',
      'react-icons'
    ]
>>>>>>> 803a45e8eb37a95a0768e6ff9712cc7a94521c06
  }
})
