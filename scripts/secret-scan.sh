#!/usr/bin/env bash
set -euo pipefail

echo "Running gitleaks via container..."
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "gitleaks not installed; attempt to run via docker"
  docker run --rm -v "$(pwd)":/repo:z zricethezav/gitleaks:8.2.0 detect --source="/repo" || exit 1
else
  gitleaks detect --source="." --report-path=gitleaks-report.json
fi
