import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/faculty': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/announcements': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/class': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/assignments': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/attendance': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/marks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/submissions': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/student': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})