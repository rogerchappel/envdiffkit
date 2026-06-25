# envdiffkit 🌱

A tiny local-first CLI that answers: **“what environment config does this project actually expect?”**

`envdiffkit` scans source, shell scripts, Dockerfiles, Markdown, and GitHub Actions workflows, compares discovered environment variable usage with `.env.example`, then emits a deterministic Markdown or JSON report. It is built for maintainers, onboarding, and agentic coding workflows that need config context without leaking secrets.

## Install

```sh
npm install -D envdiffkit
# or run from this repo
npm ci && npm run build
```

## Quick start

```sh
npx envdiffkit scan . --example .env.example --out env-report.md
npx envdiffkit scan fixtures/node-app --format json --fail-on missing
npx envdiffkit explain DATABASE_URL
```

For a checked-in onboarding audit demo:

```sh
npm install
npm run build
bash demo/run-onboarding-audit.sh
```

See [Onboarding Env Audit Demo](docs/tutorials/onboarding-env-audit.md) for the walkthrough. Promotion drafts live in [docs/promo/video-brief.md](docs/promo/video-brief.md) and [docs/promo/social-hooks.md](docs/promo/social-hooks.md).

Example output highlights:

- variables used in code, scripts, docs, Dockerfiles, and CI
- variables documented in `.env.example` or sample files
- missing entries that are used but undocumented
- stale entries documented but not observed
- suspicious secret-like names such as `API_TOKEN` or `PRIVATE_KEY`
- file and line evidence for each finding

## CLI

```txt
envdiffkit scan [path] [--example .env.example] [--format markdown|json] [--out file]
envdiffkit explain VARIABLE_NAME
```

Options:

- `--example <file>`: example/sample file relative to the scan root; repeatable.
- `--format markdown|json`: report format. Default: `markdown`.
- `--out <file>`: write the report to disk instead of stdout.
- `--fail-on none|missing|stale|suspicious|any`: non-zero exit for selected findings.
- `--ignore <patterns>`: comma-separated paths/globs to skip.
- `--allow-prefix <list>`: comma-separated env name prefixes to include.
- `--include-real-env`: explicit opt-in to scan real `.env` files. Values are still redacted.

## What it scans

V1 recognizes common references in:

- JS/TS: `process.env.NAME`, `process.env["NAME"]`
- Python: `os.environ["NAME"]`, `os.getenv("NAME")`
- shell: `$NAME`, `${NAME:-default}`, `${NAME:?required}`
- Dockerfiles: `ARG NAME`, `ENV NAME=value`
- GitHub Actions: `env.NAME`, `vars.NAME`, `secrets.NAME`
- Markdown: plain uppercase env var mentions
- `.env.example` / sample files: keys only, values redacted

## Safety model

- Local-only: no telemetry, hosted service, or network calls are needed to scan.
- Real `.env` files are skipped by default.
- Example values and snippets are redacted in reports.
- Secret-like variable names are flagged by name only; this is not a full secret scanner.
- Output is deterministic so CI and agents can compare reports safely.

## CI usage

```sh
npm ci
npm run build
npx envdiffkit scan . --format markdown --out env-report.md --fail-on missing
```

Use `--fail-on missing` for strict `.env.example` coverage, or `--fail-on any` when stale and suspicious names should block a change too.

## Development

```sh
npm ci
npm test
npm run check
npm run build
npm run smoke
bash demo/run-onboarding-audit.sh
npm run package:smoke
npm run release:check
bash scripts/validate.sh
```

A real smoke writes reports from checked-in fixtures under `tmp/`.

## Limitations

- Regex extraction favors deterministic coverage over language-perfect parsing.
- Dynamic env names such as `process.env[prefix + name]` cannot be resolved.
- Secret detection is heuristic and based on variable names.
- V1 reports suggestions but does not rewrite `.env.example`.

## License

MIT
