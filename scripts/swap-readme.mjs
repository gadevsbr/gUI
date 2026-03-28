import { copyFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const mode = process.argv[2];
const root = process.cwd();
const readmePath = resolve(root, "README.md");
const npmReadmePath = resolve(root, "npm-readme.md");
const backupPath = resolve(root, ".readme.github.backup.md");

if (mode === "npm") {
  if (!existsSync(backupPath)) {
    await copyFile(readmePath, backupPath);
  }

  await copyFile(npmReadmePath, readmePath);
  process.exit(0);
}

if (mode === "restore") {
  if (existsSync(backupPath)) {
    await copyFile(backupPath, readmePath);
    await rm(backupPath);
  }

  process.exit(0);
}

console.error('Usage: node scripts/swap-readme.mjs <npm|restore>');
process.exit(1);
