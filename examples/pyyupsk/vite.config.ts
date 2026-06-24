import { fonts } from '@pyyupsk/vite-fonts'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    react(),
    fonts({
      source: 'pyyupsk',
      families: ['Lobster', 'Merriweather:variable'],
    }),
  ],
  server: {
    host: '0.0.0.0',
  },
})
