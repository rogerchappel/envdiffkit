import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("CLI explain prints useful safety guidance", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "explain", "DATABASE_URL"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  assert.match(result.stdout, /DATABASE_URL/);
  assert.match(result.stdout, /\.env\.example/);
});

test("CLI scan can emit JSON", () => {
  const result = spawnSync(process.execPath, ["dist/cli.js", "scan", "fixtures/actions-app", "--format", "json"], { encoding: "utf8" });
  assert.equal(result.status, 0);
  const parsed = JSON.parse(result.stdout);
  assert.equal(parsed.tool, "envdiffkit");
  assert.ok(parsed.findings.some((finding) => finding.variable === "MISSING_ACTIONS_FLAG"));
});
