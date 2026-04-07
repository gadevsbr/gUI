# gUI

Build interfaces with fine-grained reactivity, keyed ownership, and direct DOM bindings.

gUI is a performance-first UI runtime for developers who want exact DOM updates instead of broad component rerenders.

## Install

```bash
npm install @bragamateus/gui
```

## Update Note

### v1.1.0

- Added keyed `list()` reconciliation with stable per-item ownership
- Added scoped disposal for dynamic subtrees and nested effects
- Added a browser benchmark harness for batching, keyed reorder, and cleanup validation
- Added optional compile-assisted templates with Vite and esbuild integration

## Why teams use it

- Updates only the exact text nodes and attributes that changed
- Keeps components as setup functions instead of rerender loops
- Reconciles keyed lists by moving existing DOM nodes in place
- Disposes nested effects and listeners when dynamic subtrees leave the DOM
- Ships an optional compiler for automatic non-event expression capture
- Ships `@bragamateus/gui/devtools` for visual runtime inspection
- Avoids virtual DOM diffing and hook-style dependency choreography

## Example

```js
import { createApp, computed, html, list, signal } from "@bragamateus/gui";

const rows = signal([
  { id: "latency", label: "Latency budget", value: 12 },
  { id: "flush", label: "Flush stability", value: 3 },
]);

const total = computed(() => rows.value.reduce((sum, row) => sum + row.value, 0));

function App() {
  return html`
    <section>
      <h1>Runtime metrics</h1>
      <p>Total: ${() => total.value}</p>

      <ul>
        ${list(rows, "id", (row, index) => html`
          <li>
            <span>${() => index.value + 1}</span>
            <strong>${() => row.value.label}</strong>
            <span>${() => row.value.value}</span>
          </li>
        `)}
      </ul>
    </section>
  `;
}

createApp("#app", App);
```

## Core API

- `signal(initialValue)` creates reactive state
- `computed(fn)` creates lazy cached derived state
- `effect(fn)` runs tracked side effects with cleanup
- `html\`...\`` binds dynamic DOM slots directly
- `list(source, key, render)` creates keyed structural bindings
- `createApp(target, component)` mounts a component once
- `@bragamateus/gui/compiler` exposes the optional template compiler for Vite and esbuild
- `@bragamateus/gui/devtools` exposes the visual inspector for overlays and runtime timelines

## Visual Inspector

```js
import { createInspector } from "@bragamateus/gui/devtools";

createInspector({
  target: "#app",
  title: "Live DOM Lens",
});
```

## Runtime Model

gUI is optimized around a simple rule: state changes should trigger only the work that is truly necessary.

- Signals notify only direct dependents
- Computeds stay lazy until read
- Effects are batched in microtasks
- DOM nodes are created once and updated in place
- Keyed rows keep stable ownership across reorder
- Swapped branches dispose nested scopes before removal

## Important Note

In runtime-only mode, complex inline expressions should still use `computed()` or getter
functions. With `@bragamateus/gui/compiler`, most non-event interpolations are wrapped
automatically during the build step.

## Package Details

- ESM
- TypeScript declarations included
- License: MIT
