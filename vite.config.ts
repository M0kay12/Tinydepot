import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Forward /api/v1/... to the backend (local development server in the API docs)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
})
