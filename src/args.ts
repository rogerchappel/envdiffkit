import type { FailOn, ReportFormat, ScanOptions } from "./types.js";
import { DEFAULT_SCAN_OPTIONS } from "./scan.js";

export interface ParsedCommand {
  command: "scan" | "explain" | "help" | "version";
  variable?: string;
  scanOptions?: ScanOptions;
}

function take(args: string[], index: number, flag: string): string {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function parseList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function parseArgs(argv: string[]): ParsedCommand {
  const [command = "help", ...rest] = argv;
  if (command === "--help" || command === "-h" || command === "help") return { command: "help" };
  if (command === "--version" || command === "-v" || command === "version") return { command: "version" };
  if (command === "explain") {
    const variable = rest[0];
    if (!variable) throw new Error("explain requires a variable name");
    return { command: "explain", variable };
  }
  if (command !== "scan") throw new Error(`Unknown command: ${command}`);

  let root = ".";
  const options: ScanOptions = { root, ...DEFAULT_SCAN_OPTIONS };
  let rootSet = false;
  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i];
    if (!arg) continue;
    if (!arg.startsWith("--") && !rootSet) {
      root = arg;
      options.root = root;
      rootSet = true;
      continue;
    }
    switch (arg) {
      case "--example":
        options.examples = [...options.examples, take(rest, i, arg)];
        i += 1;
        break;
      case "--format": {
        const value = take(rest, i, arg) as ReportFormat;
        if (value !== "markdown" && value !== "json") throw new Error("--format must be markdown or json");
        options.format = value;
        i += 1;
        break;
      }
      case "--out":
        options.out = take(rest, i, arg);
        i += 1;
        break;
      case "--fail-on": {
        const value = take(rest, i, arg) as FailOn;
        if (!["none", "missing", "stale", "suspicious", "any"].includes(value)) throw new Error("--fail-on must be none, missing, stale, suspicious, or any");
        options.failOn = value;
        i += 1;
        break;
      }
      case "--ignore":
        options.ignore.push(...parseList(take(rest, i, arg)));
        i += 1;
        break;
      case "--allow-prefix":
        options.allowPrefixes.push(...parseList(take(rest, i, arg)));
        i += 1;
        break;
      case "--include-real-env":
        options.includeRealEnv = true;
        break;
      default:
        throw new Error(`Unknown scan option: ${arg}`);
    }
  }

  options.examples = [...new Set(options.examples)];
  return { command: "scan", scanOptions: options };
}
