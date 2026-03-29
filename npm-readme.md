# gUI

Build interfaces with fine-grained reactivity, keyed ownership, and direct DOM bindings.

gUI is a performance-first UI runtime for developers who want exact DOM updates instead of broad component rerenders.

## Install

```bash
npm install @bragamateus/gui
```

## Why teams use it

- Updates only the exact text nodes and attributes that changed
- Keeps components as setup functions instead of rerender loops
- Reconciles keyed lists by moving existing DOM nodes in place
- Disposes nested effects and listeners when dynamic subtrees leave the DOM
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

## Runtime Model

gUI is optimized around a simple rule: state changes should trigger only the work that is truly necessary.

- Signals notify only direct dependents
- Computeds stay lazy until read
- Effects are batched in microtasks
- DOM nodes are created once and updated in place
- Keyed rows keep stable ownership across reorder
- Swapped branches dispose nested scopes before removal

## Important Note

Because gUI uses runtime tagged templates, complex inline expressions should use `computed()` or getter functions when they need reactive updates. Object property access should usually live inside getters, for example `${() => row.value.label}`.

## Package Details

- ESM
- TypeScript declarations included
- License: MIT
