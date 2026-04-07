import { subscribeRuntimeEvents } from "../reactivity/dependencyGraph.js";
import { subscribeDomUpdates } from "../rendering/domUpdater.js";

const INSPECTOR_STYLE = `
:host {
  all: initial;
}

.inspector-root {
  position: fixed;
  inset: 0;
  z-index: 2147483000;
  pointer-events: none;
}

.overlay-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.panel {
  position: fixed;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  width: min(360px, calc(100vw - 24px));
  max-height: min(70vh, 640px);
  overflow: hidden;
  border: 1px solid rgba(17, 18, 26, 0.14);
  border-radius: 24px;
  background: rgba(15, 16, 21, 0.92);
  color: #f8f4ec;
  box-shadow: 0 28px 90px rgba(5, 6, 10, 0.36);
  backdrop-filter: blur(20px);
  pointer-events: auto;
}

.panel--bottom-right {
  right: 16px;
  bottom: 16px;
}

.panel--bottom-left {
  left: 16px;
  bottom: 16px;
}

.panel--top-right {
  right: 16px;
  top: 16px;
}

.panel--top-left {
  left: 16px;
  top: 16px;
}

.panel.is-collapsed .panel-body {
  display: none;
}

.panel.is-expanded {
  inset: 16px;
  width: auto;
  max-width: none;
  max-height: none;
  height: auto;
  border-radius: 28px;
}

.panel-header,
.panel-meta,
.panel-summary,
.panel-stream,
.entry {
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 16px 14px;
}

.panel-kicker,
.summary-card span,
.entry-tag,
.panel-meta {
  display: inline-block;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(248, 244, 236, 0.62);
}

.panel-title {
  margin-top: 6px;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.04em;
  color: #fff8ef;
}

.panel-subtitle {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.55;
  color: rgba(248, 244, 236, 0.7);
}

.panel-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.panel-button {
  border: 0;
  border-radius: 999px;
  padding: 8px 12px;
  background: rgba(248, 244, 236, 0.1);
  color: #fff8ef;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.panel-button.is-active {
  background: rgba(13, 124, 107, 0.28);
}

.panel-button--danger {
  background: rgba(192, 63, 86, 0.18);
}

.panel-body {
  display: grid;
  gap: 14px;
  padding: 0 16px 16px;
  min-height: 0;
}

.panel-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.summary-card {
  padding: 12px;
  border-radius: 16px;
  background: rgba(248, 244, 236, 0.06);
  border: 1px solid rgba(248, 244, 236, 0.08);
}

.summary-card strong {
  display: block;
  margin-top: 6px;
  font-size: 22px;
  letter-spacing: -0.04em;
  color: #fff8ef;
}

.panel-meta {
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(248, 244, 236, 0.05);
  line-height: 1.5;
}

.panel-stream {
  display: grid;
  gap: 10px;
  max-height: 360px;
  overflow: auto;
  padding-right: 4px;
  min-height: 0;
}

.panel.is-expanded .panel-stream {
  max-height: none;
}

.entry {
  display: grid;
  gap: 8px;
  padding: 12px;
  border-radius: 16px;
  background: rgba(248, 244, 236, 0.06);
  border: 1px solid rgba(248, 244, 236, 0.08);
}

.entry-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.entry-tag {
  font-weight: 700;
}

.entry-title {
  flex: 1;
  font-size: 14px;
  font-weight: 700;
  color: #fff8ef;
}

.entry-detail {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(248, 244, 236, 0.76);
}

.entry-meta {
  font-size: 12px;
  color: rgba(248, 244, 236, 0.58);
}

.entry--text {
  border-color: rgba(13, 124, 107, 0.32);
}

.entry--attribute {
  border-color: rgba(202, 125, 33, 0.34);
}

.entry--structure {
  border-color: rgba(35, 89, 204, 0.34);
}

.entry--runtime {
  border-color: rgba(248, 244, 236, 0.14);
}

.overlay-hit {
  position: fixed;
  border-radius: 14px;
  border: 2px solid var(--tone);
  background: color-mix(in srgb, var(--tone) 18%, transparent);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08), 0 12px 30px color-mix(in srgb, var(--tone) 24%, transparent);
  transform-origin: center;
  animation: pulse-out 780ms ease forwards;
}

.overlay-hit::after {
  content: attr(data-label);
  position: absolute;
  top: -12px;
  left: 10px;
  padding: 4px 8px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--tone) 84%, #101115);
  color: #fff8ef;
  font-family: "Space Grotesk", "Segoe UI", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  white-space: nowrap;
}

.overlay-hit--text {
  --tone: #0d7c6b;
}

.overlay-hit--attribute {
  --tone: #ca7d21;
}

.overlay-hit--insert {
  --tone: #2359cc;
}

.overlay-hit--move {
  --tone: #7c4dff;
}

.overlay-hit--remove {
  --tone: #c03f56;
}

@keyframes pulse-out {
  0% {
    opacity: 0;
    transform: scale(0.96);
  }

  18% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.03);
  }
}

@media (max-width: 720px) {
  .panel {
    width: calc(100vw - 20px);
    right: 10px;
    left: 10px;
    bottom: 10px;
  }

  .panel.is-expanded {
    inset: 10px;
  }

  .panel-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
`;

