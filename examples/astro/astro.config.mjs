// @ts-check
import { fonts } from '@pyyupsk/vite-fonts/astro'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    fonts({
      source: 'google',
      families: ['Inter', 'Fira Code'],
    }),
  ],
  server: {
    host: '0.0.0.0',
  },
})
