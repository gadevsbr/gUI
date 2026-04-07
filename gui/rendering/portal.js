import {
  createOwner,
  disposeOwner,
  isReactiveToken,
  runWithTemplateCapture,
  withOwner,
} from "../reactivity/dependencyGraph.js";
import { createBindingEffect } from "../reactivity/effect.js";
import { warn } from "../utils/warn.js";
import { appendNodes, removeNodes } from "./domUpdater.js";
import { normalizeRenderable, sameNodeSequence } from "./renderable.js";
import { createTemplateResult } from "./templateResult.js";

function isReactiveSourceApi(value) {
  return Boolean(value && typeof value === "object" && value.__node);
}

function resolveValue(value) {
  if (isReactiveToken(value)) {
    return value.source.value;
  }

  if (typeof value === "function") {
    return value();
  }

  if (isReactiveSourceApi(value)) {
    return value.value;
  }

  return value;
}

function resolveTarget(target) {
  const resolved = resolveValue(target);

  if (!resolved) {
    return null;
  }

  if (typeof resolved === "string") {
    return document.querySelector(resolved);
  }

  if (resolved instanceof Element || resolved instanceof DocumentFragment) {
    return resolved;
  }

  return null;
}

function resolveChildren(children) {
  if (typeof children !== "function") {
    return children;
  }

  return runWithTemplateCapture(() => children());
}

export function Portal(target, children, options = {}) {
  const owner = createOwner(`portal:${options.label ?? "portal"}`);
  const marker = document.createComment(`gui-portal:${options.label ?? "portal"}`);
  const fragment = document.createDocumentFragment();
  fragment.append(marker);

  const state = {
    currentTarget: null,
    currentNodes: [],
    currentCleanup: null,
  };

  function clearMounted() {
    if (state.currentNodes.length > 0) {
      removeNodes(state.currentNodes);
      state.currentNodes = [];
    }

    if (state.currentCleanup) {
      state.currentCleanup();
      state.currentCleanup = null;
    }
  }

  withOwner(owner, () => {
    createBindingEffect(() => {
      const nextTarget = resolveTarget(target);

      if (!nextTarget) {
        warn(`[gUI] Portal target "${String(resolveValue(target))}" was not found.`, { once: true });
        clearMounted();
        state.currentTarget = null;
        return;
      }

      const branchOwner = createOwner(`portal-branch:${options.label ?? "portal"}`);
      const rendered = withOwner(branchOwner, () => resolveChildren(children));
      const normalized = normalizeRenderable(rendered, {
        preserveEmptyComment: true,
        commentLabel: `gui-portal-empty:${options.label ?? "portal"}`,
      });

      const sameTarget = state.currentTarget === nextTarget;
      const sameNodes = sameNodeSequence(state.currentNodes, normalized.nodes);

      if (!sameTarget || !sameNodes) {
        clearMounted();
        appendNodes(nextTarget, normalized.nodes);
        state.currentTarget = nextTarget;
        state.currentNodes = normalized.nodes;
        state.currentCleanup = () => {
          if (normalized.cleanup) {
            normalized.cleanup();
          }

          disposeOwner(branchOwner);
        };
        return;
      }

      if (normalized.cleanup) {
        normalized.cleanup();
      }

      disposeOwner(branchOwner);
    }, {
      label: options.label ? `portal:${options.label}` : "portal",
    });
  });

  return createTemplateResult(fragment, [marker], owner, () => {
    clearMounted();
    disposeOwner(owner);
  });
}
