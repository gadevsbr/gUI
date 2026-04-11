import { computed, createApp, effect, html, setDomUpdateHook, signal } from "../gui/index.js";
import { createInspector } from "../gui/devtools/index.js";
import {
  apiReference,
  codeSamples,
  comparisonRows,
  coreConcepts,
  faqItems,
  featureHighlights,
  gettingStartedSteps,
  heroStats,
  learningTracks,
  noBuildBenefits,
  performanceMatrix,
  performancePrinciples,
  playgroundPresets,
  recipes,
  roadmapMilestones,
  sidebarPrinciples,
  siteNavigation,
  tutorials,
  useCases,
} from "./content.js";

const activeSection = signal("overview", { label: "activeSection" });
const mobileNavOpen = signal(false, { label: "mobileNavOpen" });
const siteDevtoolsEnabled = signal(true, { label: "siteDevtoolsEnabled" });
const selectedTutorial = signal(tutorials[0].id, { label: "selectedTutorial" });
const selectedRecipe = signal(recipes[0].id, { label: "selectedRecipe" });
const selectedPreset = signal(playgroundPresets[0].id, { label: "selectedPreset" });
const apiFilter = signal("All", { label: "apiFilter" });
const apiSearch = signal("", { label: "apiSearch" });

const playgroundCount = signal(0, { label: "playgroundCount" });
const playgroundLabel = signal("gUI", { label: "playgroundLabel" });
const playgroundTone = signal("teal", { label: "playgroundTone" });
const playgroundQuery = signal("", { label: "playgroundQuery" });
const domWriteCount = signal(0, { label: "domWriteCount" });
const domWriteLog = signal([], { label: "domWriteLog" });

const apiCategories = ["All", ...new Set(apiReference.map((item) => item.category))];
const moduleCatalog = [
  "Signals",
  "Computeds",
  "Effects",
  "HTML bindings",
  "Template compiler",
  "DOM updater",
  "Scheduler",
  "Mounting",
  "Debug hook",
];
const playgroundRuntimeLabels = [
  "selectedPreset",
  "siteDevtoolsEnabled",
  "playgroundCount",
  "playgroundLabel",
  "playgroundTone",
  "playgroundQuery",
  "domWriteCount",
  "domWriteLog",
  "currentPreset",
  "counterDouble",
  "counterParity",
  "toneChipClass",
  "toneLabel",
  "filteredModules",
];

function matchesRuntimeLabels(event, labels) {
  const haystack = [
    event.node?.label,
    event.owner?.label,
    ...(event.node?.sources ?? []).map((source) => source.label),
  ]
    .filter(Boolean)
    .join(" ");

  return labels.some((label) => haystack.includes(label));
}

const currentTutorial = computed(
  () => tutorials.find((item) => item.id === selectedTutorial.value) ?? tutorials[0],
  { label: "currentTutorial" },
);

const currentRecipe = computed(
  () => recipes.find((item) => item.id === selectedRecipe.value) ?? recipes[0],
  { label: "currentRecipe" },
);

const currentPreset = computed(
  () => playgroundPresets.find((item) => item.id === selectedPreset.value) ?? playgroundPresets[0],
  { label: "currentPreset" },
);

const filteredApi = computed(() => {
  const category = apiFilter.value;
  const query = apiSearch.value.trim().toLowerCase();

  return apiReference.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const matchesQuery =
      query === "" ||
      item.name.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.details.some((detail) => detail.toLowerCase().includes(query));

    return matchesCategory && matchesQuery;
  });
}, { label: "filteredApi" });

const counterDouble = computed(
  () => playgroundCount.value * 2,
  { label: "counterDouble" },
);

const counterParity = computed(
  () => (playgroundCount.value % 2 === 0 ? "Even pulse" : "Odd pulse"),
  { label: "counterParity" },
);

const toneChipClass = computed(
  () => `tone-chip tone-chip--${playgroundTone.value}`,
  { label: "toneChipClass" },
);

const toneLabel = computed(
  () => playgroundTone.value.toUpperCase(),
  { label: "toneLabel" },
);

