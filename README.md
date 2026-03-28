# gUI

gUI is a performance-first JavaScript UI runtime for teams that want the control of low-level DOM updates without falling back to manual DOM plumbing.

It is built around fine-grained reactivity, direct subscriptions, and stable DOM nodes. No virtual DOM diffing. No component rerender loop. No hook scheduler. No dependency arrays.

## Why gUI

Most UI stacks make broad updates feel cheap until the app grows. gUI takes the opposite position:

- state changes should update only the exact DOM bindings that depend on them
- components should be setup functions, not rerender boundaries
- performance should come from architecture, not late-stage optimization work
- the runtime should stay inspectable and predictable under pressure

This makes gUI a strong fit for:

- dashboards with fast-moving metrics
- internal tools where responsiveness matters
- interactive product surfaces that cannot afford broad rerender churn
- teams that want a smaller mental model than framework-heavy component systems

## What You Get

- Fine-grained `signal()`, `computed()`, and `effect()` primitives
- Tagged template rendering with direct text, attribute, and event bindings
- Microtask-based batching with deduped subscriber scheduling
- One-time component execution with ongoing reactive updates
- Debug hooks to inspect real DOM writes
- ESM package with included TypeScript declarations

## Install

```bash
npm install @bragamateus/gui
```

## Quick Example

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

## Commercial Positioning

gUI is not trying to be another general-purpose abstraction layer with performance claims attached after the fact.

It is designed for builders who care about:

- lower rendering overhead
- explicit reactive flow
- easier debugging of UI updates
- less hidden framework work between state and pixels

If your product benefits from predictable runtime behavior and direct control over update boundaries, gUI is aimed at that workload.

## Core Model

### `signal()`

Signals hold mutable state and notify only direct dependents.

### `computed()`

Computeds are lazy, cached, and only recompute when one of their tracked sources changes.

### `effect()`

Effects automatically capture dependencies and rerun only when necessary, with cleanup support for external resources.

### `html`

Templates are compiled once per call site, cloned into real DOM nodes, and wired so only specific dynamic slots update.

### `createApp()`

Components execute once to create DOM and bindings. State changes do not rerun the component body.

## Important Constraint

gUI v1 uses runtime tagged templates rather than a compile step. Because JavaScript evaluates expressions before the `html` tag receives them:

- `${count.value}` is reactive during setup
- `${() => count.value * 2}` is reactive
- `${count.value * 2}` should be wrapped in `computed()` or a getter function if it needs to update reactively

That constraint is intentional and explicit. gUI avoids hiding it behind magic behavior.

## Best Fit

Use gUI when you want:

- exact DOM updates
- a lean runtime
- explicit reactive dependencies
- a smaller surface area than component-heavy frameworks

Look elsewhere if you specifically want:

- batteries-included routing and app platform features
- a compile-heavy framework toolchain by default
- a component rerender model with broad ecosystem conventions around it

## Project Structure

```text
gui/
  core/
  reactivity/
  rendering/
  utils/
demo/
index.html
ROADMAP.md
```

## Roadmap

The next major opportunities are:

- compile-assisted templates for richer reactive expressions
- keyed list ergonomics with stable ownership
- deeper devtools and graph inspection
- SSR and hydration

See [ROADMAP.md](./ROADMAP.md) for the current direction.

## Package

- NPM: `@bragamateus/gui`
- License: [MIT](./LICENSE)

## Development

Validate the runtime locally with:

```bash
npm run check
```
