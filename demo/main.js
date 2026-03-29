import { computed, createApp, effect, html, list, setDomUpdateHook, signal } from "../gui/index.js";

function createMetric(id, label, value) {
  return { id, label, value };
}

function createInitialMetrics() {
  return [
    createMetric("latency", "Latency budget", 12),
    createMetric("events", "Event throughput", 48),
    createMetric("cache", "Cache hit ratio", 91),
    createMetric("flush", "Flush stability", 3),
  ];
}

const count = signal(0, { label: "count" });
const title = signal("High-performance DOM bindings", { label: "title" });
const theme = signal("signal", { label: "theme" });
const metrics = signal(createInitialMetrics(), { label: "metrics" });
const showInspector = signal(true, { label: "showInspector" });
const rowSetups = signal(0, { label: "rowSetups" });
const activeRowScopes = signal(0, { label: "activeRowScopes" });
const disposedRowScopes = signal(0, { label: "disposedRowScopes" });
const detailMounts = signal(0, { label: "detailMounts" });
const activeDetailScopes = signal(0, { label: "activeDetailScopes" });
const disposedDetailScopes = signal(0, { label: "disposedDetailScopes" });

const double = computed(() => count.value * 2, { label: "double" });
const parity = computed(() => (count.value % 2 === 0 ? "even" : "odd"), { label: "parity" });
const badgeClass = computed(() => `badge badge--${parity.value}`, { label: "badgeClass" });
const metricOrder = computed(
  () => metrics.value.map((item) => item.id).join(" -> "),
  { label: "metricOrder" },
);
const metricTotal = computed(
  () => metrics.value.reduce((total, item) => total + item.value, 0),
  { label: "metricTotal" },
);

let appExecutions = 0;
let nextMetricId = 5;

effect(() => {
  document.title = `gUI demo - count ${count.value}`;
});

function rotateMetrics() {
  metrics.update((current) => {
    if (current.length <= 1) {
      return current;
    }

    return [...current.slice(1), current[0]];
  });
}

function reverseMetrics() {
  metrics.update((current) => [...current].reverse());
}

function bumpMiddleMetric() {
  metrics.update((current) => {
    if (current.length === 0) {
      return current;
    }

    const next = [...current];
    const middleIndex = Math.floor(next.length / 2);
    const middle = next[middleIndex];

    next[middleIndex] = {
      ...middle,
      label: `${middle.label} tuned`,
      value: middle.value + 7,
    };

    return next;
  });
}

function prependMetric() {
  const id = `queue-${nextMetricId}`;
  nextMetricId += 1;

  metrics.update((current) => [
    createMetric(id, `Queue depth ${nextMetricId}`, 10 + nextMetricId),
    ...current,
  ]);
}

function dropTailMetric() {
  metrics.update((current) => current.slice(0, -1));
}

function DetailSurface() {
  detailMounts.update((current) => current + 1);

  effect(() => {
    activeDetailScopes.update((current) => current + 1);

    return () => {
      activeDetailScopes.update((current) => current - 1);
      disposedDetailScopes.update((current) => current + 1);
    };
  }, {
    label: "detail-scope",
  });

  return html`
    <div class="detail-card" data-label="detail-surface">
      <p class="panel-kicker">Scoped disposal</p>
      <h3 data-label="detail-title">This subtree is mounted on demand.</h3>
      <p>
        Toggle it off and gUI disposes nested effects before the DOM nodes leave the tree.
      </p>

      <div class="detail-grid">
        <div class="detail-stat">
          <span class="metric-label">Live count</span>
          <strong data-label="detail-count">${() => count.value}</strong>
        </div>

        <div class="detail-stat">
          <span class="metric-label">Theme</span>
          <strong data-label="detail-theme">${() => theme.value}</strong>
        </div>
      </div>
    </div>
  `;
}

function renderMetricRow(item, index, key) {
  rowSetups.update((current) => current + 1);

  effect(() => {
    activeRowScopes.update((current) => current + 1);

    return () => {
      activeRowScopes.update((current) => current - 1);
      disposedRowScopes.update((current) => current + 1);
    };
  }, {
    label: `metric-row:${String(key)}`,
  });

  return html`
    <li class="queue-item" data-label="list-row">
      <span class="queue-index" data-label="list-index">${() => index.value + 1}</span>

      <div class="queue-copy">
        <strong data-label="list-label">${() => item.value.label}</strong>
        <span data-label="list-key">${String(key)}</span>
      </div>

      <strong class="queue-value" data-label="list-value">${() => item.value.value}</strong>
    </li>
  `;
}

