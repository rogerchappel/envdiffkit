export type Severity = "info" | "warn" | "error";
export type FindingKind = "used" | "documented" | "missing" | "stale" | "suspicious" | "ignored";
export type ReportFormat = "markdown" | "json";
export type FailOn = "none" | "missing" | "stale" | "suspicious" | "any";

export interface Evidence {
  file: string;
  line: number;
  column: number;
  source: SourceKind;
  snippet: string;
}

export type SourceKind = "code" | "markdown" | "shell" | "dockerfile" | "github-actions" | "example" | "config";

export interface EnvReference {
  name: string;
  evidence: Evidence;
  context?: string;
}

export interface ExampleEntry {
  name: string;
  hasValue: boolean;
  valuePreview: string;
  evidence: Evidence;
}

export interface ScanOptions {
  root: string;
  examples: string[];
  includeRealEnv: boolean;
  ignore: string[];
  allowPrefixes: string[];
  format: ReportFormat;
  out?: string;
  failOn: FailOn;
}

export interface Finding {
  id: string;
  kind: FindingKind;
  severity: Severity;
  variable: string;
  message: string;
  evidence: Evidence[];
  remediation: string;
}

export interface ScanReport {
  tool: "envdiffkit";
  version: string;
  generatedAt: string;
  root: string;
  safety: {
    valuesRedacted: boolean;
    realEnvIncluded: boolean;
    note: string;
  };
  summary: {
    used: number;
    documented: number;
    missing: number;
    stale: number;
    suspicious: number;
    ignored: number;
  };
  variables: Array<{
    name: string;
    used: boolean;
    documented: boolean;
    suspicious: boolean;
    evidence: Evidence[];
  }>;
  findings: Finding[];
}

export interface RuleExplanation {
  variable: string;
  suspicious: boolean;
  likelyPurpose: string;
  advice: string[];
}
