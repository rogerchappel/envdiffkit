#!/usr/bin/env node
import fs from "node:fs/promises";
import { VERSION } from "./constants.js";
import { parseArgs } from "./args.js";
import { renderExplanation } from "./explain.js";
import { scan, renderReport } from "./scan.js";
import { shouldFail } from "./analyze.js";

export function helpText(): string {
  return `envdiffkit ${VERSION}

Local-first env usage diffing. Values are redacted by default.

Usage:
  envdiffkit scan [path] [--example .env.example] [--format markdown|json] [--out file]
  envdiffkit scan fixtures/node-app --format json --fail-on missing
  envdiffkit explain DATABASE_URL

Options:
  --example <file>       Env example/sample file relative to scan root (repeatable)
  --format <kind>        markdown or json (default: markdown)
  --out <file>           Write report to file instead of stdout
  --fail-on <kind>       none, missing, stale, suspicious, any
  --ignore <patterns>    Comma-separated paths/globs to ignore
  --allow-prefix <list>  Comma-separated env name prefixes to include
  --include-real-env     Explicitly scan real .env files; values are still redacted
`;
}

export async function main(argv = process.argv.slice(2)): Promise<number> {
  try {
    const parsed = parseArgs(argv);
    if (parsed.command === "help") {
      process.stdout.write(helpText());
      return 0;
    }
    if (parsed.command === "version") {
      process.stdout.write(`${VERSION}\n`);
      return 0;
    }
    if (parsed.command === "explain") {
      process.stdout.write(renderExplanation(parsed.variable ?? ""));
      return 0;
    }
    const options = parsed.scanOptions;
    if (!options) throw new Error("Missing scan options");
    const report = await scan(options);
    const rendered = renderReport(report, options.format);
    if (options.out) await fs.writeFile(options.out, rendered, "utf8");
    else process.stdout.write(rendered);
    if (shouldFail(report, options.failOn)) return 1;
    return 0;
  } catch (error) {
    process.stderr.write(`envdiffkit: ${(error as Error).message}\n`);
    return 2;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().then((code) => {
    process.exitCode = code;
  });
}
