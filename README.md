# Playwright Test Framework

TypeScript end-to-end and page-load tests for [SauceDemo](https://www.saucedemo.com), using page objects, fixtures, and saved authentication.

## Setup

Requires Node.js 22+ and pnpm 12.

```bash
pnpm install
pnpm exec playwright install --with-deps chromium firefox
```

## Run tests

```bash
pnpm test:chromium       # Full suite on Chromium
pnpm test:firefox        # Full suite on Firefox
pnpm test               # All configured browsers
pnpm test:smoke          # Smoke tests
pnpm test:e2e            # Functional tests
pnpm test:performance    # Page-load tests
pnpm test:ui             # Interactive runner
pnpm lint                # Typecheck
```

Pass Playwright options directly, for example:

```bash
pnpm test:chromium --headed
pnpm test:chromium --shard=1/4
```

## Reports

```bash
pnpm report              # Open HTML report at http://localhost:9323
pnpm report:merge        # Merge blob reports after sharded runs
```

Failure artifacts are saved in `test-results/`; logs are in `logs/`.

## Docker

```bash
pnpm docker:build        # Build the test container
pnpm docker:test         # Run Chromium tests
pnpm docker:test:ci      # Run with CI resource limits
pnpm docker:report       # Serve the existing report at http://localhost:9323
pnpm docker:clean        # Stop containers and remove volumes
```

## Configuration

Defaults to staging at `https://www.saucedemo.com`. Override with environment variables:

```bash
BASE_URL=https://your-app.example pnpm test:chromium
TEST_ENV=production PROD_BASE_URL=https://your-app.example pnpm test:chromium
```

Use `SAUCE_PASSWORD` and `SAUCE_*_USER` to override demo credentials. See [environment configuration](src/config/environments.ts) for supported variables.

## Structure

- `src/pages/`, `src/components/` — page objects and shared UI
- `src/fixtures/` — test fixtures
- `src/config/`, `src/data/` — configuration and test data
- `src/utils/`, `src/types/` — helpers and types
- `tests/` — functional, performance, and authentication setup tests
- `.github/workflows/` — CI, nightly runs, and report publishing

## License

MIT
