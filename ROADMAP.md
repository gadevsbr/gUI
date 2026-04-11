# Roadmap

gUI is building toward being the most capable reactive runtime for **zero-build and build-optional JavaScript environments** — a position no JSX-compiler-first framework can occupy without regressing its own model.

## Recently Completed

- Keyed `list()` helpers with stable per-item ownership and minimal structural churn.
- Scoped disposal for dynamic child templates so swapped subtrees release nested effects cleanly.
- `createStore()` proxy for deep zero-build reactivity without getter boilerplate.
- `batch()`, `createResource()`, and `on()` helpers for robust data-loading and event binding.
- A repeatable browser perf harness for text bursts, keyed reorders, and subtree cleanup cycles.
- Compile-assisted templates with Vite/esbuild integration for automatic expression capture.
- Official visual inspector with exact DOM overlays, runtime timeline, and source-aware DOM events.
- Comprehensive unit test suite (180+ tests) using Vitest and `happy-dom`.
- Full docs site, playground, and benchmark harness — all built in gUI itself.

## Near-Term — Zero-Build Ergonomics and Devtools

These make the runtime-only mode a first-class experience and position the inspector as a standalone product:

- CDN-first documentation, examples, and playground entry points.
- Add deeper graph inspection for source edges, subscriber ownership, and flush order.
- Add profiler-grade timelines that correlate subscriber work with actual DOM writes.
- Add compiler diagnostics and opt-out annotations for edge-case expressions.

## Medium-Term — Production Confidence

These make gUI credible for larger internal products and enable teams to bet on it:

- Production-safe performance tracing and remote inspection hooks.
- Browser-based test harness for visual regression of reactive bindings.
- Selective hydration that attaches bindings without rerendering static DOM.

## Long-Term — Server and Partial Boot Workflows

These expand the runtime into server territory without abandoning the zero-build identity:

- Server-side rendering with serialized signal graphs.
- Streaming partial hydration for island-style bootstrapping.
- Deeper tooling for production-safe performance tracing and remote inspection.
