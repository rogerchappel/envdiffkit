import test from "node:test";
import assert from "node:assert/strict";
import { scan } from "../dist/scan.js";

test("scan finds fixture env drift", async () => {
  const report = await scan({ root: "fixtures/node-app", examples: [".env.example"], includeRealEnv: false, ignore: [], allowPrefixes: [], format: "json", failOn: "none" });
  assert.ok(report.variables.some((variable) => variable.name === "DATABASE_URL" && variable.used && variable.documented));
  assert.ok(report.findings.some((finding) => finding.kind === "missing" && finding.variable === "MISSING_TOKEN"));
  assert.ok(report.findings.some((finding) => finding.kind === "stale" && finding.variable === "STALE_ONLY"));
});
