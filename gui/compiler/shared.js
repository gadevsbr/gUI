const DEFAULT_FILTER = /\.[cm]?[jt]sx?$/;

export function shouldTransformId(id, options = {}) {
  if (!id || id.includes("\0")) {
    return false;
  }

  if ((options.exclude ?? /node_modules/).test(id)) {
    return false;
  }

  return (options.include ?? DEFAULT_FILTER).test(id);
}

export function getLoaderFromPath(path) {
  if (path.endsWith(".tsx")) {
    return "tsx";
  }

  if (path.endsWith(".ts")) {
    return "ts";
  }

  if (path.endsWith(".jsx")) {
    return "jsx";
  }

  if (path.endsWith(".mjs") || path.endsWith(".js") || path.endsWith(".cjs")) {
    return "js";
  }

  return "js";
}
