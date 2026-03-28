# gUI v1

gUI is a minimal UI runtime built around fine-grained reactivity and direct DOM bindings. It does not diff virtual trees, does not rerender components on state changes, and does not use dependency arrays or hook scheduling.

## Install

```bash
npm install gui-v1
```

If you want to publish under another name or scope, change the `name` field in [package.json](/c:/wamp64/www/gUI/package.json) before the first release.

## Project Structure

```text
gui/
  core/
    createApp.js
    mount.js
    scheduler.js
  reactivity/
    computed.js
    dependencyGraph.js
    effect.js
    signal.js
  rendering/
    bindings.js
    domUpdater.js
    html.js
    templateCompiler.js
  utils/
    is.js
    queue.js
    warn.js
demo/
  main.js
  styles.css
index.html
ROADMAP.md
README.md
```

## API

```js
import { createApp, computed, effect, html, signal } from "gui-v1";

const count = signal(0);
const double = computed(() => count.value * 2);

function App() {
  return html`
    <div>
      <h1>${count.value}</h1>
      <p>${double.value}</p>
      <button on:click=${() => (count.value += 1)}>+</button>
    </div>
  `;
}

const app = createApp("#app", App);
```

## Performance Model

- `signal()` stores a value plus a direct subscriber set. Writes only invalidate dependents attached to that signal.
- `computed()` is lazy and cached. Dependency changes mark it dirty, but the value is recomputed only on demand.
- `effect()` and DOM bindings subscribe automatically at read time and rerun through a microtask scheduler.
- DOM nodes are created once per component execution. Later updates touch only the specific text node, attribute, or listener slot attached to the changed source.
- Components are setup functions. `createApp()` executes the component once, mounts the result, and ongoing work moves through the reactive graph instead of rerendering the component.

## How Template Binding Works

`html` compiles each tagged template once per call site, clones the static DOM structure, and locates binding markers for:

- node/text parts
- attribute parts
- `on:*` event listeners

Each dynamic part gets either:

- a static write if the value is plain data
- a binding effect if the value is a signal/computed read token or a getter function

That yields constant-time updates per binding in the common case.

## Important Runtime Limitation

Because gUI v1 uses runtime tagged templates instead of a compile step, JavaScript evaluates template expressions before the `html` tag sees them. That means:

- direct source reads like `${count.value}` are reactive during component setup
- getter functions like `${() => count.value * 2}` are reactive
- complex inline expressions like `${count.value * 2}` are not trackable as reactive bindings at runtime unless wrapped in `computed()` or a getter function

This is a real constraint of runtime tagged templates, not a missing optimization pass.

## Debugging

Signals, computeds, and effects expose `inspect()` snapshots. The runtime also exports `setDomUpdateHook()` so demos or tooling can observe actual text, attribute, and structural writes.

## Running The Demo

Open [index.html](/c:/wamp64/www/gUI/index.html) in a browser served from the workspace, or load the project through your local web server:

- `http://localhost/gUI/`

The included demo proves:

- the root component executes once
- count changes update only dependent bindings
- static content is left untouched

## Publishing To NPM

1. Review the package name in [package.json](/c:/wamp64/www/gUI/package.json). `gui-v1` is configured now, but you can replace it with your final package name or scope before the first publish.
2. Authenticate with NPM: `npm login`
3. Validate the package locally: `npm run check`
4. Preview the publish tarball: `npm run pack:dry-run`
5. Publish: `npm publish`

The package is already configured with:

- ESM entrypoint via `exports`
- Type declarations via [index.d.ts](/c:/wamp64/www/gUI/gui/index.d.ts)
- Publish file allowlist via `files`
- MIT license via [LICENSE](/c:/wamp64/www/gUI/LICENSE)
- `prepublishOnly` validation hook

## Current Tradeoffs

- Runtime templates support whole-attribute bindings, not mixed static/dynamic attribute strings.
- Dynamic child template swapping works structurally, but nested ownership for fully disposable dynamic subtrees is still a roadmap item.
- SSR and hydration are intentionally out of scope for v1.