function App() {
  appExecutions += 1;

  return html`
    <main class="demo-shell" data-label="shell" data-theme=${theme.value}>
      <section class="hero">
        <p class="eyebrow">gUI v1.1 milestone</p>
        <h1 class="title" data-label="title">${title.value}</h1>
        <p class="lede">
          Component setup still runs once. The runtime now also keeps keyed rows stable and
          disposes swapped subtrees cleanly.
        </p>

        <div class="setup-metric">
          <span class="metric-label">App executions</span>
          <strong class="metric-value" data-label="setup-count">${appExecutions}</strong>
        </div>
      </section>

      <section class="panel panel--live">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Reactive surface</p>
            <h2>Only bound nodes move</h2>
          </div>
          <span class=${badgeClass.value} data-label="badge">${parity.value}</span>
        </div>

        <div class="stat-grid">
          <article class="stat">
            <span class="stat-label">Count</span>
            <strong class="stat-value" data-label="count">${count.value}</strong>
          </article>

          <article class="stat">
            <span class="stat-label">Double</span>
            <strong class="stat-value" data-label="double">${double.value}</strong>
          </article>

          <article class="stat">
            <span class="stat-label">Parity</span>
            <strong class="stat-value" data-label="parity">${parity.value}</strong>
          </article>
        </div>

        <div class="controls">
          <button class="action action--primary" on:click=${() => (count.value += 1)}>Increment</button>
          <button class="action" on:click=${() => (count.value -= 1)}>Decrement</button>
          <button
            class="action"
            on:click=${() => {
              title.value =
                title.value === "High-performance DOM bindings"
                  ? "Stable ownership, not rerender churn"
                  : "High-performance DOM bindings";
            }}
          >
            Toggle title
          </button>
          <button
            class="action"
            on:click=${() => {
              theme.value = theme.value === "signal" ? "computed" : "signal";
            }}
          >
            Toggle theme attribute
          </button>
        </div>
      </section>

      <section class="panel panel--list">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Keyed reconciliation</p>
            <h2>Rows survive reorder and update in place</h2>
          </div>
          <div class="panel-meta">
            <span>Total value</span>
            <strong data-label="list-total">${() => metricTotal.value}</strong>
          </div>
        </div>

        <p class="panel-copy">
          The list helper creates one owned subtree per key. Reorders move existing nodes.
          Value changes for the same key update only the bindings inside that row.
        </p>

        <div class="mini-grid">
          <article class="mini-stat">
            <span class="metric-label">Row setups</span>
            <strong data-label="row-setups">${rowSetups.value}</strong>
          </article>

          <article class="mini-stat">
            <span class="metric-label">Live row scopes</span>
            <strong data-label="active-row-scopes">${activeRowScopes.value}</strong>
          </article>

          <article class="mini-stat">
            <span class="metric-label">Disposed row scopes</span>
            <strong data-label="disposed-row-scopes">${disposedRowScopes.value}</strong>
          </article>
        </div>

        <p class="order-strip">
          <span>Current key order</span>
          <strong data-label="list-order">${() => metricOrder.value}</strong>
        </p>

        <div class="controls controls--dense">
          <button class="action action--primary" on:click=${rotateMetrics}>Rotate keys</button>
          <button class="action" on:click=${reverseMetrics}>Reverse</button>
          <button class="action" on:click=${bumpMiddleMetric}>Update middle value</button>
          <button class="action" on:click=${prependMetric}>Add head</button>
          <button class="action" on:click=${dropTailMetric}>Drop tail</button>
        </div>

        <ul class="queue-list">
          ${list(metrics, "id", renderMetricRow, { label: "metrics" })}
        </ul>
      </section>

      <section class="panel panel--disposal">
        <div class="panel-header">
          <div>
            <p class="panel-kicker">Dynamic subtree disposal</p>
            <h2>Swapped content releases nested effects</h2>
          </div>
          <div class="panel-meta">
            <span>Mounted detail surfaces</span>
            <strong data-label="detail-mounts">${detailMounts.value}</strong>
          </div>
        </div>

        <div class="mini-grid">
          <article class="mini-stat">
            <span class="metric-label">Live detail scopes</span>
            <strong data-label="active-detail-scopes">${activeDetailScopes.value}</strong>
          </article>

          <article class="mini-stat">
            <span class="metric-label">Disposed detail scopes</span>
            <strong data-label="disposed-detail-scopes">${disposedDetailScopes.value}</strong>
          </article>
        </div>

        <div class="controls controls--dense">
          <button
            class="action action--primary"
            on:click=${() => {
              showInspector.value = !showInspector.value;
            }}
          >
            ${() => (showInspector.value ? "Hide detail subtree" : "Show detail subtree")}
          </button>
        </div>

        ${() => (showInspector.value ? DetailSurface() : null)}
      </section>

      <section class="panel panel--static">
        <p class="panel-kicker">Static subtree</p>
        <h2>Never re-created on count or list changes</h2>
        <p>
          The debug stream on the right should show text writes, attribute writes, and the
          structural inserts and removals needed for keyed movement only.
        </p>
      </section>
    </main>
  `;
}

createApp("#app", App);

const updatesElement = document.querySelector("#updates");
const updateCountElement = document.querySelector("#update-count");
let updateCount = 0;

function labelForEvent(event) {
  if (event.type === "text") {
    return event.node.parentElement?.dataset.label ?? "text-node";
  }

  if (event.type === "attribute") {
    return event.element.dataset.label ?? event.name;
  }

  return event.node.parentElement?.dataset.label ?? event.action;
}

function describeEvent(event) {
  if (event.type === "text") {
    return `text -> ${JSON.stringify(event.value)}`;
  }

  if (event.type === "attribute") {
    return `attribute ${event.name} -> ${JSON.stringify(event.value)}`;
  }

  return `${event.action} node`;
}

setDomUpdateHook((event) => {
  const host =
    event.type === "text"
      ? event.node.parentElement?.closest("#app")
      : event.element?.closest?.("#app") ?? event.node?.parentElement?.closest("#app");

  if (!host) {
    return;
  }

  updateCount += 1;
  updateCountElement.textContent = String(updateCount);

  const item = document.createElement("li");
  item.className = "update-item";
  item.innerHTML = `<strong>${labelForEvent(event)}</strong><span>${describeEvent(event)}</span>`;
  updatesElement.prepend(item);

  while (updatesElement.children.length > 12) {
    updatesElement.removeChild(updatesElement.lastChild);
  }
});
