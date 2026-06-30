#!/usr/bin/env node
import { execFile as execFileCallback } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFile = promisify(execFileCallback);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const temp = await mkdtemp(path.join(os.tmpdir(), "envdiffkit-package-"));

async function run(command, args, options = {}) {
  return execFile(command, args, {
    cwd: root,
    maxBuffer: 1024 * 1024,
    ...options,
  });
}

try {
  await run("npm", ["run", "build"]);
  await run("npm", ["pack", "--dry-run", "--json"]);
  const { stdout } = await run("npm", ["pack", "--json", "--pack-destination", temp]);
  const [packed] = JSON.parse(stdout);
  if (!packed?.filename) throw new Error("npm pack did not report a tarball name");

  const tarball = path.join(temp, packed.filename);
  await run("npm", ["init", "-y"], { cwd: temp });
  await run("npm", ["install", tarball], { cwd: temp });

  const bin = path.join(temp, "node_modules", ".bin", "envdiffkit");
  await run(bin, ["--help"], { cwd: temp });
  await run(bin, ["--version"], { cwd: temp });
  await run(bin, ["scan", path.join(root, "fixtures", "node-app"), "--format", "json"], { cwd: temp });
  await run("node", ["--input-type=module", "-e", "import('envdiffkit').then((mod) => { if (typeof mod.scan !== 'function') process.exit(1); })"], { cwd: temp });

  console.log("envdiffkit package smoke passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
