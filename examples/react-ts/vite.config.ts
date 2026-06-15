import { fonts } from '@pyyupsk/vite-fonts'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    fonts({
      source: 'google',
      families: ['Inter', 'Fira Code'],
    }),
  ],
  server: {
    host: '0.0.0.0',
  },
})
