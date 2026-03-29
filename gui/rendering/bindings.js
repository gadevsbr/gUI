import {
  createOwner,
  disposeOwner,
  isReactiveToken,
  registerDisposable,
  withOwner,
} from "../reactivity/dependencyGraph.js";
import { createBindingEffect } from "../reactivity/effect.js";
import { isArray, isDocumentFragment, isFunction, isNode } from "../utils/is.js";
import { warn } from "../utils/warn.js";
import { insertNodesBefore, removeNodes, setAttributeValue, setTextContent } from "./domUpdater.js";
import { setupListBinding, isListBinding } from "./list.js";
import { normalizeRenderable, sameNodeSequence } from "./renderable.js";
import { isTemplateResult } from "./templateResult.js";

function isReactiveBinding(value) {
  return isReactiveToken(value) || isFunction(value);
}

function resolveBindingValue(value) {
  if (isReactiveToken(value)) {
    return value.source.value;
  }

  if (isFunction(value)) {
    return value();
  }

  return value;
}

function clearPart(part) {
  if (part.cleanup) {
    part.cleanup();
    part.cleanup = null;
  }

  if (part.currentNodes.length > 0) {
    removeNodes(part.currentNodes);
  }

  part.currentNodes = [];
  part.currentType = "empty";
  part.textNode = null;
}

function writeTextPart(part, value) {
  if (part.currentType !== "text" || !part.textNode) {
    clearPart(part);
    part.textNode = document.createTextNode("");
    part.currentNodes = [part.textNode];
    part.currentType = "text";
    insertNodesBefore(part.anchor, part.currentNodes);
  }

  setTextContent(part.textNode, value);
}

function writeNodePart(part, value) {
  const normalized = normalizeRenderable(value);
  const { nodes, cleanup } = normalized;

  if (nodes.length === 0) {
    clearPart(part);
    return;
  }

  if (part.currentType === "nodes" && sameNodeSequence(part.currentNodes, nodes)) {
    return;
  }

  clearPart(part);
  part.currentNodes = nodes;
  part.currentType = "nodes";
  part.textNode = null;
  part.cleanup = cleanup;
  insertNodesBefore(part.anchor, nodes);
}

function updateNodePart(part, value) {
  if (isListBinding(value)) {
    if (part.currentType !== "list") {
      clearPart(part);
      setupListBinding(part, value);
    }

    return;
  }

  if (
    value === null ||
    value === undefined ||
    value === false ||
    isNode(value) ||
    isDocumentFragment(value) ||
    isTemplateResult(value) ||
    isArray(value)
  ) {
    if (part.currentType === "list") {
      clearPart(part);
    }

    writeNodePart(part, value);
    return;
  }

  if (part.currentType === "list") {
    clearPart(part);
  }

  writeTextPart(part, value);
}

function setupNodeBinding(part, value) {
  if (isListBinding(value)) {
    setupListBinding(part, value);
    return;
  }

  if (!isReactiveBinding(value)) {
    updateNodePart(part, value);
    return;
  }

  if (isFunction(value)) {
    createBindingEffect(() => {
      const branchOwner = createOwner(`node-branch:${part.index}`);
      const resolved = withOwner(branchOwner, () => value());

      updateNodePart(part, resolved);

      return () => {
        disposeOwner(branchOwner);
      };
    }, {
      label: `node-part:${part.index}`,
    });
    return;
  }

  createBindingEffect(() => {
    updateNodePart(part, resolveBindingValue(value));
  }, {
    label: `node-part:${part.index}`,
  });
}

function setupAttributeBinding(part, value) {
  if (!isReactiveBinding(value)) {
    setAttributeValue(part.element, part.name, value);
    return;
  }

  createBindingEffect(() => {
    setAttributeValue(part.element, part.name, resolveBindingValue(value));
  }, {
    label: `attr-part:${part.name}`,
  });
}

function setupEventBinding(part, value) {
  if (!isFunction(value)) {
    warn(`Event binding "${part.name}" expects a function.`, { once: true });
    return;
  }

  const eventName = part.name.slice(3);
  part.element.addEventListener(eventName, value);

  registerDisposable(() => {
    part.element.removeEventListener(eventName, value);
  });
}

export function setupBindings(parts, values) {
  for (const part of parts) {
    if (!part) {
      continue;
    }

    const value = values[part.index];

    if (part.type === "node") {
      setupNodeBinding(part, value);
      continue;
    }

    if (part.type === "attribute") {
      setupAttributeBinding(part, value);
      continue;
    }

    setupEventBinding(part, value);
  }
}
