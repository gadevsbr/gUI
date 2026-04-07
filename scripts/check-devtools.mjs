import assert from "node:assert/strict";
import { subscribeDomUpdates } from "../gui/index.js";
import { createInspector } from "../gui/devtools/index.js";

assert.equal(typeof subscribeDomUpdates, "function", "subscribeDomUpdates should be exported.");
assert.equal(typeof createInspector, "function", "createInspector should be exported from ./devtools.");

console.log("[gUI] Devtools smoke check passed.");
