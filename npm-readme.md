# gUI

Build interfaces with fine-grained reactivity and direct DOM bindings.

gUI is a performance-first UI runtime for developers who want exact DOM updates instead of broad component rerenders.

## Install

```bash
npm install @bragamateus/gui
```

## Why teams use it

- Updates only the exact text nodes and attributes that changed
- Keeps components as setup functions, not rerender loops
- Avoids virtual DOM diffing and hook-style dependency choreography
- Stays small, explicit, and easy to reason about in production

## Example

```js
import { createApp, signal, computed, html } from "@bragamateus/gui";

const count = signal(0);
const doubled = computed(() => count.value * 2);

function App() {
  return html`
    <section>
      <h1>${count.value}</h1>
      <p>${doubled.value}</p>
      <button on:click=${() => (count.value += 1)}>Increment</button>
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
- `createApp(target, component)` mounts a component once

## Runtime Model

gUI is optimized around a simple rule: state changes should trigger only the work that is truly necessary.

- Signals notify only direct dependents
- Computeds stay lazy until read
- Effects are batched in microtasks
- DOM nodes are created once and updated in place

## Good fit for

- dashboards
- admin products
- realtime interfaces
- tools that need predictable rendering behavior

## Important note

Because gUI v1 uses runtime tagged templates, complex inline expressions should use `computed()` or getter functions when they need reactive updates.

## Package Details

- ESM
- TypeScript declarations included
- License: MIT
