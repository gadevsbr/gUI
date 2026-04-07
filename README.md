# gUI

[![npm version](https://img.shields.io/npm/v/%40bragamateus%2Fgui?label=npm)](https://www.npmjs.com/package/@bragamateus/gui)
[![license](https://img.shields.io/github/license/gadevsbr/gUI)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-live-0d7c6b)](https://gadevsbr.github.io/gUI/)
[![wiki](https://img.shields.io/badge/wiki-available-2359cc)](https://github.com/gadevsbr/gUI/wiki)
[![codecov](https://codecov.io/github/gadevsbr/gUI/graph/badge.svg?token=6H7DILR5I3)](https://codecov.io/github/gadevsbr/gUI)

gUI is a performance-first JavaScript UI runtime for teams that want exact DOM updates, stable ownership, and a smaller mental model than rerender-driven frameworks.

It is built around fine-grained reactivity, direct subscriptions, and real DOM bindings. No virtual DOM diffing. No hook scheduler. No full component rerender loop.

## Why gUI

Most UI stacks make broad updates look cheap until the interface gets dense, stateful, or constantly moving.

gUI takes the opposite position:

- state changes should update only the exact bindings that depend on them
- components should be setup functions, not rerender boundaries
- structural changes should preserve keyed ownership instead of rebuilding rows
- dynamic subtrees should clean up effects and listeners when they leave the DOM
- performance should come from runtime architecture, not rescue work late in the project

This makes gUI a strong fit for:

- dashboards with fast-moving metrics
- internal products where responsiveness matters
- interactive surfaces that cannot afford rerender churn
- teams that want explicit reactive flow and fewer hidden framework costs

## What You Get

- Fine-grained `signal()`, `computed()`, and `effect()` primitives
- Tagged template rendering with direct text, attribute, and event bindings
- First-class control flow with `Show()`, `Switch()`, `Match()`, and `Portal()`
- Composition helpers with `createContext()`, `provideContext()`, `useContext()`, `mergeProps()`, and `splitProps()`
- Optional compile-assisted templates for automatic expression capture
- Keyed `list()` reconciliation with stable per-item ownership
- Scoped disposal for swapped dynamic subtrees
- `mount()` and `createApp()` helpers for one-time setup and controlled teardown
- Microtask-based batching with deduped subscriber scheduling
- DOM write instrumentation via `setDomUpdateHook()` and `subscribeDomUpdates()`
- Optional visual inspector with overlays for exact writes, keyed moves, cleanup, and flushes
- Official docs site with tutorials, recipes, API reference, performance notes, and a live playground
- Browser demo and benchmark harness
- ESM package with TypeScript declarations

## Install

```bash
npm install @bragamateus/gui
```

GitHub Packages:

```bash
npm install @gadevsbr/gui --registry=https://npm.pkg.github.com
```

## Website

The project site is live at:

- https://gadevsbr.github.io/gUI/
- https://gadevsbr.github.io/gUI/demo/
- https://gadevsbr.github.io/gUI/benchmark/

Use it when you want the higher-level view of the framework before reading source code. It includes
tutorials, implementation notes, API reference, recipes, roadmap context, and an interactive
playground that shows how gUI updates exact DOM bindings in real time. The docs site, runtime
demo, and benchmark now ship with the visual inspector enabled by default.

Quick access:

- Docs + tutorials + playground: `https://gadevsbr.github.io/gUI/`
- Runtime demo: `https://gadevsbr.github.io/gUI/demo/`
- Benchmark harness: `https://gadevsbr.github.io/gUI/benchmark/`

## Update Note

### v1.2.0

`1.2.0` is the current package line on npm and GitHub Packages.

This version sharpens both the runtime and the debugging story:

- official `@bragamateus/gui/devtools` inspector for exact DOM overlays and runtime timelines
- `subscribeDomUpdates()` for multi-listener DOM write observation alongside the legacy single-hook API
- richer runtime instrumentation for text, attribute, insert, move, remove, cleanup, and flush events
- strengthened package validation with a broad Vitest + `happy-dom` test suite

The public API documented below now matches the code currently exported by the package, including
composition helpers, control-flow primitives, portals, compiler hooks, and devtools.

## Optional Compiler

For build-based projects, gUI now ships an optional compiler that rewrites non-event `html\`...\``
interpolations into getter functions automatically.

That means code like this:

```js
html`<p>${count.value * 2}</p>`
```

can be compiled to the runtime-safe equivalent automatically:

```js
html`<p>${() => count.value * 2}</p>`
```

### Vite

```js
import { defineConfig } from "vite";
import { guiVitePlugin } from "@bragamateus/gui/compiler";

export default defineConfig({
  plugins: [guiVitePlugin()],
});
```

### esbuild

```js
import { build } from "esbuild";
import { guiEsbuildPlugin } from "@bragamateus/gui/compiler";

await build({
  entryPoints: ["src/main.js"],
  bundle: true,
  outfile: "dist/main.js",
  plugins: [guiEsbuildPlugin()],
});
```

## Visual Inspector

gUI now ships with an official visual inspector for turning runtime behavior into something you can
actually see.

It is fully opt-in. Importing `@bragamateus/gui` does not mount any visual tooling by default.
The inspector only exists when you explicitly import `@bragamateus/gui/devtools` and call
`createInspector()`.

```js
import { createInspector } from "@bragamateus/gui/devtools";

createInspector({
  target: "#app",
  title: "Live DOM Lens",
});
```

What it shows:

- exact text, attribute, insert, move, and remove work
- the binding or subscriber responsible for the DOM write
- source labels connected to that flush
- cleanup cycles, computed refreshes, and subscriber execution in one timeline

This is the fastest way to prove that gUI is updating bindings instead of rerendering whole trees.

## Quick Example

```js
import { createApp, computed, html, list, signal } from "@bragamateus/gui";

const count = signal(0);
const rows = signal([
  { id: "latency", label: "Latency budget", value: 12 },
  { id: "flush", label: "Flush stability", value: 3 },
]);

const total = computed(() => rows.value.reduce((sum, row) => sum + row.value, 0));

function renderRow(row, index) {
  return html`
    <li>
      <span>${() => index.value + 1}</span>
      <strong>${() => row.value.label}</strong>
      <span>${() => row.value.value}</span>
    </li>
  `;
}

function App() {
  return html`
    <section>
      <h1>${count.value}</h1>
      <p>Total: ${() => total.value}</p>

      <button on:click=${() => (count.value += 1)}>Increment</button>
      <button
        on:click=${() => {
          rows.value = [...rows.value].reverse();
        }}
      >
        Reverse rows
      </button>

      <ul>${list(rows, "id", renderRow)}</ul>
    </section>
  `;
}

createApp("#app", App);
```

## Core API

### `signal(initialValue)`

Creates mutable reactive state. Reads track the current subscriber. Writes notify only direct dependents.

### `computed(fn)`

Creates lazy cached derived state. Computeds recalculate only when tracked sources changed and the value is read again.

### `effect(fn)`

Runs tracked side effects with cleanup support. Effects are batched in microtasks and rerun only when their sources changed.

### `html\`...\``

Compiles a template once per call site, clones real DOM nodes, and wires each dynamic slot directly to signals, computeds, or getter functions.

`isTemplateResult(value)` is also exported when you need to distinguish gUI template results from plain values.

### `list(source, key, render)`

Creates keyed structural bindings. Each key gets stable ownership, so reorders move existing DOM nodes and per-item effects survive until that key actually leaves the list.

`render` runs once per key and receives:

- `item`: a `Signal<T>` for the current item value
- `index`: a `Signal<number>` for the current position
- `key`: the resolved key

### `createApp(target, component)`

Runs the component once, mounts the result, and keeps future work inside bindings, signals, computeds, effects, and keyed owners.

### `mount(target, value)`

Mounts any renderable value directly and returns a handle with `unmount()` for explicit teardown.

### Context and Props

- `createContext(defaultValue)` creates owner-scoped context
- `provideContext(context, value, render)` injects a value for a subtree
- `useContext(context)` reads the nearest provided value or the context default
- `mergeProps(...sources)` lazily overlays prop sources
- `splitProps(props, ...keysets)` creates reactive prop partitions without cloning

### Control Flow and Portals

- `Show({ when, children, fallback })` renders a truthy branch with the resolved value
- `Match({ when, children })` defines a case for `Switch()`
- `Switch(cases, fallback)` selects the first truthy `Match()`
- `Portal(target, children)` renders a subtree into another DOM container while preserving cleanup ownership

### Compiler Exports

- `guiVitePlugin()` wires compile-assisted templates into Vite
- `guiEsbuildPlugin()` wires compile-assisted templates into esbuild
- `transformGuiTemplates()` exposes the raw template transform for custom tooling

### Debugging and Devtools

- `setDomUpdateHook(fn)` keeps the legacy single-listener DOM write hook
- `subscribeDomUpdates(fn)` lets multiple tools observe exact DOM writes concurrently
- `createInspector(options)` from `@bragamateus/gui/devtools` turns those streams into overlays and runtime timeline entries

## Performance Model

gUI is optimized around a simple rule: state changes should trigger only the work that is truly necessary.

- Signals notify only direct subscribers.
- Computeds stay lazy and cached.
- Effects are deduped and flushed in microtasks.
- Text and attribute bindings update concrete DOM nodes in place.
- Keyed list changes move existing nodes instead of rebuilding rows.
- Disposed dynamic branches release nested effects and listeners before nodes are removed.

## Important Constraint

gUI supports two modes:

- runtime-only mode
- compile-assisted mode

In runtime-only mode, JavaScript still evaluates expressions before the `html` tag receives them:

- `${count.value}` is reactive during setup for primitives
- `${() => count.value * 2}` is reactive
- `${count.value * 2}` should use `computed()` or a getter function if it needs to update
- object property access should usually live inside a getter function, for example `${() => row.value.label}`

With the optional compiler enabled, most non-event interpolations are wrapped automatically, which
removes most of that boilerplate without changing the runtime model.

## Demo And Benchmarks

The repository includes:

- `https://gadevsbr.github.io/gUI/`: docs site with tutorials, API reference, recipes, the playground, and the live inspector
- `https://gadevsbr.github.io/gUI/demo/`: public runtime demo for direct bindings, keyed rows, scoped disposal, and inspector overlays
- `https://gadevsbr.github.io/gUI/benchmark/`: public browser harness for text bursts, keyed reorders, cleanup cycles, and inspector timelines
- [`index.html`](./index.html): source entry for the runtime demo
- [`benchmark/index.html`](./benchmark/index.html): source entry for the benchmark harness

Run locally with any static server, then open those pages in the browser.

## Project Structure

```text
gui/
  compiler/
  core/
  devtools/
  reactivity/
  rendering/
  utils/
demo/
benchmark/
index.html
ROADMAP.md
```

## Roadmap

The current direction is:

- deeper graph inspection and reactive edge tracing
- profiler-grade timelines that correlate flushes with DOM work
- context and prop helpers that preserve one-time execution
- compiler diagnostics and opt-out annotations for edge-case expressions
- SSR and hydration without rerendering static DOM

See [ROADMAP.md](./ROADMAP.md) for the full roadmap.

## Package

- NPM: `@bragamateus/gui`
- GitHub Packages: `@gadevsbr/gui`
- License: [MIT](./LICENSE)

## Development

Validate the codebase locally with:

```bash
npm run check
```

Run the exhaustive unit test suite (built with Vitest + happy-dom) via:

```bash
npm test
# Or to evaluate code coverage:
npm run test:coverage
```
