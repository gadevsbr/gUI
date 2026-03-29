import { createOwner, disposeOwner, withOwner } from "../reactivity/dependencyGraph.js";
import { setupBindings } from "./bindings.js";
import { compileTemplate, locateTemplateParts } from "./templateCompiler.js";
import { createTemplateResult, isTemplateResult, toTemplateNodes } from "./templateResult.js";

export function html(strings, ...values) {
  const compiled = compileTemplate(strings);
  const fragment = compiled.template.content.cloneNode(true);
  const parts = locateTemplateParts(fragment, compiled.parts);
  const nodes = Array.from(fragment.childNodes);
  const owner = compiled.parts.length > 0 ? createOwner("template") : null;

  if (owner) {
    withOwner(owner, () => {
      setupBindings(parts, values);
    });
  } else {
    setupBindings(parts, values);
  }

  return createTemplateResult(fragment, nodes, owner, () => {
    if (owner) {
      disposeOwner(owner);
    }
  });
}

export { isTemplateResult, toTemplateNodes };
