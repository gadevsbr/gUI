import { computed, createApp, effect, html, list, setDomUpdateHook, signal } from "../gui/index.js";

function createRow(index) {
  return {
    id: `row-${index + 1}`,
    label: `Row ${index + 1}`,
    value: (index + 1) * 3,
  };
}

function createRows(size) {
  return Array.from({ length: size }, (_, index) => createRow(index));
}

function tick() {
  return Promise.resolve();
}

const HARNESS_SIZE = 240;

const benchCount = signal(0, { label: "benchCount" });
const benchRows = signal(createRows(HARNESS_SIZE), { label: "benchRows" });
const benchVisible = signal(true, { label: "benchVisible" });
const benchResults = signal([], { label: "benchResults" });
const runState = signal("idle", { label: "runState" });
const activeDetailScopes = signal(0, { label: "benchActiveDetailScopes" });
const disposedDetailScopes = signal(0, { label: "benchDisposedDetailScopes" });
const benchRowSetups = signal(0, { label: "benchRowSetups" });

const visibleRows = computed(() => benchRows.value.slice(0, 10), { label: "visibleRows" });
const rowTotal = computed(
  () => benchRows.value.reduce((total, row) => total + row.value, 0),
  { label: "rowTotal" },
);

let nextResultId = 1;
let collector = null;

function eventHost(event) {
  return event.type === "text"
    ? event.node.parentElement?.closest("#bench-app")
    : event.element?.closest?.("#bench-app") ?? event.node?.parentElement?.closest("#bench-app");
}

setDomUpdateHook((event) => {
  if (!collector || !eventHost(event)) {
    return;
  }

  collector(event);
});

function appendResult(name, summary) {
  const result = {
    id: `result-${nextResultId}`,
    name,
    ...summary,
  };

  nextResultId += 1;
  benchResults.update((current) => [result, ...current]);
}

async function measureScenario(name, run) {
  runState.value = `running ${name}`;

  const counts = {
    text: 0,
    attribute: 0,
    structure: 0,
  };

  collector = (event) => {
    counts[event.type] += 1;
  };

  const startedAt = performance.now();
  const details = await run();
  await tick();
  const duration = performance.now() - startedAt;
  collector = null;

  const result = {
    durationMs: duration.toFixed(2),
    textWrites: counts.text,
    attributeWrites: counts.attribute,
    structureWrites: counts.structure,
    note: details?.note ?? "",
  };

  appendResult(name, result);
  runState.value = "idle";
  return result;
}

function resetHarnessState() {
  benchCount.value = 0;
  benchRows.value = createRows(HARNESS_SIZE);
  benchVisible.value = true;
}

async function runTextBurst() {
  resetHarnessState();

  return measureScenario("batched text burst", async () => {
    for (let index = 0; index < 5000; index += 1) {
      benchCount.value = index;
    }

    await tick();

    return {
      note: "5000 synchronous signal writes into one flush.",
    };
  });
}

async function runKeyedReorder() {
  resetHarnessState();

  return measureScenario("keyed reorder", async () => {
    benchRows.value = [...benchRows.value].reverse();
    await tick();

    benchRows.value = benchRows.value.map((row, index) =>
      index === 2
        ? {
            ...row,
            label: `${row.label} updated`,
            value: row.value + 17,
          }
        : row,
    );
    await tick();

    return {
      note: "Reverse the keyed list, then update one row without replacing sibling ownership.",
    };
  });
}

async function runScopedDisposal() {
  resetHarnessState();

  return measureScenario("scoped disposal", async () => {
    const disposedBefore = disposedDetailScopes.peek();

    for (let index = 0; index < 80; index += 1) {
      benchVisible.value = false;
      await tick();
      benchVisible.value = true;
      await tick();
    }

    return {
      note: `${disposedDetailScopes.peek() - disposedBefore} scoped cleanups after 80 unmount cycles.`,
    };
  });
}

async function runSuite() {
  benchResults.value = [];
  await runTextBurst();
  await runKeyedReorder();
  await runScopedDisposal();
}

function renderBenchRow(item, index) {
  benchRowSetups.update((current) => current + 1);

  return html`
    <li class="preview-row">
      <span class="preview-index">${() => index.value + 1}</span>
      <span class="preview-label">${() => item.value.label}</span>
      <strong class="preview-value">${() => item.value.value}</strong>
    </li>
  `;
}

function renderResultRow(item) {
  return html`
    <li class="result-row">
      <div class="result-head">
        <strong>${() => item.value.name}</strong>
        <span>${() => item.value.durationMs} ms</span>
      </div>

      <div class="result-grid">
        <div>
          <span>Text</span>
          <strong>${() => item.value.textWrites}</strong>
        </div>

        <div>
          <span>Attr</span>
          <strong>${() => item.value.attributeWrites}</strong>
        </div>

        <div>
          <span>Structure</span>
          <strong>${() => item.value.structureWrites}</strong>
        </div>
      </div>

      <p>${() => item.value.note}</p>
    </li>
  `;
}

