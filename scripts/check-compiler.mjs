import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { transformGuiTemplates } from "../gui/compiler/transform.js";

const source = [
  'import { html } from "@bragamateus/gui";',
  "const view = html`",
  '  <button on:click=${() => count.value += 1}>+</button>',
  '  <p title=${count.value * 2}>${count.value * 2}</p>',
  '  <strong>${() => total.value}</strong>',
  '  ${flag ? html`<span>${row.value.label}</span>` : null}',
  "`;",
].join("\n");

const result = transformGuiTemplates(source, {
  id: "compiler-smoke.js",
});

assert.equal(result.changed, true, "The compiler should transform html tagged templates.");
assert.match(
  result.code,
  /on:click=\$\{\(\) => count\.value \+= 1\}/,
  "Event handlers should remain raw functions.",
);
assert.match(
  result.code,
  /title=\$\{\(\) => \(count\.value \* 2\)\}/,
  "Attribute expressions should be wrapped automatically.",
);
assert.match(
  result.code,
  /<p title=\$\{\(\) => \(count\.value \* 2\)\}>\$\{\(\) => \(count\.value \* 2\)\}<\/p>/,
  "Node expressions should be wrapped automatically.",
);
assert.match(
  result.code,
  /<strong>\$\{\(\) => total\.value\}<\/strong>/,
  "Explicit getter expressions should not be double wrapped.",
);
assert.match(
  result.code,
  /html`<span>\$\{\(\) => \(row\.value\.label\)\}<\/span>`/,
  "Nested html templates should be transformed recursively.",
);

const tempDirectory = await mkdtemp(join(tmpdir(), "gui-compiler-"));
const tempFile = join(tempDirectory, "compiled-output.js");

await writeFile(tempFile, result.code, "utf8");

const syntaxCheck = spawnSync(process.execPath, ["--check", tempFile], {
  stdio: "inherit",
});

await rm(tempDirectory, {
  recursive: true,
  force: true,
});

if (syntaxCheck.status !== 0) {
  process.exit(syntaxCheck.status ?? 1);
}

console.log("[gUI] Compiler smoke check passed.");
