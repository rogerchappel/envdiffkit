import path from "node:path";

export function normalizeSlash(value: string): string {
  return value.split(path.sep).join("/");
}

export function relativePath(root: string, file: string): string {
  return normalizeSlash(path.relative(root, file) || ".");
}

export function assertInsideRoot(root: string, target: string): string {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(root, target);
  const rel = path.relative(resolvedRoot, resolvedTarget);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`Path escapes scan root: ${target}`);
  }
  return resolvedTarget;
}

export function matchesPattern(rel: string, patterns: string[]): boolean {
  const normalized = normalizeSlash(rel);
  return patterns.some((pattern) => {
    const clean = normalizeSlash(pattern).replace(/^\.\//, "");
    if (!clean) return false;
    if (clean.includes("*")) {
      const escaped = clean.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
      return new RegExp(`(^|/)${escaped}($|/)`).test(normalized);
    }
    return normalized === clean || normalized.startsWith(`${clean}/`) || normalized.includes(`/${clean}/`);
  });
}
