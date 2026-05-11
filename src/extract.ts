import type { EnvReference, Evidence, SourceKind } from "./types.js";

const ENV_NAME = "[A-Z][A-Z0-9_]{1,}";

const PATTERNS: Array<{ re: RegExp; group: number; context: string }> = [
  { re: new RegExp(`process\\.env\\.(${ENV_NAME})`, "g"), group: 1, context: "process.env" },
  { re: new RegExp(`process\\.env\\[['\"](${ENV_NAME})['\"]\\]`, "g"), group: 1, context: "process.env[]" },
  { re: new RegExp(`os\\.environ\\[['\"](${ENV_NAME})['\"]\\]`, "g"), group: 1, context: "os.environ[]" },
  { re: new RegExp(`os\\.getenv\\(['\"](${ENV_NAME})['\"]`, "g"), group: 1, context: "os.getenv" },
  { re: new RegExp(`(?:^|[^\\w])env\\.([A-Z][A-Z0-9_]{1,})`, "g"), group: 1, context: "env." },
  { re: new RegExp(`\\$\\{(${ENV_NAME})(?::[-=?][^}]*)?\\}`, "g"), group: 1, context: "shell expansion" },
  { re: new RegExp(`\\$(${ENV_NAME})\\b`, "g"), group: 1, context: "shell variable" },
  { re: new RegExp(`(?:env|secrets|vars)\\.(${ENV_NAME})`, "g"), group: 1, context: "GitHub Actions context" },
  { re: new RegExp(`\\bARG\\s+(${ENV_NAME})\\b`, "g"), group: 1, context: "Docker ARG" },
  { re: new RegExp(`\\bENV\\s+(${ENV_NAME})(?:=|\\s)`, "g"), group: 1, context: "Docker ENV" },
  { re: new RegExp(`\\b(${ENV_NAME})\\b`, "g"), group: 1, context: "plain mention" }
];

function lineStarts(content: string): number[] {
  const starts = [0];
  for (let i = 0; i < content.length; i += 1) if (content[i] === "\n") starts.push(i + 1);
  return starts;
}

function locate(starts: number[], index: number): { line: number; column: number } {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const start = starts[mid] ?? 0;
    const next = starts[mid + 1] ?? Number.POSITIVE_INFINITY;
    if (index >= start && index < next) return { line: mid + 1, column: index - start + 1 };
    if (index < start) hi = mid - 1;
    else lo = mid + 1;
  }
  return { line: 1, column: index + 1 };
}

export function extractReferences(content: string, file: string, source: SourceKind): EnvReference[] {
  const starts = lineStarts(content);
  const lines = content.split(/\r?\n/);
  const refs = new Map<string, EnvReference>();

  for (const pattern of PATTERNS) {
    if (pattern.context === "plain mention" && source !== "markdown") continue;
    for (const match of content.matchAll(pattern.re)) {
      const name = match[pattern.group];
      if (!name || name.length > 80) continue;
      if (/^[0-9_]+$/.test(name)) continue;
      const offset = match.index + (match[0].indexOf(name));
      const pos = locate(starts, offset);
      const key = `${name}:${file}:${pos.line}:${pos.column}:${pattern.context}`;
      const snippet = (lines[pos.line - 1] ?? "").trim().replace(/=.*/, "=<redacted>");
      const evidence: Evidence = { file, line: pos.line, column: pos.column, source, snippet };
      refs.set(key, { name, evidence, context: pattern.context });
    }
  }

  return [...refs.values()].sort((a, b) => a.name.localeCompare(b.name) || a.evidence.file.localeCompare(b.evidence.file) || a.evidence.line - b.evidence.line);
}
