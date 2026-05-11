import { isSuspiciousSecretName } from "./analyze.js";
import type { RuleExplanation } from "./types.js";

export function explainVariable(variable: string): RuleExplanation {
  const name = variable.trim().toUpperCase();
  const suspicious = isSuspiciousSecretName(name);
  const purpose = name.endsWith("_URL")
    ? "Likely a service endpoint or database URL."
    : name.includes("TOKEN") || name.includes("KEY")
      ? "Likely credential material or an API authentication value."
      : name.includes("PORT")
        ? "Likely a local port or network binding setting."
        : "Likely application configuration discovered by naming convention.";

  return {
    variable: name,
    suspicious,
    likelyPurpose: purpose,
    advice: [
      "Document the variable in .env.example with an empty or obviously fake value.",
      "Keep real values out of git; envdiffkit redacts values in reports by default.",
      suspicious ? "Treat this as secret-like and prefer a secret manager or CI secret setting." : "Add a short README note if the value is required for local development."
    ]
  };
}

export function renderExplanation(variable: string): string {
  const explanation = explainVariable(variable);
  return [
    `${explanation.variable}`,
    `Suspicious secret-like name: ${explanation.suspicious ? "yes" : "no"}`,
    `Likely purpose: ${explanation.likelyPurpose}`,
    "Advice:",
    ...explanation.advice.map((item) => `- ${item}`)
  ].join("\n") + "\n";
}
