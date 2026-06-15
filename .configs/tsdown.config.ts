import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: '../src/index.ts',
    astro: '../src/frameworks/astro/index.ts',
    'astro/middleware': '../src/frameworks/astro/middleware.ts',
    'cli/index': '../src/cli/index.ts',
  },
  outDir: '../dist',
  format: ['esm'],
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  dts: true,
  clean: true,
  sourcemap: false,
  copy: [{ from: '../src/client.d.ts', to: '../dist' }],
  deps: { neverBundle: ['vite'] },
})
