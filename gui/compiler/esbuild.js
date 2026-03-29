import { readFile } from "node:fs/promises";
import { getLoaderFromPath, shouldTransformId } from "./shared.js";
import { transformGuiTemplates } from "./transform.js";

export function guiEsbuildPlugin(options = {}) {
  return {
    name: "gui-compile-assisted-templates",
    setup(build) {
      const filter = options.include ?? /\.[cm]?[jt]sx?$/;

      build.onLoad({ filter }, async (args) => {
        if (!shouldTransformId(args.path, options)) {
          return null;
        }

        const source = await readFile(args.path, "utf8");
        const result = transformGuiTemplates(source, {
          ...options,
          id: args.path,
        });

        return {
          contents: result.code,
          loader: getLoaderFromPath(args.path),
        };
      });
    },
  };
}
