import type { ExampleEntry, Evidence } from "./types.js";

const KEY_RE = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(?:=(.*))?$/;

export function redactValue(raw: string | undefined): string {
  if (raw === undefined || raw.trim() === "") return "";
  const trimmed = raw.trim().replace(/^['\"]|['\"]$/g, "");
  if (trimmed.length === 0) return "";
  return "<redacted>";
}

export function parseDotEnvExample(content: string, file: string): ExampleEntry[] {
  const entries: ExampleEntry[] = [];
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const match = trimmed.match(KEY_RE);
    if (!match) return;
    const name = match[1];
    const raw = match[2];
    if (!name) return;
    const evidence: Evidence = {
      file,
      line: index + 1,
      column: line.indexOf(name) + 1,
      source: "example",
      snippet: raw === undefined ? name : `${name}=<redacted>`
    };
    entries.push({ name, hasValue: raw !== undefined && raw.trim() !== "", valuePreview: redactValue(raw), evidence });
  });
  return entries.sort((a, b) => a.name.localeCompare(b.name) || a.evidence.line - b.evidence.line);
}
