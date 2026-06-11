import { fonts } from '@pyyupsk/vite-fonts'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    fonts({
      families: {
        sans: { family: 'Inter', weights: [400, 700] },
        mono: { family: 'JetBrains Mono', weights: [400] },
      },
    }),
    react(),
  ],
  server: {
    host: '0.0.0.0',
  },
})