function truncate(value, max = 88) {
  if (!value) {
    return "";
  }

  return value.length > max ? `${value.slice(0, max - 3)}...` : value;
}

function resolveTarget(target) {
  if (!target) {
    return null;
  }

  if (typeof target === "string") {
    return document.querySelector(target);
  }

  if (typeof target === "function") {
    return resolveTarget(target());
  }

  return target instanceof Node ? target : null;
}

function resolveEventElement(event) {
  if (event.type === "text") {
    return event.node?.parentElement ?? (event.node?.parentNode instanceof Element ? event.node.parentNode : null);
  }

  if (event.type === "attribute") {
    return event.element ?? null;
  }

  if (event.node instanceof Element) {
    return event.node;
  }

  if (event.anchor?.parentElement) {
    return event.anchor.parentElement;
  }

  return event.node?.parentElement ?? null;
}

function matchesTarget(target, event) {
  if (!target) {
    return true;
  }

  const element = resolveEventElement(event);

  if (!element) {
    return false;
  }

  return element === target || target.contains(element);
}

function rectForEvent(event) {
  if (event.rect) {
    return event.rect;
  }

  const element = resolveEventElement(event);

  if (!element || typeof element.getBoundingClientRect !== "function") {
    return null;
  }

  const rect = element.getBoundingClientRect();

  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  };
}

function resolveDataLabel(event) {
  if (event.type === "text") {
    return event.node?.parentElement?.dataset?.label ?? "text";
  }

  if (event.type === "attribute") {
    return event.element?.dataset?.label ?? event.name ?? "attribute";
  }

  return (
    event.node?.parentElement?.dataset?.label ??
    event.node?.dataset?.label ??
    `${event.action ?? "structure"}`
  );
}

function joinSourceLabels(origin) {
  if (!origin?.sources?.length) {
    return "";
  }

  return origin.sources
    .map((source) => source.label)
    .filter(Boolean)
    .slice(0, 4)
    .join(", ");
}

function formatDomEntry(event) {
  const sourceLabels = joinSourceLabels(event.origin);
  const originLabel = event.origin?.label ?? event.origin?.kind ?? "binding";
  const targetLabel = resolveDataLabel(event);

  if (event.type === "text") {
    return {
      tone: "text",
      tag: "TEXT",
      title: targetLabel,
      detail: `Updated text node to ${JSON.stringify(event.value)}.`,
      meta: sourceLabels
        ? `${originLabel} <= ${sourceLabels}`
        : `Origin ${originLabel}`,
    };
  }

  if (event.type === "attribute") {
    return {
      tone: "attribute",
      tag: "ATTR",
      title: `${targetLabel} / ${event.name}`,
      detail: `Attribute changed to ${JSON.stringify(event.value)}.`,
      meta: sourceLabels
        ? `${originLabel} <= ${sourceLabels}`
        : `Origin ${originLabel}`,
    };
  }

  const action = event.action === "move" ? "MOVE" : event.action === "remove" ? "REMOVE" : "INSERT";

  return {
    tone: "structure",
    tag: action,
    title: targetLabel,
    detail: `${action.toLowerCase()} structural ownership update.`,
    meta: sourceLabels
      ? `${originLabel} <= ${sourceLabels}`
      : `Origin ${originLabel}`,
  };
}

