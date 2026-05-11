import path from "node:path";
import type { SourceKind } from "./types.js";

export function sourceKindFor(file: string): SourceKind {
  const base = path.basename(file);
  const lower = file.toLowerCase();
  if (base === "Dockerfile" || lower.endsWith("/dockerfile")) return "dockerfile";
  if (lower.includes(".github/workflows/") && (lower.endsWith(".yml") || lower.endsWith(".yaml"))) return "github-actions";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "markdown";
  if (lower.endsWith(".sh") || lower.endsWith(".bash") || lower.endsWith(".zsh")) return "shell";
  if (base.includes(".env") || base.endsWith(".example") || base.endsWith(".sample")) return "example";
  return "code";
}