const filteredModules = computed(() => {
  const query = playgroundQuery.value.trim().toLowerCase();

  if (!query) {
    return moduleCatalog;
  }

  return moduleCatalog.filter((item) => item.toLowerCase().includes(query));
}, { label: "filteredModules" });

function setSection(sectionId) {
  activeSection.value = sectionId;
  mobileNavOpen.value = false;

  const target = document.getElementById(sectionId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function rotateTone() {
  playgroundTone.value =
    playgroundTone.value === "teal"
      ? "amber"
      : playgroundTone.value === "amber"
        ? "cobalt"
        : "teal";
}

function appendPlaygroundLog(event) {
  const label =
    event.type === "text"
      ? event.node.parentElement?.dataset.label ?? "text"
      : event.type === "attribute"
        ? event.element.dataset.label ?? event.name
        : event.node.parentElement?.dataset.label ?? event.action;

  const detail =
    event.type === "text"
      ? `text -> ${JSON.stringify(event.value)}`
      : event.type === "attribute"
        ? `attribute ${event.name} -> ${JSON.stringify(event.value)}`
        : `${event.action} node`;

  domWriteCount.update((count) => count + 1);
  domWriteLog.update((items) => [{ label, detail }, ...items].slice(0, 10));
}

function renderNoBuild() {
  return html`
    <div class="no-build-hero">
      <p class="eyebrow">Zero Build Step</p>
      <h2>The only fine-grained reactive runtime that works without a bundler or JSX compiler.</h2>
      <p class="section-copy">
        SolidJS requires JSX and a compile step. Svelte compiles components. Most modern reactive
        frameworks assume a build pipeline before you ship a single reactive node. gUI does not.
        It is the only runtime in this class that works from a plain
        <code>&lt;script type="module"&gt;</code> tag — no toolchain, no JSX, no compromise.
      </p>
    </div>

    <div class="cdn-block">
      <div class="cdn-block-head">
        <p class="eyebrow">CDN mode — no npm, no build, no toolchain</p>
        <p class="cdn-block-note">Copy this into any HTML file and you have a full reactive surface.</p>
      </div>
      <pre class="code-block cdn-code"><code>${codeSamples.cdn}</code></pre>
    </div>

    <div class="no-build-grid">
      ${noBuildBenefits.map((item) => html`
        <article class="no-build-card">
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `)}
    </div>

    <div class="comparison-block">
      <div class="comparison-block-head">
        <p class="eyebrow">Framework comparison</p>
        <h3>Where gUI sits versus build-required alternatives</h3>
      </div>
      <div class="comparison-table">
        ${comparisonRows.map((row) => html`
          <div class="comparison-row">
            <strong class="comparison-feature">${row.feature}</strong>
            <div class="comparison-cell comparison-cell--gui">
              <span class="comparison-tag">gUI</span>
              <p>${row.gui}</p>
            </div>
            <div class="comparison-cell comparison-cell--alt">
              <span class="comparison-tag">Alternatives</span>
              <p>${row.alternative}</p>
            </div>
          </div>
        `)}
      </div>
    </div>
  `;
}

function renderNav() {
  return siteNavigation.map((item) => html`
    <button
      class=${() => (activeSection.value === item.id ? "nav-link is-active" : "nav-link")}
      on:click=${() => setSection(item.id)}
    >
      <span>${item.label}</span>
    </button>
  `);
}

function renderHeroStats() {
  return heroStats.map((item) => html`
    <article class="metric-card">
      <span>${item.label}</span>
      <strong>${item.value}</strong>
      <p>${item.note}</p>
    </article>
  `);
}

function renderFeatures() {
  return featureHighlights.map((item) => html`
    <article class="feature-card">
      <p class="eyebrow">${item.eyebrow}</p>
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `);
}

function renderUseCases() {
  return useCases.map((item) => html`
    <article class="use-case-card">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `);
}

function renderGettingStarted() {
  return gettingStartedSteps.map((item, index) => html`
    <article class="step-card">
      <div class="step-index">0${index + 1}</div>
      <div class="step-copy">
        <h3>${item.title}</h3>
        <p>${item.body}</p>
        <pre class="code-block"><code>${item.code}</code></pre>
      </div>
    </article>
  `);
}

function renderTracks() {
  return learningTracks.map((track) => html`
    <article class="track-card">
      <span class="track-label">${track.label}</span>
      <h3>${track.title}</h3>
      <p class="track-audience">${track.audience}</p>
      <ul>
        ${track.modules.map((module) => html`<li>${module}</li>`)}
      </ul>
    </article>
  `);
}

function renderConcepts() {
  return coreConcepts.map((item) => html`
    <article class="concept-card">
      <h3>${item.title}</h3>
      <p>${item.summary}</p>
      <ul>
        ${item.bullets.map((bullet) => html`<li>${bullet}</li>`)}
      </ul>
    </article>
  `);
}

function renderTutorialOptions() {
  return tutorials.map((item) => html`
    <button
      class=${() => (selectedTutorial.value === item.id ? "detail-link is-active" : "detail-link")}
      on:click=${() => {
        selectedTutorial.value = item.id;
      }}
    >
      <div>
        <strong>${item.title}</strong>
        <span>${item.level}</span>
      </div>
      <small>${item.duration}</small>
    </button>
  `);
}

function renderRecipeOptions() {
  return recipes.map((item) => html`
    <button
      class=${() => (selectedRecipe.value === item.id ? "detail-link is-active" : "detail-link")}
      on:click=${() => {
        selectedRecipe.value = item.id;
      }}
    >
      <div>
        <strong>${item.title}</strong>
        <span>Recipe</span>
      </div>
    </button>
  `);
}

function renderPresetOptions() {
  return playgroundPresets.map((preset) => html`
    <button
      class=${() => (selectedPreset.value === preset.id ? "preset-chip is-active" : "preset-chip")}
      on:click=${() => {
        selectedPreset.value = preset.id;
      }}
    >
      ${preset.label}
    </button>
  `);
}

function renderApiFilters() {
  return apiCategories.map((category) => html`
    <button
      class=${() => (apiFilter.value === category ? "filter-chip is-active" : "filter-chip")}
      on:click=${() => {
        apiFilter.value = category;
      }}
    >
      ${category}
    </button>
  `);
}

function renderApiCards() {
  return html`
    <div class="api-grid">
      ${() =>
        filteredApi.value.length > 0
          ? filteredApi.value.map((item) => html`
              <article class="api-card">
                <div class="api-card-head">
                  <span class="api-category">${item.category}</span>
                  <h3>${item.name}</h3>
                </div>
                <p>${item.summary}</p>
                <ul>
                  ${item.details.map((detail) => html`<li>${detail}</li>`)}
                </ul>
              </article>
            `)
          : [
              html`
                <article class="empty-state">
                  <h3>No API entries matched</h3>
                  <p>Try another category or clear the search term.</p>
                </article>
              `,
            ]}
    </div>
  `;
}

function renderPerformanceCards() {
  return performancePrinciples.map((item) => html`
    <article class="performance-card">
      <h3>${item.title}</h3>
      <p>${item.body}</p>
    </article>
  `);
}

function renderPerformanceMatrix() {
  return performanceMatrix.map((row) => html`
    <article class="matrix-row">
      <strong>${row.label}</strong>
      <div>
        <span class="matrix-label">gUI</span>
        <p>${row.gui}</p>
      </div>
      <div>
        <span class="matrix-label">Broader alternative</span>
        <p>${row.expensive}</p>
      </div>
    </article>
  `);
}

function renderRoadmap() {
  return roadmapMilestones.map((item) => html`
    <article class="roadmap-card">
      <span class="roadmap-phase">${item.phase}</span>
      <h3>${item.title}</h3>
      <ul>
        ${item.items.map((entry) => html`<li>${entry}</li>`)}
      </ul>
    </article>
  `);
}

function renderFaq() {
  return faqItems.map((item) => html`
    <article class="faq-card">
      <h3>${item.question}</h3>
      <p>${item.answer}</p>
    </article>
  `);
}

effect(() => {
  document.title = `gUI Docs - ${activeSection.value}`;
});

function App() {
  return html`
    <div class="site-shell">
      <header class="site-header">
        <div class="brand-lockup">
          <span class="brand-mark">gUI</span>
          <div>
            <p class="brand-title">Performance-first UI runtime</p>
            <span class="brand-subtitle">A full local docs and tutorial property built in gUI itself</span>
          </div>
        </div>

        <div class="header-actions">
          <button
            class="ghost-button mobile-toggle"
            on:click=${() => {
              mobileNavOpen.value = !mobileNavOpen.value;
            }}
          >
            ${() => (mobileNavOpen.value ? "Close menu" : "Open menu")}
          </button>
          <button
            class="ghost-button"
            on:click=${() => {
              siteDevtoolsEnabled.value = !siteDevtoolsEnabled.value;
            }}
          >
            ${() => (siteDevtoolsEnabled.value ? "Disable Devtools" : "Enable Devtools")}
          </button>
          <a class="ghost-button" href="./demo/">Runtime Demo</a>
          <a class="ghost-button" href="./benchmark/">Benchmark</a>
          <a class="ghost-button" href="#api" on:click=${() => setSection("api")}>API Reference</a>
          <a class="primary-button" href="#playground" on:click=${() => setSection("playground")}>
            Open Playground
          </a>
        </div>
      </header>

      <div class="layout">
        <aside class=${() => (mobileNavOpen.value ? "sidebar is-open" : "sidebar")}>
          <div class="sidebar-card">
            <p class="eyebrow">Sections</p>
            <nav class="sidebar-nav">${renderNav()}</nav>
          </div>

          <div class="sidebar-card compact-card">
            <p class="eyebrow">Explore</p>
            <div class="detail-list">
              <a class="detail-link" href="./demo/">
                <div>
                  <strong>Runtime Demo</strong>
                  <span>Inspect direct bindings, keyed ownership, and DOM writes.</span>
                </div>
              </a>
              <a class="detail-link" href="./benchmark/">
                <div>
                  <strong>Benchmark Harness</strong>
                  <span>Run batching, keyed reorder, and disposal scenarios in the browser.</span>
                </div>
              </a>
            </div>
          </div>

          <div class="sidebar-card compact-card">
            <p class="eyebrow">Install</p>
            <pre class="code-block compact"><code>${codeSamples.install}</code></pre>
          </div>

          <div class="sidebar-card compact-card">
            <p class="eyebrow">Runtime Rules</p>
            <pre class="code-block compact"><code>${codeSamples.runtimeRules}</code></pre>
          </div>

          <div class="sidebar-card compact-card">
            <p class="eyebrow">Non-negotiables</p>
            <ul class="principle-list">
              ${sidebarPrinciples.map((item) => html`<li>${item}</li>`)}
            </ul>
          </div>
        </aside>

        <main class="content">
          <section id="overview" class="section-panel hero-panel">
            <div class="hero-copy">
              <p class="eyebrow">Framework Overview</p>
              <h1>Build interfaces that update exact DOM bindings, not whole component trees.</h1>
              <p class="hero-lede">
                gUI is a minimal runtime for engineers who care about predictable update behavior,
                explicit dependency tracking, and performance that comes from architecture instead of
                broad rerender loops.
              </p>
              <div class="hero-actions">
                <a class="primary-button" href="#getting-started" on:click=${() => setSection("getting-started")}>
                  Start Building
                </a>
                <a class="ghost-button" href="#concepts" on:click=${() => setSection("concepts")}>
                  Learn the Model
                </a>
                <a class="ghost-button" href="./demo/">Open Runtime Demo</a>
                <a class="ghost-button" href="./benchmark/">Open Benchmark Harness</a>
              </div>
            </div>

            <div class="metrics-grid">${renderHeroStats()}</div>
          </section>

          <section class="features-grid">${renderFeatures()}</section>

          <section id="no-build" class="section-panel">${renderNoBuild()}</section>

          <section class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Good Fit</p>
                <h2>Where gUI delivers the most leverage</h2>
              </div>
              <p class="section-copy">
                Use gUI where broad rerendering becomes friction and where precise UI updates are part
                of the product requirement, not a nice-to-have.
              </p>
            </div>

            <div class="use-case-grid">${renderUseCases()}</div>
          </section>

          <section id="getting-started" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Getting Started</p>
                <h2>Go from install to first mounted app quickly</h2>
              </div>
              <pre class="code-block inline-block"><code>${codeSamples.starter}</code></pre>
            </div>

            <div class="step-grid">${renderGettingStarted()}</div>
          </section>

          <section id="concepts" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Core Concepts</p>
                <h2>The runtime model you need before building larger surfaces</h2>
              </div>
              <p class="section-copy">
                Learn the state graph, lazy derivations, exact DOM binding model, and the one-time
                component setup rule that shapes the whole framework.
              </p>
            </div>

            <div class="concept-grid">${renderConcepts()}</div>

            <div class="track-grid">${renderTracks()}</div>
          </section>

          <section id="tutorials" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Tutorials</p>
                <h2>Structured paths from first app to architecture-level understanding</h2>
              </div>
              <p class="section-copy">
                Pick a tutorial and follow the concrete goals, steps, and outcome instead of learning
                the runtime as disconnected snippets.
              </p>
            </div>

            <div class="detail-layout">
              <div class="detail-list">${renderTutorialOptions()}</div>
              <article class="detail-panel">
                <div class="detail-head">
                  <div>
                    <p class="eyebrow">Selected tutorial</p>
                    <h3>${() => currentTutorial.value.title}</h3>
                  </div>
                  <div class="detail-badges">
                    <span class="detail-pill">${() => currentTutorial.value.level}</span>
                    <span class="detail-pill">${() => currentTutorial.value.duration}</span>
                  </div>
                </div>

                <p class="detail-summary">${() => currentTutorial.value.summary}</p>

                <div class="detail-columns">
                  <div>
                    <h4>Goals</h4>
                    <ul>
                      ${() => currentTutorial.value.goals.map((item) => html`<li>${item}</li>`)}
                    </ul>
                  </div>
                  <div>
                    <h4>Steps</h4>
                    <ol>
                      ${() => currentTutorial.value.steps.map((item) => html`<li>${item}</li>`)}
                    </ol>
                  </div>
                </div>

                <div class="outcome-banner">
                  <span>Outcome</span>
                  <p>${() => currentTutorial.value.outcome}</p>
                </div>
              </article>
            </div>
          </section>

          <section id="recipes" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Recipes</p>
                <h2>Reusable implementation patterns for real interfaces</h2>
              </div>
              <p class="section-copy">
                These recipes translate the core model into repeatable patterns for theming, lists,
                dashboards, and browser integrations.
              </p>
            </div>

            <div class="detail-layout">
              <div class="detail-list">${renderRecipeOptions()}</div>
              <article class="detail-panel">
                <div class="detail-head">
                  <div>
                    <p class="eyebrow">Selected recipe</p>
                    <h3>${() => currentRecipe.value.title}</h3>
                  </div>
                </div>

                <div class="recipe-copy">
                  <div>
                    <h4>Problem</h4>
                    <p>${() => currentRecipe.value.problem}</p>
                  </div>
                  <div>
                    <h4>Approach</h4>
                    <p>${() => currentRecipe.value.approach}</p>
                  </div>
                </div>

                <div class="detail-columns">
                  <div>
                    <h4>Checklist</h4>
                    <ul>
                      ${() => currentRecipe.value.checklist.map((item) => html`<li>${item}</li>`)}
                    </ul>
                  </div>
                  <div>
                    <h4>Snippet</h4>
                    <pre class="code-block"><code>${() => currentRecipe.value.snippet}</code></pre>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section id="playground" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Playground</p>
                <h2>Explore the runtime with an interactive proof surface</h2>
              </div>
              <p class="section-copy">
                Switch between presets to see how gUI handles text bindings, attribute updates, and
                computed filtering while the DOM write log and inspector stay scoped to the preview only.
              </p>
              <div class="section-actions">
                <a class="ghost-button" href="./demo/">Open Runtime Demo</a>
                <a class="ghost-button" href="./benchmark/">Open Benchmark Harness</a>
              </div>
            </div>

            <div class="preset-row">${renderPresetOptions()}</div>

            <div class="playground-grid">
              <article class="playground-doc">
                <p class="eyebrow">Current preset</p>
                <h3>${() => currentPreset.value.title}</h3>
                <p class="detail-summary">${() => currentPreset.value.description}</p>
                <div class="focus-row">
                  ${() => currentPreset.value.focus.map((item) => html`<span class="focus-chip">${item}</span>`)}
                </div>
                <pre class="code-block"><code>${() => currentPreset.value.code}</code></pre>
              </article>

              <div class="playground-preview-group">
                <article class="playground-preview" data-playground-root="true">
                  <div class=${() => (selectedPreset.value === "counter" ? "preview-card is-active" : "preview-card is-hidden")}>
                    <div class="preview-head">
                      <span class="preview-kicker">Counter demo</span>
                      <h3 data-label="counter-title">Single-source text updates</h3>
                    </div>
                    <div class="mini-metrics">
                      <article>
                        <span>Count</span>
                        <strong data-label="count">${playgroundCount.value}</strong>
                      </article>
                      <article>
                        <span>Double</span>
                        <strong data-label="double">${counterDouble.value}</strong>
                      </article>
                      <article>
                        <span>Parity</span>
                        <strong data-label="parity">${counterParity.value}</strong>
                      </article>
                    </div>
                    <div class="button-row">
                      <button class="primary-button" on:click=${() => (playgroundCount.value += 1)}>Increment</button>
                      <button class="ghost-button" on:click=${() => (playgroundCount.value = Math.max(0, playgroundCount.value - 1))}>
                        Decrement
                      </button>
                      <button class="ghost-button" on:click=${() => (playgroundCount.value = 0)}>Reset</button>
                    </div>
                  </div>

                  <div class=${() => (selectedPreset.value === "theme" ? "preview-card is-active" : "preview-card is-hidden")}>
                    <div class="preview-head">
                      <span class="preview-kicker">Theme demo</span>
                      <h3 data-label="theme-title">${() => `${playgroundLabel.value} Theme Surface`}</h3>
                    </div>
                    <div class="theme-stage" data-tone=${playgroundTone.value}>
                      <span class=${toneChipClass.value} data-label="tone-chip">${toneLabel.value}</span>
                      <p class="theme-copy">
                        The data attribute, chip class, and title label update independently.
                      </p>
                    </div>
                    <label class="search-field">
                      <span>Label</span>
                      <input
                        type="text"
                        value=${() => playgroundLabel.value}
                        on:input=${(event) => {
                          playgroundLabel.value = event.currentTarget.value || "gUI";
                        }}
                      />
                    </label>
                    <div class="button-row">
                      <button class="primary-button" on:click=${rotateTone}>Rotate tone</button>
                      <button class="ghost-button" on:click=${() => (playgroundLabel.value = "gUI")}>Reset label</button>
                    </div>
                  </div>

                  <div class=${() => (selectedPreset.value === "filter" ? "preview-card is-active" : "preview-card is-hidden")}>
                    <div class="preview-head">
                      <span class="preview-kicker">Filter demo</span>
                      <h3 data-label="filter-title">Computed list filtering</h3>
                    </div>
                    <label class="search-field">
                      <span>Search modules</span>
                      <input
                        type="search"
                        placeholder="scheduler, signal, effect..."
                        value=${() => playgroundQuery.value}
                        on:input=${(event) => {
                          playgroundQuery.value = event.currentTarget.value;
                        }}
                      />
                    </label>
                    <div class="filter-summary">
                      <span>Matches</span>
                      <strong data-label="match-count">${() => filteredModules.value.length}</strong>
                    </div>
                    <ul class="result-list">
                      ${() =>
                        filteredModules.value.length > 0
                          ? filteredModules.value.map((item) => html`<li data-label="result-item">${item}</li>`)
                          : [html`<li data-label="result-item">No modules matched the current query.</li>`]}
                    </ul>
                  </div>
                </article>

                <aside class="debug-rail">
                  <div class="debug-summary">
                    <span>Playground DOM writes</span>
                    <strong>${() => `${domWriteCount.value} tracked`}</strong>
                  </div>
                  <ul class="debug-list">
                    ${() =>
                      domWriteLog.value.length > 0
                        ? domWriteLog.value.map((entry) => html`
                            <li>
                              <strong>${entry.label}</strong>
                              <span>${entry.detail}</span>
                            </li>
                          `)
                        : [
                            html`
                              <li class="debug-placeholder">
                                <strong>No writes yet</strong>
                                <span>Interact with the playground to populate the log.</span>
                              </li>
                            `,
                          ]}
                  </ul>
                </aside>
              </div>
            </div>
          </section>

          <section id="api" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">API Reference</p>
                <h2>Jump directly to the runtime surface you need</h2>
              </div>
              <p class="section-copy">
                Filter by category or search by behavior to find the exact primitive, helper, or
                debugging surface involved.
              </p>
            </div>

            <div class="api-toolbar">
              <div class="chip-row">${renderApiFilters()}</div>
              <label class="search-field">
                <span>Search the API</span>
                <input
                  type="search"
                  placeholder="signal, cleanup, mount, template..."
                  value=${() => apiSearch.value}
                  on:input=${(event) => {
                    apiSearch.value = event.currentTarget.value;
                  }}
                />
              </label>
            </div>

            ${renderApiCards()}
          </section>

          <section id="performance" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Performance</p>
                <h2>How the runtime avoids unnecessary work</h2>
              </div>
              <p class="section-copy">
                The goal is not performance branding. The goal is a rendering model where you can
                explain exactly why a state change touched the DOM it touched.
              </p>
            </div>

            <div class="performance-grid">${renderPerformanceCards()}</div>

            <div class="matrix-grid">${renderPerformanceMatrix()}</div>
          </section>

          <section id="roadmap" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">Roadmap</p>
                <h2>What the next iterations should unlock</h2>
              </div>
              <p class="section-copy">
                The priority is to add ergonomics and capability without regressing the direct
                subscription model that gives the runtime its shape.
              </p>
            </div>

            <div class="roadmap-grid">${renderRoadmap()}</div>
          </section>

          <section id="faq" class="section-panel">
            <div class="section-heading">
              <div>
                <p class="eyebrow">FAQ</p>
                <h2>Questions advanced adopters ask early</h2>
              </div>
            </div>

            <div class="faq-grid">${renderFaq()}</div>
          </section>

          <section class="section-panel footer-panel">
            <div>
              <p class="eyebrow">Build with gUI</p>
              <h2>Start with the quickstart, then jump into the docs site, runtime demo, or benchmark.</h2>
            </div>
            <div class="footer-actions">
              <a class="primary-button" href="#getting-started" on:click=${() => setSection("getting-started")}>
                Install and start
              </a>
              <a class="ghost-button" href="#playground" on:click=${() => setSection("playground")}>
                Inspect live updates
              </a>
              <a class="ghost-button" href="./demo/">
                Open runtime demo
              </a>
              <a class="ghost-button" href="./benchmark/">
                Open benchmark
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  `;
}

createApp("#app", App);

let siteInspector = null;

effect(() => {
  if (!siteDevtoolsEnabled.value) {
    if (siteInspector) {
      siteInspector.destroy();
      siteInspector = null;
    }

    return;
  }

  if (siteInspector) {
    return;
  }

  siteInspector = createInspector({
    title: "Playground Inspector",
    subtitle: "Make gUI updates visible while you switch presets and touch the runtime.",
    target: "[data-playground-root='true']",
    position: "bottom-right",
    maxEntries: 16,
    runtimeEventFilter: (event) => matchesRuntimeLabels(event, playgroundRuntimeLabels),
    onDestroy() {
      siteInspector = null;

      if (siteDevtoolsEnabled.peek()) {
        siteDevtoolsEnabled.value = false;
      }
    },
  });
});

setDomUpdateHook((event) => {
  const host =
    event.type === "text"
      ? event.node.parentElement?.closest("[data-playground-root='true']")
      : event.element?.closest?.("[data-playground-root='true']") ??
        event.node?.parentElement?.closest("[data-playground-root='true']");

  if (!host) {
    return;
  }

  appendPlaygroundLog(event);
});

window.addEventListener(
  "scroll",
  () => {
    const offset = 180;

    for (const item of siteNavigation) {
      const element = document.getElementById(item.id);

      if (!element) {
        continue;
      }

      const rect = element.getBoundingClientRect();

      if (rect.top <= offset && rect.bottom >= offset) {
        if (activeSection.peek() !== item.id) {
          activeSection.value = item.id;
        }

        break;
      }
    }
  },
  { passive: true },
);