function formatRuntimeEntry(event) {
  if (event.type === "signal:write") {
    return {
      tone: "runtime",
      tag: "SIGNAL",
      title: event.node.label ?? event.node.id,
      detail: `Signal write -> ${event.valueSummary}`,
      meta: `${event.node.kind} ${event.node.id}`,
    };
  }

  if (event.type === "computed:invalidate") {
    return {
      tone: "runtime",
      tag: "DIRTY",
      title: event.node.label ?? event.node.id,
      detail: "Computed marked dirty.",
      meta: joinSourceLabels(event.node),
    };
  }

  if (event.type === "computed:refresh") {
    return {
      tone: "runtime",
      tag: "COMPUTED",
      title: event.node.label ?? event.node.id,
      detail: `Refreshed in ${event.durationMs} ms${event.changed ? " with a changed value." : "."}`,
      meta: joinSourceLabels(event.node),
    };
  }

  if (event.type === "subscriber:cleanup") {
    return {
      tone: "runtime",
      tag: "CLEANUP",
      title: event.node.label ?? event.node.id,
      detail: "Ran cleanup before the next flush.",
      meta: joinSourceLabels(event.node),
    };
  }

  if (event.type === "subscriber:flush") {
    return {
      tone: "runtime",
      tag: event.node.kind.toUpperCase(),
      title: event.node.label ?? event.node.id,
      detail: `Flushed in ${event.durationMs} ms.`,
      meta: joinSourceLabels(event.node),
    };
  }

  if (event.type === "subscriber:dispose") {
    return {
      tone: "runtime",
      tag: "DISPOSE",
      title: event.node.label ?? event.node.id,
      detail: "Subscriber disposed.",
      meta: joinSourceLabels(event.node),
    };
  }

  return {
    tone: "runtime",
    tag: "OWNER",
    title: event.owner?.label ?? event.owner?.id ?? "owner",
    detail: `Disposed ${event.childCount} children and ${event.disposableCount} disposables.`,
    meta: event.owner?.id ?? "",
  };
}

function createShadowRoot(container) {
  const host = document.createElement("div");
  host.dataset.guiInspector = "true";
  const shadow = host.attachShadow({ mode: "open" });
  shadow.innerHTML = `
    <style>${INSPECTOR_STYLE}</style>
    <div class="inspector-root">
      <div class="overlay-layer"></div>
      <aside class="panel panel--bottom-right">
        <div class="panel-header">
          <div>
            <span class="panel-kicker">gUI Inspector</span>
            <div class="panel-title"></div>
            <div class="panel-subtitle"></div>
          </div>
          <div class="panel-controls">
            <button class="panel-button" data-action="expand">Fullscreen</button>
            <button class="panel-button" data-action="pause">Pause</button>
            <button class="panel-button" data-action="clear">Clear</button>
            <button class="panel-button" data-action="collapse">Fold</button>
            <button class="panel-button panel-button--danger" data-action="close">Close</button>
          </div>
        </div>
        <div class="panel-body">
          <div class="panel-summary">
            <div class="summary-card"><span>Text</span><strong data-stat="text">0</strong></div>
            <div class="summary-card"><span>Attr</span><strong data-stat="attribute">0</strong></div>
            <div class="summary-card"><span>Structure</span><strong data-stat="structure">0</strong></div>
            <div class="summary-card"><span>Flushes</span><strong data-stat="flush">0</strong></div>
          </div>
          <div class="panel-meta"></div>
          <div class="panel-stream"></div>
        </div>
      </aside>
    </div>
  `;

  container.appendChild(host);
  return { host, shadow };
}

