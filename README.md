# Enterprise Playwright Framework

Enterprise-grade end-to-end test automation framework built with [Playwright](https://playwright.dev) and TypeScript, demonstrating patterns used at scale: Page Object Model, fixture-based dependency injection, multi-environment configuration, sharded CI, Docker, and Kubernetes-based parallel execution.

The demo application under test is [SauceDemo](https://www.saucedemo.com).

## Features

- **Page Object Model** — pages (`src/pages`) and reusable components (`src/components`) with a shared `BasePage`
- **Fixture-based DI** — `src/fixtures/index.ts` injects page objects and helpers into tests; no manual instantiation
- **Multi-environment config** — `staging` / `production` resolved from `TEST_ENV` (or `ENV`), overridable via env vars
- **5 Playwright projects** — `setup` (persisted auth via storage state), `chromium`, `firefox`, `webkit`, `mobile-chrome` (Pixel 7)
- **Test suites** — functional e2e (login, logout, cart, inventory, sorting, checkout + validation), visual regression (snapshots), performance (page load)
- **Test data layer** — typed users/roles and Faker-based factories (`src/data`)
- **Sharded CI** — 4-way Chromium sharding on every push, blob reports merged into a single HTML report
- **Nightly cross-browser regression** — Chromium/Firefox/WebKit matrix at 02:00 UTC
- **Report deployment** — merged HTML report auto-published to GitHub Pages
- **Docker & Kubernetes** — reproducible local runs via Docker, 4-pod Indexed Job for true horizontal scale-out
- **Custom logging** — per-worker `logs/playwright-DD-MM-YYYY.txt` files with `make logs-merge` to combine

## Project Structure

```
├── .github/workflows/        # CI, PR checks, nightly regression, report deploy
├── docker/                   # Dockerfile + compose (default & CI profiles)
├── k8s/                      # Namespace, ConfigMap, Secret, sharded test Job
├── scripts/                  # run-tests.sh, generate-report.sh
├── src/
│   ├── components/           # Reusable UI components (header, …)
│   ├── config/               # Environments, constants, timeouts
│   ├── data/                 # Users, products, Faker factories
│   ├── fixtures/             # DI container — page objects injected into tests
│   ├── pages/                # Page Objects (login, inventory, cart, checkout…)
│   ├── types/                # Shared TypeScript types
│   └── utils/                # Logger, assertions, helpers
├── tests/
│   ├── e2e/                  # Functional specs (auth, cart, inventory, checkout)
│   ├── performance/          # Page-load / Core Web Vitals specs
│   ├── visual/               # Visual regression specs + baselines
│   └── setup/                # auth.setup.ts — global login, storage state
├── Makefile                  # All developer commands (make help)
├── playwright.config.ts
└── package.json
```

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm 12 (`corepack enable`)

### Install

```bash
make setup        # pnpm install + all browser binaries
# or manually:
pnpm install
pnpm exec playwright install
```

### Run Tests

```bash
pnpm test                     # full suite (default project: chromium)
pnpm test:smoke               # @smoke subset only
pnpm test:regression          # everything except @smoke
pnpm test:headed              # watch it run
pnpm test:ui                  # Playwright UI mode
pnpm test:debug               # step-through inspector

pnpm test:chromium            # single-browser runs
pnpm test:firefox
pnpm test:webkit
pnpm test:mobile              # Pixel 7 viewport
```

Or via Make:

```bash
make test          make smoke       make e2e
make visual        make a11y        make performance
make verify        # typecheck + smoke (the PR gate)
```

### Report

```bash
pnpm report                   # serve HTML report at http://localhost:9323
make report-generate          # merge blob reports (after sharded runs), then serve
```

CI failures automatically capture trace (first retry), screenshot, and video.

## Configuration

| Variable | Default | Purpose |
|---|---|---|
| `TEST_ENV` | `staging` | `staging` or `production` |
| `BASE_URL` | `https://www.saucedemo.com` | Staging base URL override |
| `PROD_BASE_URL` | `https://www.saucedemo.com` | Production base URL override |
| `SAUCE_PASSWORD` | `secret_sauce` | Shared demo password |
| `CI` | — | Set by CI: retries 2, forbidOnly, blob reporter |

## CI/CD

| Workflow | Trigger | What it does |
|---|---|---|
| **CI** | push/PR to `main` | Quality gate (`tsc --noEmit`) → tests sharded 4× on Chromium → merge blob reports → upload HTML report |
| **PR Checks** | PRs | Smoke suite + results comment |
| **Nightly Regression** | cron 02:00 UTC | Full suite on Chromium, Firefox, WebKit (`fail-fast: false`) |
| **Deploy Reports** | after CI | Publish merged report to GitHub Pages |

## Docker

```bash
make docker-build       # build the test image
make docker-test        # run full suite in a container
make docker-test-ci     # CI profile: resource limits, no volumes
make docker-report      # serve the report from the compose stack
```

## Kubernetes

For horizontal scale-out beyond a single machine — an Indexed Job runs N shards as N parallel pods, each picking its shard from `JOB_COMPLETION_INDEX` (exposed via the downward API).

```bash
make k8s-run            # apply namespace/config/secret + launch 4-pod test job
make k8s-logs           # stream job logs
make k8s-status         # job + pod status
make k8s-clean          # delete job (keeps namespace/config)
```

Manifests: `k8s/` — `namespace.yml`, `configmap.yml`, `secret.yml`, `test-runner-job.yml` (`completionMode: Indexed`, `completions: 4`, `parallelism: 4`).

## License

MIT
