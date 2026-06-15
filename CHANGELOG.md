# Changelog

## 1.0.0 (2026-06-15)

### ✨ Features

- add Bunny Fonts source and bunny example ([8ef5df8](https://github.com/pyyupsk/vite-fonts/commit/8ef5df8dcad775c158c9b8eefad488aa5e731f36))
- add error UX polish with fuzzy font suggestions ([80aecc1](https://github.com/pyyupsk/vite-fonts/commit/80aecc102e2aaad31126cfda04cdeee53677e6e8))
- add minimal demo app ([286e1fd](https://github.com/pyyupsk/vite-fonts/commit/286e1fd91aa62bd3c5392bbed3362f4e42ab6b5f))
- add transformIndexHtml hook for stylesheet and preload link injection ([6f5f6c4](https://github.com/pyyupsk/vite-fonts/commit/6f5f6c4d822b5aa1f2398dd4bc7fbc3c49df6a58))
- add vite logger and wire into cache manager ([9aee9b6](https://github.com/pyyupsk/vite-fonts/commit/9aee9b6a6f19d388341facee4ac7d5943c9a1f13))
- **demo:** redesign demo with dark theme and font specimen ([4cef6a0](https://github.com/pyyupsk/vite-fonts/commit/4cef6a0f769235cd3d9cc26a812fa72b23b8cf72))
- emit font assets and rewrite CSS urls in build mode ([684ab2d](https://github.com/pyyupsk/vite-fonts/commit/684ab2dfc76af583f2c655adc772bf6d79454266))
- generate typed client.d.ts for virtual font modules ([2d36f91](https://github.com/pyyupsk/vite-fonts/commit/2d36f918dd68bd776448bae0ecb38f90a3d0716e))
- implement adjustFontFallback with metrics table and sidecar font-face generation ([a6b4378](https://github.com/pyyupsk/vite-fonts/commit/a6b43788f27f0c51719cf3f87bef77c01a3a0233))
- implement cache download and manager with manifest-based invalidation ([135fde3](https://github.com/pyyupsk/vite-fonts/commit/135fde369f9ffd04280b129945537d62dc506c39))
- implement CLI with citty and consola ([9238930](https://github.com/pyyupsk/vite-fonts/commit/9238930613310292052864b9fd9fcb82ce037cfa))
- implement config normalizer, hash, and types with tests ([7d84a15](https://github.com/pyyupsk/vite-fonts/commit/7d84a15fbeb76f73c598efd31a1ff966afda4932))
- implement CSS generator with font-face, theme, and root variable blocks ([c850e01](https://github.com/pyyupsk/vite-fonts/commit/c850e01119411cf8347a1fde3e20dd2e268277d2))
- implement Google Fonts CSS API v2 url builder and CSS parser ([3f5479e](https://github.com/pyyupsk/vite-fonts/commit/3f5479eb3decf8798a16b89b40b16947c926c766))
- implement vite plugin shell with resolveId, load, buildStart, and configureServer hooks ([7221bc0](https://github.com/pyyupsk/vite-fonts/commit/7221bc0541a4bf74ed097382b142cc89db9c9e59))
- ship client.d.ts for virtual module type declarations ([bf5a65d](https://github.com/pyyupsk/vite-fonts/commit/bf5a65d73ec1f5c18ebbbc6ad5135eca4c6f1b19))
- **ssr:** add Astro SSR support and integration ([06fd52a](https://github.com/pyyupsk/vite-fonts/commit/06fd52a798a19eb237b6a6b76350ea81c053c972))

### 🐛 Bug Fixes

- **build:** fix copy path for client.d.ts relative to .configs/ dir ([2b57c2e](https://github.com/pyyupsk/vite-fonts/commit/2b57c2e2cbb6eef5aadc7e7ece26ee4241d74f93))
- **build:** prefix entry paths with ../ to resolve from .configs/ dir ([37a78df](https://github.com/pyyupsk/vite-fonts/commit/37a78dfa72986102742ad83ccc04d6705b9f5e76))
- **build:** set outDir to ../dist so output lands in repo root dist/ ([aa13177](https://github.com/pyyupsk/vite-fonts/commit/aa13177c0c2c1461f34598607cdcd6328d639c18))
- **cache:** handle local fonts and fix google fonts opsz axis ([aa4eec9](https://github.com/pyyupsk/vite-fonts/commit/aa4eec9183c20b17dc6d29df28ce2d7e58cf4e5f))
- correct font CSS var naming, subset filtering, and dev server CSS delivery ([cc6b4aa](https://github.com/pyyupsk/vite-fonts/commit/cc6b4aa977b0ff1f5a24c2f0ebb3cd95fede6976))
- emit font assets and inject HTML tags correctly in build mode ([995d8f0](https://github.com/pyyupsk/vite-fonts/commit/995d8f0d3d0146391da16e30a48838850907cf9c))
- **test:** resolve @/ alias in ESM context and update vscode config path ([380a83f](https://github.com/pyyupsk/vite-fonts/commit/380a83f134b6965dfb1f5102674175bac32a5818))
- **typecheck:** exclude examples from tsc ([ec25d21](https://github.com/pyyupsk/vite-fonts/commit/ec25d21dc0b0424c055217869dbfc04403efce1c))
- **types:** resolve dual-vite mismatch and PluginOption narrowing errors ([39db017](https://github.com/pyyupsk/vite-fonts/commit/39db0177c460226cfb7cd9474ed66bad349d8869))

### ⚡ Performance

- extract font metrics from WOFF2 via fontkit at runtime ([cd2ec31](https://github.com/pyyupsk/vite-fonts/commit/cd2ec3166cba86c845a4c633dfad7e33afb57cd5))

### ♻️ Refactors

- **cache:** move fmt helper to module scope ([5b34691](https://github.com/pyyupsk/vite-fonts/commit/5b34691df5d8227394ad05aeb758d6cbf8720e9a))
- **errors:** extract stateNotInitializedError and normalize message format ([d36a7d3](https://github.com/pyyupsk/vite-fonts/commit/d36a7d35cb9a9e6df6cd6c99597b8554b94bb3ef))
- fix underscore-dangle warnings and stub cli entrypoint ([046ac9d](https://github.com/pyyupsk/vite-fonts/commit/046ac9d119bf0e704bf590e9924d810114419eb2))
- improve plugin log output with colors and summary lines ([28bfa74](https://github.com/pyyupsk/vite-fonts/commit/28bfa744a9cf954e0edbf2d64f4f09d3d7f9b40b))
- move astro middleware to src/frameworks/astro/ and rename export to ./astro/middleware ([949f6d1](https://github.com/pyyupsk/vite-fonts/commit/949f6d16630872d801343dbdfffc0b543ef0869f))
- move astro.ts to src/frameworks/astro.ts ([713f40e](https://github.com/pyyupsk/vite-fonts/commit/713f40e7ca445bcd5dd85ff3659ab25998314838))
- move tests into tests/{unit,integration,e2e,smoke} structure ([00b16ae](https://github.com/pyyupsk/vite-fonts/commit/00b16ae3990d4e7e8a8a079424210624411e41ce))

### 📚 Documentation

- replace generic Bun template with project-specific CLAUDE.md ([5822e64](https://github.com/pyyupsk/vite-fonts/commit/5822e6433b2cf0bf35fde6260d1264e0fc2535ca))
- rewrite README with full usage guide and update CLAUDE.md entry points ([2f3e96d](https://github.com/pyyupsk/vite-fonts/commit/2f3e96db4c812249b3489daaa4fba54909be4f28))
