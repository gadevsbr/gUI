import { readdir } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { spawnSync } from "node:child_process";

const roots = ["gui", "demo", "benchmark", "website", "scripts"];
const syntaxExtensions = new Set([".js", ".mjs"]);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(fullPath)));
      continue;
    }

    if (syntaxExtensions.has(extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const cwd = process.cwd();
const files = [];

for (const root of roots) {
  files.push(...(await collectFiles(resolve(cwd, root))));
}

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

console.log(`[gUI] Syntax check passed for ${files.length} files.`);
