#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

out_dir="${TMPDIR:-/tmp}/envdiffkit-onboarding-demo"
rm -rf "$out_dir"
mkdir -p "$out_dir"

npm run build >/dev/null

node dist/cli.js scan fixtures/node-app --format markdown --out "$out_dir/node-report.md"
grep -q "MISSING_TOKEN" "$out_dir/node-report.md"
grep -q "DATABASE_URL" "$out_dir/node-report.md"

node dist/cli.js scan fixtures/actions-app --format json --out "$out_dir/actions-report.json"
node -e "const fs=require('node:fs'); const report=JSON.parse(fs.readFileSync(process.argv[1],'utf8')); if(report.summary.missing < 1 || report.tool !== 'envdiffkit') process.exit(1);" "$out_dir/actions-report.json"

node dist/cli.js explain DATABASE_URL > "$out_dir/database-url.txt"
grep -q "DATABASE_URL" "$out_dir/database-url.txt"

echo "demo ok: wrote $out_dir/node-report.md, $out_dir/actions-report.json, and $out_dir/database-url.txt"
