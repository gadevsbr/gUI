# Roadmap

## Recently Completed

- Keyed `list()` helpers with stable per-item ownership and minimal structural churn.
- Scoped disposal for dynamic child templates so swapped subtrees release nested effects cleanly.
- A repeatable browser perf harness for text bursts, keyed reorders, and subtree cleanup cycles.
- Compile-assisted templates with Vite/esbuild integration for automatic expression capture.
- Official visual inspector with exact DOM overlays, runtime timeline, and source-aware DOM events.

## Near-Term

- Add deeper graph inspection for source edges, subscriber ownership, and flush order.
- Add profiler-grade timelines that correlate subscriber work with actual DOM writes.
- Add context and prop helpers that preserve one-time component execution.
- Add compiler diagnostics and opt-out annotations for edge-case expressions.

## Medium-Term

- Server-side rendering with serialized signal graphs.
- Selective hydration that attaches bindings without rerendering static DOM.
- Streaming partial hydration for island-style bootstrapping.

## Long-Term

- Partial compilation for hotter template paths and structural bindings.
- Data-loading and resource primitives that preserve explicit ownership.
- Deeper tooling for production-safe performance tracing and remote inspection.
