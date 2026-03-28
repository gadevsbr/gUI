import { computed, createApp, effect, html, setDomUpdateHook, signal } from "../gui/index.js";

const count = signal(0, { label: "count" });
const title = signal("High-performance DOM bindings", { label: "title" });
const theme = signal("signal", { label: "theme" });

const double = computed(() => count.value * 2, { label: "double" });
const parity = computed(() => (count.value % 2 === 0 ? "even" : "odd"), { label: "parity" });
const badgeClass = computed(() => `badge badge--${parity.value}`, { label: "badgeClass" });

let appExecutions = 0;

effect(() => {
  document.title = `gUI demo - count ${count.value}`;
});

function App() {
  appExecutions += 1;

  return html`
    <main class="demo-shell" data-label="shell" data-theme=${theme.value}>
      <section class="hero">
        <p class="eyebrow">gUI v1</p>
        <h1 class="title" data-label="title">${title.value}</h1>
        <p class="lede">
          Component setup runs once. Signals update only the exact bindings that depend on them.
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
                  ? "Per-binding updates, no tree diff"
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

      <section class="panel panel--static">
        <p class="panel-kicker">Static subtree</p>
        <h2>Never re-created on count changes</h2>
        <p>
          This copy is static. The debug stream on the right only reports the exact text nodes and
          attributes that were touched.
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

  while (updatesElement.children.length > 10) {
    updatesElement.removeChild(updatesElement.lastChild);
  }
});
