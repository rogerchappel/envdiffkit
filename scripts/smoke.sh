#!/usr/bin/env bash
set -euo pipefail
mkdir -p tmp
node dist/cli.js scan fixtures/node-app --format markdown --out tmp/node-report.md
node dist/cli.js scan fixtures/actions-app --format json --out tmp/actions-report.json
node dist/cli.js explain DATABASE_URL > tmp/explain.txt
grep -q "MISSING_TOKEN" tmp/node-report.md
grep -q "MISSING_ACTIONS_FLAG" tmp/actions-report.json
grep -q "DATABASE_URL" tmp/explain.txt
echo "smoke ok: wrote tmp/node-report.md, tmp/actions-report.json, tmp/explain.txt"
