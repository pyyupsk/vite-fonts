# Contributing

## Setup

```sh
git clone https://github.com/pyyupsk/vite-fonts.git
cd vite-fonts
bun install
```

## Development

```sh
bun run build        # build to dist/
bun run test         # run all tests
bun run test:watch   # watch mode
bun run typecheck    # type check
bun run check        # lint + format check
bun run lint:fix     # fix lint issues
bun run format       # fix formatting
```

## Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat|fix|chore|refactor|docs|style|test|perf: subject
```

Subject ≤50 chars. Body only when "why" is non-obvious.

## Pull Requests

1. Branch from `main`: `feat/<name>`, `fix/<name>`, `chore/<name>`
2. Keep PRs focused — one concern per PR
3. All CI checks must pass before merge
