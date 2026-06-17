# Changelog

## [0.2.0](https://github.com/pyyupsk/vite-fonts/compare/vite-fonts-v0.1.1...vite-fonts-v0.2.0) (2026-06-17)

### ✨ Features

- add fontsource as a font source ([#6](https://github.com/pyyupsk/vite-fonts/issues/6)) ([73d2b9c](https://github.com/pyyupsk/vite-fonts/commit/73d2b9cc1c5916ddcb3bb670ceba5df3a1e5e38d))

### 🐛 Bug Fixes

- preserve variable font weight range and emit fonts.css to disk ([#8](https://github.com/pyyupsk/vite-fonts/issues/8)) ([965e185](https://github.com/pyyupsk/vite-fonts/commit/965e18538142ce1925429fa99bceee7fa73f7d64))

## [0.1.1](https://github.com/pyyupsk/vite-fonts/compare/vite-fonts-v0.1.0...vite-fonts-v0.1.1) (2026-06-15)

### 🐛 Bug Fixes

- add setup-node to resolve npm auth in publish job ([#2](https://github.com/pyyupsk/vite-fonts/issues/2)) ([f6f6781](https://github.com/pyyupsk/vite-fonts/commit/f6f67816ae9a1fcb2a36a0a9e24e4ce87d43548e))
- resolve variable fonts with non-standard wght axis minimum ([#5](https://github.com/pyyupsk/vite-fonts/issues/5)) ([6b06281](https://github.com/pyyupsk/vite-fonts/commit/6b0628152c1541b168bb861bd87c5466dd938055))

## 0.1.0 (2026-06-15)

### ✨ Features

- Vite plugin that downloads and self-hosts web fonts at build time
- Google Fonts support via CSS API v2 ([3f5479e](https://github.com/pyyupsk/vite-fonts/commit/3f5479eb3decf8798a16b89b40b16947c926c766))
- Bunny Fonts source support ([8ef5df8](https://github.com/pyyupsk/vite-fonts/commit/8ef5df8dcad775c158c9b8eefad488aa5e731f36))
- Virtual module `@pyyupsk/fonts` with full TypeScript declarations ([bf5a65d](https://github.com/pyyupsk/vite-fonts/commit/bf5a65d73ec1f5c18ebbbc6ad5135eca4c6f1b19))
- Font fallback metrics via `adjustFontFallback` to minimize layout shift ([a6b4378](https://github.com/pyyupsk/vite-fonts/commit/a6b43788f27f0c51719cf3f87bef77c01a3a0233))
- Manifest-based font cache with automatic invalidation ([135fde3](https://github.com/pyyupsk/vite-fonts/commit/135fde369f9ffd04280b129945537d62dc506c39))
- CLI (`vite-fonts clean/list`) ([9238930](https://github.com/pyyupsk/vite-fonts/commit/9238930613310292052864b9fd9fcb82ce037cfa))
- Astro SSR integration ([06fd52a](https://github.com/pyyupsk/vite-fonts/commit/06fd52a798a19eb237b6a6b76350ea81c053c972))
- Fuzzy font name suggestions in error messages ([80aecc1](https://github.com/pyyupsk/vite-fonts/commit/80aecc102e2aaad31126cfda04cdeee53677e6e8))
