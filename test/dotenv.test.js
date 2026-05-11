import test from "node:test";
import assert from "node:assert/strict";
import { parseDotEnvExample } from "../dist/dotenv.js";

test("dotenv examples are parsed and values redacted", () => {
  const entries = parseDotEnvExample("# comment\nDATABASE_URL=postgres://secret\nEMPTY=\nexport API_TOKEN='abc'\n", ".env.example");
  assert.deepEqual(entries.map((entry) => entry.name), ["API_TOKEN", "DATABASE_URL", "EMPTY"]);
  assert.equal(entries.find((entry) => entry.name === "DATABASE_URL")?.valuePreview, "<redacted>");
  assert.equal(entries.find((entry) => entry.name === "EMPTY")?.valuePreview, "");
});
