
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
base: '/Proyecto-SaveBebii/',
  publicDir: '../public',

  server: {
    proxy: {
      // Conexión con el servidor local.
      '/api': 'http://localhost:3000',
      '/public': 'http://localhost:3000'
    }
  }
})
