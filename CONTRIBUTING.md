# Contributing

Thanks for helping improve `envdiffkit`. Keep changes small, deterministic, and safe around configuration data.

## Development setup

```sh
npm ci
npm test
npm run check
npm run build
npm run smoke
```

Before opening a PR, run:

```sh
bash scripts/validate.sh
```

## Contribution expectations

- Use focused commits and clear PR descriptions.
- Add fixture-backed tests for parser, analyzer, reporter, or CLI behavior.
- Preserve local-first behavior: no telemetry, hidden network calls, or secret uploads.
- Redact values in new output surfaces by default.
- Update README or docs when CLI behavior changes.
- Prefer deterministic ordering so reports are stable in CI.

## Good fixture style

Fixtures should be tiny public examples, not copied real projects. Use fake names and empty/fake values only:

```env
DATABASE_URL=
PUBLIC_API_URL=https://example.invalid
```

## Review checklist

- [ ] Tests or targeted verification included.
- [ ] No real secrets, private paths, or private hostnames.
- [ ] Markdown/JSON output remains stable.
- [ ] Safety defaults remain conservative.
- [ ] README/docs updated for user-facing changes.
