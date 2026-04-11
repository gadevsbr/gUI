# gUI

[![npm version](https://img.shields.io/npm/v/%40bragamateus%2Fgui?label=npm)](https://www.npmjs.com/package/@bragamateus/gui)
[![license](https://img.shields.io/github/license/gadevsbr/gUI)](https://github.com/gadevsbr/gUI/blob/main/LICENSE)
[![docs](https://img.shields.io/badge/docs-live-0d7c6b)](https://gadevsbr.github.io/gUI/)
[![wiki](https://img.shields.io/badge/wiki-available-2359cc)](https://github.com/gadevsbr/gUI/wiki)
[![codecov](https://codecov.io/github/gadevsbr/gUI/graph/badge.svg?token=6H7DILR5I3)](https://codecov.io/github/gadevsbr/gUI)

gUI is a performance-first JavaScript UI runtime for teams that want exact DOM updates, stable ownership, and a smaller mental model than rerender-driven frameworks.

It is built around fine-grained reactivity, direct subscriptions, and real DOM bindings. No virtual DOM diffing. No hook scheduler. No full component rerender loop.

## Why gUI

Most UI stacks make broad work look cheap until the screen becomes dense, stateful, or constantly moving.

gUI takes the opposite position:

- state writes should update only the exact bindings that depend on them
- components should behave like setup functions, not rerender boundaries
- keyed structures should preserve ownership instead of rebuilding rows
- cleanup should happen when a subtree actually leaves the DOM
- zero-build delivery should stay a first-class workflow, not a degraded fallback

This makes gUI especially useful for:

- dashboards and internal tools with fast-moving metrics
- browser extensions, embedded widgets, and CMS integrations
- interactive product surfaces where rerender churn is measurable
- teams that want explicit reactive flow with less framework overhead

## What ships in the root package

- Fine-grained primitives: `signal()`, `computed()`, `effect()`, `batch()`
- Deep object and array state: `createStore()` and `unwrapStore()`
- Async state: `createResource()`
- Tagged-template rendering: `html()` and `isTemplateResult()`
- Keyed structural rendering: `list()`
- Control flow: `Show()`, `Match()`, `Switch()`, `Portal()`
- Context and props: `createContext()`, `provideContext()`, `useContext()`, `mergeProps()`, `splitProps()`
- Form helpers: `on()`
- Native router: `Router()`, `Route()`, `useRouter()`, `push()`, `replace()`
- Mounting: `mount()` and `createApp()`
- Runtime instrumentation: `setDomUpdateHook()` and `subscribeDomUpdates()`

Subpath exports:

- `@bragamateus/gui/compiler`
- `@bragamateus/gui/devtools`

## Install

```bash
npm install @bragamateus/gui
```

GitHub Packages:

```bash
npm install @gadevsbr/gui --registry=https://npm.pkg.github.com
```

The npm package targets Node `>=18` for tooling and local development.

## Zero-build quickstart

gUI can run directly in the browser with no bundler, no JSX transform, and no build step:

```html
<script type="module">
import { createApp, html, signal } from "https://esm.sh/@bragamateus/gui";

const count = signal(0);

function App() {
  return html`
    <section>
      <h1>${count.value}</h1>
      <button on:click=${() => (count.value += 1)}>Increment</button>
    </section>
  `;
}

createApp("#app", App);
</script>
```

This mode is a strong fit for browser extensions, embedded widgets, injected scripts, CMS pages, prototypes, and any environment where adding a build pipeline is friction instead of leverage.

## Runtime example

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

## Router example

The router is part of the root package and is designed for client-side navigation without pulling in a third-party SPA router.

It supports:

- `hash` and `history` modes
- route params such as `/users/:id`
- wildcard matches with `*`
- `push()` and `replace()` helpers
- `useRouter()` for reactive access to the current path
- same-origin anchor interception in `history` mode

```js
import { Route, Router, html } from "@bragamateus/gui";

function Home() {
  return html`<h1>Home</h1>`;
}

function UserPage(id) {
  return html`<h1>User ${id}</h1>`;
}

const App = Router(
  {
    mode: "hash",
    fallback: () => html`<h1>404</h1>`,
  },
  [
    Route({ path: "/" }, Home),
    Route({ path: "/users/:id" }, ({ id }) => UserPage(id)),
    Route({ path: "*" }, () => html`<h1>Catch-all</h1>`),
  ],
);
```

Use it directly inside a template or pass it to `createApp()` just like any other render closure.

## Store, async data, and forms

`createStore()` gives you deep reactive proxies for objects and arrays. `createResource()` wraps async work in a reactive interface. `on()` turns DOM input events into a signal or setter write.

```js
import { createApp, createResource, createStore, html, on, signal } from "@bragamateus/gui";

const profile = createStore({
  user: {
    name: "Mateus",
    online: false,
  },
});

const query = signal("");

const results = createResource(query, async (value) => {
  if (!value) return [];
  const response = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
  return response.json();
});

function App() {
  return html`
    <section>
      <h1>${() => profile.user.name}</h1>
      <p>Status: ${() => (profile.user.online ? "online" : "offline")}</p>

      <input
        value=${() => query.value}
        placeholder="Search"
        on:input=${on(query)}
      />

      <p>${() => (results.loading ? "Loading..." : `Results: ${results.value?.length ?? 0}`)}</p>
    </section>
  `;
}

createApp("#app", App);
```

## Optional compiler

For build-based projects, gUI includes an optional compiler that rewrites most non-event `html\`...\`` interpolations into runtime-safe getter functions automatically.

Without the compiler:

```js
html`<p>${() => count.value * 2}</p>`;
```

With the compiler enabled, you can often write:

```js
html`<p>${count.value * 2}</p>`;
```

Compiler exports:

- `guiVitePlugin()`
- `guiEsbuildPlugin()`
- `transformGuiTemplates()`

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

## Devtools and instrumentation

gUI ships with two runtime observation layers:

1. Root-package DOM update hooks:
   `setDomUpdateHook()` and `subscribeDomUpdates()`
2. Visual inspector from `@bragamateus/gui/devtools`

The inspector is opt-in and is not mounted unless you explicitly import and start it:

```js
import { createInspector } from "@bragamateus/gui/devtools";

createInspector({
  target: "#app",
  title: "Live DOM Lens",
});
```

The inspector and hooks expose exact DOM writes, structure changes, source labels, and flush activity so you can verify that the runtime is doing direct binding updates instead of broad rerenders.

## API overview

### State and async

- `signal(initialValue, { label? })`
  Mutable reactive state with `.value`, `.set()`, `.update()`, `.peek()`, and `.inspect()`.
- `computed(fn, { label? })`
  Lazy cached derived state with `.value`, `.peek()`, `.inspect()`, and `.dispose()`.
- `effect(fn, { label? })`
  Tracked side effects with cleanup support. Returns a callable handle with `.inspect()`.
- `batch(fn)`
  Groups multiple writes into a single flush boundary.
- `createStore(initialValue)`
  Deep reactive proxy for objects and arrays.
- `unwrapStore(store)`
  Returns the underlying raw object or array from a store proxy.
- `createResource(source?, fetcher, { initialValue? })`
  Async state wrapper that exposes `{ value, loading, error, refetch() }`.

### Composition and forms

- `createContext(defaultValue, { label? })`
- `provideContext(context, value, render)`
- `useContext(context)`
- `mergeProps(...sources)`
- `splitProps(props, ...keysets)`
- `on(signalOrSetter, transform?)`

### Routing

- `Route({ path }, children)`
- `Router({ mode?, fallback? }, routes)`
- `useRouter()`
- `push(path)`
- `replace(path)`

### Rendering

- `html(strings, ...values)`
- `isTemplateResult(value)`
- `list(source, key, render, { label? })`
- `Show({ when, children, fallback })`
- `Match({ when, children })`
- `Switch(cases, fallback)`
- `Portal(target, children, { label? })`
- `mount(target, value)`
- `createApp(target, component)`

### `defineElement(tag, setup, options?)`

Compiles a gUI layout into a standard, reusable HTML Web Component. Exposes a reactive `props` store that auto-syncs with node attributes and JS properties.

```js
defineElement("gui-counter", (props) => {
  const count = signal(0);
  return html`<button on:click=${() => count.value++}>
    ${count.value} (${() => props.theme})
  </button>`;
}, { attributes: ["theme"], shadow: true });
```
*(Usage in native DOM: `<gui-counter theme="dark"></gui-counter>`)*

### Debugging

- `setDomUpdateHook(listener | null)`
- `subscribeDomUpdates(listener)`

## Runtime rules

gUI supports two usage modes:

- runtime-only mode
- compile-assisted mode

In runtime-only mode, JavaScript evaluates expressions before `html()` receives them. That means:

- `${count.value}` is fine for direct primitive reads
- `${() => count.value * 2}` is the safe reactive form for derived expressions
- `${count.value * 2}` should usually become a getter or `computed()`
- nested object reads such as `${() => row.value.label}` should usually stay inside a getter

The optional compiler removes most of that boilerplate for build-based apps while keeping the same runtime model.

## Performance model

gUI is optimized around a simple rule: state changes should trigger only the work that is truly necessary.

- signals notify direct dependents only
- computeds stay lazy and cached
- effects are deduped and flushed in microtasks
- text and attribute bindings patch real DOM nodes in place
- keyed list changes move existing nodes instead of rebuilding rows
- disposed dynamic branches release nested effects and listeners before removal

## Why not SolidJS or Preact Signals?

SolidJS is a complete application framework with JSX, a compiler, SSR, routing, and a large ecosystem. Preact Signals is a state primitive designed to live inside the broader Preact framework.

gUI is narrower and more opinionated:

- it is designed to work with no build step at all
- it uses a tagged template API instead of JSX
- it exposes direct DOM instrumentation and an official inspector
- it keeps the one-time component setup model explicit

If you need SSR, a meta-framework, and a larger application stack, SolidJS may be the better choice. If you need a focused reactive runtime that can ship in zero-build environments, gUI is built for that job.

## Documentation, demo, and benchmark

The project site is live at:

- https://gadevsbr.github.io/gUI/
- https://gadevsbr.github.io/gUI/demo/
- https://gadevsbr.github.io/gUI/benchmark/

Repository references:

- [index.html](https://github.com/gadevsbr/gUI/blob/main/index.html)
- [benchmark/index.html](https://github.com/gadevsbr/gUI/blob/main/benchmark/index.html)
- [ROADMAP.md](https://github.com/gadevsbr/gUI/blob/main/ROADMAP.md)
- [CHANGELOG.md](https://github.com/gadevsbr/gUI/blob/main/CHANGELOG.md)

## Package structure

```text
gui/
  compiler/
  composition/
  core/
  devtools/
  reactivity/
  rendering/
  utils/
demo/
benchmark/
index.html
```

## Development

Validate the package:

```bash
npm run check
```

Run tests:

```bash
npm test
```

Coverage:

```bash
npm run test:coverage
```

Dry-run the published tarball:

```bash
npm run pack:dry-run
```

## Package details

- NPM: `@bragamateus/gui`
- GitHub Packages: `@gadevsbr/gui`
- ESM package
- TypeScript declarations included
- License: [MIT](https://github.com/gadevsbr/gUI/blob/main/LICENSE)
