const TEMPLATE_RESULT = Symbol("gui.template.result");

export function createTemplateResult(fragment, nodes, owner, dispose) {
  return {
    [TEMPLATE_RESULT]: true,
    fragment,
    nodes,
    owner,
    dispose,
  };
}

export function isTemplateResult(value) {
  return Boolean(value && value[TEMPLATE_RESULT]);
}

export function toTemplateNodes(templateResult) {
  return templateResult.nodes;
}

export function disposeTemplateResult(templateResult) {
  if (templateResult && typeof templateResult.dispose === "function") {
    templateResult.dispose();
  }
}
