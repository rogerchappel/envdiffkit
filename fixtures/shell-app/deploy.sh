#!/usr/bin/env bash
set -euo pipefail
: "${BACKUP_BUCKET:?BACKUP_BUCKET is required}"
echo "Deploying ${DEPLOY_ENV:-dev} with $EXTRA_FLAG"
