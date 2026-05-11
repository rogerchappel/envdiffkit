import fs from "node:fs/promises";
import path from "node:path";
import { analyzeReferences } from "./analyze.js";
import { discoverFiles } from "./discovery.js";
import { parseDotEnvExample } from "./dotenv.js";
import { extractReferences } from "./extract.js";
import { assertInsideRoot, relativePath } from "./path-utils.js";
import { renderJson } from "./report-json.js";
import { renderMarkdown } from "./report-markdown.js";
import { sourceKindFor } from "./source-kind.js";
import type { EnvReference, ExampleEntry, ScanOptions, ScanReport } from "./types.js";

export const DEFAULT_SCAN_OPTIONS: Omit<ScanOptions, "root"> = {
  examples: [".env.example"],
  includeRealEnv: false,
  ignore: [],
  allowPrefixes: [],
  format: "markdown",
  failOn: "none"
};

export async function scan(options: ScanOptions): Promise<ScanReport> {
  const root = path.resolve(options.root);
  const files = await discoverFiles(root, options.ignore, options.includeRealEnv);
  const references: EnvReference[] = [];
  const examples: ExampleEntry[] = [];
  const exampleAbs = new Set(options.examples.map((example) => assertInsideRoot(root, example)));

  for (const file of files) {
    const content = await fs.readFile(file.absolute, "utf8");
    const kind = sourceKindFor(file.relative);
    if (exampleAbs.has(file.absolute) || kind === "example") {
      examples.push(...parseDotEnvExample(content, file.relative));
      continue;
    }
    references.push(...extractReferences(content, file.relative, kind));
  }

  for (const example of exampleAbs) {
    if (files.some((file) => file.absolute === example)) continue;
    try {
      const content = await fs.readFile(example, "utf8");
      examples.push(...parseDotEnvExample(content, relativePath(root, example)));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }

  return analyzeReferences({ ...options, root }, references, examples);
}

export function renderReport(report: ScanReport, format: ScanOptions["format"]): string {
  return format === "json" ? renderJson(report) : renderMarkdown(report);
}
