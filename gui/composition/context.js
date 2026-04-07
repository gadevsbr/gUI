import {
  createOwner,
  disposeOwner,
  getCurrentOwner,
  runWithTemplateCapture,
  withOwner,
} from "../reactivity/dependencyGraph.js";
import { normalizeRenderable } from "../rendering/renderable.js";
import { createTemplateResult } from "../rendering/templateResult.js";

let nextContextId = 0;

function createContextId() {
  nextContextId += 1;
  return `context:${nextContextId}`;
}

export function createContext(defaultValue, options = {}) {
  const context = {
    id: createContextId(),
    label: options.label ?? `context:${nextContextId}`,
    defaultValue,
  };

  context.Provider = function Provider(value, render) {
    return provideContext(context, value, render);
  };

  return context;
}

export function provideContext(context, value, render) {
  const owner = getCurrentOwner();

  if (!owner) {
    throw new Error(`[gUI] provideContext("${context?.label ?? "context"}") must run inside an owner scope.`);
  }

  const providerOwner = createOwner(`provider:${context?.label ?? context?.id ?? "context"}`);
  providerOwner.contexts.set(context.id, value);

  const rendered = withOwner(providerOwner, () =>
    runWithTemplateCapture(() => (typeof render === "function" ? render() : render)),
  );
  const normalized = normalizeRenderable(rendered, {
    preserveEmptyComment: true,
    commentLabel: `gui-provider:${context?.label ?? context?.id ?? "context"}`,
  });
  const fragment = document.createDocumentFragment();

  fragment.append(...normalized.nodes);

  return createTemplateResult(fragment, normalized.nodes, providerOwner, () => {
    if (normalized.cleanup) {
      normalized.cleanup();
    }

    disposeOwner(providerOwner);
  });
}

export function useContext(context) {
  let owner = getCurrentOwner();

  while (owner) {
    if (owner.contexts?.has(context.id)) {
      return owner.contexts.get(context.id);
    }

    owner = owner.parent;
  }

  if (arguments.length > 0 && "defaultValue" in context) {
    return context.defaultValue;
  }

  return undefined;
}
