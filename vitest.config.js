import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "happy-dom",
    include: ["test/**/*.test.js"],
    coverage: {
      provider: "v8",
      include: ["gui/**/*.js"],
      exclude: [
        "gui/devtools/inspector.js",
        "gui/devtools/index.js",
        "gui/compiler/esbuild.js",
        "gui/compiler/vite.js",
        "gui/compiler/shared.js",
        "gui/index.js"
      ],
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
});
