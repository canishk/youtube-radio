import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindCss from '@tailwindCss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindCss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
