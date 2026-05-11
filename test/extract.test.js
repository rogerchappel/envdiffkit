import test from "node:test";
import assert from "node:assert/strict";
import { extractReferences } from "../dist/extract.js";

test("extracts JavaScript Python shell Docker and Actions references", () => {
  const content = [
    "process.env.DATABASE_URL",
    "process.env['API_TOKEN']",
    "os.getenv('PYTHON_FLAG')",
    "echo ${SHELL_FLAG:-off} $PLAIN_FLAG",
    "ENV DOCKER_ENV=1",
    "${{ secrets.ACTION_SECRET }}"
  ].join("\n");
  const names = extractReferences(content, "mixed.txt", "code").map((ref) => ref.name);
  for (const expected of ["DATABASE_URL", "API_TOKEN", "PYTHON_FLAG", "SHELL_FLAG", "PLAIN_FLAG", "DOCKER_ENV", "ACTION_SECRET"]) {
    assert.ok(names.includes(expected), `${expected} missing from ${names.join(",")}`);
  }
});
