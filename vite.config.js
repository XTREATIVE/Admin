// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

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
  }
})
