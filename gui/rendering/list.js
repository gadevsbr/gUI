import { createBindingEffect } from "../reactivity/effect.js";
import { createOwner, disposeOwner, runWithTemplateCapture, withOwner } from "../reactivity/dependencyGraph.js";
import { signal } from "../reactivity/signal.js";
import { isArray, isFunction } from "../utils/is.js";
import { warn } from "../utils/warn.js";
import { insertNodesBefore, removeNodes } from "./domUpdater.js";
import { normalizeRenderable } from "./renderable.js";

const LIST_BINDING = Symbol("gui.list.binding");

function isReactiveSourceApi(value) {
  return Boolean(value && typeof value === "object" && value.__node);
}

function resolveListKey(key, item, index) {
  if (isFunction(key)) {
    return key(item, index);
  }

  return item?.[key];
}

function resolveListSource(source) {
  if (isFunction(source)) {
    return source();
  }

  if (isReactiveSourceApi(source)) {
    return source.value;
  }

  return source;
}

function normalizeListSource(binding) {
  const value = resolveListSource(binding.source);

  if (value === null || value === undefined) {
    return [];
  }

  if (!isArray(value)) {
    warn(`list("${binding.label}") expects an array source.`, { once: true });
    return [];
  }

  return value;
}

function normalizeKey(binding, item, index, seenKeys) {
  const nextKey = resolveListKey(binding.key, item, index);

  if (nextKey === null || nextKey === undefined) {
    warn(`list("${binding.label}") received an empty key at index ${index}.`, { once: true });
    return Symbol(`gui-list:${binding.label}:missing:${index}`);
  }

  if (seenKeys.has(nextKey)) {
    warn(`list("${binding.label}") received a duplicate key "${String(nextKey)}".`, { once: true });
    return Symbol(`gui-list:${binding.label}:duplicate:${String(nextKey)}:${index}`);
  }

  seenKeys.add(nextKey);
  return nextKey;
}

function createRecord(binding, item, index, key) {
  const owner = createOwner(`list-item:${String(key)}`);
  const itemSignal = signal(item, {
    label: `list-item:${binding.label}:${String(key)}`,
  });
  const indexSignal = signal(index, {
    label: `list-index:${binding.label}:${String(key)}`,
  });

  const rendered = withOwner(owner, () =>
    runWithTemplateCapture(() => binding.render(itemSignal, indexSignal, key)),
  );
  const normalized = normalizeRenderable(rendered, {
    preserveEmptyComment: true,
    commentLabel: `gui-list:${binding.label}:${String(key)}`,
  });

  return {
    key,
    owner,
    itemSignal,
    indexSignal,
    nodes: normalized.nodes,
    cleanup: normalized.cleanup,
  };
}

function disposeRecord(record) {
  disposeOwner(record.owner);

  if (record.cleanup) {
    record.cleanup();
    record.cleanup = null;
  }

  removeNodes(record.nodes);
  record.nodes = [];
}

function syncRecordOrder(part, records) {
  let reference = part.anchor;

  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    const lastNode = record.nodes[record.nodes.length - 1];

    if (lastNode?.nextSibling !== reference) {
      insertNodesBefore(reference, record.nodes);
    }

    reference = record.nodes[0] ?? reference;
  }
}

function reconcileRecords(part, state) {
  const items = normalizeListSource(state.binding);
  const seenKeys = new Set();
  const staleRecords = new Map(state.records);
  const nextOrder = new Array(items.length);
  const nextRecords = new Map();

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    const key = normalizeKey(state.binding, item, index, seenKeys);
    let record = staleRecords.get(key);

    if (record) {
      staleRecords.delete(key);
      record.itemSignal.value = item;
      record.indexSignal.value = index;
    } else {
      record = createRecord(state.binding, item, index, key);
    }

    nextOrder[index] = record;
    nextRecords.set(key, record);
  }

  for (const record of staleRecords.values()) {
    disposeRecord(record);
  }

  syncRecordOrder(part, nextOrder);
  state.records = nextRecords;
  state.order = nextOrder;
}

function disposeListState(state) {
  for (const record of state.records.values()) {
    disposeRecord(record);
  }

  state.records.clear();
  state.order = [];
  disposeOwner(state.owner);
}

export function list(source, key, render, options = {}) {
  if (!isFunction(render)) {
    throw new TypeError("[gUI] list() render must be a function.");
  }

  if (!(isFunction(key) || typeof key === "string")) {
    throw new TypeError("[gUI] list() key must be a function or property name.");
  }

  return {
    [LIST_BINDING]: true,
    source,
    key,
    render,
    label: options.label ?? "list",
  };
}

export function isListBinding(value) {
  return Boolean(value && value[LIST_BINDING]);
}

export function setupListBinding(part, binding) {
  const state = {
    binding,
    owner: createOwner(`list-part:${binding.label}:${part.index}`),
    records: new Map(),
    order: [],
  };

  part.currentType = "list";
  part.currentNodes = [];
  part.textNode = null;
  part.cleanup = () => {
    disposeListState(state);
  };

  withOwner(state.owner, () => {
    createBindingEffect(() => {
      reconcileRecords(part, state);
    }, {
      label: `list-part:${binding.label}:${part.index}`,
    });
  });
}
