# @pyyupsk/vite-fonts

Downloads and self-hosts web fonts at build time — no runtime CDN calls, no CLS, no manual `@font-face`.

## Features

- Self-hosts fonts from Google Fonts, Bunny Fonts, Fontsource, or [fonts.fasu.dev](https://fonts.fasu.dev) (downloaded at build time, served from your output)
- Generates `@font-face` CSS with `size-adjust` fallback metrics to eliminate CLS
- Injects `<link rel="preload">` tags automatically
- CSS variable per family — syncs with Tailwind v4 `@theme` automatically
- Type-safe `@pyyupsk/fonts/meta` module with autocomplete on family keys
- Caches font files in `node_modules/.cache/vite-fonts/` (no redownload on second run)

## Install

```bash
bun add -D @pyyupsk/vite-fonts
```

## Usage

### Vite

```ts
// vite.config.ts
import { fonts } from '@pyyupsk/vite-fonts'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [fonts('Inter')],
})
```

```ts
// vite-env.d.ts
/// <reference types="@pyyupsk/vite-fonts/client" />
```

### Astro

```ts
// astro.config.ts
import { fonts } from '@pyyupsk/vite-fonts/astro'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [fonts('Inter')],
})
```

### SSR frameworks

Frameworks such as TanStack Start, React Router and SvelteKit render HTML at request time. The plugin cannot add preload tags to that HTML. Render them in your document head from `@pyyupsk/fonts/meta`. Example for TanStack Start:

```tsx
// src/routes/__root.tsx
import '@pyyupsk/fonts'
import * as fonts from '@pyyupsk/fonts/meta'
import { createRootRoute } from '@tanstack/react-router'

export const Route = createRootRoute({
  head: () => ({
    links: fonts.preloads.map((p) => ({
      rel: 'preload',
      as: 'font',
      crossOrigin: 'anonymous',
      ...p,
    })),
  }),
})
```

## Configuration

Three input shapes, escalating in specificity.

**Layer 1 — string or array (90% case)**

```ts
fonts('Inter')
fonts(['Inter', 'JetBrains Mono'])
fonts(['Inter:variable', 'JetBrains Mono']) // :variable suffix → variable font
```

**Layer 2 — object with array families**

```ts
fonts({
  display: 'optional',
  preload: ['Inter'],
  families: ['Inter', 'JetBrains Mono'],
})
```

**Layer 3 — full family map**

```ts
fonts({
  source: 'google', // 'google' | 'bunny' | 'fontsource' | 'pyyupsk'
  inject: 'auto', // 'auto' | 'manual' | false

  families: {
    sans: {
      family: 'Inter',
      weights: [400, 500, 700],
      styles: ['normal', 'italic'],
      variable: '--font-sans',
      fallback: ['system-ui', 'sans-serif'],
      adjustFontFallback: true, // size-adjust metrics → zero CLS
      preload: true,
    },
    mono: {
      family: 'JetBrains Mono',
      weights: ['variable'],
      axes: ['wght', 'slnt'],
      variable: '--font-mono',
      adjustFontFallback: 'Courier New',
    },
    brand: {
      family: 'Satoshi',
      local: [{ path: './fonts/Satoshi[wght].woff2', weight: '100 900', style: 'normal' }],
      variable: '--font-brand',
    },
  },
})
```

### `FamilyConfig` options

| Option               | Type                       | Default           | Description                                                   |
| -------------------- | -------------------------- | ----------------- | ------------------------------------------------------------- |
| `family`             | `string`                   | —                 | Font name (required in map form)                              |
| `weights`            | `(number \| 'variable')[]` | `[400, 500, 700]` | Weights to download                                           |
| `styles`             | `('normal' \| 'italic')[]` | `['normal']`      | Font styles                                                   |
| `subsets`            | `string[]`                 | `['latin']`       | Unicode subsets                                               |
| `display`            | `FontDisplay`              | `'swap'`          | `font-display` value                                          |
| `axes`               | `string[]`                 | `[]`              | Variable font axes beyond `wght`                              |
| `variable`           | `string`                   | auto-derived      | CSS variable name, e.g. `--font-sans`                         |
| `fallback`           | `string[]`                 | auto by category  | Fallback font stack                                           |
| `adjustFontFallback` | `boolean \| string`        | `false`           | Generate `size-adjust` metrics to reduce CLS                  |
| `preload`            | `boolean \| number[]`      | `true`            | Preload weight 400 (or the first file), or the listed weights |
| `local`              | `LocalFontFile[]`          | `[]`              | Local font files (bypasses remote source)                     |

## Virtual module

```ts
// inject: 'manual' — import CSS manually
import '@pyyupsk/fonts'

// metadata — family keys, CSS variables, weights
import { fonts } from '@pyyupsk/fonts/meta'
fonts.sans.family // "Inter"
fonts.sans.variable // "--font-sans"
fonts.sans.cssVar // "var(--font-sans)"
fonts.sans.weights // [400, 500, 700]
fonts.sans.preloads // [{ href: "/assets/inter-400-normal-<hash>.woff2", type: "font/woff2" }]
```

`preloads` lists the files that the `preload` option selects. In a build, each `href` is the final hashed asset URL. In dev, it is `/__fonts/<file>`. The `preloads` export combines the files of all families.

Family keys on `fonts.*` are **literal types** — typos become TS errors, autocomplete works.

## Tailwind v4

CSS variables sync automatically. The plugin emits a `@theme inline` block:

```css
@theme inline {
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
}
```

No extra config needed when you import `@pyyupsk/fonts`.

## Error messages

Actionable errors with suggestions:

```
[vite-fonts] Font "Intre" not found on Google Fonts.

  Did you mean:
    → Inter
    → Inter Tight
```

```
[vite-fonts] "Inter" doesn't have weight 950.

  Available: 100, 200, 300, 400, 500, 600, 700, 800, 900
```

## CLI

```bash
bunx vite-fonts list    # show configured fonts + cache info
bunx vite-fonts clean   # clear font cache
```

## Development

```bash
bun install
bun run build           # tsdown -> dist/
bun run test            # vitest
bun run typecheck       # tsc --noEmit
bun run check           # lint + format check
```
