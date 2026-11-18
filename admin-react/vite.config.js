
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {
      // Conexión con el servidor y MongoDB.
      '/api': 'http://localhost:3000',

      // Permite cargar las imágenes originales de SaveBebi.
      '/public': 'http://localhost:3000'
    }
  }
})
