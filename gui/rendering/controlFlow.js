import { isReactiveToken, runWithTemplateCapture } from "../reactivity/dependencyGraph.js";

const MATCH = Symbol("gui.match");

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

function resolveBranch(branch, payload) {
  if (typeof branch !== "function") {
    return branch ?? null;
  }

  return runWithTemplateCapture(() => branch(payload));
}

export function Show({ when, children, fallback = null }) {
  return () => {
    const resolved = resolveValue(when);

    if (resolved) {
      return resolveBranch(children, resolved);
    }

    return resolveBranch(fallback, resolved);
  };
}

export function Match({ when, children }) {
  return {
    [MATCH]: true,
    when,
    children,
  };
}

function normalizeCases(source) {
  if (Array.isArray(source)) {
    return source;
  }

  if (source && Array.isArray(source.cases)) {
    return source.cases;
  }

  if (source && Array.isArray(source.children)) {
    return source.children;
  }

  return [];
}

export function Switch(source, fallback = null) {
  const cases = normalizeCases(source);
  const resolvedFallback =
    arguments.length > 1 ? fallback : source?.fallback ?? null;

  return () => {
    for (const entry of cases) {
      if (!entry || entry[MATCH] !== true) {
        continue;
      }

      const resolved = resolveValue(entry.when);

      if (resolved) {
        return resolveBranch(entry.children, resolved);
      }
    }

    return resolveBranch(resolvedFallback, null);
  };
}
