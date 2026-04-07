# Contributing to gUI

## Before you start

Read these first:

- [README.md](./README.md)
- [ROADMAP.md](./ROADMAP.md)
- [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)

gUI is not a rerender-driven framework. Contributions should preserve the current architecture:

- no virtual DOM diffing as the default path
- no component rerender loop
- no dependency arrays
- no React-style hooks model
- no proxy-based deep tracking in the main runtime
- direct subscriptions between reactive sources and DOM bindings

## Good contribution targets

Good contributions usually fall into one of these categories:

- bug fixes with a small reproducible case
- tests that lock down runtime behavior
- docs improvements that reflect the actual public API
- performance improvements backed by concrete reasoning
- compiler, devtools, or rendering improvements that preserve the one-time setup model

## Before opening an issue

Please check:

- whether the behavior is already documented in the README or wiki
- whether the issue is already open
- whether the behavior is actually a bug versus an intentional runtime constraint

When reporting a bug, include:

- the package version
- browser and OS
- a minimal reproduction
- expected behavior
- actual behavior

## Local setup

Install dependencies:

```bash
npm install
```

Run the main validation steps:

```bash
npm run check
npm test
```

Optional:

```bash
npm run test:coverage
npm pack --dry-run
```

## Development guidelines

### Runtime design

Prefer changes that keep updates local and inspectable.

- keep components as setup functions
- move ongoing behavior into signals, computeds, effects, and bindings
- keep list ownership stable by key
- favor direct DOM operations over broad structural replacement

### API changes

If you change public behavior, update the relevant docs:

- `README.md`
- `npm-readme.md`
- `ROADMAP.md` if the future direction changes
- wiki pages when the workflow or public API changes

### Tests

If you change runtime, compiler, rendering, or devtools behavior, add or update tests.

Relevant test areas:

- `test/reactivity/`
- `test/rendering/`
- `test/compiler/`
- `test/composition/`
- `test/core/`

### Commits and pull requests

Keep changes focused.

- separate refactors from behavior changes when practical
- explain the runtime or API impact clearly
- mention edge cases and compatibility concerns

## Pull request checklist

Before opening a PR, make sure you have:

- run `npm run check`
- run `npm test`
- updated docs if the public behavior changed
- added or updated tests for the changed behavior
- described the user-visible or runtime-visible impact

## What maintainers look for

Pull requests are evaluated primarily on:

- correctness
- architectural fit
- performance implications
- clarity of implementation
- test coverage
- documentation accuracy

## Questions

If you are unsure whether an idea fits the project direction, open a feature request or draft PR before doing a large implementation.

