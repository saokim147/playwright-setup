#!/usr/bin/env bash
# Merge sharded blob reports into a single HTML report and serve it.
#
# Usage:
#   ./scripts/generate-report.sh           # merge (if sharded) + open report
#   ./scripts/generate-report.sh --serve   # only serve the existing report
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

BLOB_DIR="blob-report"
REPORT_DIR="playwright-report"
PORT="${REPORT_PORT:-9323}"

if [[ "${1:-}" != "--serve" ]]; then
  if [[ -d "$BLOB_DIR" && -n "$(find "$BLOB_DIR" -name '*.zip' -print -quit 2>/dev/null)" ]]; then
    echo "▶ Merging sharded blob reports from $BLOB_DIR"
    pnpm exec playwright merge-reports --reporter html "$BLOB_DIR"
  elif [[ -d "$REPORT_DIR" ]]; then
    echo "▶ Using existing $REPORT_DIR (no blob reports found)"
  else
    echo "✗ No reports found. Run the tests first." >&2
    exit 1
  fi
fi

[[ -d "$REPORT_DIR" ]] || { echo "✗ $REPORT_DIR does not exist." >&2; exit 1; }

echo "▶ Serving report at http://localhost:$PORT (Ctrl+C to stop)"
exec pnpm exec playwright show-report "$REPORT_DIR" --port "$PORT"
