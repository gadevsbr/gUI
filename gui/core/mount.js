import { isArray, isDocumentFragment, isNode } from "../utils/is.js";
import { warn } from "../utils/warn.js";
import { normalizeRenderable } from "../rendering/renderable.js";
import { isTemplateResult } from "../rendering/templateResult.js";

function resolveTarget(target) {
  if (typeof target === "string") {
    const element = document.querySelector(target);

    if (!element) {
      throw new Error(`[gUI] Mount target "${target}" was not found.`);
    }

    return element;
  }

  if (isNode(target)) {
    return target;
  }

  throw new Error("[gUI] Mount target must be a selector or a DOM node.");
}

function normalizeRootValue(value) {
  if (
    value == null ||
    isNode(value) ||
    isDocumentFragment(value) ||
    isTemplateResult(value) ||
    isArray(value) ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    const normalized = normalizeRenderable(value, {
      preserveEmptyComment: true,
      commentLabel: "gui-empty-root",
    });

    if (normalized.nodes.length > 0) {
      return normalized;
    }
  }

  warn(`Unsupported root value "${String(value)}". Rendering it as text.`, { once: true });

  const fallbackText = document.createTextNode(String(value));
  return {
    nodes: [fallbackText],
    cleanup: null,
  };
}

export function mount(target, value) {
  const container = resolveTarget(target);
  const normalized = normalizeRootValue(value);

  container.replaceChildren(...normalized.nodes);

  return {
    container,
    nodes: normalized.nodes,
    unmount() {
      if (normalized.cleanup) {
        normalized.cleanup();
      }

      for (const node of normalized.nodes) {
        if (node.parentNode === container) {
          container.removeChild(node);
        }
      }
    },
  };
}
