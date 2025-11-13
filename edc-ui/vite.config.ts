import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/provider': {
        target: 'http://localhost:19193',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/provider/, '/management/v3')
      },
      '/api/consumer': {
        target: 'http://localhost:29193',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/consumer/, '/management/v3')
      }
    }
  }
})