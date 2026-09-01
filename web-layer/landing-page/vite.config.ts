import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1/users': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/api/v1/jobs': {
        target: 'http://localhost:3002',
        changeOrigin: true,
      },
    },
  },
})
