# Roadmap

## Near-Term

- Add keyed list helpers with stable per-item ownership and minimal structural churn.
- Add scoped disposal for dynamic child templates so swapped subtrees can release nested effects cleanly.
- Add fragment-level benchmarking and a repeatable perf harness against common micro-cases.

## Medium-Term

- Add compile-assisted templates for richer expression capture without giving up direct DOM bindings.
- Add devtools hooks for inspecting source graphs, subscriber edges, and flush order.
- Add context and prop helpers that preserve one-time component execution.

## Long-Term

- Server-side rendering with serialized signal graphs.
- Selective hydration that attaches bindings without rerendering static DOM.
- Streaming partial hydration for island-style bootstrapping.
