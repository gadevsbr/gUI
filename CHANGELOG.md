# Changelog

All notable changes to gUI will be documented in this file.

## Unreleased

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
