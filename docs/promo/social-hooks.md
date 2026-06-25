# Social Hooks

1. `envdiffkit` scans code, docs, shell, Dockerfiles, and GitHub Actions to compare used env vars against `.env.example`. It writes deterministic Markdown or JSON without reading real `.env` files by default.
2. New demo: scan a Node fixture, catch a missing `MISSING_TOKEN` example entry, scan a GitHub Actions fixture as JSON, then explain `DATABASE_URL` for onboarding notes.
3. Agent-friendly config context should be local, redacted, and reviewable. `envdiffkit` turns env usage into a report with file and line evidence.

## Demo command

```sh
bash demo/run-onboarding-audit.sh
```
