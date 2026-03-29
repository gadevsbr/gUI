# gUI

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
- Optional compile-assisted templates for automatic expression capture
- Keyed `list()` reconciliation with stable per-item ownership
- Scoped disposal for swapped dynamic subtrees
- Microtask-based batching with deduped subscriber scheduling
- Debug hooks for inspecting actual DOM writes
- Official docs site with tutorials, recipes, API reference, performance notes, and a live playground
- Browser demo and benchmark harness
- ESM package with TypeScript declarations

## Install

```bash
npm install @bragamateus/gui
```

## Website

The project site is live at:

- https://gadevsbr.github.io/gUI/

Use it when you want the higher-level view of the framework before reading source code. It includes
tutorials, implementation notes, API reference, recipes, roadmap context, and an interactive
playground that shows how gUI updates exact DOM bindings in real time.

## Update Note

### v1.1.0

This release moves gUI beyond fine-grained static bindings and into a more practical application
runtime:

- keyed `list()` reconciliation with stable per-item ownership
- scoped disposal for dynamic subtrees and nested effects
- repeatable benchmark harness for batching, keyed reorder, and cleanup cycles
- optional compile-assisted templates with Vite and esbuild integration

This is the first version where gUI pairs low-level runtime precision with a realistic path to
better day-to-day developer ergonomics.

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

### `list(source, key, render)`

Creates keyed structural bindings. Each key gets stable ownership, so reorders move existing DOM nodes and per-item effects survive until that key actually leaves the list.

`render` runs once per key and receives:

- `item`: a `Signal<T>` for the current item value
- `index`: a `Signal<number>` for the current position
- `key`: the resolved key

### `createApp(target, component)`

Runs the component once, mounts the result, and keeps future work inside bindings, signals, computeds, effects, and keyed owners.

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

- https://gadevsbr.github.io/gUI/: docs site with tutorials, API reference, recipes, and the interactive playground

- [`index.html`](./index.html): interactive demo for direct bindings, keyed rows, and scoped disposal
- [`benchmark/index.html`](./benchmark/index.html): repeatable browser harness for text bursts, keyed reorders, and subtree cleanup cycles

Run locally with any static server, then open those pages in the browser.

## Project Structure

```text
gui/
  compiler/
  core/
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

- deeper devtools and graph inspection
- context and prop helpers that preserve one-time execution
- compiler diagnostics and opt-out annotations for edge-case expressions
- SSR and hydration without rerendering static DOM

See [ROADMAP.md](./ROADMAP.md) for the full roadmap.

## Package

- NPM: `@bragamateus/gui`
- License: [MIT](./LICENSE)

## Development

Validate the codebase locally with:

```bash
npm run check
```