export function createInspector(options = {}) {
  if (typeof document === "undefined") {
    throw new Error("[gUI] createInspector() requires a browser document.");
  }

  const state = {
    title: options.title ?? "Live DOM Lens",
    subtitle:
      options.subtitle ??
      "Exact DOM writes, ownership movement, and reactive flushes in one timeline.",
    maxEntries: Math.max(8, options.maxEntries ?? 22),
    overlayDuration: Math.max(300, options.overlayDuration ?? 780),
    position: options.position ?? "bottom-right",
    target: options.target ?? null,
    paused: Boolean(options.paused),
    collapsed: Boolean(options.collapsed),
    expanded: Boolean(options.expanded),
    destroyed: false,
    entries: [],
    counters: {
      text: 0,
      attribute: 0,
      structure: 0,
      flush: 0,
    },
  };

  const container =
    typeof Element !== "undefined" && options.container instanceof Element
      ? options.container
      : document.body;
  const { host, shadow } = createShadowRoot(container);
  const overlayLayer = shadow.querySelector(".overlay-layer");
  const panel = shadow.querySelector(".panel");
  const titleElement = shadow.querySelector(".panel-title");
  const subtitleElement = shadow.querySelector(".panel-subtitle");
  const metaElement = shadow.querySelector(".panel-meta");
  const streamElement = shadow.querySelector(".panel-stream");
  const expandButton = shadow.querySelector('[data-action="expand"]');
  const pauseButton = shadow.querySelector('[data-action="pause"]');
  const clearButton = shadow.querySelector('[data-action="clear"]');
  const collapseButton = shadow.querySelector('[data-action="collapse"]');
  const closeButton = shadow.querySelector('[data-action="close"]');
  const statElements = {
    text: shadow.querySelector('[data-stat="text"]'),
    attribute: shadow.querySelector('[data-stat="attribute"]'),
    structure: shadow.querySelector('[data-stat="structure"]'),
    flush: shadow.querySelector('[data-stat="flush"]'),
  };

  panel.classList.add(`panel--${state.position}`);
  titleElement.textContent = state.title;
  subtitleElement.textContent = state.subtitle;

  function renderMeta() {
    const target = resolveTarget(state.target);
    const targetLabel =
      target?.id ? `#${target.id}` : target?.dataset?.label ?? target?.tagName?.toLowerCase() ?? "document";

    metaElement.textContent = `${state.paused ? "Paused" : "Live"} • target ${targetLabel} • ${state.entries.length} recent events`;
    panel.classList.toggle("is-expanded", state.expanded);
    pauseButton.classList.toggle("is-active", state.paused);
    pauseButton.textContent = state.paused ? "Resume" : "Pause";
    panel.classList.toggle("is-collapsed", state.collapsed);
    collapseButton.textContent = state.collapsed ? "Expand" : "Fold";
    expandButton.classList.toggle("is-active", state.expanded);
    expandButton.textContent = state.expanded ? "Window" : "Fullscreen";
  }

  function renderStats() {
    statElements.text.textContent = String(state.counters.text);
    statElements.attribute.textContent = String(state.counters.attribute);
    statElements.structure.textContent = String(state.counters.structure);
    statElements.flush.textContent = String(state.counters.flush);
  }

  function renderStream() {
    streamElement.innerHTML = "";

    if (state.entries.length === 0) {
      const empty = document.createElement("div");
      empty.className = "entry entry--runtime";
      empty.innerHTML = `
        <div class="entry-top">
          <span class="entry-tag">READY</span>
          <span class="entry-title">Waiting for reactive work</span>
        </div>
        <div class="entry-detail">Interact with the target surface to inspect exact writes, list movement, and cleanup behavior.</div>
        <div class="entry-meta">The inspector subscribes to both runtime and DOM event streams.</div>
      `;
      streamElement.appendChild(empty);
      return;
    }

    for (const entry of state.entries) {
      const element = document.createElement("article");
      element.className = `entry entry--${entry.tone}`;
      element.innerHTML = `
        <div class="entry-top">
          <span class="entry-tag">${entry.tag}</span>
          <span class="entry-title">${entry.title}</span>
        </div>
        <div class="entry-detail">${truncate(entry.detail)}</div>
        <div class="entry-meta">${truncate(entry.meta)}</div>
      `;
      streamElement.appendChild(element);
    }
  }

  function createOverlay(event, entry) {
    if (options.overlay === false) {
      return;
    }

    const rect = rectForEvent(event);

    if (!rect) {
      return;
    }

    const overlay = document.createElement("div");
    const tone =
      event.type === "structure"
        ? event.action === "move"
          ? "move"
          : event.action === "remove"
            ? "remove"
            : "insert"
        : event.type;

    overlay.className = `overlay-hit overlay-hit--${tone}`;
    overlay.dataset.label = `${entry.tag} ${truncate(entry.title, 30)}`;
    overlay.style.left = `${Math.max(rect.left - 4, 4)}px`;
    overlay.style.top = `${Math.max(rect.top - 4, 4)}px`;
    overlay.style.width = `${Math.max(rect.width + 8, 28)}px`;
    overlay.style.height = `${Math.max(rect.height + 8, 28)}px`;
    overlayLayer.appendChild(overlay);

    window.setTimeout(() => {
      overlay.remove();
    }, state.overlayDuration);
  }

  function pushEntry(entry) {
    state.entries.unshift(entry);
    state.entries = state.entries.slice(0, state.maxEntries);
    renderStats();
    renderMeta();
    renderStream();
  }

  function shouldTrackDomEvent(event) {
    const target = resolveTarget(state.target);

    if (state.target && !target) {
      return false;
    }

    if (!matchesTarget(target, event)) {
      return false;
    }

    return typeof options.domEventFilter === "function" ? options.domEventFilter(event) !== false : true;
  }

  function shouldTrackRuntimeEvent(event) {
    if (typeof options.runtimeEventFilter === "function") {
      return options.runtimeEventFilter(event) !== false;
    }

    return options.runtime !== false;
  }

  function handleDomEvent(event) {
    if (state.paused || !shouldTrackDomEvent(event)) {
      return;
    }

    const entry = formatDomEntry(event);

    if (event.type === "text") {
      state.counters.text += 1;
    } else if (event.type === "attribute") {
      state.counters.attribute += 1;
    } else {
      state.counters.structure += 1;
    }

    createOverlay(event, entry);
    pushEntry(entry);
  }

  function handleRuntimeEvent(event) {
    if (state.paused || !shouldTrackRuntimeEvent(event)) {
      return;
    }

    if (event.type === "subscriber:flush") {
      state.counters.flush += 1;
    }

    pushEntry(formatRuntimeEntry(event));
  }

  function clear() {
    state.entries = [];
    state.counters = {
      text: 0,
      attribute: 0,
      structure: 0,
      flush: 0,
    };

    overlayLayer.innerHTML = "";
    renderStats();
    renderMeta();
    renderStream();
  }

  function pause() {
    state.paused = true;
    renderMeta();
  }

  function resume() {
    state.paused = false;
    renderMeta();
  }

  function setTarget(nextTarget) {
    state.target = nextTarget;
    renderMeta();
  }

  function setExpanded(expanded) {
    state.expanded = Boolean(expanded);
    renderMeta();
  }

  function toggleExpanded() {
    setExpanded(!state.expanded);
  }

  pauseButton.addEventListener("click", () => {
    if (state.paused) {
      resume();
      return;
    }

    pause();
  });

  clearButton.addEventListener("click", clear);
  collapseButton.addEventListener("click", () => {
    state.collapsed = !state.collapsed;
    renderMeta();
  });
  expandButton.addEventListener("click", toggleExpanded);
  closeButton.addEventListener("click", () => {
    controller.destroy();
  });

  const unsubscribeDom = subscribeDomUpdates(handleDomEvent);
  const unsubscribeRuntime = subscribeRuntimeEvents(handleRuntimeEvent);

  renderStats();
  renderMeta();
  renderStream();

  const controller = {
    clear,
    destroy() {
      if (state.destroyed) {
        return;
      }

      state.destroyed = true;
      unsubscribeDom();
      unsubscribeRuntime();
      host.remove();
      if (typeof options.onDestroy === "function") {
        options.onDestroy();
      }
    },
    pause,
    resume,
    setExpanded,
    setTarget,
    toggleExpanded,
    entries() {
      return state.entries.slice();
    },
    isExpanded() {
      return state.expanded;
    },
    isPaused() {
      return state.paused;
    },
  };

  return controller;
}
