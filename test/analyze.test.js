import test from "node:test";
import assert from "node:assert/strict";
import { analyzeReferences, shouldFail } from "../dist/analyze.js";

const evidence = { file: "src/app.ts", line: 1, column: 1, source: "code", snippet: "process.env.MISSING_TOKEN" };
const options = { root: ".", examples: [".env.example"], includeRealEnv: false, ignore: [], allowPrefixes: [], format: "json", failOn: "missing" };

test("analyzer identifies missing stale and suspicious findings", () => {
  const report = analyzeReferences(options, [{ name: "MISSING_TOKEN", evidence }], [{ name: "STALE_ONLY", hasValue: false, valuePreview: "", evidence: { ...evidence, file: ".env.example", source: "example" } }]);
  assert.equal(report.summary.missing, 1);
  assert.equal(report.summary.stale, 1);
  assert.equal(report.summary.suspicious, 1);
  assert.equal(shouldFail(report, "missing"), true);
});
