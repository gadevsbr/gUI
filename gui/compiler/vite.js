import { shouldTransformId } from "./shared.js";
import { transformGuiTemplates } from "./transform.js";

export function guiVitePlugin(options = {}) {
  return {
    name: "gui-compile-assisted-templates",
    enforce: "pre",
    transform(source, id) {
      if (!shouldTransformId(id, options)) {
        return null;
      }

      const result = transformGuiTemplates(source, {
        ...options,
        id,
      });

      if (!result.changed) {
        return null;
      }

      return {
        code: result.code,
        map: null,
      };
    },
  };
}
