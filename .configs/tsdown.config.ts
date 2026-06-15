import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    astro: 'src/frameworks/astro.ts',
    middleware: 'src/middleware.ts',
    'cli/index': 'src/cli/index.ts',
  },
  format: ['esm'],
  outExtensions: () => ({ js: '.js', dts: '.d.ts' }),
  dts: true,
  clean: true,
  sourcemap: false,
  copy: [{ from: 'src/client.d.ts', to: 'dist' }],
  deps: { neverBundle: ['vite'] },
})
