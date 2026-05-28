#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const targets = [
  "src",
  "scripts",
  "vite.config.js",
];

function collectJsFiles(target) {
  const absoluteTarget = path.resolve(root, target);
  const stat = statSync(absoluteTarget, { throwIfNoEntry: false });
  if (!stat) return [];
  if (stat.isFile()) return absoluteTarget.endsWith(".js") ? [absoluteTarget] : [];

  return readdirSync(absoluteTarget, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(absoluteTarget, entry.name);
    if (entry.isDirectory()) return collectJsFiles(fullPath);
    return entry.isFile() && entry.name.endsWith(".js") ? [fullPath] : [];
  });
}

const files = targets.flatMap(collectJsFiles);
const failures = [];

for (const file of files) {
  const result = spawnSync(process.execPath, ["--check", file], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    failures.push({ file, stderr: result.stderr.trim() });
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Syntax check failed: ${path.relative(root, failure.file)}`);
    console.error(failure.stderr);
  }
  process.exit(1);
}

console.log(`Checked ${files.length} JavaScript files.`);
