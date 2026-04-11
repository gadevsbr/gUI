# Changelog

All notable changes to gUI will be documented in this file.

## Unreleased

## 1.2.5 - 2026-04-11

### Added

- **Native Web Components (`defineElement`)**: A factory that wraps gUI reactivity inside standard `HTMLElement` Custom Elements.
  - Generates reactive `props` stores that automatically sync with HTML attributes.
  - Creates transparent getters/setters on the element so JS property updates (`el.myProp = 10`) immediately trigger the reactive layer.
  - Inherits the `mount`/`unmount` system, meaning completely self-cleaning `disconnectedCallback` garbage collection.

### Fixed

- **Critical Compiler Attribute Bug**: Fixed an internal parser bug in `templateCompiler.js` where multiple reactive attributes on the same tag (e.g. `<div id=\${...} class=\${...}>`) were silently failing interpolation due to context chunk loss. The engine now correctly analyzes full markup accumulation.

## 1.2.4 - 2026-04-11

### Added

- **Zero-Build Native Router**: Official client-side router avoiding large third-party bundles for SPAs.
  - `Router({ mode: 'hash' | 'history', fallback }, routes)` wrapper.
  - `Route({ path }, children)` matcher supporting capture groups e.g. `/users/:id`.
  - Helpers `push(path)`, `replace(path)`, and `useRouter()`.

## 1.2.3 - 2026-04-11

### Changed

- Refreshed `npm-readme.md` so the npm package page matches the current `1.2.x` API surface, zero-build positioning, and release notes.

## 1.2.2 - 2026-04-11

### Added

- `createStore()`: Nested reactive proxy supporting state reads without getter wrappers (`${store.count}`).
- `batch()`: Suspends the microtask scheduler and groups multiple signal writes into a single synchronous flush.
- `createResource()`: Wraps asynchronous side-effects in a reactive store (`loading`, `value`, `error`) that recalculates natively on dependency updates.
- `on()`: Ergonomic helper simplifying two-way data-bindings for native input events.
- Added all new primitives to `index.js`, `index.d.ts` and the main website API reference.

## 1.2.1 - 2026-04-07

### Changed

- Refreshed the GitHub and npm READMEs to match the current `1.2.x` public API, package names, and installation guidance.
- Republished the package so the npm package page reflects the updated README content.

## 1.2.0 - 2026-04-07

### Added

- Comprehensive unit test suite with 180+ tests using Vitest and `happy-dom` to ensure rigorous DOM rendering, fine-grained reactivity graph and compiler stability. 
- Official `@bragamateus/gui/devtools` inspector with exact DOM overlays and runtime timeline.
- `subscribeDomUpdates()` for multi-listener DOM write subscriptions.
- Runtime event instrumentation for signal writes, computed refresh/invalidation, subscriber flushes, cleanup, and owner disposal.
- Built-in inspector integration across the docs site, runtime demo, and benchmark harness.

### Changed

- DOM update payloads now include timestamps, origin subscriber metadata, and structural `move` events.
- The package exports now include `@bragamateus/gui/devtools`.
- README, npm README, roadmap, and site content now document the visual inspection workflow.

## 1.1.0 - 2026-03-29

### Added

- Keyed `list()` reconciliation with stable per-item ownership.
- Scoped disposal for dynamic subtrees and nested effects.
- A browser benchmark harness covering batched text updates, keyed reorder, and cleanup cycles.
- Optional compile-assisted templates with Vite and esbuild integration.
- Compiler smoke checks as part of `npm run check`.

### Changed

- Expanded package exports with `@bragamateus/gui/compiler`.
- Updated GitHub and NPM READMEs to document the compiler workflow and the `1.1.0` release.
- Moved the roadmap forward to focus on devtools, diagnostics, context helpers, and SSR/hydration.
