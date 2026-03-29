import { isArray, isDocumentFragment, isNode } from "../utils/is.js";
import { disposeTemplateResult, isTemplateResult, toTemplateNodes } from "./templateResult.js";

function combineDisposers(disposers) {
  if (disposers.length === 0) {
    return null;
  }

  return () => {
    for (const dispose of disposers) {
      dispose();
    }
  };
}

function appendRenderable(value, nodes, disposers) {
  if (value === null || value === undefined || value === false) {
    return;
  }

  if (isTemplateResult(value)) {
    nodes.push(...toTemplateNodes(value));
    disposers.push(() => {
      disposeTemplateResult(value);
    });
    return;
  }

  if (isDocumentFragment(value)) {
    nodes.push(...Array.from(value.childNodes));
    return;
  }

  if (isNode(value)) {
    nodes.push(value);
    return;
  }

  if (isArray(value)) {
    for (const item of value) {
      appendRenderable(item, nodes, disposers);
    }

    return;
  }

  nodes.push(document.createTextNode(String(value)));
}

export function normalizeRenderable(
  value,
  {
    preserveEmptyComment = false,
    commentLabel = "gui-empty",
  } = {},
) {
  const nodes = [];
  const disposers = [];

  appendRenderable(value, nodes, disposers);

  if (nodes.length === 0 && preserveEmptyComment) {
    nodes.push(document.createComment(commentLabel));
  }

  return {
    nodes,
    cleanup: combineDisposers(disposers),
  };
}

export function sameNodeSequence(currentNodes, nextNodes) {
  if (currentNodes.length !== nextNodes.length) {
    return false;
  }

  for (let index = 0; index < currentNodes.length; index += 1) {
    if (currentNodes[index] !== nextNodes[index]) {
      return false;
    }
  }

  return true;
}
