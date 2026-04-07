import { describeActiveExecution } from "../reactivity/dependencyGraph.js";

const BOOLEAN_ATTRIBUTES = new Set([
  "checked",
  "disabled",
  "hidden",
  "open",
  "readonly",
  "required",
  "selected",
]);

const PROPERTY_ALIASES = {
  class: "className",
  readonly: "readOnly",
};

let domUpdateHook = null;
const domUpdateSubscribers = new Set();

export function setDomUpdateHook(hook) {
  domUpdateHook = typeof hook === "function" ? hook : null;
}

export function subscribeDomUpdates(listener) {
  if (typeof listener !== "function") {
    return () => {};
  }

  domUpdateSubscribers.add(listener);

  return () => {
    domUpdateSubscribers.delete(listener);
  };
}

function emit(payload) {
  const event = {
    timestamp:
      typeof performance !== "undefined" && typeof performance.now === "function"
        ? performance.now()
        : Date.now(),
    origin: describeActiveExecution(),
    ...payload,
  };

  if (domUpdateHook) {
    domUpdateHook(event);
  }

  for (const listener of Array.from(domUpdateSubscribers)) {
    listener(event);
  }
}

function normalizeTextValue(value) {
  if (value === null || value === undefined || value === false) {
    return "";
  }

  return String(value);
}

function getPropertyName(name) {
  return PROPERTY_ALIASES[name] ?? name;
}

function captureRect(node) {
  const target =
    node instanceof Element
      ? node
      : node?.parentElement ?? (node?.parentNode instanceof Element ? node.parentNode : null);

  if (!target || typeof target.getBoundingClientRect !== "function") {
    return null;
  }

  const rect = target.getBoundingClientRect();

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

export function setTextContent(node, value) {
  const nextValue = normalizeTextValue(value);

  if (node.data === nextValue) {
    return;
  }

  node.data = nextValue;
  emit({
    type: "text",
    node,
    value: nextValue,
  });
}

export function setAttributeValue(element, name, value) {
  const propertyName = getPropertyName(name);
  const hasProperty = propertyName in element;
  let mutated = false;

  if (value === null || value === undefined || value === false) {
    if (hasProperty && BOOLEAN_ATTRIBUTES.has(name) && element[propertyName] !== false) {
      element[propertyName] = false;
      mutated = true;
    }

    if (name === "value" && hasProperty && element[propertyName] !== "") {
      element[propertyName] = "";
      mutated = true;
    }

    if (element.hasAttribute(name)) {
      element.removeAttribute(name);
      mutated = true;
    }

    if (mutated) {
      emit({
        type: "attribute",
        element,
        name,
        value: null,
      });
    }

    return;
  }

  if (value === true) {
    if (hasProperty && BOOLEAN_ATTRIBUTES.has(name) && element[propertyName] !== true) {
      element[propertyName] = true;
      mutated = true;
    }

    if (element.getAttribute(name) !== "") {
      element.setAttribute(name, "");
      mutated = true;
    }

    if (mutated) {
      emit({
        type: "attribute",
        element,
        name,
        value: true,
      });
    }

    return;
  }

  if (hasProperty && element[propertyName] !== value) {
    element[propertyName] = value;
    mutated = true;
  }

  const serializedValue = String(value);

  if (element.getAttribute(name) !== serializedValue) {
    element.setAttribute(name, serializedValue);
    mutated = true;
  }

  if (mutated) {
    emit({
      type: "attribute",
      element,
      name,
      value,
    });
  }
}

export function insertNodesBefore(anchor, nodes) {
  const parent = anchor.parentNode;

  for (const node of nodes) {
    const hadParent = Boolean(node.parentNode);
    parent.insertBefore(node, anchor);
    emit({
      type: "structure",
      action: hadParent ? "move" : "insert",
      node,
      anchor,
    });
  }
}

export function appendNodes(parent, nodes) {
  for (const node of nodes) {
    const hadParent = Boolean(node.parentNode);
    parent.appendChild(node);
    emit({
      type: "structure",
      action: hadParent ? "move" : "insert",
      node,
    });
  }
}

export function removeNodes(nodes) {
  for (const node of nodes) {
    if (!node.parentNode) {
      continue;
    }

    const rect = captureRect(node);
    node.parentNode.removeChild(node);
    emit({
      type: "structure",
      action: "remove",
      node,
      rect,
    });
  }
}
