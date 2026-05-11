# EnvDiffKit PRD

Status: in-progress

## Summary

A tiny local CLI that compares environment requirements across source code, `.env.example`, shell scripts, and CI files, then writes a clean “what config is expected here?” report. No secrets leave the room. 🌱

## Source attribution

Created during the twice-daily OSS factory run on 2026-05-11. Web search for current signals was attempted but rate-limited. Follow-up web fetch reviewed the Twelve-Factor App config guidance, especially the open-source litmus test for config separated from code. This idea reframes that principle into an offline developer/agent verification tool.

## Target users

- OSS maintainers who want `.env.example` to match reality.
- Agentic coding workflows that need safe config context without exposing real secrets.
- Developers onboarding to local-first projects with unclear environment variables.

## Problem

Projects drift: code reads `FOO_TOKEN`, CI expects `BAR_URL`, docs mention `BAZ`, and `.env.example` misses all three. Agents often get stuck or leak too much context when config is unclear.

## Goals

- Discover environment variable usage from common languages and project files.
- Compare discovered usage against `.env.example`, docs, and optional allow/ignore config.
- Produce deterministic Markdown/JSON reports with missing, stale, undocumented, and suspicious variables.
- Redact values by default and never require reading real `.env` files unless explicitly asked.
- Include practical examples and fixture-backed tests.

## Non-goals

- Secret scanning as a full security product.
- Runtime validation inside applications.
- Cloud inventory or hosted dashboards.
- Editing `.env.example` automatically in V1, beyond optional report suggestions.

## V1 CLI

```bash
envdiffkit scan . --example .env.example --out env-report.md
envdiffkit scan fixtures/node-app --format json --fail-on missing
envdiffkit explain DATABASE_URL
```

## Functional requirements

1. Scan requested paths for env variable references in JS/TS, Python, shell, Dockerfile, GitHub Actions YAML, and Markdown.
2. Parse `.env.example`/sample files without exposing real values.
3. Classify variables as used, documented, missing from example, stale in example, or suspiciously secret-like.
4. Emit stable Markdown and JSON reports with file/line evidence.
5. Support ignore patterns, prefix allowlists, `--fail-on`, and `--include-real-env` as an explicit opt-in.
6. Include fixtures and tests for at least Node, shell, and GitHub Actions examples.

## Acceptance criteria

- `npm test`, `npm run check`, `npm run build`, and `npm run smoke` pass.
- `bash scripts/validate.sh` passes when present.
- Real CLI smoke scans checked-in fixtures and writes a report.
- README covers quick start, safety defaults, examples, config, and limitations.
- Public GitHub repo `rogerchappel/envdiffkit` has useful description and topics.

## Suggested implementation waves

1. Scaffold TypeScript CLI with StackForge and planning docs.
2. Implement parsers and env reference extraction.
3. Implement diff/classification and reporters.
4. Add CLI commands, config, fixtures, tests, and smoke scripts.
5. Polish README, package metadata, topics, branch protection, and release notes.