function HarnessDetail() {
  effect(() => {
    activeDetailScopes.update((current) => current + 1);

    return () => {
      activeDetailScopes.update((current) => current - 1);
      disposedDetailScopes.update((current) => current + 1);
    };
  }, {
    label: "benchmark-detail-scope",
  });

  return html`
    <div class="detail-box">
      <span>Conditional subtree</span>
      <strong>${() => benchCount.value}</strong>
      <p>Mount and unmount cycles should leave zero active leaked scopes.</p>
    </div>
  `;
}

function App() {
  return html`
    <main class="bench-shell">
      <section class="hero-panel">
        <p class="eyebrow">Benchmark harness</p>
        <h1>Repeatable browser microcases for gUI.</h1>
        <p class="hero-copy">
          This page measures the runtime against the cases that matter for gUI's architecture:
          batched text writes, keyed structural movement, and cleanup when dynamic subtrees leave
          the DOM.
        </p>

        <div class="hero-actions">
          <button class="action action--primary" on:click=${runSuite}>Run full suite</button>
          <button class="action" on:click=${runTextBurst}>Run text burst</button>
          <button class="action" on:click=${runKeyedReorder}>Run keyed reorder</button>
          <button class="action" on:click=${runScopedDisposal}>Run scoped disposal</button>
        </div>
      </section>

      <div class="content-grid">
        <section class="bench-panel bench-panel--workspace" id="bench-app">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Harness state</p>
              <h2>Live fixture</h2>
            </div>
            <span class="status-chip">${() => runState.value}</span>
          </div>

          <p class="panel-copy">
            The left rail is the live fixture. The right rail stays pinned with the last measured
            scenarios so you can compare runtime behavior without losing context.
          </p>

          <div class="metric-grid">
            <article class="metric-card">
              <span>Total rows</span>
              <strong>${() => benchRows.value.length}</strong>
            </article>

            <article class="metric-card">
              <span>Visible total</span>
              <strong>${() => rowTotal.value}</strong>
            </article>

            <article class="metric-card">
              <span>Row setups</span>
              <strong>${benchRowSetups.value}</strong>
            </article>

            <article class="metric-card">
              <span>Active detail scopes</span>
              <strong>${activeDetailScopes.value}</strong>
            </article>

            <article class="metric-card">
              <span>Disposed detail scopes</span>
              <strong>${disposedDetailScopes.value}</strong>
            </article>
          </div>

          <div class="fixture-grid">
            <div class="fixture-card fixture-card--counter">
              <p class="eyebrow">Batched text fixture</p>
              <p class="fixture-copy">
                One counter surface used to observe microtask batching and exact text writes.
              </p>
              <strong class="fixture-value">${benchCount.value}</strong>
              <button class="action action--ghost" on:click=${() => (benchCount.value += 1)}>
                Increment once
              </button>
            </div>

            <div class="fixture-card fixture-card--preview">
              <p class="eyebrow">Keyed list fixture</p>
              <p class="fixture-copy">
                Preview of the first ten rows. Reorders should move existing DOM nodes, not rebuild
                the whole slice.
              </p>
              <div class="preview-shell">
                <ul class="preview-list">
                  ${list(visibleRows, "id", renderBenchRow, { label: "benchmark-preview" })}
                </ul>
              </div>
            </div>
          </div>

          <div class="fixture-card fixture-card--branch">
            <div class="panel-head">
              <div>
                <p class="eyebrow">Scoped disposal fixture</p>
                <h2>Conditional branch</h2>
              </div>
              <button
                class="action action--ghost"
                on:click=${() => {
                  benchVisible.value = !benchVisible.value;
                }}
              >
                ${() => (benchVisible.value ? "Hide subtree" : "Show subtree")}
              </button>
            </div>

            <p class="fixture-copy">
              Toggle the subtree and confirm that active scopes drop to zero when the branch is
              removed, while disposed scopes keep climbing.
            </p>

            ${() => (benchVisible.value ? HarnessDetail() : null)}
          </div>
        </section>

        <section class="bench-panel bench-panel--results">
          <div class="panel-head">
            <div>
              <p class="eyebrow">Results</p>
              <h2>Latest runs</h2>
            </div>
            <button
              class="action action--ghost"
              on:click=${() => {
                benchResults.value = [];
              }}
            >
              Clear
            </button>
          </div>

          <p class="panel-copy">
            Each result captures elapsed time plus real text, attribute, and structural writes
            observed during the scenario.
          </p>

          <div class="result-stack">
            ${() =>
              (benchResults.value.length === 0
                ? html`
                    <div class="empty-state">
                      <strong>No runs yet.</strong>
                      <p>Run the full suite or trigger an individual scenario to populate results.</p>
                    </div>
                  `
                : null)}

            <ul class="result-list">
              ${list(benchResults, "id", renderResultRow, { label: "benchmark-results" })}
            </ul>
          </div>
        </section>
      </div>
    </main>
  `;
}

createApp("#app", App);

window.guiBenchmark = {
  runSuite,
  runTextBurst,
  runKeyedReorder,
  runScopedDisposal,
};
