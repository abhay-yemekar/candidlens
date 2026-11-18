#!/usr/bin/env node
/**
 * `hirelens` was renamed to `candidlens`. This package keeps the old
 * command working: it runs the candidlens CLI with the same arguments and
 * exits with its code. The notice goes to stderr so piped output (such as
 * `score --json`) stays clean.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const manifestPath = require.resolve("candidlens/package.json");
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const binPath = typeof manifest.bin === "string" ? manifest.bin : manifest.bin.candidlens;

process.stderr.write(
  "hirelens is now candidlens: use `npx candidlens` (this command forwards to it).\n",
);

const result = spawnSync(
  process.execPath,
  [path.join(path.dirname(manifestPath), binPath), ...process.argv.slice(2)],
  { stdio: "inherit" },
);
process.exit(result.status ?? 1);
