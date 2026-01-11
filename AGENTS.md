# Repository Guidelines

## Project Structure & Module Organization
- `src/` holds TypeScript source for the Chrome extension.
  - `src/background.ts` is the service worker entry.
  - `src/contents/` contains content scripts (one file per feature).
  - `src/utils/` contains shared helpers.
  - `src/images/` stores extension icons.
- `scripts/` contains build scripts that bundle or copy assets into `dist/`.
- `manifest.json` is the source manifest (with `$schema`); build output is `dist/manifest.json`.

## Build, Test, and Development Commands
- `yarn build`: clears `dist/` and builds the extension bundles (background, content scripts, images, manifest).
- `yarn build:background`: bundle `src/background.ts` with esbuild into `dist/`.
- `yarn build:contents`: bundle each `src/contents/*.ts` into `dist/contents/`.
- `yarn build:images`: copy `src/images/*.png` into `dist/images/`.
- `yarn build:manifest`: strip `$schema` and write `dist/manifest.json`.

To run locally, build and load the `dist/` folder as an unpacked extension in Chrome.

## Coding Style & Naming Conventions
- Use 2-space indentation, semicolons, and double quotes to match existing files.
- TypeScript files use camelCase for functions and `kebab-case` for content script filenames (e.g., `copy-commit-hash-in-pr.ts`).
- Keep content scripts focused on one feature per file; share helpers via `src/utils/`.

## Testing Guidelines
- No automated tests are currently configured (no `test` script in `package.json`).
- If you add tests, include a minimal runner and document it in this file. Prefer `tests/` or `src/**/__tests__/` and keep names aligned with the feature under test.

## Commit & Pull Request Guidelines
- Recent history mixes short messages and Conventional Commit-style prefixes (e.g., `chore:`). Follow that style: concise, imperative, and scoped when helpful.
- PRs should include a clear description of the change, any manual testing notes, and screenshots for UI changes to GitHub pages or extension UI.

## Configuration & Release Notes
- The extension manifest source of truth is `manifest.json`; build output lives under `dist/`.
- If you update `manifest.json`, rebuild so `dist/manifest.json` stays in sync.
