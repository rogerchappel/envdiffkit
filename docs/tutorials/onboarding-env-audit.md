# Onboarding Env Audit Demo

This demo scans checked-in fixtures to show how `envdiffkit` can turn scattered environment variable references into a reviewable onboarding report.

## Run it

```sh
npm install
npm run build
bash demo/run-onboarding-audit.sh
```

The script writes a temporary demo folder with:

- `node-report.md` from `fixtures/node-app`
- `actions-report.json` from `fixtures/actions-app`
- `database-url.txt` from `envdiffkit explain DATABASE_URL`

## Markdown report for humans

```sh
node dist/cli.js scan fixtures/node-app --format markdown --out /tmp/node-report.md
```

The Node fixture intentionally references `MISSING_TOKEN` in code so the report shows a missing `.env.example` entry with file and line evidence.

## JSON report for automation

```sh
node dist/cli.js scan fixtures/actions-app --format json --out /tmp/actions-report.json
```

Use JSON when another script needs to enforce missing, stale, or suspicious variable counts.

## Explain a variable

```sh
node dist/cli.js explain DATABASE_URL
```

The explanation output is meant for onboarding notes and PR review comments. It does not read real environment values.

## Verification

```sh
npm run smoke
bash demo/run-onboarding-audit.sh
```
