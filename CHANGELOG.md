# Changelog

All notable changes to gUI will be documented in this file.

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
