import fs from "node:fs/promises";
import path from "node:path";
import { DEFAULT_IGNORES, SCANNABLE_EXTENSIONS } from "./constants.js";
import { matchesPattern, normalizeSlash, relativePath } from "./path-utils.js";

export interface DiscoveredFile {
  absolute: string;
  relative: string;
}

function looksScannable(file: string): boolean {
  const base = path.basename(file);
  if (SCANNABLE_EXTENSIONS.has(base)) return true;
  const ext = path.extname(file);
  return SCANNABLE_EXTENSIONS.has(ext);
}

function isRealEnvFile(rel: string): boolean {
  const base = path.basename(rel);
  return base === ".env" || /^\.env\.[^.]+$/.test(base) && !base.includes("example") && !base.includes("sample");
}

export async function discoverFiles(root: string, extraIgnores: string[], includeRealEnv: boolean): Promise<DiscoveredFile[]> {
  const ignores = [...DEFAULT_IGNORES, ...extraIgnores];
  const files: DiscoveredFile[] = [];

  async function walk(dir: string): Promise<void> {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const absolute = path.join(dir, entry.name);
      const rel = normalizeSlash(relativePath(root, absolute));
      if (matchesPattern(rel, ignores)) continue;
      if (entry.isDirectory()) {
        await walk(absolute);
        continue;
      }
      if (!entry.isFile()) continue;
      if (!includeRealEnv && isRealEnvFile(rel)) continue;
      if (looksScannable(absolute)) files.push({ absolute, relative: rel });
    }
  }

  await walk(root);
  return files;
}
