#!/usr/bin/env bash
# Flexible CLI runner for the Playwright framework.
# Wraps `playwright test` with environment, browser, shard, and report options.
#
# Examples:
#   ./scripts/run-tests.sh                          # chromium, staging
#   ./scripts/run-tests.sh -b firefox               # firefox project
#   ./scripts/run-tests.sh -e production            # production env
#   ./scripts/run-tests.sh -s 1/4                   # shard 1 of 4
#   ./scripts/run-tests.sh -g "@smoke"              # smoke subset
#   ./scripts/run-tests.sh -b chromium -g "@smoke" --headed
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

PROJECT="chromium"
ENV_NAME="staging"
SHARD=""
GREP=""
GREP_INVERT=""
PATH_FILTER=""
HEADED=""
DEBUG=""
UI=""
SNAPSHOTS=""
DRY_RUN=""

usage() {
  cat <<'EOF'
Usage: ./scripts/run-tests.sh [options]

Options:
  -b, --browser <name>    Playwright project: chromium | firefox | webkit | mobile-chrome | all
  -e, --env <name>        Environment: staging | production (default: staging)
  -s, --shard <i/n>       Run shard i of n, e.g. 1/4
  -g, --grep <pattern>    Only tests whose titles match (e.g. "@smoke")
  -G, --grep-invert <p>   Exclude tests whose titles match
  -p, --path <glob>       Test path filter (e.g. tests/e2e/cart)
      --headed            Run headed
      --debug             Run under the inspector
      --ui                Run in UI mode
      --update-snapshots  Accept visual changes / write baselines
      --dry-run           List the tests that would run
  -h, --help              Show this help
EOF
  exit 0
}

[[ $# -eq 0 ]] || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    -b|--browser)        PROJECT="$2"; shift 2 ;;
    -e|--env)            ENV_NAME="$2"; shift 2 ;;
    -s|--shard)          SHARD="$2"; shift 2 ;;
    -g|--grep)           GREP="$2"; shift 2 ;;
    -G|--grep-invert)    GREP_INVERT="$2"; shift 2 ;;
    -p|--path)           PATH_FILTER="$2"; shift 2 ;;
    --headed)            HEADED="--headed"; shift ;;
    --debug)             DEBUG="--debug"; shift ;;
    --ui)                UI="--ui"; shift ;;
    --update-snapshots)  SNAPSHOTS="--update-snapshots"; shift ;;
    --dry-run)           DRY_RUN="--list"; shift ;;
    -h|--help)           usage ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 1 ;;
  esac
done

export TEST_ENV="$ENV_NAME"

CMD=(pnpm exec playwright test)
[[ "$PROJECT" != "all" ]] && CMD+=(--project="$PROJECT")
[[ -n "$SHARD" ]]        && CMD+=(--shard="$SHARD")
[[ -n "$GREP" ]]         && CMD+=(--grep="$GREP")
[[ -n "$GREP_INVERT" ]]  && CMD+=(--grep-invert="$GREP_INVERT")
[[ -n "$PATH_FILTER" ]]  && CMD+=("$PATH_FILTER")
[[ -n "$HEADED" ]]       && CMD+=("$HEADED")
[[ -n "$DEBUG" ]]        && CMD+=("$DEBUG")
[[ -n "$UI" ]]           && CMD+=("$UI")
[[ -n "$SNAPSHOTS" ]]    && CMD+=("$SNAPSHOTS")
[[ -n "$DRY_RUN" ]]      && CMD+=("$DRY_RUN")

echo "▶ env=$ENV_NAME project=$PROJECT ${SHARD:+shard=$SHARD }${GREP:+grep=$GREP }"
exec "${CMD[@]}"
