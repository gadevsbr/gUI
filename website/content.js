export const siteNavigation = [
  { id: "overview", label: "Overview" },
  { id: "getting-started", label: "Getting Started" },
  { id: "concepts", label: "Concepts" },
  { id: "tutorials", label: "Tutorials" },
  { id: "recipes", label: "Recipes" },
  { id: "playground", label: "Playground" },
  { id: "api", label: "API" },
  { id: "performance", label: "Performance" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
];

export const heroStats = [
  {
    label: "Update granularity",
    value: "Per binding",
    note: "Changed state touches only the exact nodes and attributes that depend on it.",
  },
  {
    label: "DOM strategy",
    value: "Stable nodes",
    note: "Templates produce real DOM once, then patch it in place.",
  },
  {
    label: "Scheduler",
    value: "Microtask batched",
    note: "Duplicate subscriber work is collapsed before paint.",
  },
  {
    label: "Mental model",
    value: "Setup once",
    note: "Components are setup functions, not rerender boundaries.",
  },
];

export const featureHighlights = [
  {
    eyebrow: "Reactive Core",
    title: "Direct subscriptions instead of broad invalidation",
    body: "Signals, computeds, and effects connect to the exact consumers that read them. Updates stay local instead of rippling through component trees.",
  },
  {
    eyebrow: "Template Runtime",
    title: "Static DOM structure with dynamic slot binding",
    body: "gUI compiles tagged templates once per call site, clones stable DOM, then binds text, attributes, and listeners directly to reactive sources.",
  },
  {
    eyebrow: "Operational Clarity",
    title: "Performance by architecture, not rescue work",
    body: "There is no virtual DOM diffing, no hook scheduler, and no dependency arrays hiding broad work behind convenience abstractions.",
  },
  {
    eyebrow: "Debugging",
    title: "Inspect the real graph and the real DOM writes",
    body: "gUI now ships with an official visual inspector, DOM update subscriptions, and runtime snapshots so you can see exact writes, moves, flushes, and cleanups in the browser.",
  },
];

export const useCases = [
  {
    title: "Realtime dashboards",
    body: "Keep fast metric updates isolated to the specific cells, badges, and counters that changed.",
  },
  {
    title: "Internal tooling",
    body: "Build responsive product surfaces without paying rerender costs across entire screens.",
  },
  {
    title: "Interactive product UI",
    body: "When the difference between one node update and a broad rerender matters, gUI gives you that boundary explicitly.",
  },
  {
    title: "Framework experimentation",
    body: "For engineers exploring reactive runtime design, gUI is small enough to inspect and strong enough to build with.",
  },
];

export const sidebarPrinciples = [
  "No virtual DOM diffing",
  "No component rerender loop",
  "No dependency arrays",
  "No proxy-based deep tracking in the hot path",
  "Direct state-to-DOM subscriptions",
];

export const gettingStartedSteps = [
  {
    title: "Install and import the runtime",
    body: "gUI ships as an ESM package with its public API exposed from a single root entrypoint.",
    code: `npm install @bragamateus/gui`,
  },
  {
    title: "Create precise state primitives",
    body: "Use `signal()` for raw mutable state and `computed()` for lazy cached derivations.",
    code: `import { signal, computed } from "@bragamateus/gui";\n\nconst count = signal(0);\nconst doubled = computed(() => count.value * 2);`,
  },
  {
    title: "Render with `html` and direct bindings",
    body: "Read source values directly in the template for stable bindings, or wrap richer expressions in getters or computeds.",
    code: `import { html } from "@bragamateus/gui";\n\nfunction Counter() {\n  return html\`\n    <section>\n      <h1>\${count.value}</h1>\n      <p>\${doubled.value}</p>\n    </section>\n  \`;\n}`,
  },
  {
    title: "Mount once and update in place",
    body: "Components execute once to create DOM and bindings. Event listeners mutate signals; the runtime updates only the affected slots.",
    code: `import { createApp } from "@bragamateus/gui";\n\ncreateApp("#app", Counter);`,
  },
];

export const learningTracks = [
  {
    label: "Track 01",
    title: "First app in one sitting",
    audience: "New adopters",
    modules: ["Install", "Signals", "Templates", "Mounting", "Debug hook"],
  },
  {
    label: "Track 02",
    title: "Realtime product surfaces",
    audience: "Dashboard and tooling teams",
    modules: ["Metric modeling", "Computed derivations", "Attribute binding", "Batched effects"],
  },
  {
    label: "Track 03",
    title: "Runtime-minded engineering",
    audience: "Framework and library authors",
    modules: ["Dependency graph", "Invalidation rules", "DOM ownership", "Compiler and devtools path"],
  },
];

export const coreConcepts = [
  {
    title: "Signals are raw sources",
    summary: "A signal holds a current value and a direct subscriber set. Reads track. Writes invalidate only what actually depends on that signal.",
    bullets: [
      "Use signals for mutable state and object references.",
      "Read with `value`, mutate with assignment, `set()`, or `update()`.",
      "Use `peek()` when you need the value without tracking.",
    ],
  },
  {
    title: "Computeds are lazy caches",
    summary: "A computed does not rerun eagerly on every write. It is marked dirty and recalculates only when something reads it again.",
    bullets: [
      "Great for derived labels, formatting, classes, and totals.",
      "Dependency edges stay precise because they are tracked during execution.",
      "Use them to keep templates simple and stable.",
    ],
  },
  {
    title: "Effects connect the outside world",
    summary: "Effects exist for side effects, not UI tree rerendering. They subscribe automatically and rerun through the scheduler when necessary.",
    bullets: [
      "Use cleanup to tear down timers, listeners, and polling.",
      "Avoid doing component-like rendering work inside effects.",
      "Think of effects as bridges to external systems.",
    ],
  },
  {
    title: "Templates bind exact DOM slots",
    summary: "The `html` tagged template creates stable DOM nodes and wires only dynamic text, attributes, and listeners.",
    bullets: [
      "Text bindings update text nodes directly.",
      "Attribute bindings patch the exact attribute or property involved.",
      "Events use direct listeners with `on:*` syntax.",
    ],
  },
  {
    title: "Components are setup, not loops",
    summary: "The component function runs once to define structure and attach bindings. It is not re-executed on every state change.",
    bullets: [
      "Move ongoing behavior into signals, computeds, effects, and bindings.",
      "Keep component bodies declarative and stable.",
      "This is one of the main reasons gUI avoids broad update costs.",
    ],
  },
  {
    title: "The runtime stays explicit",
    summary: "gUI v1 intentionally exposes where runtime template limits exist instead of hiding them behind magic.",
    bullets: [
      "Use direct reads like `${count.value}` for simple bindings.",
      "Wrap complex expressions in getters or `computed()` when they need reactivity.",
      "Use the optional compiler when you want richer template expressions without changing the runtime model.",
    ],
  },
];

export const tutorials = [
  {
    id: "counter",
    level: "Beginner",
    duration: "5 min",
    title: "Counter with exact text-node updates",
    summary: "Start with the smallest complete gUI app and verify that only a single text node changes.",
    goals: [
      "Understand the relationship between `signal()`, `computed()`, and `html`.",
      "Read reactive values directly in the template.",
      "Use the inspector and DOM update stream to prove what changed.",
    ],
    steps: [
      "Create a `count` signal and a `doubled` computed.",
      "Render both values in a template with a direct `on:click` increment handler.",
      "Mount the component once with `createApp()`.",
      "Attach the inspector or a DOM update subscriber and observe that the component body is not rerun on every click.",
    ],
    outcome: "You end with a concrete understanding of why gUI updates bindings instead of rerendering components.",
  },
  {
    id: "dashboard",
    level: "Intermediate",
    duration: "12 min",
    title: "Realtime dashboard from small reactive edges",
    summary: "Model multiple independent metrics and keep each update scoped to the exact stat that changed.",
    goals: [
      "Split raw state by update frequency and meaning.",
      "Use computeds for badges, thresholds, and summaries.",
      "Avoid over-linking unrelated parts of the screen.",
    ],
    steps: [
      "Give each metric its own signal so one write does not invalidate the full dashboard.",
      "Derive status pills, risk labels, and formatted values through computeds.",
      "Bind classes, labels, and values independently.",
      "Push external refresh work into effects with cleanup support.",
    ],
    outcome: "A dashboard where live values, badges, and annotations update independently instead of as one broad render event.",
  },
  {
    id: "docs-site",
    level: "Intermediate",
    duration: "18 min",
    title: "Documentation property built with gUI",
    summary: "Use gUI to build a full docs experience with navigation, filters, tutorials, and a live playground.",
    goals: [
      "Use top-level signals for navigation and selected content.",
      "Keep content data-driven so the site scales without structural churn.",
      "Use a local playground to make the runtime behavior visible.",
    ],
    steps: [
      "Model navigation, selected tutorial, and API filtering as signals.",
      "Render static page chrome once and update content panes through narrow bindings.",
      "Attach the official inspector to only the playground region.",
      "Use data arrays for tutorials, recipes, and API cards to keep the site maintainable.",
    ],
    outcome: "A complete docs shell that demonstrates the framework while documenting it.",
  },
  {
    id: "effects",
    level: "Advanced",
    duration: "10 min",
    title: "External effects, cleanup, and scheduling discipline",
    summary: "Learn where effects belong and how to keep side effects from turning into hidden rendering layers.",
    goals: [
      "Separate UI bindings from side effects.",
      "Use cleanup for intervals, subscriptions, and listeners.",
      "Understand batched reruns through the scheduler.",
    ],
    steps: [
      "Create an effect that synchronizes document state or polling.",
      "Return cleanup to release the previous external subscription before rerun.",
      "Read only the signals that genuinely control the side effect.",
      "Inspect the node snapshot to verify the dependency surface.",
    ],
    outcome: "A cleaner mental model for effects as system bridges rather than ersatz rendering hooks.",
  },
];

export const recipes = [
  {
    id: "theming",
    title: "Theme switching with exact attribute writes",
    problem: "You want style mode changes to update only the relevant DOM attributes and labels.",
    approach: "Keep the current theme in one signal, derive labels or class strings with computeds, and bind the theme directly to data attributes or classes.",
    checklist: [
      "Store the current tone in a single signal.",
      "Derive user-facing labels in computeds instead of repeating string logic in templates.",
      "Bind `data-theme` or `class` on the exact node that owns the visual state.",
    ],
    snippet: `const theme = signal("teal");\nconst label = computed(() => theme.value.toUpperCase());\n\nhtml\`\n  <article data-theme=\${theme.value}>\n    <strong>\${label.value}</strong>\n  </article>\n\`;`,
  },
  {
    id: "lists",
    title: "Search-driven filtering without broad rerenders",
    problem: "A user types into a filter field and you need only the filtered output region to change.",
    approach: "Keep the query in a signal and use a computed for the filtered dataset. Bind the input value and the result list separately.",
    checklist: [
      "Track the query in a signal.",
      "Use a computed for filtering and result counts.",
      "Keep static shell content outside the filtered region.",
    ],
    snippet: `const query = signal("");\nconst filtered = computed(() => items.filter((item) => item.includes(query.value)));\n\nhtml\`\n  <input value=\${() => query.value} on:input=\${(event) => (query.value = event.currentTarget.value)} />\n  <p>\${() => filtered.value.length} matches</p>\n\`;`,
  },
  {
    id: "dashboards",
    title: "High-frequency stats without UI churn",
    problem: "Fast metrics can turn large dashboards into accidental rerender tests.",
    approach: "Break metrics into independent signals and derive secondary labels with computeds instead of recalculating whole views.",
    checklist: [
      "Prefer one signal per metric stream.",
      "Use computeds for thresholds, badges, and summaries.",
      "Bind each card's value, label, and class independently.",
    ],
    snippet: `const cpu = signal(38);\nconst status = computed(() => (cpu.value > 80 ? "critical" : "healthy"));\n\nhtml\`\n  <article data-status=\${status.value}>\n    <strong>\${cpu.value}%</strong>\n    <span>\${status.value}</span>\n  </article>\n\`;`,
  },
  {
    id: "integrations",
    title: "Browser APIs through cleanup-aware effects",
    problem: "You need to coordinate timers, resize observers, or external subscriptions without leaking work.",
    approach: "Use effects to bridge reactive state to external systems and return cleanup every time the dependency surface changes.",
    checklist: [
      "Keep the effect focused on one external concern.",
      "Read only the signals that truly affect that concern.",
      "Always return cleanup for intervals and listeners.",
    ],
    snippet: `effect(() => {\n  const id = setInterval(() => refresh(metricId.value), 1000);\n  return () => clearInterval(id);\n});`,
  },
];

export const playgroundPresets = [
  {
    id: "counter",
    label: "Counter",
    title: "Direct text-node updates",
    description: "Mutate one signal and watch the count, doubled value, and parity label update without rerunning the full surface.",
    focus: ["signal()", "computed()", "text bindings"],
    code: `const count = signal(0);\nconst doubled = computed(() => count.value * 2);\n\nhtml\`\n  <strong>\${count.value}</strong>\n  <span>\${doubled.value}</span>\n\`;`,
  },
  {
    id: "theme",
    label: "Theme",
    title: "Attribute and label binding",
    description: "Rotate a tone signal and update a data attribute, badge class, and title label independently.",
    focus: ["attribute binding", "derived labels", "event listeners"],
    code: `const tone = signal("teal");\nconst chipClass = computed(() => \`tone-chip tone-chip--\${tone.value}\`);\n\nhtml\`\n  <article data-tone=\${tone.value}>\n    <span class=\${chipClass.value}></span>\n  </article>\n\`;`,
  },
  {
    id: "filter",
    label: "Filter",
    title: "Computed list filtering",
    description: "Type into a query field and update only the filtered result block and match count.",
    focus: ["input binding", "computed filtering", "local updates"],
    code: `const query = signal("");\nconst filtered = computed(() => modules.filter((item) => item.includes(query.value.toLowerCase())));\n\nhtml\`\n  <input value=\${() => query.value} />\n  <p>\${() => filtered.value.length} matches</p>\n\`;`,
  },
];

export const apiReference = [
  {
    name: "signal(initialValue, options?)",
    category: "State",
    summary: "Creates a reactive source with getter/setter semantics and direct subscriber tracking.",
    details: [
      "`value` reads participate in dependency tracking during effects and bindings.",
      "`value = next` writes invalidate only direct dependents.",
      "`set()` and `update()` give imperative mutation helpers when needed.",
      "`peek()` reads without tracking and `inspect()` exposes a node snapshot.",
    ],
  },
  {
    name: "computed(fn, options?)",
    category: "Derived",
    summary: "Creates a lazy cached derivation that only recomputes when one of its tracked sources changes.",
    details: [
      "Computeds do not eagerly recompute on every write.",
      "Dirty state propagates precisely through the graph.",
      "`dispose()` detaches the computed from its owner and sources.",
    ],
  },
  {
    name: "effect(fn, options?)",
    category: "Effects",
    summary: "Runs a tracked side effect with automatic dependency capture and optional cleanup support.",
    details: [
      "Effects rerun through the microtask scheduler.",
      "Return cleanup to release external subscriptions and timers.",
      "The handle returned by `effect()` also exposes `inspect()`.",
    ],
  },
  {
    name: "html`...`",
    category: "Rendering",
    summary: "Tagged template runtime that compiles static structure once and binds dynamic DOM slots directly.",
    details: [
      "Supports node parts, attribute parts, and `on:*` listeners.",
      "Direct reads like `${count.value}` are reactive during setup.",
      "Use computeds or getters for richer reactive expressions in v1.",
    ],
  },
  {
    name: "createApp(target, component)",
    category: "Mounting",
    summary: "Creates an owner scope, runs the component once, and mounts the resulting DOM into a selector or DOM node.",
    details: [
      "Components are setup functions, not rerender loops.",
      "`unmount()` disposes owner-bound subscriptions and removes nodes.",
      "Best used as the top-level application bootstrap.",
    ],
  },
  {
    name: "mount(target, value)",
    category: "Mounting",
    summary: "Mounts a template result, node, fragment, or primitive into a target without the full app bootstrap wrapper.",
    details: [
      "Useful for lower-level integration points.",
      "Accepts selectors or DOM nodes as targets.",
      "Returns a handle with `container`, `nodes`, and `unmount()`.",
    ],
  },
  {
    name: "isTemplateResult(value)",
    category: "Rendering",
    summary: "Checks whether a value is a gUI template result before handing it to lower-level helpers.",
    details: [
      "Useful for library-level integration and debugging.",
      "Works with the runtime template result structure from `html`.",
    ],
  },
  {
    name: "setDomUpdateHook(fn)",
    category: "Debugging",
    summary: "Sets the legacy single-listener DOM write hook for exact text, attribute, and structural updates.",
    details: [
      "Useful when you want one direct callback for DOM writes.",
      "The payload now carries timestamp, origin binding metadata, and structural move information.",
      "Filter by container when you only care about one mounted surface.",
    ],
  },
  {
    name: "subscribeDomUpdates(fn)",
    category: "Debugging",
    summary: "Subscribes to DOM write events without taking over the legacy singleton hook.",
    details: [
      "Ideal for tooling, overlays, timelines, and custom inspectors.",
      "Multiple subscribers can observe the same exact DOM write stream concurrently.",
      "Returns an unsubscribe function for teardown.",
    ],
  },
  {
    name: 'createInspector(options?) from "@bragamateus/gui/devtools"',
    category: "Debugging",
    summary: "Mounts the official gUI visual inspector with update overlays and a runtime timeline.",
    details: [
      "Highlights exact text, attribute, insert, move, and remove work in real time.",
      "Shows runtime flushes, cleanup cycles, computed refreshes, and source labels alongside DOM writes.",
      "Targets one mounted surface or playground region without forcing app rerenders.",
    ],
  },
];

export const performancePrinciples = [
  {
    title: "Only dependent work runs",
    body: "A signal write invalidates the subscribers that actually depend on that signal. Unrelated bindings do not participate.",
  },
  {
    title: "Dirty first, recompute later",
    body: "Computeds are marked dirty first and only recompute when a consumer reads them again, keeping eager work down.",
  },
  {
    title: "DOM writes stay concrete",
    body: "The runtime updates text nodes, attributes, and structural parts directly instead of diffing abstract trees.",
  },
  {
    title: "Scheduling is batched",
    body: "Microtask batching collapses duplicate subscriber work before flush, preserving stable update order.",
  },
];

export const performanceMatrix = [
  {
    label: "State write",
    gui: "Invalidates direct dependents only",
    expensive: "Can trigger a broad component rerender path",
  },
  {
    label: "Derived values",
    gui: "Lazy and cached until read",
    expensive: "Often recomputed as part of whole-view execution",
  },
  {
    label: "DOM mutation",
    gui: "Text, attribute, or node slot patch",
    expensive: "Tree walk plus diff before patch",
  },
  {
    label: "Developer feedback loop",
    gui: "Visual inspector, graph snapshots, and actual DOM writes",
    expensive: "Infer work indirectly from component reruns",
  },
];

export const roadmapMilestones = [
  {
    phase: "Near-term",
    title: "Stronger ergonomics on top of the current runtime",
    items: [
      "Official visual inspector with exact DOM overlays and runtime timeline",
      "Published docs site, runtime demo, and benchmark harness",
      "Repeatable performance harness and micro-benchmarks",
    ],
  },
  {
    phase: "Mid-term",
    title: "Deeper observability without losing the direct-binding model",
    items: [
      "Deeper graph inspection and reactive edge tracing",
      "Profiling hooks that correlate subscriber flushes with DOM work",
      "Convenience helpers that preserve one-time component setup",
    ],
  },
  {
    phase: "Long-term",
    title: "Server and partial boot workflows",
    items: [
      "SSR with serialized signal graphs",
      "Hydration without broad rerendering",
      "Selective and streaming hydration patterns",
    ],
  },
];

export const faqItems = [
  {
    question: "Does gUI use a virtual DOM?",
    answer: "No. The default rendering path writes directly to DOM nodes and attributes that correspond to reactive bindings.",
  },
  {
    question: "Can gUI handle full products or only demos?",
    answer: "It is appropriate for real products as long as you embrace its model: components are setup functions and ongoing behavior lives in signals, computeds, effects, and bindings.",
  },
  {
    question: "Why are arbitrary inline expressions not always reactive in v1?",
    answer: "Runtime tagged templates receive values after JavaScript has already evaluated the expression. Wrap richer expressions in `computed()` or getter functions when they need reactivity.",
  },
  {
    question: "When should I use `effect()`?",
    answer: "Use effects for external side effects like timers, browser APIs, analytics, or subscriptions. Do not use them as a surrogate rerender layer.",
  },
  {
    question: "How do I prove that only exact nodes changed?",
    answer: 'Use `createInspector()` from `@bragamateus/gui/devtools` for the visual overlay, or `subscribeDomUpdates()` / `setDomUpdateHook()` when you want the raw event stream. The playground on this site demonstrates that pattern.',
  },
  {
    question: "What is the biggest missing piece after v1?",
    answer: "Deeper graph tooling, profiler-grade timelines, and higher-level composition helpers are now the highest-value next steps without giving up the one-time execution model.",
  },
];

export const codeSamples = {
  install: `npm install @bragamateus/gui`,
  starter: `import { createApp, signal, computed, html } from "@bragamateus/gui";\n\nconst count = signal(0);\nconst doubled = computed(() => count.value * 2);\n\nfunction App() {\n  return html\`\n    <section>\n      <h1>\${count.value}</h1>\n      <p>\${doubled.value}</p>\n      <button on:click=\${() => (count.value += 1)}>Increment</button>\n    </section>\n  \`;\n}\n\ncreateApp("#app", App);`,
  runtimeRules: `// gUI runtime rules\n// 1. Components run once.\n// 2. State changes update exact bindings.\n// 3. Use computed() or getters for richer reactive expressions.\n// 4. Effects are for side effects, not rerendering.`,
};
