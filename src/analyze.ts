import path from "node:path";
import { LOW_SIGNAL_NAMES, SECRET_HINTS, VERSION } from "./constants.js";
import type { EnvReference, ExampleEntry, Finding, ScanOptions, ScanReport } from "./types.js";

function evidenceSort<T extends { name?: string; evidence: { file: string; line: number; column: number } }>(items: T[]): T[] {
  return [...items].sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "") || a.evidence.file.localeCompare(b.evidence.file) || a.evidence.line - b.evidence.line || a.evidence.column - b.evidence.column);
}

export function isSuspiciousSecretName(name: string): boolean {
  return SECRET_HINTS.some((hint) => name.includes(hint));
}

function makeFinding(kind: Finding["kind"], variable: string, severity: Finding["severity"], evidence: Finding["evidence"], message: string, remediation: string): Finding {
  return { id: `${kind}:${variable}`, kind, severity, variable, evidence, message, remediation };
}

export function analyzeReferences(options: ScanOptions, references: EnvReference[], examples: ExampleEntry[]): ScanReport {
  const usedMap = new Map<string, EnvReference[]>();
  for (const ref of references) {
    if (LOW_SIGNAL_NAMES.has(ref.name)) continue;
    if (options.allowPrefixes.length > 0 && !options.allowPrefixes.some((prefix) => ref.name.startsWith(prefix))) continue;
    const list = usedMap.get(ref.name) ?? [];
    list.push(ref);
    usedMap.set(ref.name, list);
  }

  const exampleMap = new Map<string, ExampleEntry[]>();
  for (const entry of examples) {
    const list = exampleMap.get(entry.name) ?? [];
    list.push(entry);
    exampleMap.set(entry.name, list);
  }

  const names = [...new Set([...usedMap.keys(), ...exampleMap.keys()])].sort();
  const findings: Finding[] = [];
  const variables = names.map((name) => {
    const usedEvidence = evidenceSort(usedMap.get(name) ?? []).map((ref) => ref.evidence);
    const docEvidence = evidenceSort(exampleMap.get(name) ?? []).map((entry) => entry.evidence);
    const used = usedEvidence.length > 0;
    const documented = docEvidence.length > 0;
    const suspicious = isSuspiciousSecretName(name);
    if (used && !documented) {
      findings.push(makeFinding("missing", name, "error", usedEvidence, `${name} is used but missing from the env example.`, "Add a redacted placeholder to .env.example or ignore it if it is intentionally implicit."));
    }
    if (documented && !used) {
      findings.push(makeFinding("stale", name, "warn", docEvidence, `${name} is documented but not observed in scanned files.`, "Remove it from the example or keep it with a comment explaining the external dependency."));
    }
    if (suspicious) {
      findings.push(makeFinding("suspicious", name, "warn", [...usedEvidence, ...docEvidence], `${name} looks secret-like; values are redacted.`, "Do not commit real values. Use empty placeholders, documentation, or a secret manager reference."));
    }
    return { name, used, documented, suspicious, evidence: [...usedEvidence, ...docEvidence] };
  });

  findings.sort((a, b) => a.variable.localeCompare(b.variable) || a.kind.localeCompare(b.kind));

  return {
    tool: "envdiffkit",
    version: VERSION,
    generatedAt: new Date(0).toISOString(),
    root: path.resolve(options.root),
    safety: {
      valuesRedacted: true,
      realEnvIncluded: options.includeRealEnv,
      note: options.includeRealEnv ? "Real env files were included by explicit opt-in; values are still redacted." : "Real .env files are skipped by default; example values are redacted."
    },
    summary: {
      used: [...usedMap.keys()].length,
      documented: [...exampleMap.keys()].length,
      missing: findings.filter((f) => f.kind === "missing").length,
      stale: findings.filter((f) => f.kind === "stale").length,
      suspicious: findings.filter((f) => f.kind === "suspicious").length,
      ignored: references.length - [...usedMap.values()].reduce((sum, refs) => sum + refs.length, 0)
    },
    variables,
    findings
  };
}

export function shouldFail(report: ScanReport, failOn: ScanOptions["failOn"]): boolean {
  if (failOn === "none") return false;
  if (failOn === "any") return report.findings.some((f) => f.severity === "error" || f.severity === "warn");
  return report.findings.some((f) => f.kind === failOn);
}
