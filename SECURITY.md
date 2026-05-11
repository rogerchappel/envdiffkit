# Security Policy

`envdiffkit` is intentionally local-first. The CLI does not need network access to scan a project, does not phone home, and redacts env values in generated reports.

## Supported versions

| Version | Supported |
| --- | --- |
| 0.1.x | Best-effort pre-1.0 support |

## Reporting a vulnerability

Please do not publish exploit details or secrets in public issues. Use GitHub private vulnerability reporting when available, or ask the maintainer for a private channel without including sensitive details.

Useful reports include:

- affected command, file, or workflow
- reproduction steps using a minimal public fixture
- expected vs actual behavior
- whether real secrets or private paths could be exposed
- suggested mitigation, if known

## Scope

In scope:

- accidental exposure of env values in reports
- unsafe default scanning behavior
- path traversal or scan-root escape bugs
- CI/release configuration shipped by this repo

Out of scope:

- general support requests
- findings from downstream projects scanned with envdiffkit
- requests for guaranteed response timelines

## Disclosure

Coordinate disclosure with the maintainer before publishing vulnerability details. Please avoid sharing real tokens, private `.env` files, or proprietary project code.
