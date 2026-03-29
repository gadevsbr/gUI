# Roadmap

## Recently Completed

- Keyed `list()` helpers with stable per-item ownership and minimal structural churn.
- Scoped disposal for dynamic child templates so swapped subtrees release nested effects cleanly.
- A repeatable browser perf harness for text bursts, keyed reorders, and subtree cleanup cycles.

## Near-Term

- Add compile-assisted templates for richer expression capture without giving up direct DOM bindings.
- Add devtools hooks for inspecting source graphs, subscriber edges, and flush order.
- Add context and prop helpers that preserve one-time component execution.

## Medium-Term

- Server-side rendering with serialized signal graphs.
- Selective hydration that attaches bindings without rerendering static DOM.
- Streaming partial hydration for island-style bootstrapping.

## Long-Term

- Partial compilation for hotter template paths and structural bindings.
- Data-loading and resource primitives that preserve explicit ownership.
- Profiling hooks for correlating reactive graph work with DOM writes.
