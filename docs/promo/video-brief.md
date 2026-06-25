# Video Brief: Onboarding Env Audit

## Hook

Show a repo with env variables in code and CI, then produce Markdown and JSON reports without reading real `.env` secrets.

## Demo beats

1. Open `fixtures/node-app/src/index.ts` and point out `DATABASE_URL`, `PUBLIC_API_URL`, and `MISSING_TOKEN`.
2. Open `fixtures/node-app/.env.example` and show that one used variable is missing from the example.
3. Run `bash demo/run-onboarding-audit.sh`.
4. Open the Markdown report and highlight missing entries plus file/line evidence.
5. Open the JSON report from the actions fixture and show the summary counts.
6. Run `node dist/cli.js explain DATABASE_URL` as the onboarding handoff close.

## Exact command

```sh
bash demo/run-onboarding-audit.sh
```

## Claims to avoid

- Do not call this a full secret scanner.
- Do not claim dynamic env names are resolved.
- Do not imply real `.env` values are scanned by default.
